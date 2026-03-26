"use client";
import React, { useEffect, useRef, useCallback } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

interface MapLocation {
  name: string;
  lat: number;
  lon: number;
  temp: number;
  heatIndex: number;
  riskScore: number;
  alerts: any[];
}

interface MapInnerProps {
  locations: MapLocation[];
  onDoubleClick?: (lat: number, lon: number) => void;
}

const MapInner: React.FC<MapInnerProps> = ({ locations, onDoubleClick }) => {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const pulseMarkerRef = useRef<L.Marker | null>(null);

  const getMarkerIcon = (score: number) => {
    const color = score < 30 ? "#10b981" : score < 60 ? "#f59e0b" : "#f43f5e";
    return L.divIcon({
      className: "custom-marker",
      html: `<div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid #fff; box-shadow: 0 0 10px ${color};"></div>`,
    });
  };

  const getPulseIcon = () => {
    return L.divIcon({
      className: "pulse-marker",
      html: `
        <div style="position: relative; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 30px; height: 30px; border-radius: 50%; background: rgba(6, 182, 212, 0.3); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="width: 12px; height: 12px; border-radius: 50%; background: #06b6d4; border: 2px solid #fff; box-shadow: 0 0 15px rgba(6, 182, 212, 0.6); z-index: 10;"></div>
        </div>
      `,
      iconSize: [30, 30],
      iconAnchor: [15, 15],
    });
  };

  // Initialize map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [12.8797, 121.774],
      zoom: 5,
      scrollWheelZoom: true,
      doubleClickZoom: false, // Disable default double-click zoom so we can use it
    });

    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
    }).addTo(map);

    // Double-click handler
    map.on("dblclick", (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;

      // Show pulse marker at clicked location
      if (pulseMarkerRef.current) {
        pulseMarkerRef.current.remove();
      }
      const pulseMarker = L.marker([lat, lng], { icon: getPulseIcon() }).addTo(map);
      pulseMarkerRef.current = pulseMarker;

      if (onDoubleClick) {
        onDoubleClick(lat, lng);
      }
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Keep onDoubleClick callback up-to-date
  useEffect(() => {
    if (!mapRef.current) return;
    
    mapRef.current.off("dblclick");
    mapRef.current.on("dblclick", (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      
      if (pulseMarkerRef.current) {
        pulseMarkerRef.current.remove();
      }
      const pulseMarker = L.marker([lat, lng], { icon: getPulseIcon() }).addTo(mapRef.current!);
      pulseMarkerRef.current = pulseMarker;

      if (onDoubleClick) {
        onDoubleClick(lat, lng);
      }
    });
  }, [onDoubleClick]);

  // Update markers when locations change
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    locations.forEach((loc) => {
      const marker = L.marker([loc.lat, loc.lon], {
        icon: getMarkerIcon(loc.riskScore),
      }).addTo(mapRef.current!);

      marker.bindPopup(`
        <div style="padding: 8px; min-width: 150px;">
          <h4 style="font-weight: bold; font-size: 16px; margin-bottom: 4px;">${loc.name}</h4>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 12px;">
            <span style="color: #6b7280; font-weight: bold;">Temp:</span>
            <span style="font-family: monospace; color: #0891b2; font-weight: 900;">${loc.temp}°C</span>
            <span style="color: #6b7280; font-weight: bold;">Heat Index:</span>
            <span style="font-family: monospace; color: #0891b2; font-weight: 900;">${loc.heatIndex}°C</span>
            <span style="color: #6b7280; font-weight: bold;">Risk:</span>
            <span style="font-family: monospace; color: #0891b2; font-weight: 900;">${Math.round(loc.riskScore)}%</span>
            <span style="color: #6b7280; font-weight: bold;">Alerts:</span>
            <span style="font-family: monospace; color: ${loc.alerts.length > 0 ? '#f43f5e' : '#10b981'}; font-weight: 900;">${loc.alerts.length}</span>
          </div>
        </div>
      `);

      markersRef.current.push(marker);
    });
  }, [locations]);

  return <div ref={containerRef} style={{ height: "100%", width: "100%", background: "#0a0e1a" }} />;
};

export default MapInner;
