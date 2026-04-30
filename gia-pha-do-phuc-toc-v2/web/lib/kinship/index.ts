/**
 * Vietnamese kinship calculator — ported from v1 (giapha-do-phuc-toc).
 * Algorithm covers:
 *  - Direct line: Bố/Mẹ → Ông/Bà → Cụ → Kỵ → Sơ → Tiệm → Tiểu → Di → Diễn (9 đời)
 *  - Descendants: Con → Cháu → Chắt → Chít → Chút → Chét → Chót → Chẹt
 *  - Siblings: anh/chị/em ruột
 *  - Uncle/aunt: Bác/Chú/Cô/Cậu/Dì (Nội/Ngoại)
 *  - Cousins: anh/chị/em họ (Nội/Ngoại)
 *  - In-laws via marriage of A, B, or both
 *  - Special: anh em cột chèo, chị em dâu
 */

/**
 * Person fields used by the kinship algorithm + tree/UI components.
 * Required fields = needed by algo. Optional fields = used only by UI.
 * Drizzle's full Person row from `lib/db/schema` satisfies this interface.
 */
export interface PersonNode {
  id: string;
  fullName: string;
  gender: "male" | "female" | "other";
  birthYear: number | null;
  birthOrder: number | null;
  generation: number | null;
  isInLaw: boolean;

  // Optional — used by tree/detail UI, ignored by algorithm
  isDeceased?: boolean;
  deathYear?: number | null;
  otherNames?: string | null;
}

export interface RelEdge {
  type: "marriage" | "biological_child" | "adopted_child" | string;
  personA: string;
  personB: string;
}

export interface KinshipResult {
  /** Person A gọi Person B là gì */
  aCallsB: string;
  /** Person B gọi Person A là gì */
  bCallsA: string;
  /** Mô tả chi tiết nhánh quan hệ */
  description: string;
  /** Số bậc cách nhau */
  distance: number;
  /** Các bước quan hệ chi tiết */
  pathLabels: string[];
}

// ── Helpers ──────────────────────────────────────────────────────────

function compareSeniority(
  a: PersonNode,
  b: PersonNode,
): "senior" | "junior" | "equal" {
  if (a.id === b.id) return "equal";

  if (a.birthOrder != null && b.birthOrder != null) {
    if (a.birthOrder < b.birthOrder) return "senior";
    if (a.birthOrder > b.birthOrder) return "junior";
  }

  if (a.birthYear != null && b.birthYear != null) {
    if (a.birthYear < b.birthYear) return "senior";
    if (a.birthYear > b.birthYear) return "junior";
  }

  return "equal";
}

const ANCESTORS = ["", "Bố/Mẹ", "Ông/Bà", "Cụ", "Kỵ", "Sơ", "Tiệm", "Tiểu", "Di", "Diễn"];
const DESCENDANTS = ["", "Con", "Cháu", "Chắt", "Chít", "Chút", "Chét", "Chót", "Chẹt"];

function getDirectAncestorTerm(depth: number, gender: "male" | "female" | "other", isPaternal: boolean): string {
  if (depth === 1) return gender === "female" ? "Mẹ" : "Bố";
  if (depth === 2) {
    const base = gender === "female" ? "Bà" : "Ông";
    return `${base} ${isPaternal ? "nội" : "ngoại"}`;
  }
  const title = ANCESTORS[depth] || `Tổ đời ${depth}`;
  if (depth === 3) {
    const base = gender === "female" ? "Cụ bà" : "Cụ ông";
    return `${base} ${isPaternal ? "nội" : "ngoại"}`;
  }
  return title;
}

function getDirectDescendantTerm(depth: number): string {
  return DESCENDANTS[depth] || `Cháu đời ${depth}`;
}

// ── Core Algorithm ──────────────────────────────────────────────────────────

