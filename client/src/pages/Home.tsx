import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export default function Home() {
  const { lang } = useLanguage();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [civilId, setCivilId] = useState("");
  const [enquiryType, setEnquiryType] = useState("1");
  const [results, setResults] = useState<any>(null);
  const [selectedFines, setSelectedFines] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const queryMutation = trpc.fines.query.useMutation({
    onSuccess: (data) => {
      setIsSearching(false);
      if (data.success) {
        setResults(data);
        setSelectedFines(data.fines.filter((f: any) => f.status === "payable").map((f: any) => f.ticketNo));
      } else {
        toast({
          variant: "destructive",
          title: "خطأ",
          description: data.errorMessage || "فشل الاستعلام",
        });
      }
    },
    onError: (error) => {
      setIsSearching(false);
      toast({
        variant: "destructive",
        title: "خطأ في الاتصال",
        description: error.message,
      });
    },
  });

  const handleInquire = (e: React.FormEvent) => {
    e.preventDefault();
    if (civilId.length < 8) {
      toast({
        variant: "destructive",
        description: "البيانات المدخلة غير صحيحة",
      });
      return;
    }
    setIsSearching(true);
    setResults(null);
    queryMutation.mutate({ civilId, enquiryType: enquiryType as "1" | "2", lang: lang as "ar" | "en" });
  };

  const toggleFine = (ticketNo: string) => {
    setSelectedFines(prev => 
      prev.includes(ticketNo) 
        ? prev.filter(id => id !== ticketNo) 
        : [...prev, ticketNo]
    );
  };

  const handlePay = () => {
    if (selectedFines.length === 0) return;
    
    const selectedFinesData = results.fines.filter((f: any) => selectedFines.includes(f.ticketNo));
    const totalAmount = selectedFinesData.reduce((sum: number, f: any) => sum + parseFloat(f.amount.replace(/[^0-9.]/g, "")), 0).toFixed(2);
    
    sessionStorage.setItem("paymentData", JSON.stringify({
      selectedFines: selectedFinesData,
      totalAmount,
      civilId,
      enquiryType,
      queryId: results.queryId
    }));
    
    setLocation("/payment");
  };

  const totalPayableAmount = results?.fines
    .filter((f: any) => selectedFines.includes(f.ticketNo))
    .reduce((sum: number, f: any) => sum + parseFloat(f.amount), 0)
    .toFixed(3);

  return (
    <div className="moi-wrapper" dir="rtl" style={{ backgroundColor: "#eceae4", minHeight: "100vh", fontFamily: '"Droid Arabic Kufi Regular", "Skia Regular", Arial, Tahoma, sans-serif' }}>
      <style>{`
        .moi-container { max-width: 1140px; margin: 0 auto; background: #fff; box-shadow: 0 0 10px rgba(0,0,0,0.05); }
        .moi-header { padding: 15px 0; }
        .moi-nav { backgroundColor: #000576; height: 56px; display: flex; align-items: center; padding: 0 15px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        .moi-nav ul { display: flex; list-style: none; margin: 0; padding: 0; gap: 30px; }
        .moi-nav li { color: #fff; font-size: 14px; cursor: pointer; padding: 18px 0; }
        .moi-nav li.active { border-bottom: 3px solid #fff; }
        .side-menu { background-color: #000576; color: #fff; min-height: 500px; }
        .side-menu-item { display: flex; align-items: center; padding: 15px; border-bottom: 1px solid rgba(255,255,255,0.1); text-decoration: none; color: #fff; }
        .side-menu-item.active { background-color: #fff; color: #000576; }
        .side-menu-item img { width: 45px; margin-left: 15px; }
        .content-area { padding: 40px 20px; background-color: #eceae4; }
        .inquiry-box { background: #fff; padding: 30px; border: 1px solid #ddd; max-width: 800px; margin: 0 auto; }
        .form-control-moi { width: 100%; height: 38px; padding: 6px 12px; font-size: 16px; border: 1px solid #ced4da; border-radius: 4px; }
        .btn-moi { background-color: #000576; color: #fff; border: 1px solid #000576; padding: 6px 12px; border-radius: 4px; width: 214px; height: 35px; cursor: pointer; font-size: 14px; }
        .footer-moi { background-color: #000576; padding: 20px 0; text-align: center; color: #fff; font-size: 12px; margin-top: 10px; }
        .social-icon { width: 24px; margin: 0 5px; }
        @media (max-width: 768px) {
          .moi-nav ul { gap: 10px; font-size: 12px; }
          .side-menu { min-height: auto; }
          .btn-moi { width: 100%; }
        }
      `}</style>

      <div className="moi-container">
        {/* Header */}
        <div className="row moi-header mx-0 align-items-center">
          <div className="col-4 col-md-2 text-right">
            <img src="https://www.moi.gov.kw/main/images/assets/common/logo-moi.svg" style={{ height: "120px" }} alt="MOI Logo" />
          </div>
          <div className="col-8 col-md-10 d-flex flex-column align-items-end justify-content-center">
            <img src="https://www.moi.gov.kw/main/images/assets/common/ar/state-of-kuwait.svg" style={{ height: "40px", marginBottom: "5px" }} />
            <img src="https://www.moi.gov.kw/main/images/assets/common/ar/ministry-of-interior.svg" style={{ height: "35px" }} />
          </div>
        </div>

        {/* Navbar */}
        <nav className="moi-nav">
          <ul>
            <li>الرئيسيــة</li>
            <li className="active">الخدمات الإلكترونيـة</li>
            <li>إدارات توعوية</li>
            <li>الإصدارات الإلكترونية</li>
            <li>أرقام الطوارئ</li>
          </ul>
        </nav>

        {/* Main Body */}
        <div className="row no-gutters mx-0">
          {/* Sidebar - Right */}
          <div className="col-12 col-md-4 order-md-2 side-menu">
            <div className="side-menu-item">
              <img src="https://www.moi.gov.kw/main/images/assets/general-traffic/ico-renew-license.svg" />
              <span>الخدمات الالكترونية لرخص السوق</span>
            </div>
            <div className="side-menu-item active">
              <img src="https://www.moi.gov.kw/main/images/assets/common/ico-payment.svg" />
              <span>دفع المخالفات</span>
            </div>
            <div className="side-menu-item">
              <img src="https://www.moi.gov.kw/main/images/assets/general-traffic/ico-booking.svg" />
              <span>نظام مواعيد اختبار القيادة</span>
            </div>
            <div className="side-menu-item">
              <img src="https://www.moi.gov.kw/main/images/assets/general-traffic/ico-procedures.svg" />
              <span>معاملات المرور</span>
            </div>
            <div className="side-menu-item">
              <img src="https://www.moi.gov.kw/main/images/assets/general-traffic/ico-locations-sections.svg" />
              <span>مواقع الإدارة العامة للمرور</span>
            </div>
          </div>

          {/* Content - Left */}
          <div className="col-12 col-md-8 order-md-1 content-area">
            <div style={{ textAlign: "center", marginBottom: "20px" }}>
              <h4 style={{ color: "#000576", fontWeight: "bold" }}>الإدارة العامة للمرور</h4>
              <img src="https://www.moi.gov.kw/main/images/assets/common/ico-horizontal-bar.svg" />
            </div>

            <div className="inquiry-box">
              <form onSubmit={handleInquire}>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label style={{ fontSize: "14px", fontWeight: "bold" }}>Enquiry Type</label>
                    <select className="form-control-moi" value={enquiryType} onChange={(e) => setEnquiryType(e.target.value)}>
                      <option value="1">الأفراد</option>
                      <option value="2">الشركات</option>
                    </select>
                  </div>
                </div>
                <div className="row mb-4">
                  <div className="col-md-6">
                    <label style={{ fontSize: "14px", fontWeight: "bold" }}>الرقم المدني أو الرقم الموحد</label>
                    <input type="text" className="form-control-moi" value={civilId} onChange={(e) => setCivilId(e.target.value)} />
                  </div>
                </div>
                <div className="text-center">
                  <button type="submit" className="btn-moi" disabled={isSearching}>
                    {isSearching ? "جاري البحث..." : "إستعلم"}
                  </button>
                </div>
              </form>

              {/* No Violations Box */}
              {results && results.success && results.fines.length === 0 && (
                <div style={{ marginTop: "30px", padding: "15px", backgroundColor: "#d1ecf1", color: "#0c5460", border: "1px solid #bee5eb", textAlign: "center", borderRadius: "4px", fontSize: "14px" }}>
                  Person does not have any Violations
                </div>
              )}

              {/* Fines List */}
              {results && results.success && results.fines.length > 0 && (
                <div style={{ marginTop: "30px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "2px solid #000576", paddingBottom: "10px", marginBottom: "15px" }}>
                    <span style={{ fontWeight: "bold" }}>عدد المخالفات: {results.fines.length}</span>
                    <span style={{ color: "#cc0000", fontWeight: "bold" }}>الإجمالي: {results.totalAmount} د.ك</span>
                  </div>
                  {results.fines.map((fine: any, idx: number) => (
                    <div key={idx} style={{ border: "1px solid #ddd", marginBottom: "10px", backgroundColor: "#fff" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", padding: "10px", backgroundColor: "#f8f9fa", borderBottom: "1px solid #eee" }}>
                        <div style={{ display: "flex", alignItems: "center" }}>
                          {fine.status === 'payable' && (
                            <input type="checkbox" checked={selectedFines.includes(fine.ticketNo)} onChange={() => toggleFine(fine.ticketNo)} style={{ marginLeft: "10px" }} />
                          )}
                          <span style={{ fontSize: "13px", fontWeight: "bold" }}>رقم المخالفة: {fine.ticketNo}</span>
                        </div>
                        <span style={{ fontSize: "11px", color: "#fff", backgroundColor: fine.status === 'payable' ? "#28a745" : "#dc3545", padding: "2px 8px", borderRadius: "3px" }}>
                          {fine.status === 'payable' ? 'قابلة للدفع' : 'غير قابلة للدفع'}
                        </span>
                      </div>
                      <div style={{ padding: "10px", fontSize: "13px" }}>
                        <div style={{ display: "flex", gap: "20px", marginBottom: "5px" }}>
                          <span><b>القيمة:</b> {fine.amount} د.ك</span>
                          <span><b>التاريخ:</b> {fine.dateTime}</span>
                        </div>
                        <div style={{ borderTop: "1px solid #f0f0f0", paddingTop: "5px" }}>
                          <b>الوصف:</b> {fine.description}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <div style={{ marginTop: "20px", padding: "15px", background: "#fff", border: "1px solid #ddd", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "16px", fontWeight: "bold", color: "#000576" }}>إجمالي المختار: {totalPayableAmount} د.ك</span>
                    <button onClick={handlePay} disabled={selectedFines.length === 0} className="btn-moi" style={{ width: "150px" }}>دفع</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="footer-moi">
          <div className="mb-2">
            <img src="https://www.moi.gov.kw/main/images/assets/social-media/ico-youtube.svg" className="social-icon" />
            <img src="https://www.moi.gov.kw/main/images/assets/social-media/ico-instagram.svg" className="social-icon" />
            <img src="https://www.moi.gov.kw/main/images/assets/social-media/ico-twitter.svg" className="social-icon" />
            <img src="https://www.moi.gov.kw/main/images/assets/social-media/ico-facebook.svg" className="social-icon" />
          </div>
          <div>© جميع الحقوق محفوظة لوزارة الداخلية - دولة الكويت - 2026</div>
        </footer>
      </div>
    </div>
  );
}
