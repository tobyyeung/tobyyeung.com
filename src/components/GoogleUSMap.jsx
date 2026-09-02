import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { experiences } from '../data/experiences';

// ─── Easing ──────────────────────────────────────────────────────────────────
const easeInOutCubic = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

// Cinematic fly-to:
//   1. setZoom(midZoom) — Google Maps plays its built-in zoom-out animation (~600ms)
//   2. Wait for it to settle, then pan smoothly at 30fps
//   3. At 70% through the pan, call setZoom(targetZoom) so the zoom-in overlaps
//      with the last stretch of the pan — convergence feels intentional & smooth
const flyToLocation = (map, targetLat, targetLng, targetZoom, panDuration = 2400, midZoom = 3) => {
  if (!map) return;

  const targetZoomInt = Math.round(targetZoom); // integer zooms use Google Maps' native animation

  // Phase 1 — zoom out; Google Maps animates this natively
  map.setZoom(midZoom);

  // Wait for zoom-out animation to finish before starting the pan
  setTimeout(() => {
    const startLat  = map.getCenter().lat();
    const startLng  = map.getCenter().lng();
    const startTime = performance.now();
    let lastFrame   = 0;
    let zoomedIn    = false;
    const THROTTLE  = 1000 / 30; // 30 fps — setCenter is cheap, this keeps it silky

    const tick = (now) => {
      if (now - lastFrame < THROTTLE) { requestAnimationFrame(tick); return; }
      lastFrame = now;

      const elapsed  = now - startTime;
      const progress = Math.min(elapsed / panDuration, 1);
      const posT     = easeInOutCubic(progress);

      // Pan only — setCenter is far cheaper than setZoom
      map.setCenter({
        lat: startLat + (targetLat - startLat) * posT,
        lng: startLng + (targetLng - startLng) * posT,
      });

      // Phase 3 — start zoom-in at 70% of pan so it overlaps the arrival;
      // Google Maps animates setZoom natively for a smooth converging effect
      if (progress >= 0.70 && !zoomedIn) {
        zoomedIn = true;
        map.setZoom(targetZoomInt);
      }

      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }, 500); // 500ms — long enough for the zoom-out animation to complete
};

// Real-world geographic coordinates for experience locations
const LOCATION_COORDS = {
  'invite': { lat: 40.1164, lng: -88.2434, city: 'Champaign, IL' },
  'uiuc_tech_services': { lat: 40.1020, lng: -88.2272, city: 'Champaign, IL' },
  'mathnasium': { lat: 37.3541, lng: -121.9552, city: 'Santa Clara, CA' },
  'techknowhow_lead': { lat: 37.5585, lng: -122.2711, city: 'Foster City, CA' },
  'thecoderschool': { lat: 37.2358, lng: -121.9624, city: 'Los Gatos, CA' },
  'techknowhow_asst': { lat: 37.5585, lng: -122.2711, city: 'Foster City, CA' },
  'kesselworks': { lat: 39.4673, lng: -76.2625, city: 'Abingdon, MD' }
};

const US_CENTER = { lat: 39.5, lng: -96.0 };
const US_ZOOM   = 4;
const TARGET_ZOOM = 8; // integer so Google Maps uses its native smooth zoom animation

// Premium dark map styles — all locality/city/neighborhood labels hidden;
// relevant city names are shown exclusively via the custom marker overlays.
const GOOGLE_MAPS_DARK_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#0a1325' }] },
  // Hide ALL text labels globally, then selectively re-enable only what we want
  { elementType: 'labels', stylers: [{ visibility: 'off' }] },
  {
    featureType: 'administrative.province',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#1a2a44' }, { weight: 1 }]
  },
  {
    featureType: 'administrative.country',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#2b3f63' }, { weight: 1.5 }]
  },
  { featureType: 'poi',           stylers: [{ visibility: 'off' }] },
  { featureType: 'transit',       stylers: [{ visibility: 'off' }] },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#121f35' }]
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#0b1424' }]
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#192a47' }]
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#0f1b2f' }]
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#040813' }]
  }
];

// Helper to shift map center so target location lands on the right side (~72% screen width on desktop)
const getRightShiftedLatLng = (map, lat, lng, zoom) => {
  if (typeof window === 'undefined' || window.innerWidth < 960) {
    return { lat, lng };
  }
  const containerWidth = map?.getDiv?.()?.offsetWidth || window.innerWidth || 1200;
  const shiftPixels = containerWidth * 0.22;

  // Degrees of longitude per pixel at specified zoom level (Web Mercator projection)
  const degreesPerPixelLng = 360 / (256 * Math.pow(2, zoom));
  const lngOffset = shiftPixels * degreesPerPixelLng;

  return {
    lat,
    lng: lng - lngOffset
  };
};

