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

const DEFAULT_OPEN_DEPTH = 2;       // Mặc định chỉ mở 2 đời đầu
const SIBLINGS_LIMIT = 8;            // Mỗi parent chỉ hiện tối đa N con, còn lại click +X nữa
const COMPACT_THRESHOLD = 12;        // Tổng node visible > N → tự bật compact mode

export default function FamilyTree({
  persons,
  relationships,
}: {
  persons: PersonNode[];
  relationships: RelEdge[];
}) {
  const [orientation, setOrientation] = useState<"vertical" | "horizontal">("vertical");
  const [compact, setCompact] = useState(false);
  const [search, setSearch] = useState("");
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [branchRootId, setBranchRootId] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [siblingsExpanded, setSiblingsExpanded] = useState<Set<string>>(new Set());
  const [hasInitCollapse, setHasInitCollapse] = useState(false);
  const transformRef = useRef<ReactZoomPanPinchRef | null>(null);

  void COMPACT_THRESHOLD; // reserved for auto-compact heuristic

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

  function toggleSiblings(id: string) {
    const next = new Set(siblingsExpanded);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSiblingsExpanded(next);
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

  function setAsBranchRoot(id: string) {
    setBranchRootId(id);
    setSearch("");
    setHighlightId(id);          // also pulse-highlight the new root
    setCollapsed(new Set());      // mở hết khi đổi nhánh
    // After re-render with new root, center+zoom on it (2 RAFs to wait for DOM)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const el = document.getElementById(`node-${id}`);
        const tr = transformRef.current;
        if (!el || !tr) return;
        const wrapper = tr.instance.contentComponent;
        if (!wrapper) return;
        const wrapperRect = wrapper.getBoundingClientRect();
        const elRect = el.getBoundingClientRect();
        const dx = wrapperRect.width / 2 - (elRect.left - wrapperRect.left + elRect.width / 2);
        const dy = wrapperRect.height / 2 - (elRect.top - wrapperRect.top + elRect.height / 2);
        const s = tr.state;
        // Reset to a comfortable zoom (1.0) and center the new root
        tr.setTransform(s.positionX + dx, s.positionY + dy, 1.0, 600);
      });
    });
  }

  // Find subtree rooted at branchRootId (treats it as new top of tree)
  const displayRoots = useMemo<TreeNode[]>(() => {
    if (!branchRootId) return roots;
    const find = (node: TreeNode): TreeNode | null => {
      if (node.person.id === branchRootId) return node;
      for (const c of node.children) {
        const found = find(c);
        if (found) return found;
      }
      return null;
    };
    for (const r of roots) {
      const found = find(r);
      if (found) return [found];
    }
    return roots;
  }, [roots, branchRootId]);

  const branchRootPerson = branchRootId ? persons.find((p) => p.id === branchRootId) : null;

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
                <li key={p.id} className="border-b border-stone-100 last:border-b-0">
                  <div className="flex items-center justify-between px-3 py-2 hover:bg-stone-50">
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-stone-900">{p.fullName}</div>
                      <div className="text-xs text-stone-500">
                        Đời {p.generation}{p.isInLaw && " · Dâu/Rể"}{p.birthYear && ` · ${p.birthYear}`}
                      </div>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <button
                        onClick={() => focusPerson(p.id)}
                        className="rounded bg-stone-100 px-2 py-1 text-xs text-stone-700 hover:bg-stone-200"
                        title="Highlight + zoom đến người này"
                      >
                        🎯 Đến
                      </button>
                      <button
                        onClick={() => setAsBranchRoot(p.id)}
                        className="rounded bg-amber-100 px-2 py-1 text-xs text-amber-800 hover:bg-amber-200"
                        title="Lọc cây — chỉ xem nhánh con cháu của người này"
                      >
                        🌿 Lọc
                      </button>
                    </div>
                  </div>
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

        <button
          onClick={() => setCompact((c) => !c)}
          className={`rounded-md border px-3 py-1.5 text-xs transition ${
            compact
              ? "border-stone-900 bg-stone-900 text-white"
              : "border-stone-300 bg-white text-stone-600 hover:text-stone-900"
          }`}
          title="Card nhỏ hơn để xem nhiều người"
        >
          ⊟ Compact
        </button>
      </div>

      {/* Branch breadcrumb */}
      {branchRootPerson && (
        <div className="flex items-center justify-between rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm">
          <div>
            <span className="text-amber-900">🌿 Đang xem nhánh từ: </span>
            <strong className="serif text-amber-900">{branchRootPerson.fullName}</strong>
            <span className="ml-2 text-xs text-amber-700">
              (đời {branchRootPerson.generation} · chỉ con cháu)
            </span>
          </div>
          <button
            onClick={() => setBranchRootId(null)}
            className="rounded border border-amber-400 bg-white px-2 py-1 text-xs text-amber-800 hover:bg-amber-100"
          >
            ← Toàn bộ cây
          </button>
        </div>
      )}

      {/* Help text */}
      <p className="text-xs text-stone-500">
        💡 Kéo để di chuyển · Cuộn / pinch để zoom · Tìm tên rồi <strong>🌿 Lọc</strong> để xem nhánh con cháu của 1 người
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
                  {displayRoots.map((root) => (
                    <TreeBranch
                      key={root.person.id}
                      node={root}
                      orientation={orientation}
                      highlightId={highlightId}
                      branchRootId={branchRootId}
                      collapsed={collapsed}
                      toggleCollapsed={toggleCollapsed}
                      siblingsExpanded={siblingsExpanded}
                      toggleSiblings={toggleSiblings}
                      compact={compact}
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
  branchRootId,
  collapsed,
  toggleCollapsed,
  siblingsExpanded,
  toggleSiblings,
  compact,
}: {
  node: TreeNode;
  orientation: "vertical" | "horizontal";
  highlightId: string | null;
  branchRootId: string | null;
  collapsed: Set<string>;
  toggleCollapsed: (id: string) => void;
  siblingsExpanded: Set<string>;
  toggleSiblings: (id: string) => void;
  compact: boolean;
}) {
  const isCollapsed = collapsed.has(node.person.id);
  const totalChildren = node.children.length;
  const hasChildren = totalChildren > 0;
  const expanded = siblingsExpanded.has(node.person.id);
  const showAll = expanded || totalChildren <= SIBLINGS_LIMIT;
  const visibleChildren = showAll ? node.children : node.children.slice(0, SIBLINGS_LIMIT);
  const hiddenCount = totalChildren - visibleChildren.length;

  const childProps = {
    orientation,
    highlightId,
    branchRootId,
    collapsed,
    toggleCollapsed,
    siblingsExpanded,
    toggleSiblings,
    compact,
  };

  const moreButton = hiddenCount > 0 ? (
    <button
      onClick={(e) => { e.stopPropagation(); toggleSiblings(node.person.id); }}
      className="flex flex-col items-center justify-center min-w-[100px] rounded-lg border-2 border-dashed border-amber-400 bg-amber-50 px-3 py-3 text-xs font-medium text-amber-800 hover:bg-amber-100"
    >
      <span className="text-lg">+{hiddenCount}</span>
      <span>người nữa</span>
    </button>
  ) : null;

  const collapseButton = expanded && totalChildren > SIBLINGS_LIMIT ? (
    <button
      onClick={(e) => { e.stopPropagation(); toggleSiblings(node.person.id); }}
      className="flex flex-col items-center justify-center min-w-[80px] rounded-lg border border-stone-300 bg-white px-2 py-3 text-xs text-stone-600 hover:bg-stone-50"
      title="Thu lại"
    >
      <span className="text-base">−</span>
      <span>thu lại</span>
    </button>
  ) : null;

  if (orientation === "vertical") {
    return (
      <div className="flex flex-col items-center">
        <PersonPair
          person={node.person}
          spouse={node.spouse}
          highlightId={highlightId}
          branchRootId={branchRootId}
          hasChildren={hasChildren}
          isCollapsed={isCollapsed}
          onToggle={() => toggleCollapsed(node.person.id)}
          childCount={totalChildren}
          compact={compact}
        />
        {hasChildren && !isCollapsed && (
          <>
            <div className="h-8 w-0.5 bg-stone-300" />
            <div className="relative flex items-start gap-4 sm:gap-6">
              {visibleChildren.length > 1 && (
                <div className="absolute left-[10%] right-[10%] top-0 h-0.5 bg-stone-300" />
              )}
              {visibleChildren.map((child) => (
                <div key={child.person.id} className="flex flex-col items-center">
                  <div className="h-8 w-0.5 bg-stone-300" />
                  <TreeBranch node={child} {...childProps} />
                </div>
              ))}
              {moreButton && (
                <div className="flex flex-col items-center">
                  <div className="h-8 w-0.5 bg-amber-400" />
                  {moreButton}
                </div>
              )}
              {collapseButton && (
                <div className="flex flex-col items-center">
                  <div className="h-8 w-0.5 bg-stone-300" />
                  {collapseButton}
                </div>
              )}
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
        branchRootId={branchRootId}
        hasChildren={hasChildren}
        isCollapsed={isCollapsed}
        onToggle={() => toggleCollapsed(node.person.id)}
        childCount={totalChildren}
        compact={compact}
      />
      {hasChildren && !isCollapsed && (
        <>
          <div className="w-8 h-0.5 bg-stone-300" />
          <div className="relative flex flex-col gap-4">
            {visibleChildren.length > 1 && (
              <div className="absolute top-[10%] bottom-[10%] left-0 w-0.5 bg-stone-300" />
            )}
            {visibleChildren.map((child) => (
              <div key={child.person.id} className="flex flex-row items-center">
                <div className="w-8 h-0.5 bg-stone-300" />
                <TreeBranch node={child} {...childProps} />
              </div>
            ))}
            {moreButton && (
              <div className="flex flex-row items-center">
                <div className="w-8 h-0.5 bg-amber-400" />
                {moreButton}
              </div>
            )}
            {collapseButton && (
              <div className="flex flex-row items-center">
                <div className="w-8 h-0.5 bg-stone-300" />
                {collapseButton}
              </div>
            )}
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
  branchRootId,
  hasChildren,
  isCollapsed,
  onToggle,
  childCount,
  compact,
}: {
  person: PersonNode;
  spouse: PersonNode | null;
  highlightId: string | null;
  branchRootId: string | null;
  hasChildren: boolean;
  isCollapsed: boolean;
  onToggle: () => void;
  childCount: number;
  compact: boolean;
}) {
  return (
    <div className="relative flex items-center gap-2">
      <PersonCard
        person={person}
        highlight={highlightId === person.id}
        isBranchRoot={branchRootId === person.id}
        compact={compact}
      />
      {spouse && (
        <>
          <span className="select-none text-amber-600 text-xl font-bold">⚭</span>
          <PersonCard
            person={spouse}
            highlight={highlightId === spouse.id}
            isBranchRoot={branchRootId === spouse.id}
            compact={compact}
          />
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

function PersonCard({
  person,
  highlight,
  isBranchRoot,
  compact,
}: {
  person: PersonNode;
  highlight?: boolean;
  isBranchRoot?: boolean;
  compact: boolean;
}) {
  const isMale = person.gender === "male";
  const colorClass = person.isInLaw
    ? "border-amber-300 bg-gradient-to-br from-amber-50 to-amber-100 text-amber-950"
    : isMale
      ? "border-sky-300 bg-gradient-to-br from-sky-50 to-sky-100 text-sky-950"
      : "border-rose-300 bg-gradient-to-br from-rose-50 to-rose-100 text-rose-950";

  // Branch root: bold ring + scale + pulse glow. Highlight (search): amber ring.
  const emphasis = isBranchRoot
    ? "ring-4 ring-emerald-500 ring-offset-2 scale-110 shadow-xl shadow-emerald-200 animate-pulse-slow"
    : highlight
      ? "ring-4 ring-amber-400 ring-offset-2 scale-105"
      : "";

  if (compact) {
    return (
      <div className="relative">
        <Link
          id={`node-${person.id}`}
          href={`/dashboard/phahe/${person.id}`}
          onClick={(e) => e.stopPropagation()}
          className={`block min-w-[80px] max-w-[110px] rounded-lg border px-2 py-1 text-center shadow-sm transition hover:shadow-md ${colorClass} ${emphasis}`}
        >
          <div className="serif text-[11px] font-semibold leading-tight truncate">{person.fullName}</div>
        </Link>
        {isBranchRoot && (
          <span className="absolute -top-2 -right-2 rounded-full bg-emerald-600 px-1.5 py-0.5 text-[9px] font-bold text-white shadow">
            🌿
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <Link
        id={`node-${person.id}`}
        href={`/dashboard/phahe/${person.id}`}
        onClick={(e) => e.stopPropagation()}
        className={`block min-w-[120px] max-w-[160px] rounded-xl border-2 px-3 py-2.5 text-center shadow-sm transition hover:shadow-md ${colorClass} ${emphasis}`}
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
      {isBranchRoot && (
        <span className="absolute -top-2 -right-2 rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-md">
          🌿 Gốc
        </span>
      )}
    </div>
  );
}
