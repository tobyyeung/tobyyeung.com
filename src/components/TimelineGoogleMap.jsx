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
export const EXPERIENCE_COLORS = {
  invite: '#63d8ca', uiuc_tech_services: '#82aaff', mathnasium: '#ffc66d',
  techknowhow_lead: '#b79aff', thecoderschool: '#ff92b4',
  techknowhow_asst: '#70db91', kesselworks: '#70d5ff'
};
const LABEL_DIRECTIONS = {
  techknowhow_lead: [-1, -1], techknowhow_asst: [1, -1],
  mathnasium: [1, 1], thecoderschool: [-1, 1],
  invite: [-1, -1], uiuc_tech_services: [1, 1], kesselworks: [1, -1]
};
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
  const mapDiv = map?.getDiv?.();
  if (window.innerWidth <= 1150 && mapDiv instanceof Element) {
    const projection = map.getProjection();
    const node = mapDiv.closest('.experience-sticky-viewport')
      ?.querySelector(`[data-experience-id="${experienceId}"]`);
    if (projection && node) {
      const viewport = mapDiv.getBoundingClientRect();
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
    // Authentication failures can invalidate a map while a flight is running.
    if (!(map.getDiv?.() instanceof Element)) { onDone?.(); return; }
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

const TimelineGoogleMap = ({ activeExpId = null, onSelectExperience, onFlightChange, onOpenDetails, onOverview, timelineMode = false }) => {
  const [isFlying, setIsFlying] = useState(false);
  const focusedExperience = experiences.find((experience) => experience.id === activeExpId);
  const selectExperienceRef = useRef(onSelectExperience);
  const openDetailsRef = useRef(onOpenDetails);
  useEffect(() => { openDetailsRef.current = onOpenDetails; }, [onOpenDetails]);
  useEffect(() => { selectExperienceRef.current = onSelectExperience; }, [onSelectExperience]);
  const containerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const prevExpIdRef = useRef(null);
  const cancelPanRef = useRef(null);
  const markerRefs = useRef([]);
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
      zoom: timelineMode ? 4.5 : US_ZOOM,
      minZoom: timelineMode ? 4.5 : US_ZOOM,
      isFractionalZoomEnabled: true,
      disableDefaultUI: true,
      gestureHandling: 'none',
      disableDoubleClickZoom: true,
      keyboardShortcuts: false,
      backgroundColor: '#0e2246',
      styles: TIMELINE_MAP_BRIGHT_STYLE
    });

    mapInstanceRef.current = map;
    prevExpIdRef.current = null;

    return () => {
      cancelPanRef.current?.();
      markerRefs.current.forEach((marker) => marker.setMap(null));
      markerRefs.current = [];
      mapInstanceRef.current = null;
    };
  }, [mapsLoaded, timelineMode]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !window.google?.maps) return undefined;
    map.setOptions({ gestureHandling: 'none', disableDoubleClickZoom: true });
    markerRefs.current.forEach((marker) => marker.setMap(null));
    markerRefs.current = [];
    if (!timelineMode) return undefined;

    const labelOverlay = new window.google.maps.OverlayView();
    let labelRoot;
    let connectorSvg;
    let labelItems = [];
    labelOverlay.onAdd = () => {
      labelRoot = document.createElement('div');
      labelRoot.style.cssText = 'position:absolute;inset:0;pointer-events:none;';
      labelOverlay.getPanes().floatPane.appendChild(labelRoot);
      connectorSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      connectorSvg.style.cssText = 'position:absolute;overflow:visible;pointer-events:none;width:1px;height:1px;';
      labelRoot.appendChild(connectorSvg);
      labelItems = experiences.map((experience) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'experience-map-label';
        button.dataset.mapExperience = experience.id;
        button.style.borderColor = EXPERIENCE_COLORS[experience.id];
        button.style.color = EXPERIENCE_COLORS[experience.id];
        const role = document.createElement('strong');
        role.textContent = experience.role;
        const icon = document.createElement('img');
        icon.src = experience.logo;
        icon.alt = '';
        button.setAttribute('aria-label', `${experience.role} at ${experience.title}`);
        button.append(icon);
        if (experience.id === activeExpId) {
          button.classList.add('is-expanded');
          const heading = document.createElement('span');
          heading.className = 'map-label-card-heading';
          const titles = document.createElement('span');
          const company = document.createElement('strong');
          company.className = 'map-label-company';
          company.textContent = experience.title;
          role.className = 'map-label-role';
          titles.append(company, role);
          heading.append(icon, titles);
          const details = document.createElement('span');
          details.className = 'map-label-details map-label-meta';
          details.textContent = `${experience.dateStr} · ${LOCATION_COORDS[experience.id].city}`;
          const summary = document.createElement('span');
          summary.className = 'map-label-details map-label-summary';
          summary.textContent = experience.shortDesc;
          const tags = document.createElement('span');
          tags.className = 'map-label-tags';
          experience.tags.forEach((tag) => {
            const pill = document.createElement('span');
            pill.textContent = tag;
            tags.appendChild(pill);
          });
          const prompt = document.createElement('span');
          prompt.className = 'map-label-details';
          prompt.textContent = 'View full experience →';
          button.replaceChildren(heading, details, summary, tags, prompt);
        }
        button.onclick = () => experience.id === activeExpId
          ? openDetailsRef.current?.(experience, button)
          : selectExperienceRef.current?.(experience);
        window.google.maps.OverlayView.preventMapHitsAndGesturesFrom(button);
        labelRoot.appendChild(button);
        const connector = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        connector.setAttribute('fill', 'none');
        connector.setAttribute('stroke', EXPERIENCE_COLORS[experience.id]);
        connector.setAttribute('stroke-width', '1.5');
        connector.setAttribute('stroke-linecap', 'round');
        connector.setAttribute('stroke-linejoin', 'round');
        connectorSvg.appendChild(connector);
        return { experience, button, connector };
      });
    };
    labelOverlay.draw = () => {
      const projection = labelOverlay.getProjection();
      if (!projection || !labelRoot) return;
      const bounds = map.getDiv().getBoundingClientRect();
      const header = map.getDiv().closest('.experience-sticky-viewport')?.querySelector('.timeline-overlay-header');
      const headerBottom = header?.getBoundingClientRect().bottom ?? bounds.top;
      const labelTop = Math.max(12, headerBottom - bounds.top + 16);
      const origin = projection.fromContainerPixelToLatLng(new window.google.maps.Point(0, 0));
      const offset = projection.fromLatLngToDivPixel(origin);
      const placed = [];
      const routes = [];
      const crosses = (a, b, c, d) => {
        const turn = (p, q, r) => (q.x - p.x) * (r.y - p.y) - (q.y - p.y) * (r.x - p.x);
        return turn(a, b, c) * turn(a, b, d) < 0 && turn(c, d, a) * turn(c, d, b) < 0;
      };
      const routeFor = (x, y, width, height, point) => {
        if (activeExpId) {
          const edges = [
            { x: x + width / 2, y, dx: 0, dy: -16 },
            { x: x + width / 2, y: y + height, dx: 0, dy: 16 },
            { x, y: y + height / 2, dx: -16, dy: 0 },
            { x: x + width, y: y + height / 2, dx: 16, dy: 0 }
          ];
          const closest = edges.reduce((best, edge) =>
            Math.hypot(edge.x - point.x, edge.y - point.y) < Math.hypot(best.x - point.x, best.y - point.y) ? edge : best
          );
          const start = { x: closest.x, y: closest.y };
          return [start, point];
        }
        const below = point.y >= y + height / 2;
        const start = { x: x + width / 2, y: y + (below ? height : 0) };
        return [start, point];
      };
      labelItems.forEach(({ experience, button, connector }) => {
        connector.setAttribute('d', '');
        const locationMarker = markerRefs.current[experiences.findIndex((item) => item.id === experience.id)];
        if (locationMarker) {
          const zoomProgress = Math.max(0, Math.min(1, (map.getZoom() - 6) / 5));
          const scale = experience.id === activeExpId ? 4 + zoomProgress * 5 : 4;
          const icon = locationMarker.getIcon();
          if (icon.scale !== scale) locationMarker.setIcon({ ...icon, scale });
          locationMarker.setZIndex(experience.id === activeExpId ? 30 : experience.id === 'techknowhow_asst' ? 20 : 10);
        }
        const point = projection.fromLatLngToContainerPixel(new window.google.maps.LatLng(LOCATION_COORDS[experience.id]));
        // Separate nearby pins at overview scale only. Keep the
        // connector endpoint aligned with the displayed pin, then restore true
        // coordinates as the camera zooms into their locations.
        const pinOffsets = {
          invite: [-6, 0], uiuc_tech_services: [6, 0],
          techknowhow_lead: [-7, -7], techknowhow_asst: [7, -7],
          thecoderschool: [-7, 7], mathnasium: [7, 7]
        };
        const pinOffset = pinOffsets[experience.id];
        if (pinOffset) {
          const separation = Math.max(0, Math.min(1, (9 - map.getZoom()) / 3));
          point.x += pinOffset[0] * separation;
          point.y += pinOffset[1] * separation;
          const marker = markerRefs.current[experiences.findIndex((item) => item.id === experience.id)];
          marker?.setPosition(projection.fromContainerPixelToLatLng(point));
        }
        button.hidden = point.x < 0 || point.y < 0 || point.x > bounds.width || point.y > bounds.height;
        if (button.hidden) return;
        button.style.maxHeight = `${Math.max(40, bounds.height - labelTop - 12)}px`;
        button.style.overflowY = 'auto';
        const width = button.offsetWidth;
        const height = button.offsetHeight;
        let best;
        let bestScore = Infinity;
        const [side, vertical] = LABEL_DIRECTIONS[experience.id];
        const closerLabel = experience.id !== 'mathnasium';
        const horizontalGap = experience.id === activeExpId ? 90 : (closerLabel ? 12 : 40);
        const preferredX = point.x + side * (width / 2 + horizontalGap);
        const preferredY = point.y + vertical * (height / 2 + (closerLabel ? 18 : 60));
        // Search nearby slots on every map redraw, including co-located roles.
        for (let y = labelTop; y <= bounds.height - height - 8; y += 16) {
          for (let x = 8; x <= bounds.width - width - 8; x += 16) {
            if (placed.some((r) => x < r.x + r.width + 8 && x + width + 8 > r.x && y < r.y + r.height + 8 && y + height + 8 > r.y)) continue;
            // Leave space between the location and its diagram callout.
            const centerX = x + width / 2;
            const centerY = y + height / 2;
            const wrongSide = (centerX - point.x) * side < 0 ? 250 : 0;
            const wrongVertical = (centerY - point.y) * vertical < 0 ? 250 : 0;
            const route = routeFor(x, y, width, height, point);
            let crossings = 0;
            for (let i = 0; i < route.length - 1; i += 1) {
              for (const existing of routes) {
                for (let j = 0; j < existing.length - 1; j += 1) {
                  if (crosses(route[i], route[i + 1], existing[j], existing[j + 1])) crossings += 1;
                }
              }
              for (const box of placed) {
                const corners = [{ x: box.x, y: box.y }, { x: box.x + box.width, y: box.y }, { x: box.x + box.width, y: box.y + box.height }, { x: box.x, y: box.y + box.height }];
                if (corners.some((corner, j) => crosses(route[i], route[i + 1], corner, corners[(j + 1) % 4]))) crossings += 2;
              }
            }
            const score = Math.hypot(centerX - preferredX, centerY - preferredY) + wrongSide + wrongVertical + crossings * 600;
            if (score < bestScore) { bestScore = score; best = { x, y, width, height }; }
          }
        }
        button.hidden = !best;
        if (!best) return;
        placed.push(best);
        button.style.left = `${offset.x + best.x}px`;
        button.style.top = `${offset.y + best.y}px`;
        // Diagram-style leader: a short horizontal shoulder and an angled
        // line to the geographic dot, without an arrowhead.
        const route = routeFor(best.x, best.y, width, height, point);
        routes.push(route);
        connector.setAttribute('d', route.map((p, i) => `${i ? 'L' : 'M'} ${offset.x + p.x},${offset.y + p.y}`).join(' '));
      });
    };
    labelOverlay.onRemove = () => { labelRoot?.remove(); };
    labelOverlay.setMap(map);
    markerRefs.current = experiences.map((experience) => {
      const location = LOCATION_COORDS[experience.id];
      const marker = new window.google.maps.Marker({
        map,
        position: location,
        // Keep a consistent stacking order for the shared TechKnowHow location.
        zIndex: experience.id === 'techknowhow_asst' ? 20 : 10,
        title: `${experience.role} @ ${experience.title}`,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 4,
          fillColor: EXPERIENCE_COLORS[experience.id],
          fillOpacity: 1,
          strokeColor: '#021022',
          strokeWeight: 1
        }
      });
      marker.addListener('click', () => selectExperienceRef.current?.(experience));
      return marker;
    });
    return () => {
      labelOverlay.setMap(null);
      markerRefs.current.forEach((marker) => marker.setMap(null));
      markerRefs.current = [];
    };
  }, [mapsLoaded, timelineMode, activeExpId]);

  // Robust, Glitch-Proof Camera Flight Transitions
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !window.google?.maps || !(map.getDiv?.() instanceof Element)) return;

    const fly = (options) => {
      setIsFlying(true);
      onFlightChange?.(true);
      return animateCamera(map, options, () => {
      const city = LOCATION_COORDS[activeExpId];
      if (city && !timelineMode && window.innerWidth <= 1150) {
        map.setCenter(getAdjustedCenter(city.lat, city.lng, map, activeExpId, map.getZoom()));
      }
      onFlightChange?.(false);
      setIsFlying(false);
      });
    };

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
        toZoom: timelineMode ? 4.5 : US_ZOOM,
        durationMs: 700
      });
      return;
    }

    const rawTarget = LOCATION_COORDS[activeExpId];
    if (!rawTarget) return;

    // Adjusted target coordinate considering layout
    const targetLoc = timelineMode
      ? { lat: rawTarget.lat, lng: rawTarget.lng }
      : getAdjustedCenter(rawTarget.lat, rawTarget.lng, map, activeExpId);

    if (timelineMode) {
      let cancelled = false;
      let cancelStage;
      setIsFlying(true);
      onFlightChange?.(true);
      const finish = () => {
        if (cancelled) return;
        setIsFlying(false);
        onFlightChange?.(false);
      };
      const stage = (toCenter, toZoom, durationMs, next) => {
        if (cancelled) return;
        const center = map.getCenter();
        cancelStage = animateCamera(map, {
          fromCenter: { lat: center.lat(), lng: center.lng() },
          fromZoom: map.getZoom(), toCenter, toZoom, durationMs
        }, next);
      };
      const overviewZoom = 4.5;
      const approach = () => stage(targetLoc, overviewZoom, 900,
        () => stage(targetLoc, TARGET_ZOOM, 1100, finish));
      const currentCenter = map.getCenter();
      const sameState = prevId && (
        (CALIFORNIA_EXPERIENCE_IDS.has(prevId) && CALIFORNIA_EXPERIENCE_IDS.has(activeExpId)) ||
        (['invite', 'uiuc_tech_services'].includes(prevId) && ['invite', 'uiuc_tech_services'].includes(activeExpId)) ||
        prevId === activeExpId
      );
      if (sameState) {
        stage(targetLoc, map.getZoom(), 800, finish);
      } else if (map.getZoom() > overviewZoom + 0.1) {
        stage({ lat: currentCenter.lat(), lng: currentCenter.lng() }, overviewZoom, 650, approach);
      } else {
        approach();
      }
      cancelPanRef.current = () => { cancelled = true; cancelStage?.(); };
      return;
    }

    // Initial entry into Experiences section: clean, direct flight into Illinois
    if (!prevId) {
      const liveCenter = map.getCenter();
      cancelPanRef.current = fly({
        fromCenter: liveCenter ? { lat: liveCenter.lat(), lng: liveCenter.lng() } : US_CENTER,
        toCenter: targetLoc,
        fromZoom: map.getZoom() ?? (timelineMode ? 4.5 : US_ZOOM),
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

  }, [activeExpId, mapsLoaded, timelineMode]);

  // Re-align after responsive layout or header sizing changes, once flights settle.
  useEffect(() => {
    // Timeline flights already center on the true coordinate. A delayed resize
    // correction must not teleport the camera in the middle of a staged flight.
    if (timelineMode) return;
    const map = mapInstanceRef.current;
    const city = LOCATION_COORDS[activeExpId];
    const container = containerRef.current;
    if (!map || !city || !(container instanceof Element)) return undefined;
    let timer;
    const align = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (mapInstanceRef.current !== map || !(map.getDiv?.() instanceof Element)) return;
        map.setCenter(timelineMode
          ? { lat: city.lat, lng: city.lng }
          : getAdjustedCenter(city.lat, city.lng, map, activeExpId, map.getZoom()));
      }, 3200);
    };
    const observer = new ResizeObserver(align);
    observer.observe(container);
    const stage = container.closest('.experience-sticky-viewport')?.querySelector('.timeline-overlay-stage');
    if (stage) observer.observe(stage);
    window.addEventListener('resize', align);
    return () => {
      clearTimeout(timer);
      observer.disconnect();
      window.removeEventListener('resize', align);
    };
  }, [activeExpId, mapsLoaded, timelineMode]);

  return (
    <div
      className={timelineMode ? 'experience-explorer-map' : undefined}
      style={{
        position: 'absolute',
        inset: 0,
        width: timelineMode ? '66%' : '100%',
        height: '100%',
        overflow: 'hidden',
        pointerEvents: timelineMode ? 'auto' : 'none',
        borderRight: timelineMode ? '1px solid rgba(58, 197, 163, 0.35)' : 'none'
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

      {timelineMode && focusedExperience && (
        <button
          type="button"
          className="experience-map-overview"
          onClick={onOverview}
          disabled={isFlying}
        >
          ← Back to US
        </button>
      )}
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
