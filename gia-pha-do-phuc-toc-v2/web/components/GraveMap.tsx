"use client";

import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import Link from "next/link";
import "leaflet/dist/leaflet.css";

// Fix default marker icon URLs (Webpack/Next bundling strips them)
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: () => string })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Custom icon by status — color-coded (use divIcon with emoji + bg)
function makeIcon(status: string, gen: number | null): L.DivIcon {
  const colors: Record<string, string> = {
    kien_co: "bg-emerald-500",
    dat: "bg-amber-500",
    cai_tang_xong: "bg-stone-400",
    that_lac: "bg-rose-500",
    khac: "bg-stone-400",
  };
  const cls = colors[status] ?? "bg-stone-500";
  return L.divIcon({
    className: "",
    html: `<div class="flex h-8 w-8 -translate-x-4 -translate-y-8 items-center justify-center rounded-full border-2 border-white text-xs font-bold text-white shadow-md ${cls}">Đ${gen ?? "?"}</div>`,
    iconSize: [0, 0],
  });
}

interface GraveMarker {
  id: string;
  geoLat: number;
  geoLng: number;
  status: string;
  cemeteryName: string | null;
  locationDescription: string | null;
  inscription: string | null;
  builtOn: string | null;
  personId: string | null;
  personName: string | null;
  personGen: number | null;
  birthYear: number | null;
  deathYear: number | null;
}

const STATUS_LABELS: Record<string, string> = {
  kien_co: "Kiên cố",
  dat: "Mộ đất",
  cai_tang_xong: "Đã cải táng",
  that_lac: "Thất lạc",
  khac: "Khác",
};

export default function GraveMap({ graves }: { graves: GraveMarker[] }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const valid = useMemo(
    () => graves.filter((g) => g.geoLat != null && g.geoLng != null),
    [graves],
  );

  const center = useMemo<[number, number]>(() => {
    if (valid.length === 0) return [16.0544, 108.2022];
    const lat = valid.reduce((s, g) => s + g.geoLat, 0) / valid.length;
    const lng = valid.reduce((s, g) => s + g.geoLng, 0) / valid.length;
    return [lat, lng];
  }, [valid]);

  if (!mounted) {
    return (
      <div className="flex h-[500px] items-center justify-center rounded-lg border border-stone-200 bg-stone-50">
        <p className="text-sm text-stone-500">Đang tải bản đồ…</p>
      </div>
    );
  }

  if (valid.length === 0) {
    return (
      <div className="flex h-[500px] items-center justify-center rounded-lg border border-stone-200 bg-stone-50 text-center">
        <div>
          <p className="text-sm text-stone-600">Chưa có mộ nào có toạ độ</p>
          <p className="mt-1 text-xs text-stone-500">
            Cập nhật <code>geoLat</code>, <code>geoLng</code> ở các mộ để hiện trên bản đồ.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-stone-200 shadow-sm">
      <MapContainer
        center={center}
        zoom={17}
        scrollWheelZoom={true}
        style={{ height: "70vh", minHeight: 400 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {valid.map((g) => (
          <Marker
            key={g.id}
            position={[g.geoLat, g.geoLng]}
            icon={makeIcon(g.status, g.personGen)}
          >
            <Popup>
              <div className="min-w-[200px]">
                <div className="font-serif text-base font-semibold text-stone-900">
                  {g.personName ?? "Mộ chưa định danh"}
                </div>
                {g.personGen && (
                  <div className="mt-0.5 text-xs text-stone-600">
                    Đời {g.personGen}
                    {g.birthYear && ` · ${g.birthYear}`}
                    {g.deathYear && `–${g.deathYear}`}
                  </div>
                )}
                <div className="mt-2 inline-block rounded bg-stone-100 px-2 py-0.5 text-xs text-stone-700">
                  {STATUS_LABELS[g.status] ?? g.status}
                </div>
                {g.cemeteryName && (
                  <div className="mt-2 text-xs text-stone-700">{g.cemeteryName}</div>
                )}
                {g.locationDescription && (
                  <div className="mt-1 text-xs italic text-stone-600">
                    📍 {g.locationDescription}
                  </div>
                )}
                {g.inscription && (
                  <div className="mt-2 border-l-2 border-stone-300 pl-2 text-xs italic text-stone-600">
                    &ldquo;{g.inscription}&rdquo;
                  </div>
                )}
                {g.personId && (
                  <Link
                    href={`/dashboard/phahe/${g.personId}`}
                    className="mt-3 inline-block text-xs font-medium text-amber-700 hover:underline"
                  >
                    Xem hồ sơ →
                  </Link>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
