import React, { useState, useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import { experiences } from '../data/experiences';

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

const US_CENTER = [38.5, -96.0];
const US_ZOOM = 4;
const CITY_ZOOM = 11;

// Helper to calculate approximate distance in km between two lat/lng points
const getDistanceKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

// Helper to offset map center so target location lands on the right side (~72% screen width)
const getRightShiftedCenter = (map, lat, lng, targetZoom) => {
  if (!map) return [lat, lng];
  try {
    const targetPoint = map.project([lat, lng], targetZoom);
    const containerWidth = map.getSize().x || (typeof window !== 'undefined' ? window.innerWidth : 1200);
    // Shift camera center ~22% of viewport width to the left on desktop so pin appears on right side
    const shiftPixels = (typeof window !== 'undefined' && window.innerWidth < 960) ? 0 : containerWidth * 0.22;
    const centerPoint = L.point(targetPoint.x - shiftPixels, targetPoint.y);
    const centerLatLng = map.unproject(centerPoint, targetZoom);
    return [centerLatLng.lat, centerLatLng.lng];
  } catch (e) {
    return [lat, lng];
  }
};

const InteractiveUSMap = ({ onSelectExperience, decorative = false }) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({});

  // Custom experience sequence order requested: AI Research -> UIUC Tech -> KesselWorks -> Mathnasium -> theCoderSchool -> TechKnowHow -> Loop
  const sortedExperiences = useMemo(() => {
    const customOrder = ['invite', 'uiuc_tech_services', 'kesselworks', 'mathnasium', 'thecoderschool', 'techknowhow_lead', 'techknowhow_asst'];
    return [...experiences].sort((a, b) => {
      const idxA = customOrder.indexOf(a.id);
      const idxB = customOrder.indexOf(b.id);
      return (idxA !== -1 ? idxA : 99) - (idxB !== -1 ? idxB : 99);
    });
  }, []);

  const [activeExpIndex, setActiveExpIndex] = useState(0);
  const prevExpIndexRef = useRef(null);

  // Helper to create HTML icon string for a marker
  const createMarkerIcon = (exp, isActive) => {
    const loc = LOCATION_COORDS[exp.id] || { city: 'USA' };

    // In decorative mode, show glowing dots with flag labels
    if (decorative) {
      return L.divIcon({
        className: 'custom-map-pin',
        html: isActive ? `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center;">
            <div style="
              position: absolute;
              bottom: 24px;
              left: 50%;
              transform: translateX(-50%);
              background: rgba(10, 19, 37, 0.92);
              border: 1px solid rgba(58, 197, 163, 0.5);
              border-radius: 8px;
              padding: 0.3rem 0.65rem;
              white-space: nowrap;
              text-align: center;
              font-family: 'Outfit', 'Inter', system-ui, -apple-system, sans-serif !important;
              -webkit-font-smoothing: antialiased;
              box-shadow: 0 8px 20px rgba(0, 0, 0, 0.6);
              z-index: 1000;
            ">
              <div style="font-size: 0.82rem; font-weight: 600; color: #ffffff; line-height: 1.25; font-family: 'Outfit', sans-serif;">${exp.role} <span style="font-weight: 500; color: #3AC5A3;">@ ${exp.title}</span></div>
              <div style="font-size: 0.62rem; font-weight: 500; color: #a0a0ab; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 2px; font-family: 'Outfit', sans-serif;">${loc.city}</div>
              <div style="
                position: absolute;
                bottom: -4px;
                left: 50%;
                transform: translateX(-50%) rotate(45deg);
                width: 6px;
                height: 6px;
                background: rgba(10, 19, 37, 0.92);
                border-right: 1px solid rgba(58, 197, 163, 0.5);
                border-bottom: 1px solid rgba(58, 197, 163, 0.5);
              "></div>
            </div>
            <div style="position: relative; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center;">
              <div style="position: absolute; width: 12px; height: 12px; border-radius: 50%; background: #3AC5A3; border: 2px solid #ffffff; box-shadow: 0 0 12px #3AC5A3; z-index: 2;"></div>
              <div style="position: absolute; width: 28px; height: 28px; border-radius: 50%; border: 2px solid #3AC5A3; animation: mapPulse 1.8s infinite ease-in-out; opacity: 0.6;"></div>
            </div>
          </div>
        ` : `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center;">
            <div style="
              position: absolute;
              bottom: 20px;
              left: 50%;
              transform: translateX(-50%);
              background: rgba(10, 19, 37, 0.8);
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
                background: rgba(10, 19, 37, 0.75);
                border-right: 1px solid rgba(255, 255, 255, 0.15);
                border-bottom: 1px solid rgba(255, 255, 255, 0.15);
              "></div>
            </div>
            <div style="position: relative; width: 16px; height: 16px; display: flex; align-items: center; justify-content: center; opacity: 0.7;">
              <div style="width: 10px; height: 10px; border-radius: 50%; background: #3AC5A3; border: 1.5px solid #ffffff;"></div>
            </div>
          </div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      });
    }

    return L.divIcon({
      className: 'custom-map-pin',
      html: isActive ? `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center;">
          <!-- Floating Flag Popup Card at Location -->
          <div style="
            position: absolute;
            bottom: 26px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(10, 19, 37, 0.95);
            border: 1px solid rgba(58, 197, 163, 0.4);
            border-radius: 12px;
            padding: 0.45rem 0.75rem;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.7), 0 0 15px rgba(58, 197, 163, 0.2);
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
              min-width: 26px !important;
              min-height: 26px !important;
              max-width: 26px !important;
              max-height: 26px !important;
              display: flex;
              align-items: center;
              justify-content: center;
              flex-shrink: 0;
              overflow: hidden;
              box-shadow: 0 2px 6px rgba(0,0,0,0.2);
            ">
              <img src="${exp.logo}" alt="${exp.title}" style="width: 22px !important; height: 22px !important; max-width: 22px !important; max-height: 22px !important; object-fit: contain; display: block;" width="22" height="22" />
            </div>
            <div style="text-align: left;">
              <div style="font-size: 0.68rem; font-weight: 700; color: #3AC5A3; text-transform: uppercase; letter-spacing: 0.04em;">
                ${loc.city} | ${exp.dateStr}
              </div>
              <div style="font-size: 0.82rem; font-weight: 700; color: #ffffff; line-height: 1.2;">
                ${exp.role} <span style="font-weight: 400; color: #a0a0ab;">@ ${exp.title}</span>
              </div>
            </div>
            <!-- Flag Stem Arrow -->
            <div style="
              position: absolute;
              bottom: -5px;
              left: 50%;
              transform: translateX(-50%) rotate(45deg);
              width: 9px;
              height: 9px;
              background: rgba(10, 19, 37, 0.95);
              border-right: 1px solid rgba(58, 197, 163, 0.4);
              border-bottom: 1px solid rgba(58, 197, 163, 0.4);
            "></div>
          </div>

          <!-- Glowing Location Pin -->
          <div style="position: relative; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; width: 12px; height: 12px; border-radius: 50%; background: #3AC5A3; border: 2px solid #ffffff; box-shadow: 0 0 12px #3AC5A3; z-index: 2;"></div>
            <div style="position: absolute; width: 28px; height: 28px; border-radius: 50%; border: 2px solid #3AC5A3; animation: mapPulse 1.8s infinite ease-in-out; opacity: 0.6;"></div>
          </div>
        </div>
      ` : `
        <div style="position: relative; width: 16px; height: 16px; display: flex; align-items: center; justify-content: center; opacity: 0.7;">
          <div style="width: 10px; height: 10px; border-radius: 50%; background: #3AC5A3; border: 1.5px solid #ffffff;"></div>
        </div>
      `,
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });
  };

  // Initialize Leaflet Map Instance
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Create Leaflet Map Instance (preferCanvas: false to prevent Safari WebKit black box rendering bug)
    const map = L.map(mapContainerRef.current, {
      center: US_CENTER,
      zoom: US_ZOOM,
      zoomControl: false,
      attributionControl: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      dragging: !decorative,
      keyboard: !decorative,
      touchZoom: !decorative,
      boxZoom: false,
      preferCanvas: false,
      fadeAnimation: true,
      zoomAnimation: true
    });

    // Dark CartoDB raster tiles (zero grid lines, zero labels) with high buffer caching
    const tileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/dark_nolabels/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
      keepBuffer: 30,
      updateWhenIdle: false,
      updateWhenZooming: false,
      crossOrigin: true
    }).addTo(map);

    // Pre-warm CartoDB tiles for experience regions (IL, CA, MD) into browser cache
    const prefetchRegions = [
      // Overview US tiles
      'https://a.basemaps.cartocdn.com/rastertiles/dark_nolabels/4/3/6.png',
      'https://b.basemaps.cartocdn.com/rastertiles/dark_nolabels/4/4/6.png',
      'https://c.basemaps.cartocdn.com/rastertiles/dark_nolabels/4/3/5.png',
      'https://d.basemaps.cartocdn.com/rastertiles/dark_nolabels/4/4/5.png',
      // Zoom level 5 & 6 across US
      'https://a.basemaps.cartocdn.com/rastertiles/dark_nolabels/5/8/12.png',
      'https://b.basemaps.cartocdn.com/rastertiles/dark_nolabels/5/9/12.png',
      'https://c.basemaps.cartocdn.com/rastertiles/dark_nolabels/6/16/24.png',
      'https://d.basemaps.cartocdn.com/rastertiles/dark_nolabels/6/10/25.png',
      'https://a.basemaps.cartocdn.com/rastertiles/dark_nolabels/6/18/24.png'
    ];
    prefetchRegions.forEach(url => {
      const img = new Image();
      img.src = url;
    });

    // Custom HTML Pin Marker Icons for each experience
    sortedExperiences.forEach((exp, idx) => {
      const loc = LOCATION_COORDS[exp.id] || { lat: 38.5, lng: -96.0 };
      const isActive = idx === 0;

      const marker = L.marker([loc.lat, loc.lng], {
        icon: createMarkerIcon(exp, isActive),
        zIndexOffset: isActive ? 1000 : 100
      }).addTo(map);

      if (!decorative) {
        marker.on('click', () => {
          if (onSelectExperience) onSelectExperience(exp);
        });
      }

      markersRef.current[exp.id] = marker;
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [sortedExperiences, onSelectExperience]);

  // Google Maps Style FlyTo Sequential Loop (Newest -> Oldest) & Flag Update
  useEffect(() => {
    let timerId;
    const map = mapInstanceRef.current;
    if (!map) return;

    const currentExp = sortedExperiences[activeExpIndex] || sortedExperiences[0];
    const currentLoc = LOCATION_COORDS[currentExp.id] || { lat: 38.5, lng: -96.0 };

    const prevExp = prevExpIndexRef.current !== null ? sortedExperiences[prevExpIndexRef.current] : null;
    const prevLoc = prevExp ? (LOCATION_COORDS[prevExp.id] || { lat: 38.5, lng: -96.0 }) : null;

    prevExpIndexRef.current = activeExpIndex;

    // Update all marker icons so active experience displays the floating location flag
    sortedExperiences.forEach((exp, idx) => {
      const marker = markersRef.current[exp.id];
      if (marker) {
        const isActive = idx === activeExpIndex;
        marker.setIcon(createMarkerIcon(exp, isActive));
        marker.setZIndexOffset(isActive ? 1000 : 100);
      }
    });

    if (decorative) {
      // Zoom into state level (zoom 7.5) shifted rightwards (~72% screen width)
      const flyCenter = getRightShiftedCenter(map, currentLoc.lat, currentLoc.lng, 7.5);
      map.flyTo(flyCenter, 7.5, {
        duration: 3.5,
        easeLinearity: 0.2
      });

      timerId = setTimeout(() => {
        setActiveExpIndex((prevIdx) => (prevIdx + 1) % sortedExperiences.length);
      }, 7500);
    } else {
      // Interactive mode: full city-level zoom shifted rightwards
      const distKm = prevLoc ? getDistanceKm(prevLoc.lat, prevLoc.lng, currentLoc.lat, currentLoc.lng) : 9999;
      const isSameRegion = distKm < 150;

      let flyDuration = 2.4;
      let targetZoom = CITY_ZOOM;

      if (prevLoc && isSameRegion) {
        flyDuration = 2.0;
        targetZoom = CITY_ZOOM;
      } else if (prevLoc) {
        flyDuration = 3.4;
        targetZoom = CITY_ZOOM;
      }

      const flyCenter = getRightShiftedCenter(map, currentLoc.lat, currentLoc.lng, targetZoom);
      map.flyTo(flyCenter, targetZoom, {
        duration: flyDuration,
        easeLinearity: 0.25
      });

      timerId = setTimeout(() => {
        setActiveExpIndex((prevIdx) => (prevIdx + 1) % sortedExperiences.length);
      }, (flyDuration * 1000) + 4000);
    }

    return () => {
      clearTimeout(timerId);
    };
  }, [activeExpIndex, sortedExperiences, decorative]);

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '100%',
      minHeight: '100%',
      overflow: 'hidden',
      margin: '0 auto',
      background: 'transparent',
      border: 'none',
      boxShadow: 'none',
      pointerEvents: decorative ? 'none' : 'auto',
      WebkitBackfaceVisibility: 'hidden',
      WebkitTransform: 'translate3d(0,0,0)'
    }}>
      {/* Leaflet Map Canvas */}
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%', zIndex: 1 }} />

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
        .leaflet-container {
          background-color: #0A1325 !important;
          background: #0A1325 !important;
          font-family: 'Plus Jakarta Sans', 'Outfit', sans-serif !important;
        }
        .leaflet-tile {
          background-color: #0A1325 !important;
        }
        .leaflet-tile-container {
          background-color: #0A1325 !important;
        }
        .custom-map-pin, .custom-map-pin * {
          font-family: 'Plus Jakarta Sans', 'Outfit', sans-serif !important;
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

export default InteractiveUSMap;
