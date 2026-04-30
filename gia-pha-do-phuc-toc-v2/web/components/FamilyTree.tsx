"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { PersonNode, RelEdge } from "@/lib/kinship";

interface TreeNode {
  person: PersonNode;
  spouse: PersonNode | null;
  children: TreeNode[];
}

export default function FamilyTree({
  persons,
  relationships,
}: {
  persons: PersonNode[];
  relationships: RelEdge[];
}) {
  const [orientation, setOrientation] = useState<"vertical" | "horizontal">("vertical");
  const [search, setSearch] = useState("");
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const { roots, personsMap } = useMemo(() => {
    const personsMap = new Map(persons.map((p) => [p.id, p]));
    const childrenOf = new Map<string, string[]>();
    const parentsOf = new Map<string, string[]>();
    const spouseOf = new Map<string, string>();

    for (const r of relationships) {
      if (r.type === "biological_child" || r.type === "adopted_child") {
        if (!childrenOf.has(r.personA)) childrenOf.set(r.personA, []);
        childrenOf.get(r.personA)!.push(r.personB);
        if (!parentsOf.has(r.personB)) parentsOf.set(r.personB, []);
        parentsOf.get(r.personB)!.push(r.personA);
      } else if (r.type === "marriage") {
        spouseOf.set(r.personA, r.personB);
        spouseOf.set(r.personB, r.personA);
      }
    }

    // Roots = those without parents and not in-law
    const rootIds = persons
      .filter((p) => !p.isInLaw && !parentsOf.has(p.id))
      .map((p) => p.id);

    const built = new Set<string>();

    function buildNode(id: string): TreeNode | null {
      if (built.has(id)) return null;
      built.add(id);
      const person = personsMap.get(id);
      if (!person) return null;
      const spouseId = spouseOf.get(id);
      const spouse: PersonNode | null = spouseId ? (personsMap.get(spouseId) ?? null) : null;
      // Children belong to the non-in-law parent (the bloodline person)
      const childIds = childrenOf.get(id) ?? [];
      const children = childIds
        .map(buildNode)
        .filter((c): c is TreeNode => c !== null)
        .sort((a, b) => (a.person.birthOrder ?? 99) - (b.person.birthOrder ?? 99));
      // Mark the spouse as built too so we don't double-render
      if (spouseId) built.add(spouseId);
      return { person, spouse, children };
    }

    const roots = rootIds.map(buildNode).filter((n): n is TreeNode => n !== null);
    return { roots, personsMap };
  }, [persons, relationships]);

  const searchResults = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return [];
    return persons
      .filter((p) => p.fullName.toLowerCase().includes(q))
      .slice(0, 8);
  }, [search, persons]);

  function toggleCollapsed(id: string) {
    const next = new Set(collapsed);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setCollapsed(next);
  }

  function focusPerson(id: string) {
    setHighlightId(id);
    setSearch("");
    // Scroll to node
    setTimeout(() => {
      const el = document.getElementById(`node-${id}`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
    }, 50);
  }

  void personsMap; // reserved for future ancestor highlight

  return (
    <div>
      {/* Toolbar */}
      <div className="sticky top-0 z-10 -mx-6 mb-4 border-b border-stone-200 bg-stone-50/95 px-6 py-3 backdrop-blur">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="🔍 Tìm tên..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm focus:border-stone-500 focus:outline-none"
            />
            {searchResults.length > 0 && (
              <ul className="absolute left-0 right-0 top-full mt-1 max-h-72 overflow-y-auto rounded-md border border-stone-200 bg-white shadow-lg">
                {searchResults.map((p) => (
                  <li key={p.id}>
                    <button
                      onClick={() => focusPerson(p.id)}
                      className="block w-full px-3 py-2 text-left text-sm hover:bg-stone-100"
                    >
                      <span className="font-medium text-stone-900">{p.fullName}</span>
                      <span className="ml-2 text-xs text-stone-500">
                        Đời {p.generation}
                        {p.isInLaw && " · Dâu/Rể"}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex rounded-md border border-stone-300 bg-white p-0.5 text-xs">
            <button
              onClick={() => setOrientation("vertical")}
              className={`rounded px-3 py-1.5 transition ${orientation === "vertical" ? "bg-stone-900 text-white" : "text-stone-600 hover:text-stone-900"}`}
            >
              ↓ Dọc
            </button>
            <button
              onClick={() => setOrientation("horizontal")}
              className={`rounded px-3 py-1.5 transition ${orientation === "horizontal" ? "bg-stone-900 text-white" : "text-stone-600 hover:text-stone-900"}`}
            >
              → Ngang
            </button>
          </div>

          {collapsed.size > 0 && (
            <button
              onClick={() => setCollapsed(new Set())}
              className="rounded border border-stone-300 bg-white px-3 py-1.5 text-xs text-stone-600 hover:text-stone-900"
            >
              Mở tất cả ({collapsed.size})
            </button>
          )}
        </div>
      </div>

      {/* Tree */}
      <div
        className={`overflow-auto ${orientation === "horizontal" ? "py-4" : ""}`}
        style={orientation === "horizontal" ? { minHeight: "60vh" } : {}}
      >
        <div
          className={
            orientation === "vertical"
              ? "flex flex-col items-center gap-8 py-4"
              : "flex flex-row items-start gap-12 py-4"
          }
        >
          {roots.map((root) => (
            <TreeBranch
              key={root.person.id}
              node={root}
              orientation={orientation}
              highlightId={highlightId}
              collapsed={collapsed}
              toggleCollapsed={toggleCollapsed}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function TreeBranch({
  node,
  orientation,
  highlightId,
  collapsed,
  toggleCollapsed,
}: {
  node: TreeNode;
  orientation: "vertical" | "horizontal";
  highlightId: string | null;
  collapsed: Set<string>;
  toggleCollapsed: (id: string) => void;
}) {
  const isCollapsed = collapsed.has(node.person.id);
  const hasChildren = node.children.length > 0;

  if (orientation === "vertical") {
    return (
      <div className="flex flex-col items-center">
        <PersonPair
          person={node.person}
          spouse={node.spouse}
          highlightId={highlightId}
          hasChildren={hasChildren}
          isCollapsed={isCollapsed}
          onToggle={() => toggleCollapsed(node.person.id)}
        />

        {hasChildren && !isCollapsed && (
          <>
            <div className="h-6 w-px bg-stone-300" />
            <div className="relative flex items-start gap-4 sm:gap-6 md:gap-10">
              {node.children.length > 1 && (
                <div className="absolute left-0 right-0 top-0 h-px bg-stone-300" />
              )}
              {node.children.map((child) => (
                <div key={child.person.id} className="flex flex-col items-center">
                  <div className="h-6 w-px bg-stone-300" />
                  <TreeBranch
                    node={child}
                    orientation={orientation}
                    highlightId={highlightId}
                    collapsed={collapsed}
                    toggleCollapsed={toggleCollapsed}
                  />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  // Horizontal
  return (
    <div className="flex flex-row items-center">
      <PersonPair
        person={node.person}
        spouse={node.spouse}
        highlightId={highlightId}
        hasChildren={hasChildren}
        isCollapsed={isCollapsed}
        onToggle={() => toggleCollapsed(node.person.id)}
      />

      {hasChildren && !isCollapsed && (
        <>
          <div className="w-6 h-px bg-stone-300" />
          <div className="relative flex flex-col gap-4">
            {node.children.length > 1 && (
              <div className="absolute top-0 bottom-0 left-0 w-px bg-stone-300" />
            )}
            {node.children.map((child) => (
              <div key={child.person.id} className="flex flex-row items-center">
                <div className="w-6 h-px bg-stone-300" />
                <TreeBranch
                  node={child}
                  orientation={orientation}
                  highlightId={highlightId}
                  collapsed={collapsed}
                  toggleCollapsed={toggleCollapsed}
                />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function PersonPair({
  person,
  spouse,
  highlightId,
  hasChildren,
  isCollapsed,
  onToggle,
}: {
  person: PersonNode;
  spouse: PersonNode | null;
  highlightId: string | null;
  hasChildren: boolean;
  isCollapsed: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center gap-1.5 relative">
      <PersonCard person={person} highlight={highlightId === person.id} />
      {spouse && (
        <>
          <span className="text-stone-400 text-lg">⚭</span>
          <PersonCard person={spouse} highlight={highlightId === spouse.id} />
        </>
      )}
      {hasChildren && (
        <button
          onClick={onToggle}
          aria-label={isCollapsed ? "Mở nhánh" : "Đóng nhánh"}
          className="absolute -bottom-2 left-1/2 -translate-x-1/2 z-10 flex h-5 w-5 items-center justify-center rounded-full border border-stone-300 bg-white text-xs text-stone-600 hover:bg-stone-100"
        >
          {isCollapsed ? "+" : "−"}
        </button>
      )}
    </div>
  );
}

function PersonCard({ person, highlight }: { person: PersonNode; highlight?: boolean }) {
  const isMale = person.gender === "male";
  const colorClass = person.isInLaw
    ? "border-amber-300 bg-amber-50"
    : isMale
      ? "border-sky-300 bg-sky-50"
      : "border-rose-300 bg-rose-50";

  return (
    <Link
      id={`node-${person.id}`}
      href={`/dashboard/phahe/${person.id}`}
      className={`block min-w-[110px] max-w-[160px] rounded-lg border-2 px-2 py-2 text-center transition hover:shadow-md ${colorClass} ${highlight ? "ring-4 ring-amber-400 ring-offset-2" : ""}`}
    >
      <div className="serif text-xs sm:text-sm font-semibold text-stone-900 leading-tight">
        {person.fullName}
      </div>
      <div className="mt-1 text-[10px] text-stone-600">
        {person.birthYear ?? "?"}
        {person.generation && ` · Đ${person.generation}`}
      </div>
      {person.isInLaw && (
        <div className="mt-1 text-[10px] font-medium text-amber-700">Dâu/Rể</div>
      )}
    </Link>
  );
}
