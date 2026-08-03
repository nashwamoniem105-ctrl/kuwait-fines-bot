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

// ===== HEADER =====
const SharedHeader = ({ isMobile }: { isMobile: boolean }) => {
  const { t, lang, isRTL } = useLanguage();

  return (
    <header className="w-full bg-white shadow-sm">
      {/* Top logos section */}
      <div className="container py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img src="/logo-moi.svg" alt="MOI Logo" className="h-16 md:h-20" />
          <div className="hidden md:flex flex-col items-start">
            <img src="/state-of-kuwait.svg" alt="State of Kuwait" className="h-6" />
            <img src="/ministry-of-interior.svg" alt="Ministry of Interior" className="h-8 mt-1" />
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
           <div className="flex items-center gap-4 text-xs font-semibold text-gray-600">
             <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> 901</span>
             <button className="hover:text-primary transition-colors">{isRTL ? "English" : "عربي"}</button>
           </div>
           <div className="flex items-center gap-2 mt-2">
             <img src="/logo-general-traffic.svg" alt="Traffic Logo" className="h-12" />
             <div className="text-right hidden sm:block">
               <div className="text-sm font-bold text-primary">الإدارة العامة للمرور</div>
               <div className="text-[10px] text-gray-500">General Department of Traffic</div>
             </div>
           </div>
        </div>
      </div>

      {/* Blue Navigation Bar */}
      <nav className="w-full bg-primary text-white overflow-x-auto">
        <div className="container flex items-center h-12 gap-6 text-sm font-bold whitespace-nowrap">
          <button className="flex items-center gap-2 px-4 h-full bg-white/10 hover:bg-white/20 transition-colors">
            <HomeIcon className="w-4 h-4" />
            <span>الرئيسية</span>
          </button>
          <button className="hover:text-white/80 transition-colors">الخدمات الإلكترونية</button>
          <button className="hover:text-white/80 transition-colors">إدارات توعوية</button>
          <button className="hover:text-white/80 transition-colors">الإصدارات الإلكترونية</button>
          <button className="hover:text-white/80 transition-colors">التحقق من الوثائق</button>
          <button className="hover:text-white/80 transition-colors">منصة المواعيد</button>
        </div>
      </nav>
    </header>
  );
};

