import { useEffect, useRef } from "react";
import { MapView } from "@/components/Map";
import { cn } from "@/lib/utils";

type MapDefect = {
  id: number;
  label: string;
  severity: "low" | "medium" | "high" | "critical";
  latitude: string | number;
  longitude: string | number;
};

type MapTelemetry = {
  latitude: string | number;
  longitude: string | number;
};

function colorForSeverity(severity: MapDefect["severity"]) {
  return severity === "critical" ? "#ef4444" : severity === "high" ? "#f97316" : severity === "medium" ? "#eab308" : "#22c55e";
}

export function DriftMap({
  defects,
  telemetry,
  selectedId,
  onSelect,
  className,
}: {
  defects: MapDefect[];
  telemetry: MapTelemetry[];
  selectedId?: number;
  onSelect: (id: number) => void;
  className?: string;
}) {
  const overlays = useRef<google.maps.MVCObject[]>([]);

  const coordinates = [...defects, ...telemetry]
    .map(point => ({ lat: Number(point.latitude), lng: Number(point.longitude) }))
    .filter(point => Number.isFinite(point.lat) && Number.isFinite(point.lng));
  const center = coordinates[0] ?? { lat: 28.6139, lng: 77.209 };

  return (
    <div className={cn("relative min-h-[420px] overflow-hidden bg-slate-950", className)} aria-label="Provider-backed geospatial defect map">
      <MapView
        className="h-[420px]"
        initialCenter={center}
        initialZoom={coordinates.length ? 15 : 12}
        onMapReady={map => {
          overlays.current.forEach(item => {
            if ("setMap" in item && typeof item.setMap === "function") item.setMap(null);
          });
          overlays.current = [];

          if (telemetry.length > 1) {
            const route = new google.maps.Polyline({
              map,
              path: telemetry.map(point => ({ lat: Number(point.latitude), lng: Number(point.longitude) })),
              geodesic: true,
              strokeColor: "#06b6d4",
              strokeOpacity: 0.9,
              strokeWeight: 3,
            });
            overlays.current.push(route);
          }

          defects.forEach(defect => {
            const marker = new google.maps.Marker({
              map,
              position: { lat: Number(defect.latitude), lng: Number(defect.longitude) },
              title: `${defect.label} · ${defect.severity}`,
              label: { text: String(defect.id), color: "#ffffff", fontSize: "10px", fontWeight: "700" },
              icon: {
                path: google.maps.SymbolPath.CIRCLE,
                fillColor: colorForSeverity(defect.severity),
                fillOpacity: selectedId === defect.id ? 1 : 0.82,
                strokeColor: "#ffffff",
                strokeWeight: selectedId === defect.id ? 3 : 1,
                scale: selectedId === defect.id ? 10 : 7,
              },
            });
            marker.addListener("click", () => onSelect(defect.id));
            overlays.current.push(marker);
          });
        }}
      />
      <div className="pointer-events-none absolute left-3 top-3 z-10 max-w-[calc(100%-1.5rem)] bg-slate-950/90 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-100 shadow-lg">
        {coordinates.length ? `${defects.length} defects · ${telemetry.length} telemetry points · live coordinates` : "No mission coordinates yet · run a simulator mission or connect a bridge"}
      </div>
      <div className="pointer-events-none absolute bottom-3 left-3 z-10 flex flex-wrap gap-2 bg-slate-950/90 px-3 py-2 text-[10px] uppercase tracking-[0.12em] text-slate-200">
        <span><i className="mr-1 inline-block h-2 w-2 rounded-full bg-red-500" />critical</span>
        <span><i className="mr-1 inline-block h-2 w-2 rounded-full bg-orange-500" />high</span>
        <span><i className="mr-1 inline-block h-2 w-2 rounded-full bg-cyan-400" />flight trace</span>
      </div>
    </div>
  );
}