function resolveBloodTerms(
  depthA: number,
  depthB: number,
  personA: PersonNode,
  personB: PersonNode,
  pathA: PersonNode[],
  pathB: PersonNode[],
): [string, string, string] {
  const genderA = personA.gender;
  const genderB = personB.gender;

  // 1. TRỰC HỆ
  if (depthA === 0) {
    const firstChildOfA = pathB[pathB.length - 1];
    if (!firstChildOfA) return ["Hậu duệ", "Tiền bối", "Quan hệ Trực hệ"];
    const isPaternal = firstChildOfA.gender === "male";
    const bCallsA = getDirectAncestorTerm(depthB, genderA, isPaternal);
    const aCallsB = getDirectDescendantTerm(depthB);
    return [aCallsB, bCallsA, "Quan hệ Trực hệ"];
  }

  if (depthB === 0) {
    const firstChildOfB = pathA[pathA.length - 1];
    if (!firstChildOfB) return ["Tiền bối", "Hậu duệ", "Quan hệ Trực hệ"];
    const isPaternal = firstChildOfB.gender === "male";
    const aCallsB = getDirectAncestorTerm(depthA, genderB, isPaternal);
    const bCallsA = getDirectDescendantTerm(depthA);
    return [aCallsB, bCallsA, "Quan hệ Trực hệ"];
  }

  // 2. NGANG HÀNG / HỌ HÀNG
  const branchA = pathA[pathA.length - 1];
  const branchB = pathB[pathB.length - 1];
  if (!branchA || !branchB) return ["Họ hàng", "Họ hàng", "Quan hệ họ hàng"];

  const seniority = compareSeniority(branchA, branchB);
  const isPaternalA = branchA.gender === "male";

  // Anh chị em ruột
  if (depthA === 1 && depthB === 1) {
    const aSenior = compareSeniority(personA, personB);
    if (aSenior === "senior") {
      return [
        genderB === "female" ? "Em gái" : "Em trai",
        genderA === "female" ? "Chị gái" : "Anh trai",
        "Anh chị em ruột",
      ];
    } else {
      return [
        genderB === "female" ? "Chị gái" : "Anh trai",
        genderA === "female" ? "Em gái" : "Em trai",
        "Anh chị em ruột",
      ];
    }
  }

  // Bác/Chú/Cô/Cậu/Dì (B là anh chị em của tổ tiên A)
  if (depthA > 1 && depthB === 1) {
    let termForB = "";
    const isPaternalSide = branchA.gender === "male";

    if (isPaternalSide) {
      if (genderB === "female") {
        termForB = seniority === "junior" ? "Bác" : "Cô";
      } else {
        termForB = seniority === "junior" ? "Bác" : "Chú";
      }
    } else {
      termForB = genderB === "female" ? "Dì" : "Cậu";
    }

    let prefix = "";
    if (depthA === 3) prefix = genderB === "female" ? "Bà " : "Ông ";
    else if (depthA === 4) prefix = genderB === "female" ? "Cụ bà " : "Cụ ông ";
    else if (depthA > 4) prefix = (ANCESTORS[depthA - 1] ?? "") + " ";

    return [
      (prefix + termForB).trim(),
      getDirectDescendantTerm(depthA),
      isPaternalSide ? "Bên Nội (Vế trên)" : "Bên Ngoại (Vế trên)",
    ];
  }

  if (depthA === 1 && depthB > 1) {
    const [bCallsA, aCallsB, desc] = resolveBloodTerms(
      depthB, depthA, personB, personA, pathB, pathA,
    );
    return [aCallsB, bCallsA, desc];
  }

  // Anh em họ
  if (depthA > 1 && depthB > 1) {
    const side = isPaternalA ? "Nội" : "Ngoại";

    if (depthA === depthB) {
      if (seniority === "senior") {
        return [
          "Em họ",
          genderA === "female" ? "Chị họ" : "Anh họ",
          `Anh em họ ${side}`,
        ];
      } else {
        return [
          genderB === "female" ? "Chị họ" : "Anh họ",
          "Em họ",
          `Anh em họ ${side}`,
        ];
      }
    } else {
      const genDiff = depthA - depthB;
      if (genDiff > 0) {
        let termForB = "Họ hàng";
        if (genDiff === 1) {
          const isPaternalSide = branchA.gender === "male";
          if (isPaternalSide) {
            termForB = genderB === "female"
              ? seniority === "junior" ? "Bác họ" : "Cô họ"
              : seniority === "junior" ? "Bác họ" : "Chú họ";
          } else {
            termForB = genderB === "female" ? "Dì họ" : "Cậu họ";
          }
        } else {
          termForB = genderB === "female" ? "Bà họ" : "Ông họ";
        }
        return [termForB, "Cháu họ", `Họ hàng ${side}`];
      } else {
        const [bCallsA, aCallsB, desc] = resolveBloodTerms(
          depthB, depthA, personB, personA, pathB, pathA,
        );
        return [aCallsB, bCallsA, desc];
      }
    }
  }

  return ["Người trong họ", "Người trong họ", "Quan hệ họ hàng"];
}