// ===== FINE CARD =====
const FineCard = ({ fine, idx, isMobile, isSelected, onToggle, lang }: any) => {
  const isPaid = fine.isPaid || fine.status === "paid";
  const statusConfig = isPaid
    ? { label: lang === "ar" ? "مدفوع" : "Paid", bg: "#eef1f1", color: "#5b5f62" }
    : { label: lang === "ar" ? "قابل للدفع" : "Payable", bg: "#fff0f0", color: "#cc0000" };

  return (
    <div
      className={`rounded-xl p-4 transition-all border-2 ${isSelected ? "border-primary bg-primary/5 shadow-md" : "border-gray-200 bg-white"}`}
      onClick={onToggle}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-6 h-6 rounded border-2 flex items-center justify-center ${isSelected ? "bg-primary border-primary" : "bg-white border-gray-300"}`}>
            {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
          </div>
          <div>
            <div className="text-[10px] text-gray-500 uppercase font-bold">{lang === "ar" ? "رقم المخالفة" : "Ticket No."}</div>
            <div className="text-sm font-black">{fine.ticketNo}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-black text-primary">{fine.amount} د.ك</div>
          <div className="text-[10px] px-2 py-0.5 rounded-full font-bold inline-block mt-1" style={{ backgroundColor: statusConfig.bg, color: statusConfig.color }}>
            {statusConfig.label}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <div>
            <div className="text-[9px] text-gray-400 font-bold">{lang === "ar" ? "التاريخ" : "Date"}</div>
            <div className="text-xs font-semibold">{fine.dateTime}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-gray-400" />
          <div>
            <div className="text-[9px] text-gray-400 font-bold">{lang === "ar" ? "الموقع" : "Location"}</div>
            <div className="text-xs font-semibold truncate max-w-[120px]">{fine.location}</div>
          </div>
        </div>
      </div>
      
      {fine.description && (
        <div className="mt-3 p-2 bg-gray-50 rounded text-xs text-gray-600 leading-relaxed">
          {fine.description}
        </div>
      )}
    </div>
  );
};

export default function Home() {
  const [view, setView] = useState<ViewMode>("form");
  const [searchTab, setSearchTab] = useState<"individuals" | "companies">("individuals");
  const [civilId, setCivilId] = useState("");
  const [enquiryType, setEnquiryType] = useState<"1" | "2">("1");
  const [result, setResult] = useState<QueryResult | null>(null);
  const [location, navigate] = useLocation();
  const [selectedFines, setSelectedFines] = useState<Set<number>>(new Set());
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const isMobile = typeof window !== 'undefined' ? window.innerWidth < 768 : false;

  const { t, lang, isRTL } = useLanguage();

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

  const handleQuery = () => {
    const normalizedCivilId = civilId.trim();
    if (!normalizedCivilId) {
      toast.error(lang === "ar" ? "يرجى إدخال الرقم المدني" : "Please enter Civil ID");
      return;
    }
    queryMutation.mutate({
      civilId: normalizedCivilId,
      enquiryType,
      lang,
    });
  };

  const toggleFine = (idx: number) => {
    const next = new Set(selectedFines);
    if (next.has(idx)) next.delete(idx); else next.add(idx);
    setSelectedFines(next);
  };

  const selectedTotal = Array.from(selectedFines).reduce((sum, idx) => {
    const fine = result?.fines[idx];
    if (!fine) return sum;
    const amt = parseFloat(fine.amount.replace(/[^0-9.]/g, ""));
    return sum + (isNaN(amt) ? 0 : amt);
  }, 0);

  return (
    <div className="min-h-screen bg-[#f1f0e8] flex flex-col font-sans" dir={isRTL ? "rtl" : "ltr"}>
      <SharedHeader isMobile={isMobile} />

      <main className="flex-1 container py-8 md:py-12">
        {view === "form" ? (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
              <div className="bg-primary p-6 text-white text-center">
                <h1 className="text-2xl font-black mb-2">الاستعلام عن المخالفات المرورية</h1>
                <p className="text-sm opacity-90">Traffic Violations Enquiry</p>
              </div>

              <div className="p-8">
                {/* Tabs */}
                <div className="flex bg-gray-100 p-1 rounded-xl mb-8">
                  <button
                    onClick={() => setSearchTab("individuals")}
                    className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${searchTab === "individuals" ? "bg-white text-primary shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                  >
                    الأفراد (Individuals)
                  </button>
                  <button
                    onClick={() => setSearchTab("companies")}
                    className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${searchTab === "companies" ? "bg-white text-primary shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                  >
                    الشركات (Companies)
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-black text-gray-700 mb-2">
                      {searchTab === "individuals" ? "الرقم المدني" : "رقم السجل التجاري"}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={civilId}
                        onChange={(e) => setCivilId(e.target.value)}
                        placeholder={searchTab === "individuals" ? "أدخل الرقم المدني المكون من 12 رقم" : "أدخل رقم السجل"}
                        className="w-full h-14 px-5 rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-0 text-lg font-bold transition-all"
                      />
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                        <User className="w-6 h-6" />
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleQuery}
                    disabled={queryMutation.isPending}
                    className="w-full h-14 bg-[#cc0000] hover:bg-[#b30000] text-white rounded-xl font-black text-lg shadow-lg shadow-red-900/20 transition-all flex items-center justify-center gap-3 disabled:opacity-70"
                  >
                    {queryMutation.isPending ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <>
                        <Search className="w-6 h-6" />
                        <span>إستعلم (Inquire)</span>
                      </>
                    )}
                  </button>

                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 flex gap-3">
                    <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-700 leading-relaxed">
                      بعد إجراء عملية الدفع.. يرجى عدم محاولة الدفع مرة أخرى حيث يجرى تحديث البيانات خلال 15 دقيقة.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <button
                  onClick={() => setView("form")}
                  className="flex items-center gap-2 text-primary font-bold hover:underline mb-2"
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>العودة للاستعلام</span>
                </button>
                <h2 className="text-3xl font-black text-gray-900">نتائج المخالفات</h2>
                <p className="text-gray-500">تم العثور على {result?.fines.length} مخالفة مسجلة</p>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-6">
                <div className="text-center px-4 border-l border-gray-100">
                  <div className="text-[10px] text-gray-400 font-bold uppercase">الإجمالي</div>
                  <div className="text-2xl font-black text-primary">{result?.totalAmount} د.ك</div>
                </div>
                <button
                  onClick={() => navigate("/payment")}
                  disabled={selectedFines.size === 0}
                  className="px-8 py-3 bg-[#cc0000] text-white rounded-xl font-black shadow-lg shadow-red-900/20 hover:bg-[#b30000] transition-all disabled:opacity-50 disabled:shadow-none"
                >
                  دفع المحدد ({selectedTotal} د.ك)
                </button>
              </div>
            </div>

            {result?.fines.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-gray-200">
                <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-black text-gray-900 mb-2">لا توجد مخالفات مرورية</h3>
                <p className="text-gray-500">لم يتم العثور على أي مخالفات مسجلة لهذا الرقم المدني.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {result?.fines.map((fine, idx) => (
                  <FineCard
                    key={idx}
                    fine={fine}
                    idx={idx}
                    isSelected={selectedFines.has(idx)}
                    onToggle={() => toggleFine(idx)}
                    lang={lang}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="bg-primary text-white py-12 mt-auto">
        <div className="container grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <img src="/logo-moi.svg" alt="MOI Logo" className="h-16 brightness-0 invert mb-6" />
            <p className="text-sm text-white/70 leading-relaxed max-w-md">
              البوابة الإلكترونية لوزارة الداخلية - دولة الكويت. جميع الحقوق محفوظة © 2026.
              الإدارة العامة للمرور تهدف إلى توفير أفضل الخدمات الإلكترونية للمواطنين والمقيمين.
            </p>
          </div>
          <div>
            <h4 className="font-black mb-6">روابط سريعة</h4>
            <ul className="space-y-3 text-sm text-white/70">
              <li><a href="#" className="hover:text-white">الرئيسية</a></li>
              <li><a href="#" className="hover:text-white">الخدمات الإلكترونية</a></li>
              <li><a href="#" className="hover:text-white">دفع المخالفات</a></li>
              <li><a href="#" className="hover:text-white">منصة المواعيد</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-black mb-6">تواصل معنا</h4>
            <ul className="space-y-3 text-sm text-white/70">
              <li className="flex items-center gap-2"><Phone className="w-4 h-4" /> 901</li>
              <li className="flex items-center gap-2"><Mail className="w-4 h-4" /> info@moi.gov.kw</li>
              <li className="flex items-center gap-2"><Globe className="w-4 h-4" /> www.moi.gov.kw</li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
