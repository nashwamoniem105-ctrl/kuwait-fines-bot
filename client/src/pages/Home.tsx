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
    <div className="moi-app-root" dir="rtl">
      {/* External CSS Injection - Using exact same versions as original */}
      <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" />
      <link rel="stylesheet" href="https://www.moi.gov.kw/main/css/site.css?v=go_4IccMhw1NChPOSH_W7AbpThLoN7-zMHFe4trNRE0" />
      
      <style>{`
        body { background-color: #eceae4 !important; font-family: "Droid Arabic Kufi Regular", "Skia Regular", Arial, Tahoma, sans-serif !important; }
        .moi-app-root { background-color: #eceae4; min-height: 100vh; }
        .container.bg-white { max-width: 1140px; margin-top: 0; margin-bottom: 0; }
        
        /* Navbar matching */
        .navbar { background-color: #000576 !important; height: 57px; padding: 0 !important; }
        .navbar-nav .nav-item .nav-link { color: rgba(255,255,255,.5) !important; padding: 16px 20px !important; font-size: 14px; }
        .navbar-nav .nav-item.active .nav-link { color: #fff !important; border-bottom: 3px solid #fff; background: transparent; }
        
        /* Sidebar matching */
        .side-menu-container { background-color: #000576; padding: 0; min-height: 500px; }
        .side-menu-container a { display: flex; align-items: center; padding: 12px 15px; border-bottom: 1px solid rgba(255,255,255,.1); text-decoration: none; color: #fff; transition: 0.3s; }
        .side-menu-container a:hover { background: rgba(255,255,255,0.05); }
        .side-menu-container .active-menu-item { background-color: #fff !important; color: #000576 !important; }
        .side-menu-container .active-menu-item a { color: #000576 !important; }
        .side-menu-icon { width: 45px; margin-left: 15px; }
        
        /* Content area */
        .content-main { background-color: #eceae4; padding: 30px 20px; }
        .moi-card { background: #fff; padding: 25px; border: 1px solid #ddd; border-radius: 0; box-shadow: none; }
        .moi-title { color: #000576; font-weight: bold; font-size: 1.2rem; margin-bottom: 5px; }
        
        /* Buttons and Inputs */
        .form-control { border-radius: 4px; border: 1px solid #ced4da; height: 38px; }
        .btn-moi-primary { background-color: #000576; color: #fff; border: 1px solid #000576; padding: 6px 12px; border-radius: 4px; width: 214px; height: 35px; font-size: 14px; cursor: pointer; }
        .btn-moi-primary:hover { background-color: #000350; }
        
        /* Footer matching */
        .footer { background-color: #000576 !important; color: #fff !important; padding: 15px 0; border-top: none !important; margin-top: 0 !important; }
        .social-media-icon { width: 24px; height: 24px; margin: 0 5px; filter: brightness(0) invert(1); }
        
        /* Responsive */
        @media (max-width: 768px) {
          .navbar { height: auto; }
          .navbar-nav .nav-item .nav-link { padding: 10px 15px !important; border-bottom: none !important; }
          .side-menu-container { min-height: auto; margin-top: 20px; }
          .moi-header-logo { height: 80px !important; }
          .main-header-title { height: 30px !important; }
        }
      `}</style>

      <div className="container bg-white p-0 shadow-sm">
        {/* Header - Identical to Original */}
        <header className="px-3 py-2">
          <div className="row align-items-center">
            <div className="col-4 col-md-2 text-center">
              <a href="/">
                <img src="https://www.moi.gov.kw/main/images/assets/common/logo-moi.svg" className="moi-header-logo" style={{ height: "120px" }} alt="MOI Logo" />
              </a>
            </div>
            <div className="col-8 col-md-10 d-flex flex-column align-items-end justify-content-center pr-md-5">
              <img src="https://www.moi.gov.kw/main/images/assets/common/ar/state-of-kuwait.svg" className="main-header-title mb-1" style={{ height: "40px" }} alt="State of Kuwait" />
              <img src="https://www.moi.gov.kw/main/images/assets/common/ar/ministry-of-interior.svg" className="main-header-title" style={{ height: "35px" }} alt="Ministry of Interior" />
            </div>
          </div>
        </header>

        {/* Navigation Bar - Identical to Original */}
        <nav className="navbar navbar-expand-lg navbar-dark">
          <div className="container px-0">
            <button className="navbar-toggler ml-3" type="button" data-toggle="collapse" data-target="#moiNav">
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="moiNav">
              <ul className="navbar-nav w-100 pr-0">
                <li className="nav-item"><a className="nav-link" href="#">الرئيسيــة</a></li>
                <li className="nav-item active"><a className="nav-link" href="#">الخدمات الإلكترونيـة</a></li>
                <li className="nav-item"><a className="nav-link" href="#">إدارات توعوية</a></li>
                <li className="nav-item"><a className="nav-link" href="#">الإصدارات الإلكترونية</a></li>
                <li className="nav-item"><a className="nav-link" href="#">أرقام الطوارئ</a></li>
                <li className="nav-item"><a className="nav-link" href="#">منصة المواعيد</a></li>
              </ul>
            </div>
          </div>
        </nav>

        {/* Main Content Layout */}
        <div className="row no-gutters">
          {/* Sidebar - Right side on desktop, Bottom on mobile */}
          <div className="col-12 col-md-4 order-md-2 side-menu-container">
            <div className="d-flex flex-column">
              <a href="#">
                <img src="https://www.moi.gov.kw/main/images/assets/general-traffic/ico-renew-license.svg" className="side-menu-icon" />
                <span>الخدمات الالكترونية لرخص السوق</span>
              </a>
              <div className="active-menu-item">
                <a href="#">
                  <img src="https://www.moi.gov.kw/main/images/assets/common/ico-payment.svg" className="side-menu-icon" />
                  <span className="font-weight-bold">دفع المخالفات</span>
                </a>
              </div>
              <a href="#">
                <img src="https://www.moi.gov.kw/main/images/assets/general-traffic/ico-booking.svg" className="side-menu-icon" />
                <span>نظام مواعيد اختبار القيادة</span>
              </a>
              <a href="#">
                <img src="https://www.moi.gov.kw/main/images/assets/general-traffic/ico-procedures.svg" className="side-menu-icon" />
                <span>معاملات المرور</span>
              </a>
              <a href="#">
                <img src="https://www.moi.gov.kw/main/images/assets/general-traffic/ico-locations-sections.svg" className="side-menu-icon" />
                <span>مواقع الإدارة العامة للمرور</span>
              </a>
              <a href="#">
                <img src="https://www.moi.gov.kw/main/images/assets/common/ico-pdf-doc.svg" className="side-menu-icon" />
                <span>شروط منح رخص السوق لغير الكويتيين</span>
              </a>
            </div>
          </div>

          {/* Main Inquiry Area - Left side on desktop, Top on mobile */}
          <div className="col-12 col-md-8 order-md-1 content-main">
            <div className="text-center mb-4">
              <h4 className="moi-title">الإدارة العامة للمرور</h4>
              <img src="https://www.moi.gov.kw/main/images/assets/common/ico-horizontal-bar.svg" className="img-fluid" alt="divider" />
            </div>

            <div className="moi-card mx-auto" style={{ maxWidth: "750px" }}>
              <form onSubmit={handleInquire}>
                <div className="form-row">
                  <div className="col-12 col-md-6 mb-3">
                    <label className="font-weight-bold small">Enquiry Type</label>
                    <select className="form-control" value={enquiryType} onChange={(e) => setEnquiryType(e.target.value)}>
                      <option value="1">الأفراد</option>
                      <option value="2">الشركات</option>
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="col-12 col-md-6 mb-4">
                    <label className="font-weight-bold small">الرقم المدني أو الرقم الموحد</label>
                    <input type="text" className="form-control" value={civilId} onChange={(e) => setCivilId(e.target.value)} placeholder="أدخل الرقم المدني" />
                  </div>
                </div>
                <div className="text-center">
                  <button type="submit" className="btn btn-moi-primary" disabled={isSearching}>
                    {isSearching ? "جاري البحث..." : "إستعلم"}
                  </button>
                </div>
              </form>

              {/* Status Message - Matching Original Alert Style */}
              {results && results.success && results.fines.length === 0 && (
                <div className="alert alert-info mt-4 text-center font-weight-bold" style={{ backgroundColor: "#d1ecf1", color: "#0c5460", borderColor: "#bee5eb", borderRadius: "4px" }}>
                  Person does not have any Violations
                </div>
              )}

              {/* Results Table - Matching Original Table Style */}
              {results && results.success && results.fines.length > 0 && (
                <div className="mt-4">
                  <div className="d-flex justify-content-between border-bottom pb-2 mb-3" style={{ borderBottom: "2px solid #000576 !important" }}>
                    <span className="font-weight-bold">عدد المخالفات: {results.fines.length}</span>
                    <span className="font-weight-bold text-danger">الإجمالي: {results.totalAmount} د.ك</span>
                  </div>
                  <div className="table-responsive">
                    <table className="table table-bordered table-hover table-sm bg-white">
                      <thead className="thead-light">
                        <tr>
                          <th className="text-center">إختر</th>
                          <th>رقم المخالفة</th>
                          <th>التاريخ</th>
                          <th>القيمة</th>
                          <th>الحالة</th>
                        </tr>
                      </thead>
                      <tbody>
                        {results.fines.map((fine: any, idx: number) => (
                          <tr key={idx}>
                            <td className="text-center">
                              {fine.status === 'payable' && (
                                <input type="checkbox" checked={selectedFines.includes(fine.ticketNo)} onChange={() => toggleFine(fine.ticketNo)} />
                              )}
                            </td>
                            <td className="small">{fine.ticketNo}</td>
                            <td className="small">{fine.dateTime}</td>
                            <td className="font-weight-bold">{fine.amount}</td>
                            <td>
                              <span className={`badge badge-${fine.status === 'payable' ? 'success' : 'danger'}`} style={{ fontSize: "10px" }}>
                                {fine.status === 'payable' ? 'قابلة للدفع' : 'غير قابلة'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="d-flex justify-content-between align-items-center bg-light p-3 border mt-3">
                    <h5 className="m-0 font-weight-bold" style={{ color: "#000576", fontSize: "1rem" }}>إجمالي المختار: {totalPayableAmount} د.ك</h5>
                    <button onClick={handlePay} disabled={selectedFines.length === 0} className="btn btn-moi-primary" style={{ width: "120px" }}>دفع</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer - Identical to Original */}
        <footer className="footer text-center">
          <div className="container">
            <div className="row">
              <div className="col-12 mb-2">
                <img src="https://www.moi.gov.kw/main/images/assets/social-media/ico-youtube.svg" className="social-media-icon" alt="Youtube" />
                <img src="https://www.moi.gov.kw/main/images/assets/social-media/ico-instagram.svg" className="social-media-icon" alt="Instagram" />
                <img src="https://www.moi.gov.kw/main/images/assets/social-media/ico-twitter.svg" className="social-media-icon" alt="Twitter" />
                <img src="https://www.moi.gov.kw/main/images/assets/social-media/ico-facebook.svg" className="social-media-icon" alt="Facebook" />
                &nbsp;&nbsp;
                <img src="https://www.moi.gov.kw/main/images/assets/common/ico-android.svg" className="social-media-icon" alt="Android" />
                &nbsp;&nbsp;
                <img src="https://www.moi.gov.kw/main/images/assets/common/ico-apple.svg" className="social-media-icon" alt="Apple" />
              </div>
              <div className="col-12 small">© جميع الحقوق محفوظة لوزارة الداخلية-دولة الكويت - 2026</div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
