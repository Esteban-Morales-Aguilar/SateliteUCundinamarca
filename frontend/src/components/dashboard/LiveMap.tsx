import { MapContainer, TileLayer, CircleMarker, Polyline, Popup, useMap } from 'react-leaflet';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';

function MapFollower({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom, { animate: true });
  }, [center, zoom, map]);
  return null;
}

export function LiveMap({ latest, history, center, zoom }: { latest: any; history: any; center?: [number, number]; zoom?: number }) {
  const { t } = useTranslation();
  const GROUND_STATION = { lat: center ? center[0] : 4.34, lng: center ? center[1] : -74.37 };
  const trail = (history || []).filter((p: any) => p && (p.latitude != null || p.lat != null));
  const balloonPos: [number, number] = latest?.latitude != null && latest?.longitude != null
    ? [latest.latitude, latest.longitude]
    : latest?.lat != null && latest?.lng != null
      ? [latest.lat, latest.lng]
      : [GROUND_STATION.lat, GROUND_STATION.lng];

  const positions: [number, number][] = trail.map((p: any) => [p.latitude || p.lat || GROUND_STATION.lat, p.longitude || p.lng || GROUND_STATION.lng]);

  // Follow the satellite: center on balloon position if available, otherwise ground station
  const followCenter: [number, number] = latest?.altitude != null ? balloonPos : [GROUND_STATION.lat, GROUND_STATION.lng];
  const followZoom = latest?.altitude != null ? 10 : (zoom || 8);

  return (
    <MapContainer center={[GROUND_STATION.lat, GROUND_STATION.lng]} zoom={zoom || 8} style={{ height: '400px', width: '100%' }} scrollWheelZoom={false}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapFollower center={followCenter} zoom={followZoom} />
      {/* Ground station - Fusagasugá */}
      <CircleMarker center={[GROUND_STATION.lat, GROUND_STATION.lng]} radius={8} pathOptions={{ color: '#003366', fillColor: '#003366', fillOpacity: 0.9 }}>
        <Popup>{t('dashboard.groundStation')} (Fusagasugá)</Popup>
      </CircleMarker>
      {/* Balloon position (latest) - red marker */}
      {latest?.altitude != null && (
        <CircleMarker center={balloonPos} radius={10} pathOptions={{ color: '#B71C1C', fillColor: '#B71C1C', fillOpacity: 1 }}>
          <Popup>{t('dashboard.altitude')}: {Math.round(latest.altitude)} m</Popup>
        </CircleMarker>
      )}
      {/* Red path - ascent/descent trajectory */}
      {positions.length > 1 && (
        <Polyline positions={positions} pathOptions={{ color: '#B71C1C', weight: 3, opacity: 0.75 }} />
      )}
    </MapContainer>
  );
}
