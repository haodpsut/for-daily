import {
  pgTable,
  pgEnum,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  date,
  doublePrecision,
  jsonb,
  uniqueIndex,
  index,
  check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// ============================================================================
// ENUMS
// ============================================================================

export const genderEnum = pgEnum("gender", ["male", "female", "other"]);

export const userRoleEnum = pgEnum("user_role", ["admin", "editor", "member"]);

export const relationshipTypeEnum = pgEnum("relationship_type", [
  "marriage",
  "biological_child",
  "adopted_child",
]);

export const heritageTypeEnum = pgEnum("heritage_type", [
  "di_huan",      // Lời dạy / di huấn
  "gia_phong",    // Nề nếp gia phong
  "cau_doi",      // Câu đối
  "hoanh_phi",    // Hoành phi
  "van_ban_co",   // Văn bản cổ / scan gia phả cũ
  "tho_van",      // Thơ văn ông bà
]);

export const ritualKindEnum = pgEnum("ritual_kind", [
  "gio_to",           // Giỗ Tổ
  "gio_thuong",       // Giỗ thường (cá nhân)
  "le_tet",           // Lễ Tết Nguyên Đán
  "le_thanh_minh",    // Tảo mộ Thanh Minh
  "le_chap_tu",       // Chạp tổ cuối năm
  "khac",             // Khác
]);

export const mediaTypeEnum = pgEnum("media_type", [
  "image",
  "video",
  "audio",
  "doc",
]);

export const mediaLinkTargetEnum = pgEnum("media_link_target", [
  "person",
  "grave",
  "ritual",
  "ritual_occurrence",
  "heritage_item",
  "annual_report",
  "ancestral_hall",
]);

export const graveStatusEnum = pgEnum("grave_status", [
  "kien_co",          // Mộ kiên cố
  "dat",              // Mộ đất
  "cai_tang_xong",    // Đã cải táng
  "that_lac",         // Mộ thất lạc
  "khac",
]);

// ============================================================================
// AUTH / USERS
// ============================================================================

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  fullName: text("full_name"),
  role: userRoleEnum("role").notNull().default("member"),
  isActive: boolean("is_active").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ============================================================================
// MODULE A — PHẢ HỆ
// ============================================================================

export const persons = pgTable(
  "persons",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    fullName: text("full_name").notNull(),
    otherNames: text("other_names"),                 // Tên thường gọi / pháp danh / tên cúng cơm
    gender: genderEnum("gender").notNull(),

    // Ngày sinh / mất — cho phép partial (chỉ năm)
    birthYear: integer("birth_year"),
    birthMonth: integer("birth_month"),
    birthDay: integer("birth_day"),
    birthIsLunar: boolean("birth_is_lunar").notNull().default(false),

    deathYear: integer("death_year"),
    deathMonth: integer("death_month"),
    deathDay: integer("death_day"),
    deathIsLunar: boolean("death_is_lunar").notNull().default(false),

    isDeceased: boolean("is_deceased").notNull().default(false),
    isInLaw: boolean("is_in_law").notNull().default(false),  // Dâu / rể (không phải huyết thống)

    generation: integer("generation"),                // Đời thứ mấy
    birthOrder: integer("birth_order"),               // Thứ con trong nhà

    avatarUrl: text("avatar_url"),
    biography: text("biography"),                     // Tiểu sử (markdown)
    note: text("note"),

    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("idx_persons_full_name").on(t.fullName),
    index("idx_persons_generation").on(t.generation),
    index("idx_persons_is_deceased").on(t.isDeceased),
  ],
);

