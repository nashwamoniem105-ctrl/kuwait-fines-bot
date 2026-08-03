import { useState, useRef, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  MapPin,
  Calendar,
  Hash,
  Info,
  Ticket,
  ArrowLeft,
  ArrowRight,
  Phone,
  Globe,
  Mail,
  Search,
  Bell,
  User,
  Home as HomeIcon,
  CreditCard,
  X,
  Shield,
  FileText,
  Building,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

// ===== TYPES =====
type ViewMode = "form" | "results";
type FilterStatus = "all" | "payable" | "notpayable" | "paid";

interface QueryResult {
  success: boolean;
  queryId?: number;
  sessionId: string | null;
  fines: FineResult[];
  totalAmount?: string;
  totalFines?: number;
  errorMessage?: string;
}

interface FineResult {
  ticketNo: string;
  amount: string;
  location: string;
  source: string;
  description: string;
  dateTime: string;
  status: string;
  isPaid: boolean;
  violationType?: string;
  payableOnline?: boolean;
}

interface QueryHistory {
  id: number;
  civilId: string;
  enquiryType: string;
  status: string;
  createdAt: Date;
}

// ===== HEADER =====
const SharedHeader = ({ transparent = false, isMobile, headerScrolled }: { transparent?: boolean; isMobile: boolean; headerScrolled: boolean }) => {
  const { t, lang, isRTL } = useLanguage();

  return (
    <header
      className="sticky top-0 z-50 transition-all duration-500"
      style={{
        backgroundColor: transparent && !headerScrolled ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.98)",
        borderBottom: "2px solid #8B0000",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        boxShadow: headerScrolled ? "0 4px 20px rgba(139,0,0,0.12)" : "0 2px 8px rgba(0,0,0,0.04)",
      }}
    >
      {/* Top bar */}
      <div
        className="hidden md:flex items-center justify-between px-8 py-2 text-xs"
        style={{ backgroundColor: "#8B0000", color: "#ffffff" }}
      >
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> 901</span>
          <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> info@moi.gov.kw</span>
        </div>
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-1 hover:opacity-80 font-bold"><User className="w-3 h-3" /> تسجيل الدخول</button>
          <button className="flex items-center gap-1 hover:opacity-80"><Globe className="w-3 h-3" /> English</button>
        </div>
      </div>

      {/* Main header */}
      <div
        className="px-5 md:px-8 flex items-center justify-between"
        style={{ paddingTop: isMobile ? "12px" : "14px", paddingBottom: isMobile ? "12px" : "14px" }}
      >
        <div className="flex items-center gap-3">
          {/* MOI Kuwait Logo */}
          <svg width="56" height="56" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="48" fill="none" stroke="#8B0000" strokeWidth="3"/>
            <path d="M50 10 L75 25 L75 55 Q75 78 50 90 Q25 78 25 55 L25 25 Z" fill="#8B0000"/>
            <polygon points="50,22 53,31 63,31 55,37 58,46 50,40 42,46 45,37 37,31 47,31" fill="#FFD700"/>
            <text x="50" y="72" textAnchor="middle" fill="white" fontSize="8" fontFamily="Arial" fontWeight="bold">MOI</text>
            <text x="50" y="82" textAnchor="middle" fill="#FFD700" fontSize="5" fontFamily="Arial">KUWAIT</text>
          </svg>
          <div>
            <div className="text-lg font-black" style={{ color: "#8B0000" }}>
              {lang === "ar" ? "وزارة الداخلية" : "Ministry of Interior"}
            </div>
            <div className="text-xs text-gray-500">
              {lang === "ar" ? "دولة الكويت" : "State of Kuwait"}
            </div>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-6 text-sm font-semibold">
          <button className="flex items-center gap-1 hover:text-red-700 transition-colors" style={{ color: "#8B0000" }}>
            <HomeIcon className="w-4 h-4" /> {lang === "ar" ? "الرئيسية" : "Home"}
          </button>
          <button className="flex items-center gap-1 text-gray-600 hover:text-red-700 transition-colors">{lang === "ar" ? "الخدمات" : "Services"}</button>
          <button className="flex items-center gap-1 text-gray-600 hover:text-red-700 transition-colors">{lang === "ar" ? "عن الوزارة" : "About"}</button>
          <button className="flex items-center gap-1 text-gray-600 hover:text-red-700 transition-colors">{lang === "ar" ? "تواصل معنا" : "Contact"}</button>
        </nav>

        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1 rounded-full border px-3 py-2 text-xs font-bold transition-all hover:opacity-80" style={{ borderColor: "#8B0000", color: "#8B0000" }}>
            <Globe className="w-3.5 h-3.5" />
            <span>{isRTL ? "EN" : "عربي"}</span>
          </button>
        </div>
      </div>
    </header>
  );
};

