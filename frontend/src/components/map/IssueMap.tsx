import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import { Issue, IssueStatus } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { Button } from '../common/Button';
import { Link } from 'react-router-dom';
import { Crosshair, Layers, ArrowRight, Clock, AlertTriangle, Eye } from 'lucide-react';
import { getSlaInfo } from '../../utils/helpers';

interface IssueMapProps {
  issues: Issue[];
  center?: [number, number];
  zoom?: number;
  userLocation?: { latitude: number; longitude: number } | null;
  selectedIssueId?: string;
  onSelectIssue?: (issue: Issue) => void;
  showHeatmap?: boolean;
}

// Map recenter controller component
function RecenterMap({ lat, lng, zoom }: { lat: number; lng: number; zoom?: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], zoom || map.getZoom(), { duration: 1.2 });
  }, [lat, lng, zoom, map]);
  return null;
}

// Generate colored SVG pin icons for Leaflet markers
function createCustomPin(status: IssueStatus, count = 1) {
  const colors: Record<IssueStatus, { bg: string; border: string }> = {
    reported: { bg: '#ef4444', border: '#b91c1c' },
    acknowledged: { bg: '#8b5cf6', border: '#6d28d9' },
    in_progress: { bg: '#f59e0b', border: '#d97706' },
    resolved: { bg: '#10b981', border: '#059669' },
    disputed: { bg: '#f97316', border: '#c2410c' },
    closed: { bg: '#6b7280', border: '#4b5563' },
  };

  const { bg, border } = colors[status] || colors.reported;

  const html = `
    <div style="position: relative; width: 34px; height: 42px; display: flex; align-items: center; justify-content: center; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3)); cursor: pointer;">
      <svg viewBox="0 0 34 42" width="34" height="42" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M17 0C7.61 0 0 7.61 0 17C0 29.75 17 42 17 42C17 42 34 29.75 34 17C34 7.61 26.39 0 17 0Z" fill="${bg}" stroke="${border}" stroke-width="2"/>
        <circle cx="17" cy="17" r="8" fill="#FFFFFF"/>
        <circle cx="17" cy="17" r="4" fill="${bg}"/>
      </svg>
      ${
        count > 1
          ? `<span style="position: absolute; top: -4px; right: -4px; background: #1e293b; color: white; font-size: 10px; font-weight: bold; border-radius: 999px; padding: 2px 5px; border: 1.5px solid white;">${count}</span>`
          : ''
      }
    </div>
  `;

  return L.divIcon({
    className: 'custom-leaflet-pin',
    html,
    iconSize: [34, 42],
    iconAnchor: [17, 42],
    popupAnchor: [0, -38],
  });
}

const userLocationIcon = L.divIcon({
  className: 'user-pulse-pin',
  html: `
    <div style="position: relative; width: 24px; height: 24px;">
      <div style="position: absolute; inset: 0; background: #0284c7; border-radius: 9999px; opacity: 0.35; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
      <div style="position: relative; width: 24px; height: 24px; background: #0284c7; border-radius: 9999px; border: 3px solid #ffffff; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"></div>
    </div>
  `,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

export const IssueMap: React.FC<IssueMapProps> = ({
  issues,
  center = [12.9352, 77.6245],
  zoom = 14,
  userLocation,
  selectedIssueId,
  onSelectIssue,
  showHeatmap = false,
}) => {
  const [mapCenter, setMapCenter] = useState<[number, number]>(center);
  const [currentZoom, setCurrentZoom] = useState<number>(zoom);

  const handleLocateUser = () => {
    if (userLocation) {
      setMapCenter([userLocation.latitude, userLocation.longitude]);
      setCurrentZoom(16);
    }
  };

  return (
    <div className="relative w-full h-full min-h-[420px] rounded-3xl overflow-hidden shadow-inner border border-slate-200">
      <MapContainer
        center={mapCenter}
        zoom={currentZoom}
        scrollWheelZoom={true}
        className="w-full h-full z-0"
        style={{ minHeight: '420px' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <RecenterMap lat={mapCenter[0]} lng={mapCenter[1]} zoom={currentZoom} />

        {/* User GPS pulse location marker */}
        {userLocation && (
          <Marker
            position={[userLocation.latitude, userLocation.longitude]}
            icon={userLocationIcon}
          >
            <Popup>
              <div className="p-1 font-semibold text-xs text-slate-800">
                You are here (Within 10m accuracy)
              </div>
            </Popup>
          </Marker>
        )}

        {/* Heatmap density circles if enabled */}
        {showHeatmap &&
          issues.map((issue) => {
            const isResolved = issue.status === 'resolved' || issue.status === 'closed';
            return (
              <Circle
                key={`heat_${issue.id}`}
                center={[issue.location.latitude, issue.location.longitude]}
                radius={240}
                pathOptions={{
                  fillColor: isResolved ? '#10b981' : '#ef4444',
                  fillOpacity: 0.28,
                  stroke: false,
                }}
              />
            );
          })}

        {/* Issue Pins */}
        {issues.map((issue) => {
          const sla = getSlaInfo(issue.sla_deadline, issue.status === 'resolved');
          const isSelected = selectedIssueId === issue.id;

          return (
            <Marker
              key={issue.id}
              position={[issue.location.latitude, issue.location.longitude]}
              icon={createCustomPin(issue.status, issue.upvotes_count)}
              eventHandlers={{
                click: () => onSelectIssue?.(issue),
              }}
            >
              <Popup className="civic-custom-popup">
                <div className="w-64 p-1">
                  {issue.photo_url && (
                    <img
                      src={issue.photo_url}
                      alt={issue.title}
                      className="w-full h-28 object-cover rounded-xl mb-2.5 border border-slate-100"
                    />
                  )}
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <StatusBadge status={issue.status} size="sm" />
                    <span className="text-[10px] font-mono text-slate-500 font-bold">
                      {issue.tracking_id}
                    </span>
                  </div>

                  <h4 className="font-bold text-xs text-slate-900 line-clamp-2 leading-snug">
                    {issue.title}
                  </h4>

                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                    {issue.location.address || issue.location.ward}
                  </p>

                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${sla.badgeColorClass}`}>
                      {sla.formattedText}
                    </span>

                    <Link
                      to={`/tickets/${issue.id}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-700"
                    >
                      <span>View</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Floating map controls */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        {userLocation && (
          <button
            onClick={handleLocateUser}
            className="p-3 bg-white rounded-xl shadow-md border border-slate-200 text-slate-700 hover:text-brand-600 hover:bg-slate-50 transition"
            title="Recenter on my GPS position"
          >
            <Crosshair className="w-5 h-5 text-brand-600" />
          </button>
        )}
      </div>

      {/* Status Legend Bar */}
      <div className="absolute bottom-4 left-4 right-4 z-10 bg-white px-3.5 py-2.5 rounded-xl shadow-md border border-slate-200 flex items-center justify-between overflow-x-auto text-xs gap-3">
        <div className="flex items-center gap-4 shrink-0 font-medium text-slate-600">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Reported
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> Acknowledged
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> In Progress
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Resolved
          </span>
        </div>
        <span className="text-[11px] text-slate-400 shrink-0 hidden sm:inline">
          {issues.length} active issues plotted
        </span>
      </div>
    </div>
  );
};
