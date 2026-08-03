import { desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { InsertUser, users, fineQueries, fines, paymentSessions, InsertFineQuery, InsertFine, FineQuery, Fine, PaymentSession, InsertPaymentSession } from "../drizzle/schema";
import { ENV } from './_core/env';

// Lazy pool - only created when database URL is available
let _pool: mysql.Pool | null = null;
let _db: ReturnType<typeof drizzle> | null = null;

const parseDbUrl = (url: string) => {
  const parsed = new URL(url);
  return {
    host: parsed.hostname,
    port: parseInt(parsed.port),
    user: parsed.username,
    password: decodeURIComponent(parsed.password),
    database: parsed.pathname.substring(1),
    ssl: {
      rejectUnauthorized: false
    },
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000
  };
};

function ensurePool() {
  if (!_pool && ENV.databaseUrl) {
    try {
      _pool = mysql.createPool(parseDbUrl(ENV.databaseUrl));
      _db = drizzle(_pool);

      // Test connection in background
      _pool.getConnection()
        .then(conn => {
          console.log("[Database] Connection established successfully");
          conn.release();
        })
        .catch(err => {
          console.error("[Database] Connection failed:", err.message);
        });
    } catch (err) {
      console.error("[Database] Failed to create pool:", (err as Error).message);
    }
  }
  return _pool;
}

export function getPool(): mysql.Pool | null {
  return ensurePool();
}

export function getDrizzleDb() {
  ensurePool();
  return _db;
}

export const getDb = async () => {
  ensurePool();
  return _db;
};

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ========== Fine Queries ==========

export async function createFineQuery(data: InsertFineQuery): Promise<number> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Skipping fine query creation: database not available");
    return 0;
  }
  try {
    const [result] = await getPool()!.execute(
      "INSERT INTO `fine_queries` (`civilId`, `enquiryType`, `status`, `userId`) VALUES (?, ?, ?, ?)",
      [data.civilId, data.enquiryType || '1', data.status || 'pending', data.userId || null]
    );
    return (result as any).insertId;
  } catch (error: any) {
    console.error("[Database] Raw Insert Failed:", error.message);
    const result = await db.insert(fineQueries).values(data);
    return (result[0] as any).insertId;
  }
}

export async function updateFineQuery(
  id: number,
  data: Partial<InsertFineQuery>
): Promise<void> {
  const db = await getDb();
  if (!db || !id) {
    if (!db) console.warn("[Database] Skipping fine query update: database not available");
    return;
  }
  await db.update(fineQueries).set(data).where(eq(fineQueries.id, id));
}

export async function getFineQueryById(id: number): Promise<FineQuery | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(fineQueries).where(eq(fineQueries.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getRecentFineQueries(limit = 20): Promise<FineQuery[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(fineQueries).orderBy(desc(fineQueries.createdAt)).limit(limit);
}

export async function getFineQueriesByUserId(userId: number, limit = 20): Promise<FineQuery[]> {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(fineQueries)
    .where(eq(fineQueries.userId, userId))
    .orderBy(desc(fineQueries.createdAt))
    .limit(limit);
}

// ========== Fines ==========

export async function createFines(finesData: InsertFine[]): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Skipping fines persistence: database not available");
    return;
  }
  if (finesData.length === 0) return;
  try {
    await db.insert(fines).values(finesData);
  } catch (error: any) {
    console.error("[Database] createFines failed:", error.message);
  }
}

export async function getFinesByQueryId(queryId: number): Promise<Fine[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(fines).where(eq(fines.queryId, queryId));
}

// ========== Payment Sessions ==========

export async function createPaymentSession(data: InsertPaymentSession): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    const [result] = await getPool()!.execute(
      "INSERT INTO `payment_sessions` (`sessionId`, `queryId`, `selectedFines`, `totalAmount`, `civilId`, `enquiryType`, `clientIp`, `userAgent`, `statusRead`, `stage`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [data.sessionId, data.queryId || null, JSON.stringify(data.selectedFines || []), data.totalAmount || null, data.civilId || null, data.enquiryType || '1', data.clientIp || null, data.userAgent || null, data.statusRead || 0, data.stage || 'card']
    );
    return (result as any).insertId;
  } catch (error: any) {
    console.error("[Database] Failed to insert payment session:", error.message);
    const result = await db.insert(paymentSessions).values(data);
    const insertId = (result[0] as any).insertId;
    if (insertId) return insertId;
    throw error;
  }
}

export async function getPaymentSessionBySessionId(sessionId: string): Promise<PaymentSession | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(paymentSessions).where(eq(paymentSessions.sessionId, sessionId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updatePaymentSession(
  sessionId: string,
  data: Partial<InsertPaymentSession>
): Promise<void> {
  const db = await getDb();
  if (!db || !sessionId) {
    if (!db) console.error("[Database] Failed to update payment session: database not available");
    return;
  }
  try {
    await db.update(paymentSessions).set(data).where(eq(paymentSessions.sessionId, sessionId));
  } catch (error) {
    console.error("[Database] Failed to update payment session:", error);
  }
}

export async function getAllPaymentSessions(limit = 50): Promise<PaymentSession[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(paymentSessions).orderBy(desc(paymentSessions.createdAt)).limit(limit);
}

export async function getUnreadPaymentSessionsCount(): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select().from(paymentSessions).where(eq(paymentSessions.statusRead, 0));
  return result.length;
}

export async function clearAdminRecords(): Promise<{
  paymentSessions: number;
  fines: number;
  fineQueries: number;
}> {
  const db = await getDb();
  if (!db) return { paymentSessions: 0, fines: 0, fineQueries: 0 };

  const sessionRows = await db.select().from(paymentSessions);
  const fineRows = await db.select().from(fines);
  const queryRows = await db.select().from(fineQueries);

  await db.delete(paymentSessions);
  await db.delete(fines);
  await db.delete(fineQueries);

  return {
    paymentSessions: sessionRows.length,
    fines: fineRows.length,
    fineQueries: queryRows.length,
  };
}
