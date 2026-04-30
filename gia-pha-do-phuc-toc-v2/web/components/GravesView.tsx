"use client";

import { useState } from "react";
import Link from "next/link";
import GraveMap from "./GraveMapWrapper";

const STATUS_LABELS: Record<string, string> = {
  kien_co: "Kiên cố",
  dat: "Mộ đất",
  cai_tang_xong: "Đã cải táng",
  that_lac: "Thất lạc",
  khac: "Khác",
};

const STATUS_COLORS: Record<string, string> = {
  kien_co: "bg-emerald-100 text-emerald-800",
  dat: "bg-amber-100 text-amber-800",
  cai_tang_xong: "bg-stone-200 text-stone-700",
  that_lac: "bg-rose-100 text-rose-800",
  khac: "bg-stone-100 text-stone-700",
};

interface Grave {
  id: string;
  cemeteryName: string | null;
  addressText: string | null;
  geoLat: number | null;
  geoLng: number | null;
  locationDescription: string | null;
  status: string;
  builtOn: string | null;
  lastReinterredOn: string | null;
  inscription: string | null;
  personId: string | null;
  personName: string | null;
  personGen: number | null;
  birthYear: number | null;
  deathYear: number | null;
}

export default function GravesView({ graves }: { graves: Grave[] }) {
  const [view, setView] = useState<"list" | "map">("map");
  const withCoords = graves.filter((g) => g.geoLat != null && g.geoLng != null);

  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <div className="flex rounded-md border border-stone-300 bg-white p-0.5 text-xs">
          <button
            onClick={() => setView("map")}
            className={`rounded px-3 py-1.5 transition ${view === "map" ? "bg-stone-900 text-white" : "text-stone-600 hover:text-stone-900"}`}
          >
            🗺 Bản đồ
          </button>
          <button
            onClick={() => setView("list")}
            className={`rounded px-3 py-1.5 transition ${view === "list" ? "bg-stone-900 text-white" : "text-stone-600 hover:text-stone-900"}`}
          >
            ☰ Danh sách
          </button>
        </div>
        <span className="text-xs text-stone-500">
          {withCoords.length} / {graves.length} mộ có toạ độ
        </span>
      </div>

      {view === "map" ? (
        <GraveMap
          graves={withCoords as Array<Grave & { geoLat: number; geoLng: number }>}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {graves.map((g) => (
            <article key={g.id} className="rounded-lg border border-stone-200 bg-white p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="serif text-lg font-semibold text-stone-900">{g.personName}</h2>
                  <p className="text-xs text-stone-500">
                    Đời {g.personGen} · {g.birthYear ?? "?"}–{g.deathYear ?? "?"}
                  </p>
                </div>
                <span className={`rounded px-2 py-1 text-xs font-medium ${STATUS_COLORS[g.status] ?? "bg-stone-100 text-stone-700"}`}>
                  {STATUS_LABELS[g.status] ?? g.status}
                </span>
              </div>

              <div className="mt-3 space-y-1 text-sm text-stone-700">
                {g.cemeteryName && <p>{g.cemeteryName}</p>}
                {g.addressText && <p className="text-xs text-stone-500">{g.addressText}</p>}
                {g.locationDescription && (
                  <p className="text-xs text-stone-600">📍 {g.locationDescription}</p>
                )}
              </div>

              {g.geoLat != null && g.geoLng != null && (
                <p className="mt-2 text-xs text-stone-400">
                  {g.geoLat.toFixed(6)}, {g.geoLng.toFixed(6)}
                </p>
              )}

              {g.inscription && (
                <p className="mt-3 border-l-2 border-stone-300 pl-3 text-sm italic text-stone-600">
                  &ldquo;{g.inscription}&rdquo;
                </p>
              )}

              {g.builtOn && (
                <p className="mt-2 text-xs text-stone-500">
                  Xây: {g.builtOn}
                  {g.lastReinterredOn && ` · Cải táng: ${g.lastReinterredOn}`}
                </p>
              )}

              {g.personId && (
                <Link
                  href={`/dashboard/phahe/${g.personId}`}
                  className="mt-3 inline-block text-xs font-medium text-amber-700 hover:underline"
                >
                  Xem hồ sơ →
                </Link>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
