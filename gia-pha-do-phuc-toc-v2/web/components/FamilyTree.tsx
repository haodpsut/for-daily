"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  TransformWrapper,
  TransformComponent,
  type ReactZoomPanPinchRef,
} from "react-zoom-pan-pinch";
import type { PersonNode, RelEdge } from "@/lib/kinship";

interface TreeNode {
  person: PersonNode;
  spouse: PersonNode | null;
  children: TreeNode[];
}

const DEFAULT_OPEN_DEPTH = 2; // Mặc định chỉ mở 2 đời đầu

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
  const [hasInitCollapse, setHasInitCollapse] = useState(false);
  const transformRef = useRef<ReactZoomPanPinchRef | null>(null);

  const { roots } = useMemo(() => {
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
      const childIds = childrenOf.get(id) ?? [];
      const children = childIds
        .map(buildNode)
        .filter((c): c is TreeNode => c !== null)
        .sort((a, b) => (a.person.birthOrder ?? 99) - (b.person.birthOrder ?? 99));
      if (spouseId) built.add(spouseId);
      return { person, spouse, children };
    }

    const roots = rootIds.map(buildNode).filter((n): n is TreeNode => n !== null);
    return { roots };
  }, [persons, relationships]);

  // Init: collapse mọi node có đời >= DEFAULT_OPEN_DEPTH (lần đầu render)
  if (!hasInitCollapse && persons.length > 0) {
    const init = new Set<string>();
    for (const p of persons) {
      if (p.generation && p.generation >= DEFAULT_OPEN_DEPTH) {
        init.add(p.id);
      }
    }
    setCollapsed(init);
    setHasInitCollapse(true);
  }

  const searchResults = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return [];
    return persons.filter((p) => p.fullName.toLowerCase().includes(q)).slice(0, 8);
  }, [search, persons]);

  function toggleCollapsed(id: string) {
    const next = new Set(collapsed);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setCollapsed(next);
  }

  function expandAll() {
    setCollapsed(new Set());
  }

  function collapseToDepth(depth: number) {
    const next = new Set<string>();
    for (const p of persons) {
      if (p.generation && p.generation >= depth) next.add(p.id);
    }
    setCollapsed(next);
  }

  function focusPerson(id: string) {
    setHighlightId(id);
    setSearch("");
    // Mở tất cả ancestor của person này
    const ancestors = findAncestors(id, relationships);
    const next = new Set(collapsed);
    for (const a of ancestors) next.delete(a);
    setCollapsed(next);

    setTimeout(() => {
      const el = document.getElementById(`node-${id}`);
      if (el && transformRef.current) {
        const wrapper = transformRef.current.instance.contentComponent;
        if (wrapper) {
          const wrapperRect = wrapper.getBoundingClientRect();
          const elRect = el.getBoundingClientRect();
          const dx = (wrapperRect.width / 2) - (elRect.left - wrapperRect.left + elRect.width / 2);
          const dy = (wrapperRect.height / 2) - (elRect.top - wrapperRect.top + elRect.height / 2);
          const state = transformRef.current.state;
          transformRef.current.setTransform(state.positionX + dx, state.positionY + dy, Math.max(state.scale, 1), 400);
        }
      }
    }, 100);
  }

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[180px]">
          <input
            type="text"
            placeholder="🔍 Tìm tên..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm focus:border-stone-500 focus:outline-none"
          />
          {searchResults.length > 0 && (
            <ul className="absolute left-0 right-0 top-full mt-1 z-30 max-h-72 overflow-y-auto rounded-md border border-stone-200 bg-white shadow-lg">
              {searchResults.map((p) => (
                <li key={p.id}>
                  <button
                    onClick={() => focusPerson(p.id)}
                    className="block w-full px-3 py-2 text-left text-sm hover:bg-stone-100"
                  >
                    <span className="font-medium text-stone-900">{p.fullName}</span>
                    <span className="ml-2 text-xs text-stone-500">
                      Đời {p.generation}{p.isInLaw && " · Dâu/Rể"}
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

        <div className="flex rounded-md border border-stone-300 bg-white p-0.5 text-xs">
          <button onClick={() => collapseToDepth(2)} className="rounded px-3 py-1.5 text-stone-600 hover:text-stone-900" title="Chỉ hiện 2 đời">
            2 đời
          </button>
          <button onClick={() => collapseToDepth(4)} className="rounded px-3 py-1.5 text-stone-600 hover:text-stone-900" title="Hiện 4 đời">
            4 đời
          </button>
          <button onClick={expandAll} className="rounded px-3 py-1.5 text-stone-600 hover:text-stone-900" title="Mở tất cả">
            Tất cả
          </button>
        </div>
      </div>

      {/* Help text */}
      <p className="text-xs text-stone-500">
        💡 Kéo để di chuyển · Cuộn / pinch để zoom · Click <strong>+/−</strong> trên card để mở/đóng nhánh
      </p>

      {/* Tree with pan-zoom */}
      <div className="relative h-[70vh] overflow-hidden rounded-lg border border-stone-200 bg-gradient-to-br from-stone-50 to-stone-100">
        <TransformWrapper
          ref={transformRef}
          initialScale={0.85}
          minScale={0.2}
          maxScale={3}
          centerOnInit
          limitToBounds={false}
          wheel={{ step: 0.1 }}
          panning={{ velocityDisabled: true }}
          doubleClick={{ disabled: true }}
        >
          {({ zoomIn, zoomOut, resetTransform, centerView }) => (
            <>
              <div className="absolute right-3 top-3 z-20 flex flex-col gap-1 rounded-md border border-stone-300 bg-white/95 p-1 shadow-sm backdrop-blur">
                <button onClick={() => zoomIn()} className="size-8 rounded text-base hover:bg-stone-100" title="Phóng to">＋</button>
                <button onClick={() => zoomOut()} className="size-8 rounded text-base hover:bg-stone-100" title="Thu nhỏ">−</button>
                <button onClick={() => { resetTransform(); centerView(); }} className="size-8 rounded text-xs hover:bg-stone-100" title="Reset">⌂</button>
              </div>

              <TransformComponent
                wrapperClass="!w-full !h-full"
                contentClass="!w-auto !h-auto"
              >
                <div
                  className={
                    orientation === "vertical"
                      ? "flex flex-col items-center gap-12 p-12"
                      : "flex flex-row items-start gap-16 p-12"
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
              </TransformComponent>
            </>
          )}
        </TransformWrapper>
      </div>
    </div>
  );
}

function findAncestors(id: string, relationships: RelEdge[]): string[] {
  const parentsOf = new Map<string, string[]>();
  for (const r of relationships) {
    if (r.type === "biological_child" || r.type === "adopted_child") {
      if (!parentsOf.has(r.personB)) parentsOf.set(r.personB, []);
      parentsOf.get(r.personB)!.push(r.personA);
    }
  }
  const visited = new Set<string>();
  const queue = [id];
  while (queue.length > 0) {
    const cur = queue.shift()!;
    if (visited.has(cur)) continue;
    visited.add(cur);
    const parents = parentsOf.get(cur) ?? [];
    for (const p of parents) queue.push(p);
  }
  return [...visited];
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
          childCount={node.children.length}
        />
        {hasChildren && !isCollapsed && (
          <>
            <div className="h-8 w-0.5 bg-stone-300" />
            <div className="relative flex items-start gap-6 sm:gap-10">
              {node.children.length > 1 && (
                <div className="absolute left-[10%] right-[10%] top-0 h-0.5 bg-stone-300" />
              )}
              {node.children.map((child) => (
                <div key={child.person.id} className="flex flex-col items-center">
                  <div className="h-8 w-0.5 bg-stone-300" />
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

  return (
    <div className="flex flex-row items-center">
      <PersonPair
        person={node.person}
        spouse={node.spouse}
        highlightId={highlightId}
        hasChildren={hasChildren}
        isCollapsed={isCollapsed}
        onToggle={() => toggleCollapsed(node.person.id)}
        childCount={node.children.length}
      />
      {hasChildren && !isCollapsed && (
        <>
          <div className="w-8 h-0.5 bg-stone-300" />
          <div className="relative flex flex-col gap-6">
            {node.children.length > 1 && (
              <div className="absolute top-[10%] bottom-[10%] left-0 w-0.5 bg-stone-300" />
            )}
            {node.children.map((child) => (
              <div key={child.person.id} className="flex flex-row items-center">
                <div className="w-8 h-0.5 bg-stone-300" />
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
  childCount,
}: {
  person: PersonNode;
  spouse: PersonNode | null;
  highlightId: string | null;
  hasChildren: boolean;
  isCollapsed: boolean;
  onToggle: () => void;
  childCount: number;
}) {
  return (
    <div className="relative flex items-center gap-2">
      <PersonCard person={person} highlight={highlightId === person.id} />
      {spouse && (
        <>
          <span className="select-none text-amber-600 text-xl font-bold">⚭</span>
          <PersonCard person={spouse} highlight={highlightId === spouse.id} />
        </>
      )}
      {hasChildren && (
        <button
          onClick={(e) => { e.stopPropagation(); onToggle(); }}
          aria-label={isCollapsed ? `Mở ${childCount} con` : "Đóng nhánh"}
          className={`absolute -bottom-3 left-1/2 -translate-x-1/2 z-10 flex h-6 min-w-[24px] items-center justify-center rounded-full border-2 px-1.5 text-xs font-bold shadow-sm transition ${
            isCollapsed
              ? "border-amber-500 bg-amber-100 text-amber-800 hover:bg-amber-200"
              : "border-stone-400 bg-white text-stone-700 hover:bg-stone-100"
          }`}
        >
          {isCollapsed ? `+${childCount}` : "−"}
        </button>
      )}
    </div>
  );
}

function PersonCard({ person, highlight }: { person: PersonNode; highlight?: boolean }) {
  const isMale = person.gender === "male";
  const colorClass = person.isInLaw
    ? "border-amber-300 bg-gradient-to-br from-amber-50 to-amber-100 text-amber-950"
    : isMale
      ? "border-sky-300 bg-gradient-to-br from-sky-50 to-sky-100 text-sky-950"
      : "border-rose-300 bg-gradient-to-br from-rose-50 to-rose-100 text-rose-950";

  return (
    <Link
      id={`node-${person.id}`}
      href={`/dashboard/phahe/${person.id}`}
      onClick={(e) => e.stopPropagation()}
      className={`block min-w-[120px] max-w-[160px] rounded-xl border-2 px-3 py-2.5 text-center shadow-sm transition hover:shadow-md ${colorClass} ${highlight ? "ring-4 ring-amber-400 ring-offset-2 scale-105" : ""}`}
    >
      <div className="serif text-sm font-semibold leading-tight">{person.fullName}</div>
      <div className="mt-1 text-[10px] opacity-75">
        {person.birthYear ?? "?"}
        {person.isDeceased && person.deathYear && ` – ${person.deathYear}`}
      </div>
      {person.generation && (
        <div className="mt-0.5 text-[10px] font-medium opacity-60">Đời {person.generation}</div>
      )}
    </Link>
  );
}
