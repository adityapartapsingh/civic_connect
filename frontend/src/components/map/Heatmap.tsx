import React, { useEffect, useMemo } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';
import { Flame } from 'lucide-react';
import { Issue } from '../../types';

interface HeatmapToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  hotspotsCount?: number;
}

export const HeatmapToggle: React.FC<HeatmapToggleProps> = ({
  enabled,
  onToggle,
  hotspotsCount = 3,
}) => {
  return (
    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-300 shadow-xs">
      <div className="flex items-center gap-2.5">
        <div
          className={`p-1.5 rounded transition-colors ${
            enabled ? 'bg-red-700 text-white' : 'bg-slate-100 text-slate-500'
          }`}
        >
          <Flame className="w-4 h-4" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-900">Density Heatmap</span>
            {enabled && (
              <span className="text-[10px] bg-red-50 text-red-700 font-mono font-medium px-1.5 py-0.5 border border-red-200 rounded">
                Thermal Active
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-500">
            {enabled
              ? 'Displaying high-density issue clusters & unresolved problem areas'
              : 'Show municipal cluster density overlay'}
          </p>
        </div>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        onClick={() => onToggle(!enabled)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
          enabled ? 'bg-red-600' : 'bg-slate-300'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            enabled ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
};

interface HeatmapLayerProps {
  issues: Issue[];
  radius?: number;
  blur?: number;
  maxZoom?: number;
}

/**
 * Continuous GIS Density Heatmap Layer for Leaflet.
 * Uses Gaussian blur kernel with multi-stop thermal gradient:
 * Cyan -> Green -> Yellow -> Orange -> Deep Red.
 */
export const HeatmapLayer: React.FC<HeatmapLayerProps> = ({
  issues,
  radius = 32,
  blur = 20,
  maxZoom = 16,
}) => {
  const map = useMap();

  const heatPoints = useMemo(() => {
    const points: [number, number, number][] = [];

    issues.forEach((issue) => {
      const lat = issue.location?.latitude;
      const lng = issue.location?.longitude;
      if (!lat || !lng || isNaN(lat) || isNaN(lng)) return;

      // Base weight by priority
      let weight = 0.5;
      if (issue.priority === 'urgent') weight = 1.0;
      else if (issue.priority === 'high') weight = 0.8;
      else if (issue.priority === 'medium') weight = 0.6;
      else if (issue.priority === 'low') weight = 0.4;

      // Unresolved issues contribute full intensity; resolved issues have reduced footprint
      const isUnresolved = issue.status !== 'resolved' && issue.status !== 'closed';
      if (!isUnresolved) {
        weight *= 0.35;
      }

      // Add extra intensity for citizen upvotes / community corroborations
      const upvotesBonus = Math.min(0.3, (issue.upvotes_count || 0) * 0.05);
      const intensity = Math.min(1.0, weight + upvotesBonus);

      // Primary hotspot node
      points.push([lat, lng, intensity]);

      // If active and high priority, add secondary dispersion nodes to form realistic continuous thermal blobs
      if (isUnresolved && weight >= 0.7) {
        const offsets = [
          [0.0004, 0.0003],
          [-0.0003, -0.0004],
          [0.0005, -0.0002],
          [-0.0002, 0.0005],
        ];
        offsets.forEach(([dLat, dLng]) => {
          points.push([lat + dLat, lng + dLng, intensity * 0.75]);
        });
      }
    });

    return points;
  }, [issues]);

  useEffect(() => {
    if (!heatPoints.length) return;

    // Initialize leaflet.heat layer with real continuous thermal color ramp
    const heat = (L as any).heatLayer(heatPoints, {
      radius,
      blur,
      maxZoom,
      max: 1.0,
      minOpacity: 0.38,
      gradient: {
        0.15: '#38bdf8', // light blue/cyan halo
        0.35: '#22c55e', // green zone
        0.55: '#facc15', // yellow warning zone
        0.75: '#f97316', // orange high density
        1.00: '#dc2626', // solid red severe hotspot
      },
    });

    heat.addTo(map);

    return () => {
      map.removeLayer(heat);
    };
  }, [map, heatPoints, radius, blur, maxZoom]);

  return null;
};
