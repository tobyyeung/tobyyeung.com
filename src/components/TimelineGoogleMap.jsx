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

const CALIFORNIA_EXPERIENCE_IDS = new Set([
  'mathnasium',
  'techknowhow_lead',
  'thecoderschool',
  'techknowhow_asst'
]);

const US_CENTER = { lat: 39.5, lng: -96.0 };
const US_ZOOM = 4;
const TARGET_ZOOM = 11; // Deep city zoom
const FLIGHT_ZOOM = 5;
const CAMERA_FRAME_MS = 1000 / 30;

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
  // Optimization: Turn off unnecessary POI, transit, man-made and parcel layers to reduce data payload and maximize speed
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'landscape.man_made', stylers: [{ visibility: 'off' }] },
  { featureType: 'administrative.land_parcel', stylers: [{ visibility: 'off' }] },
  { featureType: 'administrative.neighborhood', stylers: [{ visibility: 'off' }] },
  { featureType: 'road.local', elementType: 'labels', stylers: [{ visibility: 'off' }] },
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

// Calculate target camera center with desktop card offset
const getAdjustedCenter = (lat, lng, map, experienceId, zoom = TARGET_ZOOM) => {
  if (window.innerWidth <= 1150 && map) {
    const projection = map.getProjection();
    const node = map.getDiv().closest('.experience-sticky-viewport')
      ?.querySelector(`[data-experience-id="${experienceId}"]`);
    if (projection && node) {
      const viewport = map.getDiv().getBoundingClientRect();
      const marker = node.getBoundingClientRect();
      const city = projection.fromLatLngToPoint(new window.google.maps.LatLng(lat, lng));
      const scale = 2 ** zoom;
      const center = projection.fromPointToLatLng(new window.google.maps.Point(
        city.x + (viewport.width / 2 - (marker.left + marker.width / 2 - viewport.left)) / scale,
        city.y + (viewport.height / 2 - (marker.top + marker.height / 2 - viewport.top)) / scale
      ));
      return { lat: center.lat(), lng: center.lng() };
    }
  }
  const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 1024;
  const lngShift = isDesktop ? -0.055 : 0;
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

// Google Maps is expensive to redraw. A capped 30fps camera path stays smooth
// while avoiding the tile churn caused by calling setCenter on every RAF.
const animateCamera = (
  map,
  { fromCenter, toCenter, fromZoom, toZoom, durationMs, flightZoom = null },
  onDone
) => {
  const start = performance.now();
  const easeInOutCubic = (t) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  let animId;
  let isCancelled = false;
  let lastFrame = -CAMERA_FRAME_MS;

  const tick = (now) => {
    if (isCancelled) return;
    const elapsed = now - start;
    const progress = Math.min(1, elapsed / durationMs);
    const shouldPaint = elapsed - lastFrame >= CAMERA_FRAME_MS || progress === 1;

    if (shouldPaint) {
      const eased = easeInOutCubic(progress);
      let centerProgress = eased;

      if (flightZoom !== null) {
        // Keep the origin still while zooming out so the lower-detail tiles can
        // render, then travel only during the cruise portion of the flight.
        if (progress < 0.5) {
          centerProgress = 0;
        } else if (progress < 0.75) {
          centerProgress = easeInOutCubic((progress - 0.5) / 0.25);
        } else {
          centerProgress = 1;
        }
      }

      const center = {
        lat: fromCenter.lat + (toCenter.lat - fromCenter.lat) * centerProgress,
        lng: fromCenter.lng + (toCenter.lng - fromCenter.lng) * centerProgress
      };
      let zoom = fromZoom + (toZoom - fromZoom) * eased;

      if (flightZoom !== null) {
        // Ease down, pause at altitude while tiles settle, travel, then zoom in.
        if (progress < 0.4) {
          zoom = fromZoom + (flightZoom - fromZoom) * easeInOutCubic(progress / 0.4);
        } else if (progress < 0.75) {
          zoom = flightZoom;
        } else {
          zoom = flightZoom + (toZoom - flightZoom) * easeInOutCubic((progress - 0.75) / 0.25);
        }
      }

      map.moveCamera({ center, zoom });
      lastFrame = elapsed;
    }

    if (progress < 1) {
      animId = requestAnimationFrame(tick);
    } else {
      map.moveCamera({ center: toCenter, zoom: toZoom });
      if (onDone) onDone();
    }
  };

  animId = requestAnimationFrame(tick);
  return () => {
    isCancelled = true;
    cancelAnimationFrame(animId);
  };
};

let googleMapsPromise;
const GOOGLE_MAPS_CALLBACK = '__timelineGoogleMapsReady';

// Cache one loader promise across mounts and omit unused libraries to keep the
// initial download and parse cost as small as possible.
const loadGoogleMapsScript = (apiKey) => {
  if (window.google?.maps) return Promise.resolve(window.google.maps);
  if (googleMapsPromise) return googleMapsPromise;

  googleMapsPromise = new Promise((resolve, reject) => {
    if (window.google && window.google.maps) {
      resolve(window.google.maps);
      return;
    }
    const existing = document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]');
    if (existing) {
      existing.addEventListener('load', () => resolve(window.google.maps));
      existing.addEventListener('error', (error) => {
        googleMapsPromise = null;
        reject(error);
      });
      return;
    }
    const script = document.createElement('script');
    window[GOOGLE_MAPS_CALLBACK] = () => {
      delete window[GOOGLE_MAPS_CALLBACK];
      resolve(window.google.maps);
    };
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&v=weekly&loading=async&callback=${GOOGLE_MAPS_CALLBACK}`;
    script.async = true;
    script.onerror = (error) => {
      delete window[GOOGLE_MAPS_CALLBACK];
      googleMapsPromise = null;
      reject(error);
    };
    document.head.appendChild(script);
  });

  return googleMapsPromise;
};

const TimelineGoogleMap = ({ activeExpId = null, onSelectExperience }) => {
  const containerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const prevExpIdRef = useRef(null);
  const cancelPanRef = useRef(null);
  const [mapsLoaded, setMapsLoaded] = useState(false);
  const [shouldLoadMap, setShouldLoadMap] = useState(false);

  // Start loading shortly before the timeline enters view. This keeps Google
  // Maps off the critical path for the top of the portfolio.
  useEffect(() => {
    const container = containerRef.current;
    if (!container || typeof IntersectionObserver === 'undefined') {
      setShouldLoadMap(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoadMap(true);
          observer.disconnect();
        }
      },
      { rootMargin: '700px 0px' }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Load API script
  useEffect(() => {
    if (!shouldLoadMap) return undefined;

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
  }, [shouldLoadMap]);

  // Initialize Map
  useEffect(() => {
    if (!mapsLoaded || !containerRef.current || mapInstanceRef.current || !window.google?.maps) return;

    const google = window.google;

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
      cancelPanRef.current?.();
      mapInstanceRef.current = null;
    };
  }, [mapsLoaded]);

  // Robust, Glitch-Proof Camera Flight Transitions
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !window.google?.maps) return;

    const fly = (options) => animateCamera(map, options, () => {
      const city = LOCATION_COORDS[activeExpId];
      if (city && window.innerWidth <= 1150) {
        map.setCenter(getAdjustedCenter(city.lat, city.lng, map, activeExpId, map.getZoom()));
      }
    });

    if (cancelPanRef.current) {
      cancelPanRef.current();
      cancelPanRef.current = null;
    }

    const prevId = prevExpIdRef.current;
    prevExpIdRef.current = activeExpId;

    // Case 1: Scrolled back above Experience section → return to US overview
    if (!activeExpId) {
      const currentCenter = map.getCenter();
      cancelPanRef.current = fly({
        fromCenter: currentCenter
          ? { lat: currentCenter.lat(), lng: currentCenter.lng() }
          : US_CENTER,
        toCenter: US_CENTER,
        fromZoom: map.getZoom() || TARGET_ZOOM,
        toZoom: US_ZOOM,
        durationMs: 700
      });
      return;
    }

    const rawTarget = LOCATION_COORDS[activeExpId];
    if (!rawTarget) return;

    // Adjusted target coordinate considering layout
    const targetLoc = getAdjustedCenter(rawTarget.lat, rawTarget.lng, map, activeExpId);

    // Initial entry into Experiences section: clean, direct flight into Illinois
    if (!prevId) {
      cancelPanRef.current = fly({
        fromCenter: US_CENTER,
        toCenter: targetLoc,
        fromZoom: US_ZOOM,
        toZoom: TARGET_ZOOM,
        durationMs: 1050
      });
      return;
    }

    // Capture the REAL live camera position and zoom at this exact millisecond
    const currentCenter = map.getCenter();
    const fromCoord = currentCenter
      ? { lat: currentCenter.lat(), lng: currentCenter.lng() }
      : targetLoc;
    const currentZoom = map.getZoom() ?? TARGET_ZOOM;

    // Physical distance from wherever the camera currently is to the new target
    const distanceKm = getDistanceKm(fromCoord, targetLoc);

    // California stops stay at one altitude: pan between cities without any
    // zoom change. Interstate arrivals and departures still use the flight arc.
    const isCaliforniaToCalifornia =
      CALIFORNIA_EXPERIENCE_IDS.has(prevId) &&
      CALIFORNIA_EXPERIENCE_IDS.has(activeExpId);

    if (isCaliforniaToCalifornia) {
      cancelPanRef.current = fly({
        fromCenter: fromCoord,
        toCenter: targetLoc,
        fromZoom: currentZoom,
        toZoom: currentZoom,
        durationMs: 650
      });
      return;
    }

    // Case 2: Local campus move (< 20 km — Champaign ↔ Urbana)
    if (distanceKm < 20) {
      cancelPanRef.current = fly({
        fromCenter: fromCoord,
        toCenter: targetLoc,
        fromZoom: currentZoom,
        toZoom: TARGET_ZOOM,
        durationMs: 500
      });
      return;
    }

    // Case 3: Regional move (< 180 km — California Bay Area)
    if (distanceKm < 180) {
      cancelPanRef.current = fly({
        fromCenter: fromCoord,
        toCenter: targetLoc,
        fromZoom: currentZoom,
        toZoom: TARGET_ZOOM,
        durationMs: 750,
        flightZoom: Math.min(currentZoom, 8.5)
      });
      return;
    }

    // Case 4: Long distance (> 180 km — Illinois ↔ California ↔ Maryland)
    cancelPanRef.current = fly({
      fromCenter: fromCoord,
      toCenter: targetLoc,
      fromZoom: currentZoom,
      toZoom: TARGET_ZOOM,
      durationMs: 3000,
      flightZoom: FLIGHT_ZOOM
    });

  }, [activeExpId, mapsLoaded]);

  // Re-align after responsive layout or header sizing changes, once flights settle.
  useEffect(() => {
    const map = mapInstanceRef.current;
    const city = LOCATION_COORDS[activeExpId];
    if (!map || !city) return undefined;
    let timer;
    const align = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        map.setCenter(getAdjustedCenter(city.lat, city.lng, map, activeExpId, map.getZoom()));
      }, 3200);
    };
    const observer = new ResizeObserver(align);
    observer.observe(map.getDiv());
    const stage = map.getDiv().closest('.experience-sticky-viewport')?.querySelector('.timeline-overlay-stage');
    if (stage) observer.observe(stage);
    window.addEventListener('resize', align);
    return () => {
      clearTimeout(timer);
      observer.disconnect();
      window.removeEventListener('resize', align);
    };
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
        .gmnoprint, .gm-style-cc, a[href^="https://maps.google.com/maps"],
        .gm-err-container, .gm-err-autocomplete, .gm-err-message, div[aria-label="Map error"] {
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