// ===== FINE CARD =====
const FineCard = ({ fine, idx, isMobile = false }: { fine: FineResult; idx: number; isMobile?: boolean }) => {
  const { selectedFines, setSelectedFines, isRTL, lang, t } = useFineCardContext();
  const isSelected = selectedFines.has(idx);
  const amt = parseFloat((fine.amount || "0").replace(/[^0-9.]/g, ""));

  const toggleSelect = () => {
    const next = new Set(selectedFines);
    if (isSelected) next.delete(idx); else next.add(idx);
    setSelectedFines(next);
  };

  const isPaid = fine.isPaid || fine.status === "paid";
  const statusConfig = isPaid
    ? { label: lang === "ar" ? "مدفوع" : "Paid", bg: "#eef1f1", color: "#5b5f62" }
    : { label: lang === "ar" ? "قابل للدفع" : "Payable", bg: "#fff0f0", color: "#8B0000" };

  const iconSize = isMobile ? 16 : 18;

  return (
    <div
      className="rounded-2xl p-4 transition-all hover:shadow-md"
      style={{
        backgroundColor: isSelected ? "#fef2f2" : "#ffffff",
        border: `1.5px solid ${isSelected ? "#8B0000" : "#e5e7eb"}`,
        boxShadow: isSelected ? "0 4px 16px rgba(139,0,0,0.12)" : "0 1px 4px rgba(0,0,0,0.04)",
      }}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          type="button"
          onClick={toggleSelect}
          className="flex items-center justify-center flex-shrink-0 mt-1"
          style={{
            width: isMobile ? "24px" : "26px",
            height: isMobile ? "24px" : "26px",
            borderRadius: "6px",
            border: `1.8px solid ${isSelected ? "#8B0000" : "#cfd3d8"}`,
            backgroundColor: isSelected ? "#fef2f2" : "#ffffff",
          }}
        >
          {isSelected && (
            <svg width="12" height="10" viewBox="0 0 14 10" fill="none">
              <path d="M1 5L4.5 8.5L13 1" stroke="#8B0000" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </button>

        {/* Content */}
        <div className="flex-1" dir={isRTL ? "rtl" : "ltr"}>
          {/* Top row: ticket number + amount */}
          <div className="flex items-start justify-between mb-2">
            <div>
              <div className="text-xs text-gray-500 mb-0.5">{lang === "ar" ? "رقم المخالفة" : "Ticket No."}</div>
              <div className="text-sm font-bold" dir="ltr">{fine.ticketNo || "—"}</div>
            </div>
            <div className="text-left">
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold" style={{ color: isPaid ? "#5b5f62" : "#8B0000" }}>
                  {isPaid ? (fine.amount || "0") : amt > 0 ? `${amt.toFixed(0)} KWD` : (fine.amount || "0")}
                </span>
              </div>
              <div
                className="text-[10px] px-2 py-0.5 rounded-full font-semibold inline-block mt-1"
                style={{ backgroundColor: statusConfig.bg, color: statusConfig.color }}
              >
                {statusConfig.label}
              </div>
            </div>
          </div>

          {/* Description */}
          {fine.description && (
            <div className="flex items-start gap-2 mt-2 p-2 rounded-lg" style={{ backgroundColor: "#f8f9fa" }}>
              <FileText size={iconSize} className="flex-shrink-0 mt-0.5" style={{ color: "#6b7280" }} />
              <span className="text-xs text-gray-600 leading-5">{fine.description}</span>
            </div>
          )}

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-2 mt-3">
            <div className="flex items-center gap-1.5">
              <Calendar size={iconSize} className="flex-shrink-0" style={{ color: "#6b7280" }} />
              <div>
                <div className="text-[10px] text-gray-400">{lang === "ar" ? "التاريخ" : "Date"}</div>
                <div className="text-xs font-semibold text-gray-700" dir="ltr">{fine.dateTime || "—"}</div>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin size={iconSize} className="flex-shrink-0" style={{ color: "#6b7280" }} />
              <div>
                <div className="text-[10px] text-gray-400">{lang === "ar" ? "الموقع" : "Location"}</div>
                <div className="text-xs font-semibold text-gray-700">{fine.location || "—"}</div>
              </div>
            </div>
            {fine.source && (
              <div className="flex items-center gap-1.5">
                <Building size={iconSize} className="flex-shrink-0" style={{ color: "#6b7280" }} />
                <div>
                  <div className="text-[10px] text-gray-400">{lang === "ar" ? "المصدر" : "Source"}</div>
                  <div className="text-xs font-semibold text-gray-700">{fine.source}</div>
                </div>
              </div>
            )}
            {fine.violationType && (
              <div className="flex items-center gap-1.5">
                <Shield size={iconSize} className="flex-shrink-0" style={{ color: "#6b7280" }} />
                <div>
                  <div className="text-[10px] text-gray-400">{lang === "ar" ? "النوع" : "Type"}</div>
                  <div className="text-xs font-semibold text-gray-700">{fine.violationType}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Context for FineCard
let fineCardContext: any = {};
function useFineCardContext() {
  return fineCardContext;
}

export default function Home() {
  const [view, setView] = useState<ViewMode>("form");
  const [searchTab, setSearchTab] = useState<"individuals" | "companies">("individuals");
  const [civilId, setCivilId] = useState("");
  const [enquiryType, setEnquiryType] = useState<"1" | "2">("1");
  const [result, setResult] = useState<QueryResult | null>(null);
  const [location, navigate] = useLocation();
  const [showHistory, setShowHistory] = useState(false);
  const [selectedFines, setSelectedFines] = useState<Set<number>>(new Set());
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const isMobile = window.innerWidth < 768;
  const [headerScrolled, setHeaderScrolled] = useState(false);

  const { t, lang, isRTL } = useLanguage();
  const isArabicRoute = location === "/ar" || location.startsWith("/ar?");

  useEffect(() => {
    const handleScroll = () => setHeaderScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const { data: history } = trpc.fines.getHistory.useQuery(undefined, { retry: false });

  const queryMutation = trpc.fines.query.useMutation({
    onSuccess: (data) => {
      setResult(data as QueryResult);
      setView("results");
      setSelectedFines(new Set());
      setFilterStatus("all");
    },
    onError: (err) => {
      toast.error((lang === "ar" ? "فشل الاستعلام: " : "Query failed: ") + err.message);
    },
  });

  const normalizeDigits = (value: string) => value
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)))
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)));

  const handleQuery = () => {
    const normalizedCivilId = normalizeDigits(civilId).trim();
    if (!normalizedCivilId) {
      toast.error(lang === "ar" ? "يرجى إدخال الرقم المدني" : "Please enter Civil ID");
      return;
    }
    if (normalizedCivilId.length < 12) {
      toast.error(lang === "ar" ? "الرقم المدني يجب أن يكون 12 رقم" : "Civil ID must be 12 digits");
      return;
    }

    queryMutation.mutate({
      civilId: normalizedCivilId,
      enquiryType,
      lang,
    });
  };

  const resetForm = () => {
    setCivilId("");
    setResult(null);
    setView("form");
    setSelectedFines(new Set());
  };

  const allFines = result?.fines || [];

  const filteredFines = allFines.filter((fine) => {
    if (filterStatus === "all") return true;
    if (filterStatus === "payable") return !fine.isPaid;
    if (filterStatus === "notpayable") return fine.isPaid;
    if (filterStatus === "paid") return fine.isPaid;
    return true;
  });

  const selectedTotal = Array.from(selectedFines).reduce((sum, idx) => {
    const fine = filteredFines[idx];
    if (!fine) return sum;
    const amt = parseFloat((fine.amount || "0").replace(/[^0-9.]/g, ""));
    return sum + (isNaN(amt) ? 0 : amt);
  }, 0);

  const buildPaymentPayload = () => {
    const selectedFinesData = Array.from(selectedFines)
      .map(idx => filteredFines[idx])
      .filter(Boolean);
    const total = selectedTotal.toFixed(0);
    const sessionId = result?.sessionId || null;

    return {
      selectedFines: selectedFinesData,
      fineAmount: total,
      totalAmount: total,
      civilId: normalizeDigits(civilId).trim(),
      enquiryType,
      queryId: result?.queryId,
      sessionId,
    };
  };

  const goToPaymentPage = () => {
    const paymentPayload = buildPaymentPayload();

    try {
      sessionStorage.setItem("paymentData", JSON.stringify(paymentPayload));
      if (paymentPayload.sessionId) {
        sessionStorage.setItem("paymentSessionId", paymentPayload.sessionId);
      } else {
        sessionStorage.removeItem("paymentSessionId");
      }
    } catch (error) {
      console.error("Failed to cache payment payload before navigation", error);
    }

    const params = new URLSearchParams();
    if (paymentPayload.sessionId) params.set("sessionId", paymentPayload.sessionId);
    if (paymentPayload.totalAmount) params.set("total", paymentPayload.totalAmount);

    const queryString = params.toString();
    const paymentBasePath = isArabicRoute ? "/ar/payment" : "/payment";
    navigate(queryString ? `${paymentBasePath}?${queryString}` : paymentBasePath);
  };

  // Set fine card context
  fineCardContext = { selectedFines, setSelectedFines, isRTL, lang, t };

  // Filter tabs
  const filterTabs = [
    {
      key: "all" as FilterStatus,
      label: lang === "ar" ? "الكل" : "All",
      count: allFines.length,
      icon: <FileText size={14} />,
    },
    {
      key: "payable" as FilterStatus,
      label: lang === "ar" ? "قابل للدفع" : "Payable",
      count: allFines.filter(f => !f.isPaid).length,
      icon: <CreditCard size={14} />,
    },
    {
      key: "notpayable" as FilterStatus,
      label: lang === "ar" ? "مدفوعة" : "Paid",
      count: allFines.filter(f => f.isPaid).length,
      icon: <CheckCircle2 size={14} />,
    },
  ];

  // ===== RESULTS VIEW =====
  if (view === "results" && result) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: "#f5f5f5", fontFamily: "'Cairo', 'Segoe UI', Tahoma, Arial, sans-serif" }} dir="rtl">
        <SharedHeader transparent={false} isMobile={isMobile} headerScrolled={headerScrolled} />

        {/* Breadcrumb */}
        <div className="hidden md:flex items-center gap-2 px-8 py-2 text-sm border-b" style={{ backgroundColor: "#ffffff", borderColor: "#e5e7eb" }}>
          <button className="text-gray-500 hover:text-red-700 flex items-center gap-1">
            <HomeIcon className="w-3.5 h-3.5" /> {lang === "ar" ? "الرئيسية" : "Home"}
          </button>
          <ChevronLeft className="w-3.5 h-3.5 text-gray-400" />
          <span className="font-semibold" style={{ color: "#8B0000" }}>{lang === "ar" ? "الاستعلام عن المخالفات" : "Violation Inquiry"}</span>
        </div>

        {/* Results content */}
        <div className="px-4 md:px-8 py-6 max-w-6xl mx-auto">
          {/* Header with back button and info */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-black" style={{ color: "#111827" }}>
                {lang === "ar" ? "نتائج المخالفات" : "Violations Results"}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {lang === "ar" ? "الرقم المدني:" : "Civil ID:"}{" "}
                <span className="font-bold" style={{ color: "#8B0000" }} dir="ltr">{civilId}</span>
              </p>
            </div>
            <button
              onClick={() => { setView("form"); setResult(null); setSelectedFines(new Set()); }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
              style={{ backgroundColor: "#fef2f2", color: "#8B0000", border: "1px solid #fecaca" }}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{lang === "ar" ? "استعلام جديد" : "New Inquiry"}</span>
            </button>
          </div>

          {/* Error */}
          {!result.success && (
            <div className="flex items-center gap-3 p-4 rounded-xl mb-4" style={{ backgroundColor: "#fff3f3", border: "1px solid #fecaca" }}>
              <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700">{result.errorMessage || (lang === "ar" ? "لم يتم العثور على مخالفات" : "No violations found")}</p>
            </div>
          )}

          {/* No fines */}
          {result.success && filteredFines.length === 0 && (
            <div className="flex flex-col items-center gap-3 py-20 bg-white rounded-2xl">
              <CheckCircle2 className="w-20 h-20" style={{ color: "#16a34a" }} />
              <p className="text-xl font-black text-gray-700">{lang === "ar" ? "لا توجد مخالفات مرورية مسجلة" : "No traffic violations recorded"}</p>
              <p className="text-sm text-gray-400">{lang === "ar" ? "لم يتم العثور على أي مخالفات مرورية مرتبطة بهذا الرقم المدني" : "No traffic violations were found associated with this Civil ID"}</p>
            </div>
          )}

          {/* Filter tabs */}
          {allFines.length > 0 && (
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              {filterTabs.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilterStatus(f.key)}
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all"
                  style={{
                    backgroundColor: filterStatus === f.key ? "#8B0000" : "#ffffff",
                    color: filterStatus === f.key ? "#ffffff" : "#374151",
                    border: filterStatus === f.key ? "none" : "1.5px solid #e5e7eb",
                  }}
                >
                  <span>{f.icon}</span>
                  {f.label}
                  <span
                    className="text-xs px-1.5 py-0.5 rounded-full font-bold"
                    style={{ backgroundColor: filterStatus === f.key ? "rgba(255,255,255,0.25)" : "#f0f4f2", color: filterStatus === f.key ? "#fff" : "#374151" }}
                  >
                    {f.count}
                  </span>
                </button>
              ))}

              <button
                className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mr-auto"
                style={{ backgroundColor: "#ffffff", border: "1.5px solid #e5e7eb", color: "#374151" }}
                onClick={() => {
                  if (filteredFines.length === 0) return;
                  if (selectedFines.size === filteredFines.length) setSelectedFines(new Set());
                  else setSelectedFines(new Set(filteredFines.map((_, i) => i)));
                }}
              >
                {selectedFines.size === filteredFines.length ? (lang === "ar" ? "إلغاء التحديد" : "Deselect All") : (lang === "ar" ? "تحديد الكل" : "Select All")}
              </button>
            </div>
          )}

          {/* Fines list */}
          {filteredFines.length > 0 && (
            <div className="space-y-3">
              {filteredFines.map((fine, idx) => (
                <FineCard key={idx} fine={fine} idx={idx} isMobile={isMobile} />
              ))}
            </div>
          )}

          {/* Bottom summary bar */}
          {allFines.length > 0 && (
            <div className="mt-6 rounded-2xl overflow-hidden bg-white" style={{ border: "1px solid #e8e8e8", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
              <div className="flex items-center px-6 py-4" dir={isRTL ? "rtl" : "ltr"}>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black text-gray-900">{selectedFines.size > 0 ? selectedFines.size : allFines.length}</span>
                  <span className="text-sm text-gray-500">{lang === "ar" ? "مخالفة" : "Violation(s)"}</span>
                </div>
                <div className="w-px bg-gray-200 mx-6" style={{ height: "24px" }} />
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black text-gray-900">
                    {selectedTotal > 0 ? selectedTotal.toFixed(0) : "0"}
                  </span>
                  <span className="text-sm text-gray-500">KWD</span>
                </div>
                <div className="flex-1" />
                <div className="flex items-center gap-3">
                  <button
                    disabled={selectedFines.size === 0}
                    className="px-8 py-2.5 rounded-full text-sm font-bold transition-all"
                    style={{
                      backgroundColor: selectedFines.size > 0 ? "#8B0000" : "#d1d5db",
                      color: selectedFines.size > 0 ? "#ffffff" : "#9ca3af",
                    }}
                    onClick={goToPaymentPage}
                  >
                    {lang === "ar" ? "دفع المحدد" : "Pay Selected"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ===== FORM VIEW =====
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f5f5f5", fontFamily: "'Cairo', 'Segoe UI', Tahoma, Arial, sans-serif" }} dir="rtl">
      <SharedHeader transparent={true} isMobile={isMobile} headerScrolled={headerScrolled} />

      {/* Hero banner */}
      <div
        className="relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #8B0000 0%, #a52a2a 50%, #cc3333 100%)",
          minHeight: isMobile ? "200px" : "280px",
        }}
      >
        {/* Decorative pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="kuwait-pattern" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                <circle cx="30" cy="30" r="20" fill="none" stroke="white" strokeWidth="1"/>
                <polygon points="30,10 35,25 50,25 38,35 42,50 30,42 18,50 22,35 10,25 25,25" fill="none" stroke="white" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#kuwait-pattern)"/>
          </svg>
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 py-10 text-center">
          <svg width="72" height="72" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="mb-4">
            <circle cx="50" cy="50" r="48" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2"/>
            <path d="M50 10 L75 25 L75 55 Q75 78 50 90 Q25 78 25 55 L25 25 Z" fill="rgba(255,255,255,0.15)"/>
            <polygon points="50,22 53,31 63,31 55,37 58,46 50,40 42,46 45,37 37,31 47,31" fill="rgba(255,255,255,0.4)"/>
          </svg>
          <h1 className="text-2xl md:text-3xl font-black text-white mb-2">
            {lang === "ar" ? "الاستعلام عن المخالفات المرورية" : "Traffic Violations Inquiry"}
          </h1>
          <p className="text-sm md:text-base text-white/80 max-w-md">
            {lang === "ar" ? "أدخل الرقم المدني للاستعلام عن المخالفات المرورية ودفع الغرامات إلكترونياً" : "Enter your Civil ID to inquire about traffic violations and pay fines online"}
          </p>
        </div>
      </div>

      {/* Form card */}
      <div className="px-4 py-6 max-w-lg mx-auto" style={{ marginTop: isMobile ? "-40px" : "-60px" }}>
        <div className="rounded-2xl p-6 bg-white" style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }}>
          {/* Tabs */}
          <div className="flex items-center gap-2 mb-6">
            <button
              onClick={() => { setSearchTab("individuals"); setEnquiryType("1"); }}
              className="flex-1 py-3 rounded-xl text-sm font-bold transition-all"
              style={{
                backgroundColor: searchTab === "individuals" ? "#8B0000" : "#f3f4f6",
                color: searchTab === "individuals" ? "#ffffff" : "#374151",
              }}
            >
              {lang === "ar" ? "أفراد" : "Individuals"}
            </button>
            <button
              onClick={() => { setSearchTab("companies"); setEnquiryType("2"); }}
              className="flex-1 py-3 rounded-xl text-sm font-bold transition-all"
              style={{
                backgroundColor: searchTab === "companies" ? "#8B0000" : "#f3f4f6",
                color: searchTab === "companies" ? "#ffffff" : "#374151",
              }}
            >
              {lang === "ar" ? "شركات" : "Companies"}
            </button>
          </div>

          {/* Civil ID Input */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 block">
                {lang === "ar" ? "الرقم المدني" : "Civil ID"}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={civilId}
                  onChange={(e) => setCivilId(e.target.value)}
                  placeholder={lang === "ar" ? "أدخل الرقم المدني (12 رقم)" : "Enter Civil ID (12 digits)"}
                  maxLength={12}
                  dir="ltr"
                  className="w-full px-4 py-3.5 rounded-xl text-base font-medium transition-all outline-none"
                  style={{
                    border: "1.5px solid #d1d5db",
                    backgroundColor: "#ffffff",
                    color: "#111827",
                  }}
                  onFocus={(e) => e.target.style.borderColor = "#8B0000"}
                  onBlur={(e) => e.target.style.borderColor = "#d1d5db"}
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <FileText className="w-5 h-5 text-gray-400" />
                </div>
              </div>
              <p className="text-xs text-gray-400">
                {lang === "ar" ? "أدخل الرقم المدني المكون من 12 رقم كما هو مدون في البطاقة المدنية" : "Enter the 12-digit Civil ID as written on your Civil ID card"}
              </p>
            </div>

            {/* Info note */}
            <div className="flex items-start gap-2 p-3 rounded-lg" style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca" }}>
              <Info className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-700 leading-5">
                {lang === "ar" ? "ملاحظة: يمكنك الاستعلام عن مخالفاتك المرورية عبر إدخال الرقم المدني. الخدمة متاحة للأفراد والشركات." : "Note: You can inquire about your traffic violations by entering your Civil ID. The service is available for individuals and companies."}
              </p>
            </div>

            {/* Buttons */}
            <div className="space-y-3 mt-6">
              <button
                onClick={handleQuery}
                disabled={queryMutation.isPending}
                className="w-full py-3.5 rounded-xl text-base font-bold text-white transition-all"
                style={{
                  backgroundColor: queryMutation.isPending ? "#ccc" : "#8B0000",
                  boxShadow: queryMutation.isPending ? "none" : "0 4px 16px rgba(139,0,0,0.3)",
                }}
              >
                {queryMutation.isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>{lang === "ar" ? "جاري الاستعلام..." : "Inquiring..."}</span>
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Search className="w-5 h-5" />
                    <span>{lang === "ar" ? "استعلام" : "Inquire"}</span>
                  </span>
                )}
              </button>

              <button
                onClick={resetForm}
                className="w-full py-3 rounded-xl text-sm font-bold transition-all"
                style={{
                  backgroundColor: "#ffffff",
                  color: "#374151",
                  border: "1.5px solid #d1d5db",
                }}
              >
                {lang === "ar" ? "إعادة تعيين" : "Reset"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Service info */}
      <div className="px-4 py-4 max-w-lg mx-auto mb-8">
        <div className="rounded-xl p-5 bg-white" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
          <div className="flex items-center gap-2 mb-3" style={{ color: "#8B0000" }}>
            <Info className="w-4 h-4" />
            <span className="text-sm font-bold">{lang === "ar" ? "عن الخدمة" : "About This Service"}</span>
          </div>
          <p className="text-sm text-gray-600 leading-6 mb-3">
            {lang === "ar" ? "خدمة للاستعلام عن المخالفات المرورية المرتبطة بالرقم المدني، مع إمكانية دفع الغرامات إلكترونياً." : "A service to inquire about traffic violations linked to your Civil ID, with the ability to pay fines electronically."}
          </p>
          <div className="space-y-2">
            {[
              lang === "ar" ? "الاستعلام عن جميع المخالفات المرورية المسجلة على الرقم المدني" : "Inquire about all traffic violations registered on the Civil ID",
              lang === "ar" ? "الاطلاع على تفاصيل المخالفة بما في ذلك الموقع والتاريخ والمبلغ" : "Review violation details including location, date, and amount",
              lang === "ar" ? "إمكانية دفع المخالفات إلكترونياً عبر بوابة الدفع الآمنة" : "Pay violations electronically through the secure payment gateway",
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: "#8B0000" }} />
                <p className="text-sm text-gray-600">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
