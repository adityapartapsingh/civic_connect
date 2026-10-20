import { useState, useEffect, useCallback } from 'react';
import { LocationData } from '../types';

interface GeolocationState {
  coords: { latitude: number; longitude: number } | null;
  accuracy: number | null;
  readingsCount: number;
  isMockSuspected: boolean;
  address: string;
  landmark: string;
  ward: string;
  isLoading: boolean;
  error: string | null;
}

const DEFAULT_COORDS = {
  latitude: 31.3260,
  longitude: 75.5762,
  address: 'Civil Lines, Jalandhar, Punjab',
  landmark: 'Near Company Bagh',
  ward: 'Jalandhar Municipal Corporation',
};

export function useGeolocation() {
  const [geoState, setGeoState] = useState<GeolocationState>({
    coords: null,
    accuracy: null,
    readingsCount: 0,
    isMockSuspected: false,
    address: '',
    landmark: '',
    ward: '',
    isLoading: true,
    error: null,
  });

  const reverseGeocode = useCallback(async (lat: number, lon: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'CivicConnect-App/1.0',
          },
        }
      );
      if (res.ok) {
        const data = await res.json();
        const addr = data.address || {};
        
        const road = addr.road || addr.suburb || addr.neighbourhood || addr.residential || '';
        const suburb = addr.suburb || addr.neighbourhood || addr.subdistrict || addr.locality || '';
        const city = addr.city || addr.town || addr.municipality || addr.county || addr.state_district || 'Local Area';
        const state = addr.state || '';
        
        const fullAddress = [road, suburb, city, state].filter(Boolean).join(', ') || data.display_name?.split(',').slice(0, 3).join(',') || 'Current Location';
        const landmark = addr.amenity || addr.building || (road ? `Near ${road}` : `Near ${city}`);
        const ward = suburb ? `${suburb} Area` : `${city} Ward`;

        return {
          address: fullAddress,
          landmark,
          ward,
        };
      }
    } catch {
      // Network or CORS error on reverse geocode
    }
    return {
      address: `Coordinates: ${lat.toFixed(4)}, ${lon.toFixed(4)}`,
      landmark: 'Live GPS Location',
      ward: 'Current Municipal Area',
    };
  }, []);

  const acquireAccurateLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setGeoState({
        coords: { latitude: DEFAULT_COORDS.latitude, longitude: DEFAULT_COORDS.longitude },
        accuracy: 10,
        readingsCount: 1,
        isMockSuspected: false,
        address: DEFAULT_COORDS.address,
        landmark: DEFAULT_COORDS.landmark,
        ward: DEFAULT_COORDS.ward,
        isLoading: false,
        error: 'Geolocation is not supported by your browser. Using simulated ward location.',
      });
      return;
    }

    setGeoState((prev) => ({ ...prev, isLoading: true, error: null }));

    // Step 1: Immediate instant position capture via browser navigator.geolocation
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        const acc = Math.round(pos.coords.accuracy);

        const geoData = await reverseGeocode(lat, lon);
        setGeoState({
          coords: { latitude: lat, longitude: lon },
          accuracy: acc,
          readingsCount: 1,
          isMockSuspected: false,
          address: geoData.address,
          landmark: geoData.landmark,
          ward: geoData.ward,
          isLoading: false,
          error: null,
        });
      },
      async (err) => {
        console.warn('Browser GPS permission not granted or timeout, attempting IP-based geolocation fallback...', err.message);
        
        // IP-based real location fallback (fetches user's real city/state e.g. Jalandhar, Punjab)
        try {
          const ipRes = await fetch('https://ipapi.co/json/');
          if (ipRes.ok) {
            const ipData = await ipRes.json();
            if (ipData.latitude && ipData.longitude) {
              const lat = ipData.latitude;
              const lon = ipData.longitude;
              const city = ipData.city || 'Jalandhar';
              const region = ipData.region || 'Punjab';
              
              setGeoState({
                coords: { latitude: lat, longitude: lon },
                accuracy: 100,
                readingsCount: 1,
                isMockSuspected: false,
                address: `${city}, ${region}, India`,
                landmark: `${city} City Center`,
                ward: `${city} Municipal Corporation`,
                isLoading: false,
                error: null,
              });
              return;
            }
          }
        } catch {
          // IP fallback failed
        }

        // Final fallback if all network & GPS fail
        setGeoState({
          coords: null,
          accuracy: null,
          readingsCount: 0,
          isMockSuspected: false,
          address: 'Location permission needed',
          landmark: 'Please allow location access in your browser',
          ward: 'Local Ward',
          isLoading: false,
          error: 'Please enable Location permission in your browser to view your live ward and map.',
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 10000,
      }
    );

    // Step 2: Continuous live position updates
    const watchId = navigator.geolocation.watchPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        const acc = Math.round(pos.coords.accuracy);

        // Update live coordinates immediately
        setGeoState((prev) => ({
          ...prev,
          coords: { latitude: lat, longitude: lon },
          accuracy: acc,
          readingsCount: prev.readingsCount + 1,
          isLoading: false,
        }));
      },
      (err) => {
        console.warn('Live watch error:', err.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000,
      }
    );

    // Safety clear watch on timeout
    const timer = setTimeout(() => {
      navigator.geolocation.clearWatch(watchId);
    }, 30000);

    return () => {
      clearTimeout(timer);
      navigator.geolocation.clearWatch(watchId);
    };
  }, [reverseGeocode]);

  useEffect(() => {
    acquireAccurateLocation();
  }, [acquireAccurateLocation]);

  const getLocationData = (): LocationData => ({
    latitude: geoState.coords?.latitude ?? DEFAULT_COORDS.latitude,
    longitude: geoState.coords?.longitude ?? DEFAULT_COORDS.longitude,
    address: geoState.address || DEFAULT_COORDS.address,
    landmark: geoState.landmark || DEFAULT_COORDS.landmark,
    ward: geoState.ward || DEFAULT_COORDS.ward,
    accuracy: geoState.accuracy ?? 10,
    isMockSuspected: geoState.isMockSuspected,
  });

  return {
    ...geoState,
    refreshLocation: acquireAccurateLocation,
    getLocationData,
  };
}