// Thông tin nhạy cảm — tách bảng để guard chặt ở app layer
export const personDetailsPrivate = pgTable("person_details_private", {
  personId: uuid("person_id")
    .primaryKey()
    .references(() => persons.id, { onDelete: "cascade" }),
  phoneNumber: text("phone_number"),
  occupation: text("occupation"),
  currentResidence: text("current_residence"),
  email: text("email"),
  socialLinks: jsonb("social_links"),                 // {facebook, zalo, ...}
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const relationships = pgTable(
  "relationships",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    type: relationshipTypeEnum("type").notNull(),
    personA: uuid("person_a").notNull().references(() => persons.id, { onDelete: "cascade" }),
    personB: uuid("person_b").notNull().references(() => persons.id, { onDelete: "cascade" }),
    note: text("note"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    check("no_self_relationship", sql`${t.personA} != ${t.personB}`),
    uniqueIndex("uniq_relationship").on(t.personA, t.personB, t.type),
    index("idx_rel_person_a").on(t.personA),
    index("idx_rel_person_b").on(t.personB),
  ],
);

// ============================================================================
// MODULE B — TỪ ĐƯỜNG
// ============================================================================

// 1 row duy nhất (singleton) — thông tin Từ đường
export const ancestralHallInfo = pgTable("ancestral_hall_info", {
  id: integer("id").primaryKey().default(1),
  name: text("name").notNull(),
  address: text("address"),
  geoLat: doublePrecision("geo_lat"),
  geoLng: doublePrecision("geo_lng"),
  founderPersonId: uuid("founder_person_id").references(() => persons.id, { onDelete: "set null" }),
  history: text("history"),                           // Lịch sử thành lập (markdown)
  heroImageUrl: text("hero_image_url"),
  contactInfo: jsonb("contact_info"),                 // {trưởng tộc, sđt, ...}
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  // Constraint: chỉ cho 1 row
  // (enforce ở app layer + check id=1)
});

// Giỗ kỵ — gắn với 1 person (đã mất)
export const deathAnniversaries = pgTable(
  "death_anniversaries",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    personId: uuid("person_id").notNull().references(() => persons.id, { onDelete: "cascade" }),

    // Ngày giỗ (luôn theo âm lịch)
    lunarMonth: integer("lunar_month").notNull(),
    lunarDay: integer("lunar_day").notNull(),

    importance: integer("importance").notNull().default(1),  // 1=thường, 5=trọng đại
    ritualScript: text("ritual_script"),               // Văn cúng riêng (markdown), để rỗng nếu dùng văn chung
    note: text("note"),

    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("idx_death_anniv_person").on(t.personId),
    index("idx_death_anniv_lunar").on(t.lunarMonth, t.lunarDay),
  ],
);

// Nghi lễ (template) — Giỗ Tổ, Tết, Thanh Minh, Chạp tổ...
export const rituals = pgTable("rituals", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  kind: ritualKindEnum("kind").notNull(),
  purpose: text("purpose"),
  ritualScript: text("ritual_script"),                // Văn cúng (markdown)
  offeringList: jsonb("offering_list"),               // Danh sách vật phẩm: [{name, qty, note}, ...]
  procedure: text("procedure"),                       // Tiến trình (markdown)
  // Lịch âm cố định (vd: mùng 1 Tết, 3/3 Thanh Minh)
  fixedLunarMonth: integer("fixed_lunar_month"),
  fixedLunarDay: integer("fixed_lunar_day"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// Lần thực hiện cụ thể — phục vụ ghi chép thực tế từng năm
export const ritualOccurrences = pgTable(
  "ritual_occurrences",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    ritualId: uuid("ritual_id").references(() => rituals.id, { onDelete: "set null" }),
    deathAnniversaryId: uuid("death_anniversary_id").references(() => deathAnniversaries.id, { onDelete: "set null" }),

    occurredOn: date("occurred_on").notNull(),         // Ngày dương lịch thực tế
    hostPersonId: uuid("host_person_id").references(() => persons.id, { onDelete: "set null" }),
    location: text("location"),
    attendeeCount: integer("attendee_count"),
    summary: text("summary"),                           // Ghi chép buổi lễ
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    check("ritual_or_anniv", sql`${t.ritualId} IS NOT NULL OR ${t.deathAnniversaryId} IS NOT NULL`),
    index("idx_occ_date").on(t.occurredOn),
  ],
);

// Báo cáo Từ đường mỗi năm
export const annualReports = pgTable("annual_reports", {
  id: uuid("id").defaultRandom().primaryKey(),
  year: integer("year").notNull().unique(),
  summary: text("summary"),                            // Tổng kết năm (markdown)
  totalContributions: doublePrecision("total_contributions"),  // Tổng công đức (VND)
  ritualCount: integer("ritual_count"),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// Công đức — đóng góp tiền/hiện vật
export const contributions = pgTable("contributions", {
  id: uuid("id").defaultRandom().primaryKey(),
  contributorPersonId: uuid("contributor_person_id").references(() => persons.id, { onDelete: "set null" }),
  contributorName: text("contributor_name"),           // Cho người ngoài tộc
  amountVnd: doublePrecision("amount_vnd"),
  inKind: text("in_kind"),                              // Hiện vật
  occurrenceId: uuid("occurrence_id").references(() => ritualOccurrences.id, { onDelete: "set null" }),
  reportId: uuid("report_id").references(() => annualReports.id, { onDelete: "set null" }),
  receivedOn: date("received_on").notNull(),
  note: text("note"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ============================================================================
// MODULE C — DI SẢN TINH THẦN
// ============================================================================

export const heritageItems = pgTable(
  "heritage_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    type: heritageTypeEnum("type").notNull(),
    title: text("title").notNull(),
    content: text("content"),                          // Nội dung (markdown / chữ Hán Nôm)
    transliteration: text("transliteration"),          // Phiên âm (nếu chữ Hán)
    translation: text("translation"),                  // Dịch nghĩa
    sourcePersonId: uuid("source_person_id").references(() => persons.id, { onDelete: "set null" }),  // Tác giả / liên quan đến ai
    sourceNote: text("source_note"),                   // Nguồn gốc văn bản
    yearComposed: integer("year_composed"),
    displayOrder: integer("display_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("idx_heritage_type").on(t.type),
    index("idx_heritage_order").on(t.displayOrder),
  ],
);

// ============================================================================
// MODULE D — MỒ MẢ
// ============================================================================

export const graves = pgTable(
  "graves",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    personId: uuid("person_id").references(() => persons.id, { onDelete: "set null" }),  // Có thể null nếu chưa định danh

    cemeteryName: text("cemetery_name"),
    addressText: text("address_text"),
    geoLat: doublePrecision("geo_lat"),
    geoLng: doublePrecision("geo_lng"),
    locationDescription: text("location_description"), // "Hàng 3, lô 12, từ cổng vào bên trái"

    status: graveStatusEnum("status").notNull().default("dat"),
    builtOn: date("built_on"),
    lastReinterredOn: date("last_reinterred_on"),
    inscription: text("inscription"),                  // Chữ trên bia
    note: text("note"),

    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("idx_graves_person").on(t.personId)],
);

export const graveVisits = pgTable("grave_visits", {
  id: uuid("id").defaultRandom().primaryKey(),
  graveId: uuid("grave_id").notNull().references(() => graves.id, { onDelete: "cascade" }),
  visitedOn: date("visited_on").notNull(),
  visitorNames: text("visitor_names"),                  // "Anh Hào, chị Lan, cháu Bin"
  purpose: text("purpose"),                              // "Tảo mộ Thanh Minh"
  workDone: text("work_done"),                           // "Sơn lại bia, dọn cỏ, thắp hương"
  note: text("note"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ============================================================================
// MODULE E — MEDIA (POLYMORPHIC)
// ============================================================================

export const mediaItems = pgTable("media_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  type: mediaTypeEnum("type").notNull(),
  url: text("url").notNull(),                           // Đường dẫn (local hoặc R2)
  thumbnailUrl: text("thumbnail_url"),
  filename: text("filename"),
  mimeType: text("mime_type"),
  sizeBytes: integer("size_bytes"),
  caption: text("caption"),
  takenAt: date("taken_at"),
  uploadedBy: uuid("uploaded_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const mediaLinks = pgTable(
  "media_links",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    mediaId: uuid("media_id").notNull().references(() => mediaItems.id, { onDelete: "cascade" }),
    targetType: mediaLinkTargetEnum("target_type").notNull(),
    targetId: uuid("target_id"),                         // null nếu target là ancestral_hall (singleton)
    displayOrder: integer("display_order").notNull().default(0),
    isPrimary: boolean("is_primary").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("idx_media_links_target").on(t.targetType, t.targetId),
    index("idx_media_links_media").on(t.mediaId),
  ],
);

// ============================================================================
// AUDIT LOG
// ============================================================================

export const auditLog = pgTable("audit_log", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  action: text("action").notNull(),                     // "create" | "update" | "delete"
  tableName: text("table_name").notNull(),
  recordId: text("record_id"),
  diff: jsonb("diff"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ============================================================================
// EXPORT TYPES
// ============================================================================

export type Person = typeof persons.$inferSelect;
export type NewPerson = typeof persons.$inferInsert;
export type Relationship = typeof relationships.$inferSelect;
export type NewRelationship = typeof relationships.$inferInsert;
export type Ritual = typeof rituals.$inferSelect;
export type NewRitual = typeof rituals.$inferInsert;
export type DeathAnniversary = typeof deathAnniversaries.$inferSelect;
export type HeritageItem = typeof heritageItems.$inferSelect;
export type Grave = typeof graves.$inferSelect;
export type MediaItem = typeof mediaItems.$inferSelect;
export type MediaLink = typeof mediaLinks.$inferSelect;
