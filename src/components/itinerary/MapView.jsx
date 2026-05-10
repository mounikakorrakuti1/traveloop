import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useRef } from "react";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import "leaflet/dist/leaflet.css";
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow
});
/** Playbook §3.7 — Leaflet in refs; markers refreshed when `stops` change */ export function MapView({ stops, height = "400px" }) {
    const mapRef = useRef(null);
    const containerRef = useRef(null);
    const routeLayerRef = useRef(null);
    useEffect(()=>{
        if (!containerRef.current || mapRef.current) return;
        mapRef.current = L.map(containerRef.current).setView([
            20,
            78
        ], 4);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "© OpenStreetMap contributors"
        }).addTo(mapRef.current);
        routeLayerRef.current = L.layerGroup().addTo(mapRef.current);
        return ()=>{
            routeLayerRef.current = null;
            mapRef.current?.remove();
            mapRef.current = null;
        };
    }, []);
    useEffect(()=>{
        const map = mapRef.current;
        const layer = routeLayerRef.current;
        if (!map || !layer) return;
        layer.clearLayers();
        const withCity = stops.filter((s)=>Boolean(s.city));
        if (!withCity.length) return;
        const coords = withCity.map((s)=>[
                s.city.latitude,
                s.city.longitude
            ]);
        if (coords.length > 1) {
            L.polyline(coords, {
                color: "#0D7680",
                weight: 3,
                dashArray: "6 4"
            }).addTo(layer);
            map.fitBounds(coords);
        } else {
            const only = coords[0];
            if (only) map.setView(only, 6);
        }
        withCity.forEach((s)=>{
            L.marker([
                s.city.latitude,
                s.city.longitude
            ]).bindPopup(`<b>${s.city.name}</b><br/>${s.arrivalDate} → ${s.departureDate}`).addTo(layer);
        });
    }, [
        stops
    ]);
    return /*#__PURE__*/ _jsx("div", {
        ref: containerRef,
        style: {
            height,
            width: "100%"
        },
        className: "overflow-hidden rounded-xl border border-gray-200 dark:border-slate-700",
        "aria-label": "Trip map"
    });
}
