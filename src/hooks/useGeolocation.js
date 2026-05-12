import { useState } from "react";

export function useGeolocation() {
  const [coords, setCoords] = useState(null);
  const [isLocating, setIsLocating] = useState(false);

  const requestLocation = () =>
    new Promise((resolve) => {
      if (!navigator?.geolocation) {
        resolve(null);
        return;
      }

      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const next = {
            latitude: Number(position.coords.latitude.toFixed(6)),
            longitude: Number(position.coords.longitude.toFixed(6)),
          };
          setCoords(next);
          setIsLocating(false);
          resolve(next);
        },
        () => {
          setIsLocating(false);
          resolve(null);
        },
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
      );
    });

  return { coords, isLocating, requestLocation };
}
