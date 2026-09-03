import React, { useEffect, useRef, useState } from 'react';
import { experiences } from '../data/experiences';

// Real-world coordinates for all experience locations
export const LOCATION_COORDS = {
  'invite': { lat: 40.1164, lng: -88.2434, city: 'Champaign, Illinois' },
  'uiuc_tech_services': { lat: 40.1106, lng: -88.2073, city: 'Urbana, Illinois' },
  'mathnasium': { lat: 37.3541, lng: -121.9552, city: 'Santa Clara, California' },
  'techknowhow_lead': { lat: 37.5585, lng: -122.2711, city: 'Foster City, California' },
  'thecoderschool': { lat: 37.2358, lng: -121.9624, city: 'Los Gatos, California' },
  'techknowhow_asst': { lat: 37.5585, lng: -122.2711, city: 'Foster City, California' },
  'kesselworks': { lat: 39.4673, lng: -76.2625, city: 'Abingdon, Maryland' }
};

const US_CENTER = { lat: 39.5, lng: -96.0 };
const US_ZOOM = 4;
const MID_ZOOM = 7;
const TARGET_ZOOM = 11; // Deep city zoom

// Vibrant cyber dark map styles: High brightness, glowing state & country borders
const TIMELINE_MAP_BRIGHT_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#0e2246' }] },
  // Hide all generic city, town, and road labels
  { elementType: 'labels', stylers: [{ visibility: 'off' }] },
  // State lines: Radiant, electric sky-blue borders clearly delineating all 50 states!
  {
    featureType: 'administrative.province',
    elementType: 'geometry.stroke',
    stylers: [
      { visibility: 'on' },
      { color: '#38bdf8' },
      { weight: 2.2 }
    ]
  },
  // Country lines: Bright neon teal border
  {
    featureType: 'administrative.country',
    elementType: 'geometry.stroke',
    stylers: [
      { visibility: 'on' },
      { color: '#3AC5A3' },
      { weight: 3.0 }
    ]
  },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  // Road networks
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#1a3a6e' }]
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#0d2244' }]
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#2a5ba8' }]
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#143872' }]
  },
  // Water bodies
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#06132b' }]
  }
];

// Helper to shift map center on desktop so pin lands on the OPPOSITE side of the active card
const getShiftedCenter = (map, lat, lng, zoom, cardIsOnLeft = true) => {
  if (typeof window === 'undefined' || window.innerWidth < 860) {
    return { lat, lng };
  }
  const containerWidth = map?.getDiv?.()?.offsetWidth || window.innerWidth || 1200;
  // Shift by 24% of container width so the pin is positioned in the center of the opposite half
  const shiftPixels = containerWidth * 0.24;
  const degreesPerPixelLng = 360 / (256 * Math.pow(2, zoom));

  const lngShift = cardIsOnLeft
    ? -shiftPixels * degreesPerPixelLng
    : +shiftPixels * degreesPerPixelLng;

  return {
    lat,
    lng: lng + lngShift
  };
};

