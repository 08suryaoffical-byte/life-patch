import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { DeviceLocation } from '../types';
import { SafetyHub } from '../services/geolocation';

interface InteractiveMapProps {
  userLocation: DeviceLocation | null;
  hubs?: SafetyHub[];
  activeLayer?: 'all' | 'police' | 'corridor' | 'hospital';
  onSelectHub?: (hub: SafetyHub) => void;
  onEmergencyDial?: (phone: string) => void;
  heightClass?: string;
  isInteractive?: boolean;
  zoom?: number;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  userLocation,
  hubs = [],
  activeLayer = 'all',
  onSelectHub,
  onEmergencyDial,
  heightClass = 'h-80',
  isInteractive = true,
  zoom = 15,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const accuracyCircleRef = useRef<L.Circle | null>(null);
  const hubMarkersRef = useRef<L.Marker[]>([]);

  // Default coordinate fallback: Tiruchirappalli (10.8281, 78.6868)
  const defaultLat = userLocation?.latitude ?? 10.8281;
  const defaultLng = userLocation?.longitude ?? 78.6868;

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [defaultLat, defaultLng],
      zoom: zoom,
      zoomControl: isInteractive,
      attributionControl: false,
      dragging: isInteractive,
      touchZoom: isInteractive,
      scrollWheelZoom: isInteractive,
      doubleClickZoom: isInteractive,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    mapRef.current = map;

    // Small delay to invalidate size after DOM layout settles
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => {
      clearTimeout(timer);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update User Position & Accuracy Circle
  useEffect(() => {
    if (!mapRef.current || !userLocation) return;
    const map = mapRef.current;
    const latLng: L.LatLngExpression = [userLocation.latitude, userLocation.longitude];

    // User Pin Icon using DivIcon
    const userIcon = L.divIcon({
      className: 'custom-user-marker',
      html: `
        <div style="position: relative; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 36px; height: 36px; border-radius: 50%; background: rgba(0, 81, 213, 0.25); animation: pulse 2s infinite ease-in-out;"></div>
          <div style="width: 20px; height: 20px; border-radius: 50%; background: #0051d5; border: 3px solid #ffffff; box-shadow: 0 2px 8px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center;">
            <div style="width: 6px; height: 6px; border-radius: 50%; background: #ffffff;"></div>
          </div>
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });

    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng(latLng);
    } else {
      userMarkerRef.current = L.marker(latLng, { icon: userIcon, zIndexOffset: 1000 }).addTo(map);
      userMarkerRef.current.bindPopup(`
        <div style="font-family: sans-serif; font-size: 12px; padding: 2px;">
          <strong style="color: #001026;">Your Current Location</strong><br/>
          <span style="color: #44474e;">Lat: ${userLocation.latitude.toFixed(5)}°, Lng: ${userLocation.longitude.toFixed(5)}°</span><br/>
          <span style="color: #0051d5; font-weight: 600;">GPS Accuracy: ±${Math.round(userLocation.accuracy)}m</span>
        </div>
      `);
    }

    // Accuracy Circle
    const accuracyRadius = Math.max(userLocation.accuracy, 10);
    if (accuracyCircleRef.current) {
      accuracyCircleRef.current.setLatLng(latLng);
      accuracyCircleRef.current.setRadius(accuracyRadius);
    } else {
      accuracyCircleRef.current = L.circle(latLng, {
        radius: accuracyRadius,
        color: '#0051d5',
        weight: 1.5,
        fillColor: '#316bf3',
        fillOpacity: 0.12,
      }).addTo(map);
    }
  }, [userLocation]);

  // Update Safety Hub Markers
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    // Clear previous hub markers
    hubMarkersRef.current.forEach((marker) => marker.remove());
    hubMarkersRef.current = [];

    const filtered = activeLayer === 'all' ? hubs : hubs.filter((h) => h.type === activeLayer);

    filtered.forEach((hub) => {
      const isPolice = hub.type === 'police';
      const isHospital = hub.type === 'hospital';
      const bgColor = isPolice ? '#001026' : isHospital ? '#ba1a1a' : '#15803d';
      const iconChar = isPolice ? '👮' : isHospital ? '🏥' : '🛡️';

      const hubIcon = L.divIcon({
        className: 'custom-hub-marker',
        html: `
          <div style="cursor: pointer; background: ${bgColor}; color: #ffffff; border: 2px solid #ffffff; border-radius: 12px; padding: 4px 8px; font-size: 11px; font-weight: bold; box-shadow: 0 4px 10px rgba(0,0,0,0.3); display: flex; align-items: center; gap: 4px; white-space: nowrap;">
            <span>${iconChar}</span>
            <span>${hub.name.split(' ')[0]}</span>
          </div>
        `,
        iconSize: [80, 26],
        iconAnchor: [40, 13],
      });

      const marker = L.marker([hub.latitude, hub.longitude], { icon: hubIcon }).addTo(map);

      marker.on('click', () => {
        if (onSelectHub) onSelectHub(hub);
      });

      const popupContent = `
        <div style="font-family: sans-serif; font-size: 12px; min-width: 170px;">
          <strong style="color: #001026; display: block; margin-bottom: 2px;">${hub.name}</strong>
          <span style="color: #44474e; font-size: 11px; display: block; margin-bottom: 4px;">${hub.address}</span>
          <span style="color: #0051d5; font-size: 11px; font-weight: 600; display: block; margin-bottom: 6px;">${hub.officer}</span>
          <button id="dial-${hub.id}" style="width: 100%; background: #0051d5; color: #ffffff; border: none; border-radius: 6px; padding: 6px 8px; font-size: 11px; font-weight: bold; cursor: pointer;">
            📞 Dial Desk (${hub.phone})
          </button>
        </div>
      `;

      marker.bindPopup(popupContent);

      marker.on('popupopen', () => {
        const btn = document.getElementById(`dial-${hub.id}`);
        if (btn && onEmergencyDial) {
          btn.onclick = () => onEmergencyDial(hub.phone);
        }
      });

      hubMarkersRef.current.push(marker);
    });
  }, [hubs, activeLayer, onSelectHub, onEmergencyDial]);

  const handleCenterOnUser = () => {
    if (!mapRef.current) return;
    if (userLocation) {
      mapRef.current.flyTo([userLocation.latitude, userLocation.longitude], 16, {
        duration: 1.2,
      });
    } else {
      mapRef.current.flyTo([defaultLat, defaultLng], 15, {
        duration: 1.2,
      });
    }
  };

  return (
    <div className={`relative w-full ${heightClass} rounded-2xl overflow-hidden shadow-md border border-surface-container bg-surface-container`}>
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Floating Recenter Action Button */}
      {isInteractive && (
        <button
          onClick={handleCenterOnUser}
          className="absolute top-3 right-3 z-10 w-10 h-10 rounded-xl bg-surface-container-lowest/95 hover:bg-surface-container-lowest text-primary shadow-md border border-surface-container flex items-center justify-center transition-transform active:scale-95 cursor-pointer backdrop-blur-md"
          title="Center on my GPS position"
          type="button"
        >
          <span className="material-symbols-outlined text-[20px] text-secondary">
            my_location
          </span>
        </button>
      )}
    </div>
  );
};
