"use client";
import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

type Pin = { lat: number; lon: number } | null;

// Tap the map to drop a pin. Map tiles come from OpenStreetMap (keep usage light; see their tile policy).
export default function MapPicker({ pin, onPick }: { pin: Pin; onPick: (p: { lat: number; lon: number }) => void }) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const marker = useRef<L.CircleMarker | null>(null);
  const cb = useRef(onPick);
  cb.current = onPick; // always call the latest callback

  useEffect(() => {
    if (!el.current || map.current) return;
    const m = L.map(el.current).setView([22.5, 79], 4); // centre of India
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18,
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(m);
    m.on("click", (e: L.LeafletMouseEvent) => cb.current({ lat: e.latlng.lat, lon: e.latlng.lng }));
    map.current = m;
    return () => {
      m.remove();
      map.current = null;
      marker.current = null;
    };
  }, []);

  useEffect(() => {
    const m = map.current;
    if (!m || !pin) return;
    if (marker.current) marker.current.setLatLng([pin.lat, pin.lon]);
    else {
      marker.current = L.circleMarker([pin.lat, pin.lon], {
        radius: 10, color: "#1F5E3B", fillColor: "#1F5E3B", fillOpacity: 0.8,
      }).addTo(m);
    }
    m.setView([pin.lat, pin.lon], Math.max(m.getZoom(), 12));
  }, [pin]);

  return <div ref={el} className="map" />;
}
