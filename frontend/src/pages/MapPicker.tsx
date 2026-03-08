import { useEffect, useRef, useState } from "react";
import Map, { Marker } from "react-map-gl/mapbox";
import mapboxgl from "mapbox-gl";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";

import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";

const FAST = { lat: 31.48104, lng: 74.303449 };

interface Props {
  lat: number | null;
  lng: number | null;
  onSelect: (lat: number, lng: number) => void;
}

export default function MapPicker({ lat, lng, onSelect }: Props) {
  const mapRef = useRef<any>(null);
  const geocoderRef = useRef<HTMLDivElement>(null);
  const geocoderInstanceRef = useRef<MapboxGeocoder | null>(null);
  const [locating, setLocating] = useState(false);

  const [viewState, setViewState] = useState({
    latitude: lat ?? FAST.lat,
    longitude: lng ?? FAST.lng,
    zoom: 14
  });

  function handleCurrentLocation() {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setViewState((prev) => ({
          ...prev,
          latitude,
          longitude,
          zoom: 16
        }));
        onSelect(latitude, longitude);
        setLocating(false);
      },
      (error) => {
        setLocating(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            alert("Location permission denied. Please enable location access in your browser settings.");
            break;
          case error.POSITION_UNAVAILABLE:
            alert("Location information is unavailable.");
            break;
          case error.TIMEOUT:
            alert("The request to get your location timed out.");
            break;
          default:
            alert("An unknown error occurred while fetching location.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  }

  useEffect(() => {
    // Initialize geocoder only once
    if (geocoderInstanceRef.current || !geocoderRef.current) return;

    const geocoder = new MapboxGeocoder({
      accessToken: 'pk.eyJ1IjoiYXJoYW0xMjM0IiwiYSI6ImNta3J6ejF6cjE3eWIzbHFuczZxcGwwbTIifQ.Or9JpWqTXoefT5uaz5YjHA',
      mapboxgl: mapboxgl as any,
      placeholder: "Search hostel location...",
      marker: false,
    });

    // Add custom CSS to fix the icon/text layout
    const style = document.createElement('style');
    style.textContent = `
      /* Fix geocoder container */
      .mapboxgl-ctrl-geocoder {
        width: 100% !important;
        max-width: 100% !important;
        border-radius: 4px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        font-size: 14px;
      }
      
      /* Fix the input field */
      .mapboxgl-ctrl-geocoder input[type='text'] {
        height: 40px !important;
        padding: 8px 12px 8px 40px !important;
        font-size: 14px;
        line-height: 1.5;
        border-radius: 4px !important;
      }
      
      /* Fix search icon position */
      .mapboxgl-ctrl-geocoder .mapboxgl-ctrl-geocoder--icon {
        top: 50% !important;
        left: 12px !important;
        transform: translateY(-50%) !important;
        width: 18px !important;
        height: 18px !important;
      }
      
      /* Fix search icon color */
      .mapboxgl-ctrl-geocoder--icon {
        fill: #757575 !important;
      }
      
      /* Fix dropdown suggestions */
      .mapbox-gl-geocoder--suggestion {
        padding: 10px 12px !important;
        display: flex !important;
        align-items: center !important;
        gap: 8px !important;
        font-size: 14px;
        line-height: 1.5;
      }
      
      /* Fix suggestion icon */
      .mapbox-gl-geocoder--suggestion-icon {
        flex-shrink: 0 !important;
        margin-right: 8px !important;
        font-size: 16px;
      }
      
      /* Fix suggestion text */
      .mapbox-gl-geocoder--suggestion-text {
        flex: 1 !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
        white-space: nowrap !important;
      }
      
      /* Ensure the geocoder appears properly */
      .mapboxgl-ctrl-geocoder--input:focus {
        outline: 2px solid #4a90e2;
        outline-offset: -2px;
      }
      
      /* Fix loading spinner */
      .mapboxgl-ctrl-geocoder--icon-loading {
        width: 20px !important;
        height: 20px !important;
      }
      
      /* Remove any conflicting styles */
      .mapboxgl-ctrl-geocoder--icon-close {
        margin-top: -10px !important;
      }
      
      /* Ensure the geocoder dropdown appears above map */
      .mapboxgl-ctrl-geocoder--suggestions {
        z-index: 1000 !important;
        border-radius: 4px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      }
    `;
    document.head.appendChild(style);

    geocoder.addTo(geocoderRef.current);
    geocoderInstanceRef.current = geocoder;

    geocoder.on("result", (e: any) => {
      const [lng, lat] = e.result.center;

      setViewState((prev) => ({
        ...prev,
        latitude: lat,
        longitude: lng,
        zoom: 15
      }));

      onSelect(lat, lng);
    });

    return () => {
      // Clean up geocoder properly
      if (geocoderInstanceRef.current) {
        geocoderInstanceRef.current.clear();
        geocoderInstanceRef.current.onRemove();
        geocoderInstanceRef.current = null;
      }
      if (style.parentNode) {
        style.parentNode.removeChild(style);
      }
    };
  }, []);

  // Update map view when lat/lng props change
  useEffect(() => {
    if (lat && lng) {
      setViewState(prev => ({
        ...prev,
        latitude: lat,
        longitude: lng
      }));
    }
  }, [lat, lng]);

  return (
    <div>
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        marginBottom: "10px",
        position: "relative",
        zIndex: 2,
        width: "100%",
      }}>
        <div 
          ref={geocoderRef} 
          style={{ 
            flex: 1,
            height: "40px",
            position: "relative",
          }}
        />
        <button
          type="button"
          onClick={handleCurrentLocation}
          disabled={locating}
          style={{
            height: "40px",
            padding: "0 14px",
            border: "1px solid #ccc",
            borderRadius: "4px",
            background: locating ? "#e0e0e0" : "#fff",
            cursor: locating ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "13px",
            fontWeight: 500,
            color: "#333",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            whiteSpace: "nowrap",
            transition: "background 0.2s",
          }}
          title="Use current location"
        >
          {locating ? (
            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" style={{ animation: "spin 1s linear infinite" }}>
                <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
                <circle cx="12" cy="12" r="10" stroke="#999" strokeWidth="3" fill="none" strokeDasharray="31.4 31.4" />
              </svg>
              Locating…
            </span>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4a90e2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
              </svg>
              Current Location
            </>
          )}
        </button>
      </div>

      <div style={{ 
        width: "100%", 
        height: "300px", 
        minHeight: "300px", 
        position: "relative",
        zIndex: 1 
      }}>
        <Map
          ref={mapRef}
          mapLib={mapboxgl}
          mapboxAccessToken='pk.eyJ1IjoiYXJoYW0xMjM0IiwiYSI6ImNta3J6ejF6cjE3eWIzbHFuczZxcGwwbTIifQ.Or9JpWqTXoefT5uaz5YjHA'
          {...viewState}
          onMove={(e) => setViewState(e.viewState)}
          onClick={(e) => {
            const { lat, lng } = e.lngLat;
            onSelect(lat, lng);
          }}
          mapStyle="mapbox://styles/mapbox/streets-v11"
          style={{ width: "100%", height: "100%" }}
        >
          {lat && lng && <Marker latitude={lat} longitude={lng} />}
        </Map>
      </div>
    </div>
  );
}