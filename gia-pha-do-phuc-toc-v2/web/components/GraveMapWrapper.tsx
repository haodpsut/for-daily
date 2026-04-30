"use client";

import dynamic from "next/dynamic";

// Leaflet uses window/document → must be client-only, no SSR
const GraveMap = dynamic(() => import("./GraveMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[500px] items-center justify-center rounded-lg border border-stone-200 bg-stone-50">
      <p className="text-sm text-stone-500">Đang tải bản đồ…</p>
    </div>
  ),
});

export default GraveMap;