function getAncestryData(
  id: string,
  parentMap: Map<string, string[]>,
  personsMap: Map<string, PersonNode>,
) {
  const depths = new Map<string, { depth: number; path: PersonNode[] }>();
  const queue: { id: string; depth: number; path: PersonNode[] }[] = [
    { id, depth: 0, path: [] },
  ];

  while (queue.length > 0) {
    const { id: currentId, depth, path } = queue.shift()!;
    if (!depths.has(currentId)) {
      depths.set(currentId, { depth, path });
      const currentNode = personsMap.get(currentId);
      if (!currentNode) continue;
      const parents = parentMap.get(currentId) ?? [];
      for (const pId of parents) {
        const pNode = personsMap.get(pId);
        if (pNode) {
          queue.push({ id: pId, depth: depth + 1, path: [...path, currentNode] });
        }
      }
    }
  }
  return depths;
}

function findBloodKinship(
  personA: PersonNode,
  personB: PersonNode,
  personsMap: Map<string, PersonNode>,
  parentMap: Map<string, string[]>,
): KinshipResult | null {
  const ancA = getAncestryData(personA.id, parentMap, personsMap);
  const ancB = getAncestryData(personB.id, parentMap, personsMap);

  let lcaId: string | null = null;
  let minDistance = Infinity;

  for (const [id, dataA] of ancA) {
    if (ancB.has(id)) {
      const dist = dataA.depth + ancB.get(id)!.depth;
      if (dist < minDistance) {
        minDistance = dist;
        lcaId = id;
      }
    }
  }

  if (!lcaId) return null;

  const dataA = ancA.get(lcaId)!;
  const dataB = ancB.get(lcaId)!;

  const [aCallsB, bCallsA, description] = resolveBloodTerms(
    dataA.depth, dataB.depth, personA, personB, dataA.path, dataB.path,
  );

  const lcaName = personsMap.get(lcaId)?.fullName ?? "Tổ tiên chung";
  const pathParts: string[] = [
    `${personA.fullName} cách ${lcaName} ${dataA.depth} đời.`,
    `${personB.fullName} cách ${lcaName} ${dataB.depth} đời.`,
  ];

  return {
    aCallsB,
    bCallsA,
    description: `${description} (Tổ tiên chung: ${lcaName})`,
    distance: minDistance,
    pathLabels: pathParts,
  };
}

// ── Main Entry Point ──────────────────────────────────────────────────────────

