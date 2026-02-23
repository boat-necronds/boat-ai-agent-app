import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

// Agents (chatbot + marketplace ตาม PRD)
export const agents = pgTable("agents", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description"),
  url: text("url").notNull(),
  agentType: text("agent_type").notNull(), // e.g. 'fitness' | 'food' | 'general'
  /** 'active' | 'inactive' | 'maintenance' - ใช้ซ่อน/เปิด agent โดยไม่ลบ */
  status: text("status").default("active").notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  slug: text("slug"),
  allowedModels: text("allowed_models"),
  defaultModel: text("default_model"),
  // PRD: marketplace
  /** 'platform' | 'third_party' */
  type: text("type").default("platform").notNull(),
  /** ทักษะ (JSON array string) */
  skills: text("skills"),
  capabilities: text("capabilities"),
  /** 'fixed' | 'hourly' | 'subscription' */
  pricingModel: text("pricing_model"),
  /** ราคา (เก็บเป็น string เลขทศนิยม) */
  price: text("price"),
  /** คะแนนเฉลี่ย 0–5 */
  rating: text("rating").default("0"),
  totalJobs: integer("total_jobs").default(0).notNull(),
  completedJobs: integer("completed_jobs").default(0).notNull(),
  mcpEndpoint: text("mcp_endpoint"),
  approvedAt: timestamp("approved_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Agent = typeof agents.$inferSelect;
export type NewAgent = typeof agents.$inferInsert;

// Jobs (PRD: Human จ้าง AI — lifecycle draft → published → … → completed)
export const jobs = pgTable("jobs", {
  id: uuid("id").primaryKey().defaultRandom(),
  humanId: uuid("human_id")
    .notNull()
    .references(() => accounts.id, { onDelete: "cascade" }),
  agentId: uuid("agent_id").references(() => agents.id),

  title: text("title").notNull(),
  goal: text("goal").notNull(),
  task: text("task").notNull(),
  /** JSON array of allowed tool names */
  allowedTools: text("allowed_tools"),
  /** วงเงิน (เก็บเป็น string เลขทศนิยม) */
  budget: text("budget").notNull(),
  deadline: timestamp("deadline"),

  /** draft | published | matching | pending_confirmation | active | in_review | revision_requested | completed | cancelled | rejected */
  status: text("status").default("draft").notNull(),

  output: text("output"),
  /** JSON array of file URLs/paths */
  outputFiles: text("output_files"),

  revisionCount: integer("revision_count").default(0).notNull(),
  maxRevisions: integer("max_revisions").default(2).notNull(),
  /** ข้อความ feedback เมื่อ user กด Request revision */
  revisionFeedback: text("revision_feedback"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  publishedAt: timestamp("published_at"),
  confirmedAt: timestamp("confirmed_at"),
  completedAt: timestamp("completed_at"),
});

export type Job = typeof jobs.$inferSelect;
export type NewJob = typeof jobs.$inferInsert;

// Job logs (audit trail สำหรับ PRD: ระบบ log ทุก action)
export const jobLogs = pgTable("job_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  jobId: uuid("job_id")
    .notNull()
    .references(() => jobs.id, { onDelete: "cascade" }),
  /** created | published | agent_assigned | confirmed | cancelled | work_submitted | in_review | approved | rejected | revision_requested */
  event: text("event").notNull(),
  /** Optional JSON payload (e.g. agentId, revisionFeedback) */
  payload: text("payload"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type JobLog = typeof jobLogs.$inferSelect;
export type NewJobLog = typeof jobLogs.$inferInsert;

// Reviews (PRD: Human ให้ rating/review หลัง completed)
export const reviews = pgTable("reviews", {
  id: uuid("id").primaryKey().defaultRandom(),
  jobId: uuid("job_id")
    .notNull()
    .references(() => jobs.id, { onDelete: "cascade" }),
  agentId: uuid("agent_id")
    .notNull()
    .references(() => agents.id, { onDelete: "cascade" }),
  humanId: uuid("human_id")
    .notNull()
    .references(() => accounts.id, { onDelete: "cascade" }),
  /** 1–5 */
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Review = typeof reviews.$inferSelect;
export type NewReview = typeof reviews.$inferInsert;

// Page sections (title/description for pages e.g. agents list)
export const pageSections = pgTable("page_sections", {
  key: text("key").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
});

export type PageSection = typeof pageSections.$inferSelect;
export type NewPageSection = typeof pageSections.$inferInsert;

// User account (combines profile and settings, references Supabase auth.users)
export const accounts = pgTable("accounts", {
  id: uuid("id").primaryKey(), // References auth.users.id
  // Profile fields
  fullName: text("full_name"),
  username: text("username").unique(),
  bio: text("bio"),
  avatarUrl: text("avatar_url"),
  // Settings fields
  emailNotifications: boolean("email_notifications").default(true).notNull(),
  pushNotifications: boolean("push_notifications").default(true).notNull(),
  theme: text("theme").default("system").notNull(), // 'light' | 'dark' | 'system'
  language: text("language").default("th").notNull(),
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Type exports
export type Account = typeof accounts.$inferSelect;
export type NewAccount = typeof accounts.$inferInsert;

// Legacy exports for backward compatibility (will be removed)
export const profiles = accounts;
export const userSettings = accounts;
export type Profile = Account;
export type NewProfile = NewAccount;
export type UserSettings = Account;
export type NewUserSettings = NewAccount;
