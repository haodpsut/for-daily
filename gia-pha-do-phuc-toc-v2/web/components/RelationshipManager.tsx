"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  addParentAction,
  addChildAction,
  addSpouseAction,
  removeRelationshipAction,
} from "@/lib/actions/relationships";

interface PersonLite {
  id: string;
  fullName: string;
  gender: "male" | "female" | "other";
  birthYear: number | null;
  isInLaw: boolean;
  generation: number | null;
}

export interface RelEntry {
  relationshipId: string;
  type: "marriage" | "biological_child" | "adopted_child";
  person: PersonLite;
}

export default function RelationshipManager({
  personId,
  personFullName,
  allPersons,
  parents,
  spouses,
  children,
}: {
  personId: string;
  personFullName: string;
  allPersons: PersonLite[];
  parents: RelEntry[];
  spouses: RelEntry[];
  children: RelEntry[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Persons already related (exclude from picker)
  const usedIds = useMemo(() => {
    const s = new Set<string>([personId]);
    [...parents, ...spouses, ...children].forEach((r) => s.add(r.person.id));
    return s;
  }, [personId, parents, spouses, children]);

  function handleAdd(kind: "parent" | "spouse" | "child", otherId: string, adopted = false) {
    setError(null);
    startTransition(async () => {
      let res;
      if (kind === "parent") res = await addParentAction(personId, otherId, adopted ? "adopted_child" : "biological_child");
      else if (kind === "child") res = await addChildAction(personId, otherId, adopted ? "adopted_child" : "biological_child");
      else res = await addSpouseAction(personId, otherId);

      if (res.error) setError(res.error);
      else router.refresh();
    });
  }

  function handleRemove(relId: string) {
    if (!confirm("Xoá quan hệ này? Người đó vẫn nằm trong gia phả, chỉ huỷ liên kết.")) return;
    setError(null);
    startTransition(async () => {
      const res = await removeRelationshipAction(relId);
      if (res.error) setError(res.error);
      else router.refresh();
    });
  }

  return (
    <section className="rounded-lg border-2 border-rose-100 bg-white p-6">
      <div className="flex items-baseline justify-between">
        <h2 className="serif text-xl font-semibold text-stone-900">⚙ Quản lý quan hệ</h2>
        <span className="text-xs text-rose-700">Chỉ Quản trị</span>
      </div>
      <p className="mt-1 text-xs text-stone-500">
        Thêm cha/mẹ/vợ/chồng/con cho <strong>{personFullName}</strong>. Người được chọn phải đã có sẵn trong gia phả.
      </p>

      {error && <div className="mt-3 rounded bg-rose-50 p-2 text-sm text-rose-800">{error}</div>}
      {pending && <div className="mt-3 rounded bg-amber-50 p-2 text-xs text-amber-800">Đang xử lý...</div>}

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <RelGroup
          title="Cha / Mẹ"
          color="sky"
          entries={parents}
          allPersons={allPersons}
          usedIds={usedIds}
          onAdd={(id) => handleAdd("parent", id)}
          onRemove={handleRemove}
          allowAdopt={true}
          onAddAdopted={(id) => handleAdd("parent", id, true)}
          pickerLabel="Chọn cha/mẹ..."
        />
        <RelGroup
          title="Vợ / Chồng"
          color="amber"
          entries={spouses}
          allPersons={allPersons}
          usedIds={usedIds}
          onAdd={(id) => handleAdd("spouse", id)}
          onRemove={handleRemove}
          pickerLabel="Chọn vợ/chồng..."
        />
        <RelGroup
          title="Con"
          color="emerald"
          entries={children}
          allPersons={allPersons}
          usedIds={usedIds}
          onAdd={(id) => handleAdd("child", id)}
          onRemove={handleRemove}
          allowAdopt={true}
          onAddAdopted={(id) => handleAdd("child", id, true)}
          pickerLabel="Chọn con..."
        />
      </div>
    </section>
  );
}

function RelGroup({
  title,
  color,
  entries,
  allPersons,
  usedIds,
  onAdd,
  onRemove,
  allowAdopt,
  onAddAdopted,
  pickerLabel,
}: {
  title: string;
  color: "sky" | "amber" | "emerald";
  entries: RelEntry[];
  allPersons: PersonLite[];
  usedIds: Set<string>;
  onAdd: (id: string) => void;
  onRemove: (relId: string) => void;
  allowAdopt?: boolean;
  onAddAdopted?: (id: string) => void;
  pickerLabel: string;
}) {
  const colorClass: Record<string, string> = {
    sky: "border-sky-200 bg-sky-50/40",
    amber: "border-amber-200 bg-amber-50/40",
    emerald: "border-emerald-200 bg-emerald-50/40",
  };

  return (
    <div className={`rounded-md border p-3 ${colorClass[color]}`}>
      <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-700">
        {title} <span className="ml-1 text-stone-500">({entries.length})</span>
      </h3>

      <ul className="mt-2 space-y-1.5">
        {entries.map((e) => (
          <li key={e.relationshipId} className="flex items-center justify-between gap-2 rounded bg-white p-2 text-sm">
            <Link href={`/dashboard/phahe/${e.person.id}`} className="min-w-0 flex-1 hover:underline">
              <div className="truncate font-medium text-stone-900">{e.person.fullName}</div>
              <div className="text-[10px] text-stone-500">
                Đời {e.person.generation ?? "?"}
                {e.person.birthYear && ` · ${e.person.birthYear}`}
                {e.type === "adopted_child" && " · Nhận nuôi"}
              </div>
            </Link>
            <button
              onClick={() => onRemove(e.relationshipId)}
              className="rounded border border-rose-200 bg-white px-2 py-0.5 text-[10px] text-rose-700 hover:bg-rose-50"
              title="Xoá quan hệ này"
            >
              Xoá
            </button>
          </li>
        ))}
        {entries.length === 0 && (
          <li className="rounded border border-dashed border-stone-300 p-2 text-center text-xs text-stone-400">
            Chưa có
          </li>
        )}
      </ul>

      <div className="mt-3">
        <PersonPicker
          allPersons={allPersons}
          excludeIds={usedIds}
          placeholder={pickerLabel}
          onPick={onAdd}
          onPickAdopted={allowAdopt ? onAddAdopted : undefined}
        />
      </div>
    </div>
  );
}

function PersonPicker({
  allPersons,
  excludeIds,
  placeholder,
  onPick,
  onPickAdopted,
}: {
  allPersons: PersonLite[];
  excludeIds: Set<string>;
  placeholder: string;
  onPick: (id: string) => void;
  onPickAdopted?: (id: string) => void;
}) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);

  const results = useMemo(() => {
    const query = q.toLowerCase().trim();
    return allPersons
      .filter((p) => !excludeIds.has(p.id))
      .filter((p) => !query || p.fullName.toLowerCase().includes(query))
      .slice(0, 30);
  }, [q, allPersons, excludeIds]);

  return (
    <div className="relative">
      <input
        type="text"
        placeholder={placeholder}
        value={q}
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
        }}
        className="w-full rounded-md border border-stone-300 bg-white px-3 py-1.5 text-xs focus:border-stone-500 focus:outline-none"
      />
      {open && results.length > 0 && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <ul className="absolute left-0 right-0 top-full mt-1 z-20 max-h-60 overflow-y-auto rounded-md border border-stone-200 bg-white shadow-lg">
            {results.map((p) => (
              <li key={p.id} className="border-b border-stone-100 last:border-b-0">
                <div className="flex items-center justify-between px-3 py-2 text-xs">
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium text-stone-900">{p.fullName}</div>
                    <div className="text-[10px] text-stone-500">
                      Đời {p.generation ?? "?"}
                      {p.isInLaw && " · Dâu/Rể"}
                      {p.birthYear && ` · ${p.birthYear}`}
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button
                      onClick={() => {
                        onPick(p.id);
                        setQ("");
                        setOpen(false);
                      }}
                      className="rounded bg-stone-900 px-2 py-1 text-[10px] text-white hover:bg-stone-700"
                    >
                      + Thêm
                    </button>
                    {onPickAdopted && (
                      <button
                        onClick={() => {
                          onPickAdopted(p.id);
                          setQ("");
                          setOpen(false);
                        }}
                        className="rounded border border-amber-300 bg-amber-50 px-2 py-1 text-[10px] text-amber-800 hover:bg-amber-100"
                        title="Quan hệ con nuôi / nhận nuôi"
                      >
                        Nhận nuôi
                      </button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
      {open && results.length === 0 && q && (
        <div className="absolute left-0 right-0 top-full mt-1 z-20 rounded-md border border-stone-200 bg-white p-3 text-center text-xs text-stone-500 shadow-lg">
          Không có kết quả. Tạo người mới ở{" "}
          <Link href="/dashboard/admin/persons/new" className="font-medium text-amber-700 underline">
            Quản trị → Người
          </Link>
        </div>
      )}
    </div>
  );
}