export function computeKinship(
  personA: PersonNode,
  personB: PersonNode,
  persons: PersonNode[],
  relationships: RelEdge[],
): KinshipResult | null {
  if (personA.id === personB.id) return null;

  const personsMap = new Map(persons.map((p) => [p.id, p]));
  const parentMap = new Map<string, string[]>();
  const spouseMap = new Map<string, string[]>();

  for (const r of relationships) {
    if (r.type === "biological_child" || r.type === "adopted_child") {
      const p = parentMap.get(r.personB) ?? [];
      p.push(r.personA);
      parentMap.set(r.personB, p);
    } else if (r.type === "marriage") {
      const sA = spouseMap.get(r.personA) ?? [];
      sA.push(r.personB);
      spouseMap.set(r.personA, sA);
      const sB = spouseMap.get(r.personB) ?? [];
      sB.push(r.personA);
      spouseMap.set(r.personB, sB);
    }
  }

  // 0. Hôn nhân trực tiếp
  const spousesA = spouseMap.get(personA.id) ?? [];
  if (spousesA.includes(personB.id)) {
    return {
      aCallsB: personB.gender === "female" ? "Vợ" : "Chồng",
      bCallsA: personA.gender === "female" ? "Vợ" : "Chồng",
      description: "Quan hệ Hôn nhân",
      distance: 0,
      pathLabels: [`${personA.fullName} và ${personB.fullName} là vợ chồng.`],
    };
  }

  // 1. Huyết thống
  const blood = findBloodKinship(personA, personB, personsMap, parentMap);
  if (blood) return blood;

  // 2. Qua hôn nhân của A
  for (const sId of spousesA) {
    if (sId === personB.id) continue;
    const spouseA = personsMap.get(sId);
    if (!spouseA) continue;
    const res = findBloodKinship(spouseA, personB, personsMap, parentMap);
    if (res) {
      let aCallsB = res.aCallsB;
      let bCallsA = res.bCallsA;
      const suffix = personA.gender === "male" ? " vợ" : " chồng";

      if (
        res.aCallsB === "Bố" || res.aCallsB === "Mẹ" ||
        res.aCallsB.startsWith("Ông") || res.aCallsB.startsWith("Bà") || res.aCallsB.startsWith("Cụ")
      ) {
        aCallsB = res.aCallsB + suffix;
      } else if (res.aCallsB.includes("Anh trai")) {
        aCallsB = "Anh" + suffix;
      } else if (res.aCallsB.includes("Chị gái")) {
        aCallsB = "Chị" + suffix;
      } else if (res.aCallsB === "Em họ") {
        aCallsB = "Em " + suffix + " (họ)";
      } else if (res.aCallsB === "Chị họ") {
        aCallsB = "Chị " + suffix + " (họ)";
      } else if (res.aCallsB === "Anh họ") {
        aCallsB = "Anh " + suffix + " (họ)";
      } else if (res.aCallsB.includes("Em")) {
        aCallsB = "Em" + suffix;
      } else if (
        ["Bác", "Chú", "Cô", "Cậu", "Dì"].includes(res.aCallsB) ||
        res.aCallsB.endsWith(" họ")
      ) {
        aCallsB = res.aCallsB.replace(" họ", "") + suffix;
      }

      if (res.bCallsA === "Con") {
        bCallsA = personA.gender === "male" ? "Con rể" : "Con dâu";
      } else if (res.bCallsA === "Cháu") {
        bCallsA = personA.gender === "male" ? "Cháu rể" : "Cháu dâu";
      } else if (res.bCallsA.includes("Anh trai") || res.bCallsA.includes("Chị gái")) {
        bCallsA = personA.gender === "male" ? "Anh rể" : "Chị dâu";
      } else if (res.bCallsA.includes("Em")) {
        bCallsA = personA.gender === "male" ? "Em rể" : "Em dâu";
        if (res.bCallsA.includes("họ")) bCallsA += " (họ)";
      } else if (res.bCallsA === "Chị họ") {
        bCallsA = "Anh rể (họ)";
      } else if (res.bCallsA === "Anh họ") {
        bCallsA = "Chị dâu (họ)";
      } else if (res.bCallsA === "Chú") bCallsA = "Cô";
      else if (res.bCallsA === "Chú họ") bCallsA = "Thím họ";
      else if (res.bCallsA === "Bác họ") bCallsA = "Bác họ";
      else if (res.bCallsA === "Cô") bCallsA = "Chú";
      else if (res.bCallsA === "Cậu") bCallsA = "Dì";
      else if (res.bCallsA === "Dì") bCallsA = "Cậu";
      else if (res.bCallsA === "Bà Cô") bCallsA = "Ông Dượng";
      else if (res.bCallsA === "Ông Chú") bCallsA = "Bà Thím";
      else if (res.bCallsA === "Ông Bác") bCallsA = "Bà Bác";
      else {
        bCallsA = (personA.gender === "male" ? "Chồng" : "Vợ") + " của " + res.bCallsA;
      }

      return {
        ...res,
        aCallsB,
        bCallsA,
        description: `Thông qua hôn nhân của ${spouseA.fullName}`,
        pathLabels: [
          `${personA.fullName} là ${personA.gender === "male" ? "Chồng" : "Vợ"} của ${spouseA.fullName}`,
          ...res.pathLabels,
        ],
      };
    }
  }

  // 3. Qua hôn nhân của B
  const spousesB = spouseMap.get(personB.id) ?? [];
  for (const sId of spousesB) {
    const spouseB = personsMap.get(sId);
    if (!spouseB) continue;
    const res = findBloodKinship(personA, spouseB, personsMap, parentMap);
    if (res) {
      let aCallsB = res.aCallsB;
      let bCallsA = res.bCallsA;

      if (res.aCallsB === "Con") {
        aCallsB = personB.gender === "male" ? "Con rể" : "Con dâu";
      } else if (res.aCallsB === "Cháu") {
        aCallsB = personB.gender === "male" ? "Cháu rể" : "Cháu dâu";
      } else if (res.aCallsB.includes("Anh trai")) {
        aCallsB = personB.gender === "female" ? "Chị dâu" : "Anh rể";
      } else if (res.aCallsB.includes("Chị gái")) {
        aCallsB = personB.gender === "male" ? "Anh rể" : "Chị dâu";
      } else if (res.aCallsB.includes("Chị họ")) {
        aCallsB = "Anh rể (họ)";
      } else if (res.aCallsB.includes("Anh họ")) {
        aCallsB = "Chị dâu (họ)";
      } else if (res.aCallsB.includes("Em")) {
        aCallsB = personB.gender === "male" ? "Em rể (họ)" : "Em dâu (họ)";
      } else if (res.aCallsB === "Chú") aCallsB = "Cô";
      else if (res.aCallsB === "Chú họ") aCallsB = "Thím họ";
      else if (res.aCallsB === "Cô") aCallsB = "Chú";
      else if (res.aCallsB === "Cậu") aCallsB = "Dì";
      else if (res.aCallsB === "Dì") aCallsB = "Cậu";
      else if (res.aCallsB === "Bà Cô") aCallsB = "Ông Dượng";
      else if (res.aCallsB === "Ông Chú") aCallsB = "Bà Thím";
      else if (res.aCallsB === "Ông Bác") aCallsB = "Bà Bác";
      else {
        aCallsB = (personB.gender === "male" ? "Chồng" : "Vợ") + " của " + res.aCallsB;
      }

      const suffix = personB.gender === "male" ? " vợ" : " chồng";
      if (
        res.bCallsA === "Bố" || res.bCallsA === "Mẹ" ||
        res.bCallsA.startsWith("Ông") || res.bCallsA.startsWith("Bà") || res.bCallsA.startsWith("Cụ")
      ) {
        bCallsA = res.bCallsA + suffix;
      } else if (res.bCallsA.includes("Anh trai")) {
        bCallsA = "Anh" + suffix;
      } else if (res.bCallsA.includes("Chị gái")) {
        bCallsA = "Chị" + suffix;
      } else if (res.bCallsA === "Em họ") {
        bCallsA = "Em" + suffix + " (họ)";
      } else if (res.bCallsA === "Chị họ") {
        bCallsA = "Chị" + suffix + " (họ)";
      } else if (res.bCallsA === "Anh họ") {
        bCallsA = "Anh" + suffix + " (họ)";
      } else if (res.bCallsA.includes("Em")) {
        bCallsA = "Em" + suffix;
      } else if (
        ["Bác", "Chú", "Cô", "Cậu", "Dì"].includes(res.bCallsA) ||
        res.bCallsA.endsWith(" họ")
      ) {
        bCallsA = res.bCallsA + suffix;
      }

      return {
        ...res,
        aCallsB,
        bCallsA,
        description: `Thông qua hôn nhân của ${spouseB.fullName}`,
        pathLabels: [
          ...res.pathLabels,
          `${personB.fullName} là ${personB.gender === "male" ? "Chồng" : "Vợ"} của ${spouseB.fullName}`,
        ],
      };
    }
  }

  // 4. Qua cả 2 hôn nhân
  for (const sIdA of spousesA) {
    const spouseA = personsMap.get(sIdA);
    if (!spouseA) continue;
    for (const sIdB of spousesB) {
      if (sIdA === sIdB) continue;
      const spouseB = personsMap.get(sIdB);
      if (!spouseB) continue;
      const res = findBloodKinship(spouseA, spouseB, personsMap, parentMap);
      if (res) {
        const prefixA = personA.gender === "male" ? "Chồng" : "Vợ";
        const prefixB = personB.gender === "male" ? "Chồng" : "Vợ";
        let aCallsB = `${prefixB} của ${res.aCallsB}`;
        let bCallsA = `${prefixA} của ${res.bCallsA}`;

        if (res.description.includes("Anh chị em ruột")) {
          if (
            personA.gender === "male" && personB.gender === "male" &&
            spouseA.gender === "female" && spouseB.gender === "female"
          ) {
            aCallsB = "Anh em cột chèo";
            bCallsA = "Anh em cột chèo";
          } else if (
            personA.gender === "female" && personB.gender === "female" &&
            spouseA.gender === "male" && spouseB.gender === "male"
          ) {
            aCallsB = "Chị em dâu";
            bCallsA = "Chị em dâu";
          }
        }

        return {
          ...res,
          aCallsB,
          bCallsA,
          description: `Thông qua hôn nhân của cả ${spouseA.fullName} và ${spouseB.fullName}`,
          pathLabels: [
            `${personA.fullName} là ${prefixA} của ${spouseA.fullName}`,
            ...res.pathLabels,
            `${personB.fullName} là ${prefixB} của ${spouseB.fullName}`,
          ],
        };
      }
    }
  }

  return {
    aCallsB: "Chưa xác định",
    bCallsA: "Chưa xác định",
    description: "Không tìm thấy quan hệ trong phạm vi dữ liệu",
    distance: -1,
    pathLabels: [],
  };
}