// Calculate great-circle distance between two locations in kilometers
const getDistanceKm = (loc1, loc2) => {
  if (!loc1 || !loc2) return 99999;
  const R = 6371; // Earth's radius in km
  const dLat = ((loc2.lat - loc1.lat) * Math.PI) / 180;
  const dLng = ((loc2.lng - loc1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((loc1.lat * Math.PI) / 180) *
      Math.cos((loc2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Smooth 60fps Camera Pan only — no zoom during flight to avoid tile reload lag
const smoothPan = (map, fromCoord, toCoord, durationMs, onDone) => {
  const start = performance.now();
  const easeInOutSine = (t) => -(Math.cos(Math.PI * t) - 1) / 2;

  let animId;
  const tick = (now) => {
    const elapsed = now - start;
    const progress = Math.min(1, elapsed / durationMs);
    const eased = easeInOutSine(progress);

    const lat = fromCoord.lat + (toCoord.lat - fromCoord.lat) * eased;
    const lng = fromCoord.lng + (toCoord.lng - fromCoord.lng) * eased;

    map.setCenter({ lat, lng });

    if (progress < 1) {
      animId = requestAnimationFrame(tick);
    } else {
      map.setCenter({ lat: toCoord.lat, lng: toCoord.lng });
      if (onDone) onDone();
    }
  };

  animId = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(animId);
};

// Script loader helper
const loadGoogleMapsScript = (apiKey) => {
  return new Promise((resolve, reject) => {
    if (window.google && window.google.maps) {
      resolve(window.google.maps);
      return;
    }
    const existing = document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]');
    if (existing) {
      existing.addEventListener('load', () => resolve(window.google.maps));
      existing.addEventListener('error', reject);
      return;
    }
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(window.google.maps);
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

const TimelineGoogleMap = ({ activeExpId = null, onSelectExperience }) => {
  const containerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const prevExpIdRef = useRef(null);
  const timeoutsRef = useRef([]);
  const cancelPanRef = useRef(null);
  const [mapsLoaded, setMapsLoaded] = useState(false);

  // Load API script
  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
    let isMounted = true;

    loadGoogleMapsScript(apiKey)
      .then(() => {
        if (isMounted) setMapsLoaded(true);
      })
      .catch((err) => {
        console.warn('Google Maps API failed to load:', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Initialize Map — start directly on the first experience location
  useEffect(() => {
    if (!mapsLoaded || !containerRef.current || mapInstanceRef.current || !window.google?.maps) return;

    const google = window.google;

    // Always start at US overview — the cinematic zoom-in plays when first entering the section
    const map = new google.maps.Map(containerRef.current, {
      center: US_CENTER,
      zoom: US_ZOOM,
      isFractionalZoomEnabled: true,
      disableDefaultUI: true,
      gestureHandling: 'none',
      keyboardShortcuts: false,
      backgroundColor: '#0e2246',
      styles: TIMELINE_MAP_BRIGHT_STYLE
    });

    mapInstanceRef.current = map;

    return () => {
      mapInstanceRef.current = null;
    };
  }, [mapsLoaded, onSelectExperience]);

  // Camera Flight Transitions — PHASED to avoid simultaneous tile reloads:
  //   Phase 1: Zoom OUT (instant setZoom, Google applies CSS transform — no tile reload)
  //   Phase 2: Pan (smooth 60fps coordinate animation at the wide zoom)
  //   Phase 3: Zoom IN (instant setZoom after pan reaches destination — one tile load at a fixed location)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !window.google?.maps) return;

    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];

    if (cancelPanRef.current) {
      cancelPanRef.current();
      cancelPanRef.current = null;
    }

    const prevId = prevExpIdRef.current;
    prevExpIdRef.current = activeExpId;

    // Case 1: Scrolled back above Experience section → pull back to US overview
    if (!activeExpId) {
      map.setZoom(7);
      const t1 = setTimeout(() => {
        map.setZoom(US_ZOOM);
        map.panTo(US_CENTER);
      }, 200);
      timeoutsRef.current.push(t1);
      return;
    }

    const targetLoc = LOCATION_COORDS[activeExpId];
    if (!targetLoc) return;

    // Initial entry into Experiences section — cinematic zoom in from US view to Illinois
    if (!prevId) {
      // Smooth pan from US center directly to Champaign, IL while still wide
      cancelPanRef.current = smoothPan(map, US_CENTER, targetLoc, 1000);
      // Then step zoom in as the pan converges on Illinois
      const ti2 = setTimeout(() => map.setZoom(6), 800);
      const ti3 = setTimeout(() => map.setZoom(8), 1400);
      const ti4 = setTimeout(() => map.setZoom(10), 2000);
      const ti5 = setTimeout(() => map.setZoom(TARGET_ZOOM), 2600);
      timeoutsRef.current.push(ti2, ti3, ti4, ti5);
      return;
    }

    // Live camera position
    const currentCenter = map.getCenter();
    const fromCoord = currentCenter
      ? { lat: currentCenter.lat(), lng: currentCenter.lng() }
      : LOCATION_COORDS[prevId] || targetLoc;

    // Case 2: Local campus move (< 15 km — Champaign ↔ Urbana)
    // Stay at city zoom, smooth pan only — no zoom change needed
    const prevLoc = LOCATION_COORDS[prevId];
    const distanceKm = prevLoc ? getDistanceKm(prevLoc, targetLoc) : 99999;

    if (distanceKm < 15) {
      // Pure smooth pan at city zoom — zero tile reload
      cancelPanRef.current = smoothPan(map, fromCoord, targetLoc, 1100);
      return;
    }

    // Case 3: Regional move (< 180 km — California Bay Area)
    // NO zoom changes — just a clean, smooth pan at city zoom level (11)
    // This avoids any tile reload stutter between California cities
    if (distanceKm < 180) {
      cancelPanRef.current = smoothPan(map, fromCoord, targetLoc, 2000);
      return;
    }

    // Case 4: Cross-country (> 180 km — Illinois ↔ California ↔ Maryland)
    // Phase 1: Slow stepped zoom out 11 → 9 → 7 → 5 (300ms per step, lets tiles load gracefully)
    // Phase 2: Pan 3.2s at zoom 5 (wide continental view, smooth)
    // Phase 3: Slow stepped zoom in 5 → 7 → 9 → 11 AFTER pan arrives at destination
    map.setZoom(9);                                      // step 1: 0ms
    const tz2 = setTimeout(() => map.setZoom(7), 300);  // step 2: 300ms
    const tz3 = setTimeout(() => map.setZoom(5), 600);  // step 3: 600ms — now at continental view

    // Pan starts after zoom-out completes (900ms)
    const t1 = setTimeout(() => {
      cancelPanRef.current = smoothPan(map, fromCoord, targetLoc, 3200, () => {
        // Phase 3 — slow stepped zoom in AFTER pan arrives at destination
        const t2 = setTimeout(() => map.setZoom(7), 250);
        const t3 = setTimeout(() => map.setZoom(9), 750);
        const t4 = setTimeout(() => map.setZoom(TARGET_ZOOM), 1350);
        timeoutsRef.current.push(t2, t3, t4);
      });
    }, 900);

    timeoutsRef.current.push(tz2, tz3, t1);
    return;

  }, [activeExpId, mapsLoaded]);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        pointerEvents: 'none'
      }}
    >
      {/* Google Maps Viewport with tight top edge feather */}
      <div
        ref={containerRef}
        style={{
          width: '100%',
          height: '100%',
          background: '#020716',
          maskImage: 'linear-gradient(to bottom, transparent 0%, black 50px)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 50px)'
        }}
      />

      {/* Subtle light vignette so the map is vibrant, glowing and apparent */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at 50% 50%, rgba(2, 7, 22, 0.03) 0%, rgba(2, 7, 22, 0.38) 100%)',
          pointerEvents: 'none'
        }}
      />

      <style>{`
        .gmnoprint, .gm-style-cc, a[href^="https://maps.google.com/maps"] {
          display: none !important;
        }
        @keyframes mapPulse {
          0% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.8); opacity: 0.2; }
          100% { transform: scale(1); opacity: 0.8; }
        }
      `}</style>
    </div>
  );
};

export default TimelineGoogleMap;
