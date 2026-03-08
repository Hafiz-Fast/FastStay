import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Map, { Marker, Source, Layer } from "react-map-gl/mapbox";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import styles from "../styles/DirectionsMap.module.css";

const MAPBOX_TOKEN =
  "pk.eyJ1IjoiYXJoYW0xMjM0IiwiYSI6ImNta3J6ejF6cjE3eWIzbHFuczZxcGwwbTIifQ.Or9JpWqTXoefT5uaz5YjHA";

const FAST_LAHORE = { lat: 31.48104, lng: 74.303449 };

interface RouteInfo {
  distance: number; // km
  duration: number; // minutes
  geometry: GeoJSON.LineString;
}

export default function DirectionsMap() {
  const mapRef = useRef<any>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );

  const hostelLat = parseFloat(queryParams.get("lat") || "0");
  const hostelLng = parseFloat(queryParams.get("lng") || "0");
  const hostelName = queryParams.get("name") || "Hostel";
  const userId = queryParams.get("user_id") || "";
  const hostelId = queryParams.get("hostel_id") || "";

  const [route, setRoute] = useState<RouteInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [viewState, setViewState] = useState({
    latitude: (FAST_LAHORE.lat + hostelLat) / 2,
    longitude: (FAST_LAHORE.lng + hostelLng) / 2,
    zoom: 13,
  });

  // Fetch route from Mapbox Directions API
  useEffect(() => {
    if (!hostelLat || !hostelLng) {
      setError("Hostel location not available.");
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    const fetchRoute = async () => {
      try {
        const url =
          `https://api.mapbox.com/directions/v5/mapbox/driving/` +
          `${FAST_LAHORE.lng},${FAST_LAHORE.lat};${hostelLng},${hostelLat}` +
          `?geometries=geojson&overview=full&access_token=${MAPBOX_TOKEN}`;

        const res = await fetch(url, { signal: controller.signal });
        const data = await res.json();

        if (data.routes && data.routes.length > 0) {
          const r = data.routes[0];
          setRoute({
            distance: parseFloat((r.distance / 1000).toFixed(1)),
            duration: Math.ceil(r.duration / 60),
            geometry: r.geometry,
          });
        } else {
          setError("No route found between the two locations.");
        }
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.error("Directions API error:", err);
          setError("Failed to fetch directions.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRoute();
    return () => controller.abort();
  }, [hostelLat, hostelLng]);

  // Fit map to route bounds once route is loaded
  useEffect(() => {
    if (!route || !mapRef.current) return;

    const coords = route.geometry.coordinates;
    if (coords.length === 0) return;

    const bounds = new mapboxgl.LngLatBounds();
    coords.forEach((c) => bounds.extend(c as [number, number]));

    mapRef.current.fitBounds(bounds.toArray(), {
      padding: { top: 100, bottom: 200, left: 60, right: 60 },
      duration: 1000,
    });
  }, [route]);

  const routeGeoJSON: GeoJSON.Feature<GeoJSON.LineString> | null = route
    ? {
        type: "Feature",
        properties: {},
        geometry: route.geometry,
      }
    : null;

  const handleBack = useCallback(() => {
      navigate(`/student/hostelDetails?id=${hostelId}&user_id=${userId}`);
    }, [navigate, hostelId, userId]);

  return (
    <div className={styles.wrapper}>
      {/* Top bar */}
      <div className={styles.topBar}>
        <button className={styles.backBtn} onClick={handleBack}>
          <i className="fa-solid fa-arrow-left"></i>
        </button>
        <div className={styles.topBarTitle}>Directions</div>
        <div style={{ width: 40 }} />
      </div>

      {/* Map */}
      <div className={styles.mapContainer}>
        <Map
          ref={mapRef}
          mapLib={mapboxgl}
          mapboxAccessToken={MAPBOX_TOKEN}
          {...viewState}
          onMove={(e) => setViewState(e.viewState)}
          mapStyle="mapbox://styles/mapbox/streets-v12"
          style={{ width: "100%", height: "100%" }}
          attributionControl={false}
        >
          {/* Route line */}
          {routeGeoJSON && (
            <>
              {/* Route shadow */}
              <Source id="route-shadow" type="geojson" data={routeGeoJSON}>
                <Layer
                  id="route-shadow-layer"
                  type="line"
                  paint={{
                    "line-color": "#00000030",
                    "line-width": 10,
                    "line-blur": 4,
                  }}
                  layout={{
                    "line-join": "round",
                    "line-cap": "round",
                  }}
                />
              </Source>

              {/* Route line */}
              <Source id="route" type="geojson" data={routeGeoJSON}>
                <Layer
                  id="route-layer"
                  type="line"
                  paint={{
                    "line-color": "#4A90D9",
                    "line-width": 5,
                    "line-opacity": 0.9,
                  }}
                  layout={{
                    "line-join": "round",
                    "line-cap": "round",
                  }}
                />
              </Source>
            </>
          )}

          {/* FAST Lahore marker (origin) */}
          <Marker latitude={FAST_LAHORE.lat} longitude={FAST_LAHORE.lng} anchor="bottom">
            <div className={styles.originMarker}>
              <div className={styles.markerDot} style={{ background: "#27ae60" }} />
              <span className={styles.markerLabel}>FAST</span>
            </div>
          </Marker>

          {/* Hostel marker (destination) */}
          {hostelLat !== 0 && hostelLng !== 0 && (
            <Marker latitude={hostelLat} longitude={hostelLng} anchor="bottom">
              <div className={styles.destMarker}>
                <div className={styles.markerPin}>
                  <i className="fa-solid fa-location-dot"></i>
                </div>
              </div>
            </Marker>
          )}
        </Map>

        {loading && (
          <div className={styles.loadingOverlay}>
            <div className={styles.spinner} />
            <p>Finding best route...</p>
          </div>
        )}
      </div>

      {/* Bottom card (InDrive-style) */}
      <div className={styles.bottomCard}>
        {error ? (
          <div className={styles.errorMsg}>
            <i className="fa-solid fa-triangle-exclamation"></i> {error}
          </div>
        ) : route ? (
          <>
            <div className={styles.routeHeader}>
              <div className={styles.routeTitle}>{hostelName}</div>
              <div className={styles.routeSubtitle}>
                Block {queryParams.get("block") || "—"}, House{" "}
                {queryParams.get("house") || "—"}
              </div>
            </div>

            <div className={styles.routeStats}>
              <div className={styles.stat}>
                <i className="fa-solid fa-road"></i>
                <div>
                  <span className={styles.statValue}>{route.distance} km</span>
                  <span className={styles.statLabel}>Distance</span>
                </div>
              </div>
              <div className={styles.statDivider} />
              <div className={styles.stat}>
                <i className="fa-solid fa-clock"></i>
                <div>
                  <span className={styles.statValue}>{route.duration} min</span>
                  <span className={styles.statLabel}>Drive</span>
                </div>
              </div>
              <div className={styles.statDivider} />
              <div className={styles.stat}>
                <i className="fa-solid fa-person-walking"></i>
                <div>
                  <span className={styles.statValue}>
                    {Math.ceil((route.distance / 5) * 60)} min
                  </span>
                  <span className={styles.statLabel}>Walk</span>
                </div>
              </div>
            </div>

            <div className={styles.routeSteps}>
              <div className={styles.step}>
                <div className={styles.stepIcon} style={{ background: "#27ae60" }}>
                  <i className="fa-solid fa-graduation-cap"></i>
                </div>
                <div className={styles.stepText}>
                  <strong>FAST-NUCES Lahore</strong>
                  <span>Starting Point</span>
                </div>
              </div>
              <div className={styles.stepLine} />
              <div className={styles.step}>
                <div className={styles.stepIcon} style={{ background: "#e74c3c" }}>
                  <i className="fa-solid fa-building"></i>
                </div>
                <div className={styles.stepText}>
                  <strong>{hostelName}</strong>
                  <span>Destination</span>
                </div>
              </div>
            </div>

            <a
              className={styles.googleMapsBtn}
              href={`https://www.google.com/maps/dir/${FAST_LAHORE.lat},${FAST_LAHORE.lng}/${hostelLat},${hostelLng}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="fa-solid fa-diamond-turn-right"></i> Open in Google Maps
            </a>
          </>
        ) : null}
      </div>
    </div>
  );
}