// Script loader helper for Google Maps JavaScript API
const loadGoogleMapsScript = (apiKey) => {
  return new Promise((resolve, reject) => {
    if (window.google && window.google.maps) {
      resolve(window.google.maps);
      return;
    }

    const existingScript = document.getElementById('google-maps-js-sdk');
    if (existingScript) {
      const checkInterval = setInterval(() => {
        if (window.google && window.google.maps) {
          clearInterval(checkInterval);
          resolve(window.google.maps);
        }
      }, 50);
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-maps-js-sdk';
    const keyParam = apiKey ? `key=${apiKey}&` : '';
    script.src = `https://maps.googleapis.com/maps/api/js?${keyParam}loading=async&callback=__googleMapsInitCallback`;
    script.async = true;
    script.defer = true;

    window.__googleMapsInitCallback = () => {
      delete window.__googleMapsInitCallback;
      resolve(window.google.maps);
    };

    script.onerror = (err) => {
      reject(err);
    };

    document.head.appendChild(script);
  });
};

const GoogleUSMap = ({ onSelectExperience, decorative = false }) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const overlaysRef = useRef({});
  const [activeExpIndex, setActiveExpIndex] = useState(0);
  const [mapsLoaded, setMapsLoaded] = useState(false);

  // Custom experience sequence order
  const sortedExperiences = useMemo(() => {
    const customOrder = ['invite', 'uiuc_tech_services', 'kesselworks', 'mathnasium', 'thecoderschool', 'techknowhow_lead', 'techknowhow_asst'];
    return [...experiences].sort((a, b) => {
      const idxA = customOrder.indexOf(a.id);
      const idxB = customOrder.indexOf(b.id);
      return (idxA !== -1 ? idxA : 99) - (idxB !== -1 ? idxB : 99);
    });
  }, []);

  // HTML content generator for experience pin markers
  const getMarkerHtml = (exp, isActive) => {
    const loc = LOCATION_COORDS[exp.id] || { city: 'USA' };

    if (decorative) {
      return isActive ? `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; pointer-events: auto;">
          <div style="
            position: absolute;
            bottom: 24px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(10, 19, 37, 0.94);
            border: 1px solid rgba(58, 197, 163, 0.55);
            border-radius: 8px;
            padding: 0.35rem 0.7rem;
            white-space: nowrap;
            text-align: center;
            font-family: 'Outfit', 'Inter', system-ui, -apple-system, sans-serif !important;
            -webkit-font-smoothing: antialiased;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.7), 0 0 16px rgba(58, 197, 163, 0.3);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            z-index: 1000;
          ">
            <div style="font-size: 0.84rem; font-weight: 600; color: #ffffff; line-height: 1.25; font-family: 'Outfit', sans-serif;">${exp.role} <span style="font-weight: 500; color: #3AC5A3;">@ ${exp.title}</span></div>
            <div style="font-size: 0.64rem; font-weight: 600; color: #a0a0ab; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 2px; font-family: 'Outfit', sans-serif;">${loc.city}</div>
            <div style="
              position: absolute;
              bottom: -4px;
              left: 50%;
              transform: translateX(-50%) rotate(45deg);
              width: 6px;
              height: 6px;
              background: rgba(10, 19, 37, 0.94);
              border-right: 1px solid rgba(58, 197, 163, 0.55);
              border-bottom: 1px solid rgba(58, 197, 163, 0.55);
            "></div>
          </div>
          <div style="position: relative; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; width: 12px; height: 12px; border-radius: 50%; background: #3AC5A3; border: 2px solid #ffffff; box-shadow: 0 0 14px #3AC5A3; z-index: 2;"></div>
            <div style="position: absolute; width: 30px; height: 30px; border-radius: 50%; border: 2px solid #3AC5A3; animation: mapPulse 1.8s infinite ease-in-out; opacity: 0.6;"></div>
          </div>
        </div>
      ` : `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center;">
          <div style="
            position: absolute;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(10, 19, 37, 0.82);
            border: 1px solid rgba(255, 255, 255, 0.18);
            border-radius: 6px;
            padding: 0.22rem 0.5rem;
            white-space: nowrap;
            text-align: center;
            font-family: 'Outfit', 'Inter', system-ui, -apple-system, sans-serif !important;
            -webkit-font-smoothing: antialiased;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
            z-index: 100;
          ">
            <div style="font-size: 0.68rem; font-weight: 600; color: rgba(255, 255, 255, 0.92); line-height: 1.25; font-family: 'Outfit', sans-serif;">${exp.role} <span style="font-weight: 400; color: rgba(58, 197, 163, 0.9);">@ ${exp.title}</span></div>
            <div style="font-size: 0.54rem; font-weight: 500; color: rgba(160, 160, 171, 0.85); text-transform: uppercase; letter-spacing: 0.04em; margin-top: 2px; font-family: 'Outfit', sans-serif;">${loc.city}</div>
            <div style="
              position: absolute;
              bottom: -3px;
              left: 50%;
              transform: translateX(-50%) rotate(45deg);
              width: 5px;
              height: 5px;
              background: rgba(10, 19, 37, 0.82);
              border-right: 1px solid rgba(255, 255, 255, 0.15);
              border-bottom: 1px solid rgba(255, 255, 255, 0.15);
            "></div>
          </div>
          <div style="position: relative; width: 16px; height: 16px; display: flex; align-items: center; justify-content: center; opacity: 0.7;">
            <div style="width: 10px; height: 10px; border-radius: 50%; background: #3AC5A3; border: 1.5px solid #ffffff;"></div>
          </div>
        </div>
      `;
    }

    return isActive ? `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center;">
        <div style="
          position: absolute;
          bottom: 26px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(10, 19, 37, 0.95);
          border: 1px solid rgba(58, 197, 163, 0.5);
          border-radius: 12px;
          padding: 0.45rem 0.75rem;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.7), 0 0 15px rgba(58, 197, 163, 0.25);
          backdrop-filter: blur(12px);
          white-space: nowrap;
          display: flex;
          align-items: center;
          gap: 0.6rem;
          z-index: 1000;
        ">
          <div style="
            background: #ffffff;
            border-radius: 6px;
            padding: 2px;
            width: 26px !important;
            height: 26px !important;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            overflow: hidden;
            box-shadow: 0 2px 6px rgba(0,0,0,0.2);
          ">
            <img src="${exp.logo}" alt="${exp.title}" style="width: 22px !important; height: 22px !important; object-fit: contain; display: block;" width="22" height="22" />
          </div>
          <div style="text-align: left;">
            <div style="font-size: 0.68rem; font-weight: 700; color: #3AC5A3; text-transform: uppercase; letter-spacing: 0.04em;">
              ${loc.city} | ${exp.dateStr}
            </div>
            <div style="font-size: 0.82rem; font-weight: 700; color: #ffffff; line-height: 1.2;">
              ${exp.role} <span style="font-weight: 400; color: #a0a0ab;">@ ${exp.title}</span>
            </div>
          </div>
          <div style="
            position: absolute;
            bottom: -5px;
            left: 50%;
            transform: translateX(-50%) rotate(45deg);
            width: 9px;
            height: 9px;
            background: rgba(10, 19, 37, 0.95);
            border-right: 1px solid rgba(58, 197, 163, 0.5);
            border-bottom: 1px solid rgba(58, 197, 163, 0.5);
          "></div>
        </div>
        <div style="position: relative; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 12px; height: 12px; border-radius: 50%; background: #3AC5A3; border: 2px solid #ffffff; box-shadow: 0 0 14px #3AC5A3; z-index: 2;"></div>
          <div style="position: absolute; width: 30px; height: 30px; border-radius: 50%; border: 2px solid #3AC5A3; animation: mapPulse 1.8s infinite ease-in-out; opacity: 0.6;"></div>
        </div>
      </div>
    ` : `
      <div style="position: relative; width: 16px; height: 16px; display: flex; align-items: center; justify-content: center; opacity: 0.7;">
        <div style="width: 10px; height: 10px; border-radius: 50%; background: #3AC5A3; border: 1.5px solid #ffffff;"></div>
      </div>
    `;
  };

  // Load Google Maps API Script
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

  // Initialize Google Maps Instance & Custom Overlay Markers
  useEffect(() => {
    if (!mapsLoaded || !mapContainerRef.current || mapInstanceRef.current || !window.google?.maps) return;

    const google = window.google;
    const initialCenter = getRightShiftedLatLng(null, US_CENTER.lat, US_CENTER.lng, US_ZOOM);

    const map = new google.maps.Map(mapContainerRef.current, {
      center: initialCenter,
      zoom: US_ZOOM,
      disableDefaultUI: true,
      zoomControl: false,
      mapTypeControl: false,
      scaleControl: false,
      streetViewControl: false,
      rotateControl: false,
      fullscreenControl: false,
      gestureHandling: decorative ? 'none' : 'cooperative',
      keyboardShortcuts: false,
      backgroundColor: '#0a1325',
      styles: GOOGLE_MAPS_DARK_STYLE
    });

    // Custom HTML Overlay View Class
    class HtmlMarkerOverlay extends google.maps.OverlayView {
      constructor(position, content, onClick) {
        super();
        this.position = new google.maps.LatLng(position.lat, position.lng);
        this.content = content;
        this.onClick = onClick;
        this.div = null;
        this.setMap(map);
      }

      onAdd() {
        this.div = document.createElement('div');
        this.div.style.position = 'absolute';
        this.div.style.transform = 'translate(-50%, -50%)';
        this.div.style.pointerEvents = decorative ? 'none' : 'auto';
        this.div.className = 'custom-map-pin';
        this.div.innerHTML = this.content;

        if (this.onClick && !decorative) {
          this.div.style.cursor = 'pointer';
          this.div.addEventListener('click', this.onClick);
        }

        const panes = this.getPanes();
        panes?.overlayMouseTarget?.appendChild(this.div);
      }

      draw() {
        const projection = this.getProjection();
        if (!projection || !this.div) return;
        const point = projection.fromLatLngToDivPixel(this.position);
        if (point) {
          this.div.style.left = `${point.x}px`;
          this.div.style.top = `${point.y}px`;
        }
      }

      setContent(newContent, zIndex = 100) {
        this.content = newContent;
        if (this.div) {
          this.div.innerHTML = newContent;
          this.div.style.zIndex = zIndex;
        }
      }

      onRemove() {
        if (this.div && this.div.parentNode) {
          this.div.parentNode.removeChild(this.div);
          this.div = null;
        }
      }
    }

    // Instantiate custom markers for all experiences
    const createdOverlays = {};
    sortedExperiences.forEach((exp, idx) => {
      const loc = LOCATION_COORDS[exp.id] || { lat: 39.5, lng: -96.0 };
      const isActive = idx === 0;
      const overlay = new HtmlMarkerOverlay(
        loc,
        getMarkerHtml(exp, isActive),
        () => onSelectExperience?.(exp)
      );
      createdOverlays[exp.id] = overlay;
    });

    overlaysRef.current = createdOverlays;
    mapInstanceRef.current = map;

    return () => {
      Object.values(createdOverlays).forEach((overlay) => overlay.setMap(null));
      overlaysRef.current = {};
      mapInstanceRef.current = null;
    };
  }, [mapsLoaded, sortedExperiences, decorative, onSelectExperience]);

  // Sequential FlyTo animation loop across Experience Locations
  useEffect(() => {
    let timerId;
    const map = mapInstanceRef.current;
    if (!map || !window.google?.maps) return;

    const currentExp = sortedExperiences[activeExpIndex] || sortedExperiences[0];
    const currentLoc = LOCATION_COORDS[currentExp.id] || { lat: 39.5, lng: -96.0 };

    // Update marker overlays for active vs inactive state
    sortedExperiences.forEach((exp, idx) => {
      const overlay = overlaysRef.current[exp.id];
      if (overlay) {
        const isActive = idx === activeExpIndex;
        overlay.setContent(getMarkerHtml(exp, isActive), isActive ? 1000 : 100);
      }
    });

    // Shift target camera so pin lands nicely on the right half of the screen
    const targetCenter = getRightShiftedLatLng(map, currentLoc.lat, currentLoc.lng, TARGET_ZOOM);

    // Skip fly on first render; just snap into position
    const isFirstRender = activeExpIndex === 0 && map.getZoom() === US_ZOOM;
    if (isFirstRender) {
      map.setCenter({ lat: targetCenter.lat, lng: targetCenter.lng });
      map.setZoom(TARGET_ZOOM);
    } else {
      // Cinematic fly: native zoom-out → smooth pan → overlapping native zoom-in
      flyToLocation(map, targetCenter.lat, targetCenter.lng, TARGET_ZOOM, 2400, 3);
    }

    // 500ms zoom-out settle + 2400ms pan + 5000ms hold at destination
    const holdMs = isFirstRender ? 5000 : 500 + 2400 + 5000;
    timerId = setTimeout(() => {
      setActiveExpIndex((prev) => (prev + 1) % sortedExperiences.length);
    }, holdMs);

    return () => {
      clearTimeout(timerId);
    };
  }, [activeExpIndex, sortedExperiences, mapsLoaded, decorative]);

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '100%',
      minHeight: '100%',
      overflow: 'hidden',
      margin: '0 auto',
      background: '#0a1325',
      border: 'none',
      boxShadow: 'none',
      pointerEvents: decorative ? 'none' : 'auto',
      WebkitBackfaceVisibility: 'hidden',
      WebkitTransform: 'translate3d(0,0,0)'
    }}>
      {/* Google Maps Canvas Container */}
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%', zIndex: 1, background: '#0a1325' }} />

      {/* Uniform Blue Tint Overlay matching site theme */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(10, 19, 37, 0.45)',
        pointerEvents: 'none',
        zIndex: 2
      }} />

      <style>{`
        /* Hide Google Maps default terms/watermark in decorative background mode */
        .gmnoprint, .gm-style-cc, a[href^="https://maps.google.com/maps"] {
          display: none !important;
        }
        .custom-map-pin, .custom-map-pin * {
          font-family: 'Outfit', 'Inter', sans-serif !important;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
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

export default GoogleUSMap;
