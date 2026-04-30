"use client";

import { useMemo, useState } from "react";
import { computeKinship, type PersonNode, type RelEdge } from "@/lib/kinship";

export default function KinshipCalculator({
  persons,
  relationships,
}: {
  persons: PersonNode[];
  relationships: RelEdge[];
}) {
  const [aId, setAId] = useState<string | null>(null);
  const [bId, setBId] = useState<string | null>(null);
  const [searchA, setSearchA] = useState("");
  const [searchB, setSearchB] = useState("");

  const personA = useMemo(() => persons.find((p) => p.id === aId) ?? null, [persons, aId]);
  const personB = useMemo(() => persons.find((p) => p.id === bId) ?? null, [persons, bId]);

  const result = useMemo(() => {
    if (!personA || !personB) return null;
    return computeKinship(personA, personB, persons, relationships);
  }, [personA, personB, persons, relationships]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <PersonPicker
          label="Người A"
          search={searchA}
          setSearch={setSearchA}
          selectedId={aId}
          onSelect={setAId}
          disabledId={bId}
          persons={persons}
        />
        <PersonPicker
          label="Người B"
          search={searchB}
          setSearch={setSearchB}
          selectedId={bId}
          onSelect={setBId}
          disabledId={aId}
          persons={persons}
        />
      </div>

      {personA && personB && result && (
        <div className="rounded-lg border-2 border-amber-300 bg-amber-50 p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <CallBox
              from={personA}
              to={personB}
              call={result.aCallsB}
            />
            <CallBox
              from={personB}
              to={personA}
              call={result.bCallsA}
            />
          </div>

          <div className="mt-4 border-t border-amber-200 pt-4">
            <p className="text-sm font-medium text-stone-700">{result.description}</p>
            {result.distance >= 0 && (
              <p className="mt-1 text-xs text-stone-500">
                Khoảng cách: {result.distance} bậc
              </p>
            )}
            {result.pathLabels.length > 0 && (
              <ul className="mt-3 space-y-1 text-sm text-stone-600">
                {result.pathLabels.map((l, i) => (
                  <li key={i}>• {l}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {personA && personB && !result && (
        <div className="rounded-lg border border-stone-200 bg-white p-6 text-center text-stone-600">
          Không thể tính xưng hô (có thể chọn cùng 1 người).
        </div>
      )}

      {(!personA || !personB) && (
        <div className="rounded-lg border border-dashed border-stone-300 bg-white p-8 text-center text-sm text-stone-500">
          Chọn 2 người để xem cách xưng hô.
        </div>
      )}
    </div>
  );
}

function PersonPicker({
  label,
  search,
  setSearch,
  selectedId,
  onSelect,
  disabledId,
  persons,
}: {
  label: string;
  search: string;
  setSearch: (s: string) => void;
  selectedId: string | null;
  onSelect: (id: string) => void;
  disabledId: string | null;
  persons: PersonNode[];
}) {
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return persons
      .filter((p) => p.id !== disabledId)
      .filter((p) => !q || p.fullName.toLowerCase().includes(q))
      .slice(0, 30);
  }, [persons, search, disabledId]);

  const selected = persons.find((p) => p.id === selectedId);

  return (
    <div className="rounded-lg border border-stone-200 bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">{label}</p>

      {selected ? (
        <div className="mt-3 flex items-center justify-between rounded bg-stone-50 p-3">
          <div>
            <div className="font-semibold text-stone-900">{selected.fullName}</div>
            <div className="text-xs text-stone-600">
              Đời {selected.generation} · {selected.gender === "male" ? "Nam" : selected.gender === "female" ? "Nữ" : "Khác"}
              {selected.isInLaw && " · Dâu/Rể"}
              {selected.birthYear && ` · ${selected.birthYear}`}
            </div>
          </div>
          <button
            onClick={() => onSelect("")}
            className="text-xs text-stone-500 underline hover:text-stone-900"
          >
            Đổi
          </button>
        </div>
      ) : (
        <>
          <input
            type="text"
            placeholder="Gõ tên để tìm..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mt-2 w-full rounded border border-stone-300 px-3 py-2 text-sm focus:border-stone-500 focus:outline-none"
            autoFocus={!selected}
          />
          <ul className="mt-2 max-h-64 overflow-y-auto">
            {filtered.length === 0 && (
              <li className="px-3 py-2 text-sm text-stone-400">Không có kết quả</li>
            )}
            {filtered.map((p) => (
              <li key={p.id}>
                <button
                  onClick={() => { onSelect(p.id); setSearch(""); }}
                  className="w-full rounded px-3 py-2 text-left text-sm hover:bg-stone-100"
                >
                  <span className="font-medium text-stone-900">{p.fullName}</span>
                  <span className="ml-2 text-xs text-stone-500">
                    Đời {p.generation}
                    {p.isInLaw && " · Dâu/Rể"}
                    {p.birthYear && ` · ${p.birthYear}`}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

function CallBox({
  from,
  to,
  call,
}: {
  from: PersonNode;
  to: PersonNode;
  call: string;
}) {
  return (
    <div className="rounded bg-white p-4 shadow-sm">
      <p className="text-xs text-stone-500">
        <span className="font-medium text-stone-900">{from.fullName}</span> gọi{" "}
        <span className="font-medium text-stone-900">{to.fullName}</span> là
      </p>
      <p className="serif mt-2 text-2xl font-bold text-amber-700">{call}</p>
    </div>
  );
}
