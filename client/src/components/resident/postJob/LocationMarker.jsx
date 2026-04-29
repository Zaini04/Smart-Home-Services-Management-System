// postJob/LocationMarker.jsx
import React from "react";
import { Marker, useMapEvents, useMap } from "react-leaflet";

function LocationMarker({ position, setPosition, setAddress }) {
  const map = useMap();

  useMapEvents({
    async click(e) {
      const { lat, lng } = e.latlng;
      setPosition({ lat, lng });
      map.flyTo(e.latlng, map.getZoom());
      try {
        const res  = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
        const data = await res.json();
        if (data?.display_name) setAddress(data.display_name);
      } catch (err) {
        console.error("Geocoding failed");
      }
    },
  });

  return position === null ? null : <Marker position={position} />;
}

export default LocationMarker;

