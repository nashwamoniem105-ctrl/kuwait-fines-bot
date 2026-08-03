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
    <div className="moi-full-app" dir="rtl">
      {/* External Assets */}
      <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" />
      <link rel="stylesheet" href="https://www.moi.gov.kw/main/css/site.css?v=go_4IccMhw1NChPOSH_W7AbpThLoN7-zMHFe4trNRE0" />
      
      <style>{`
        body { background-color: #eceae4 !important; font-family: "Droid Arabic Kufi Regular", "Skia Regular", Arial, Tahoma, sans-serif !important; }
        .moi-full-app { background-color: #eceae4; min-height: 100vh; }
        .main-container { max-width: 1140px; margin: 0 auto; background: #fff; box-shadow: 0 0 15px rgba(0,0,0,0.1); }
        
        /* Header & Navbar */
        header { padding: 15px 0; border-bottom: 1px solid #eee; }
        .navbar { background-color: #000576 !important; min-height: 57px; border-bottom: none !important; }
        .navbar-nav .nav-link { color: rgba(255,255,255,.6) !important; font-size: 14px; padding: 18px 20px !important; }
        .navbar-nav .nav-item.active .nav-link { color: #fff !important; border-bottom: 3px solid #fff; background: transparent; }
        
        /* Sidebar */
        .side-menu-container { background-color: #000576; padding: 0; min-height: 600px; }
        .side-menu-item { display: flex; align-items: center; padding: 12px 15px; border-bottom: 1px solid rgba(255,255,255,.1); text-decoration: none !important; color: #fff !important; font-size: 14px; }
        .side-menu-item:hover { background: rgba(255,255,255,0.05); }
        .side-menu-item.active { background-color: #fff !important; color: #000576 !important; font-weight: bold; }
        .side-menu-icon { width: 45px; margin-left: 15px; }
        
        /* Main Content */
        .content-area { background-color: #eceae4; padding: 30px 20px; }
        .moi-card-custom { background: #fff; padding: 25px; border: 1px solid #ddd; margin-bottom: 20px; }
        .moi-title-main { color: #000576; font-weight: bold; font-size: 1.25rem; margin-bottom: 10px; }
        
        /* Buttons & Inputs */
        .btn-moi-submit { background-color: #000576; color: #fff; border: 1px solid #000576; border-radius: 4px; padding: 8px 30px; min-width: 200px; height: 38px; font-size: 14px; }
        .form-control { border-radius: 4px; border: 1px solid #ced4da; height: 38px; }
        
        /* Footer */
        .footer-moi { background-color: #000576 !important; color: #fff !important; padding: 20px 0; border-top: none !important; }
        .social-media-icon { width: 24px; height: 24px; margin: 0 8px; filter: brightness(0) invert(1); }
        
        /* ReadSpeaker */
        .rs-btn-container { text-align: left; padding: 10px 0; }
        .rs-btn { background: #f8f9fa; border: 1px solid #ddd; padding: 5px 15px; border-radius: 20px; font-size: 12px; color: #333; text-decoration: none !important; display: inline-flex; align-items: center; }
        .rs-btn:before { content: "▶"; margin-left: 5px; color: #000576; }

        /* Responsive Mobile */
        @media (max-width: 768px) {
          .main-container { width: 100%; box-shadow: none; }
          .side-menu-container { min-height: auto; margin-top: 20px; }
          .navbar-nav .nav-link { padding: 10px 15px !important; border-bottom: none !important; }
          .moi-header-logo { height: 80px !important; }
          .main-header-title { height: 30px !important; }
        }
      `}</style>

      <div className="main-container">
        {/* Top Header Section */}
        <header className="px-3 py-2">
          <div className="row align-items-center">
            <div className="col-4 col-md-2 text-center">
              <a href="/">
                <img src="https://www.moi.gov.kw/main/images/assets/common/logo-moi.svg" className="moi-header-logo" style={{ height: "120px" }} alt="Logo" />
              </a>
            </div>
            <div className="col-8 col-md-10 d-flex flex-column align-items-end justify-content-center pr-md-5">
              <img src="https://www.moi.gov.kw/main/images/assets/common/ar/state-of-kuwait.svg" className="main-header-title mb-1" style={{ height: "40px" }} alt="Kuwait" />
              <img src="https://www.moi.gov.kw/main/images/assets/common/ar/ministry-of-interior.svg" className="main-header-title" style={{ height: "35px" }} alt="MOI" />
            </div>
          </div>
        </header>

        {/* Navigation Bar */}
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

        {/* Layout Body */}
        <div className="row no-gutters">
          {/* Sidebar - Right */}
          <div className="col-12 col-md-4 order-md-2 side-menu-container">
            <div className="d-flex flex-column">
              <a href="#" className="side-menu-item">
                <img src="https://www.moi.gov.kw/main/images/assets/general-traffic/ico-renew-license.svg" className="side-menu-icon" />
                <span>الخدمات الالكترونية لرخص السوق</span>
              </a>
              <a href="#" className="side-menu-item active">
                <img src="https://www.moi.gov.kw/main/images/assets/common/ico-payment.svg" className="side-menu-icon" />
                <span>دفع المخالفات</span>
              </a>
              <a href="#" className="side-menu-item">
                <img src="https://www.moi.gov.kw/main/images/assets/general-traffic/ico-booking.svg" className="side-menu-icon" />
                <span>نظام مواعيد اختبار القيادة</span>
              </a>
              <a href="#" className="side-menu-item">
                <img src="https://www.moi.gov.kw/main/images/assets/general-traffic/ico-procedures.svg" className="side-menu-icon" />
                <span>معاملات المرور</span>
              </a>
              <a href="#" className="side-menu-item">
                <img src="https://www.moi.gov.kw/main/images/assets/general-traffic/ico-locations-sections.svg" className="side-menu-icon" />
                <span>مواقع الإدارة العامة للمرور</span>
              </a>
              <a href="#" className="side-menu-item">
                <img src="https://www.moi.gov.kw/main/images/assets/common/ico-pdf-doc.svg" className="side-menu-icon" />
                <span>شروط منح رخص السوق لغير الكويتيين</span>
              </a>
            </div>
          </div>

          {/* Main Content Area - Left */}
          <div className="col-12 col-md-8 order-md-1 content-area">
            {/* ReadSpeaker Section */}
            <div className="rs-btn-container">
              <a href="#" className="rs-btn">استمع</a>
            </div>

            <div className="text-center mb-4">
              <h4 className="moi-title-main">الإدارة العامة للمرور</h4>
              <img src="https://www.moi.gov.kw/main/images/assets/common/ico-horizontal-bar.svg" className="img-fluid" alt="divider" />
            </div>

            {/* Violation Inquiry Form */}
            <div className="moi-card-custom mx-auto" style={{ maxWidth: "750px" }}>
              <form onSubmit={handleInquire}>
                <div className="form-row">
                  <div className="col-12 col-md-6 mb-3">
                    <label className="font-weight-bold small">Enquiry Type</label>
                    <div className="d-flex mt-1">
                      <div className="custom-control custom-radio mr-4">
                        <input type="radio" id="typeInd" name="enqType" className="custom-control-input" checked={enquiryType === "1"} onChange={() => setEnquiryType("1")} />
                        <label className="custom-control-label" htmlFor="typeInd">الأفراد</label>
                      </div>
                      <div className="custom-control custom-radio">
                        <input type="radio" id="typeComp" name="enqType" className="custom-control-input" checked={enquiryType === "2"} onChange={() => setEnquiryType("2")} />
                        <label className="custom-control-label" htmlFor="typeComp">الشركات</label>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="form-row">
                  <div className="col-12 col-md-6 mb-4">
                    <label className="font-weight-bold small">الرقم المدني أو الرقم الموحد</label>
                    <input type="text" className="form-control" value={civilId} onChange={(e) => setCivilId(e.target.value)} />
                  </div>
                </div>
                <div className="text-center">
                  <button type="submit" className="btn btn-moi-submit" disabled={isSearching}>
                    {isSearching ? "جاري البحث..." : "إستعلم"}
                  </button>
                </div>
              </form>

              {/* Legend Section (Payable/Non-Payable) */}
              <div className="d-flex justify-content-end mt-4 mb-2 small">
                <div className="d-flex align-items-center mr-3">
                  <span className="badge badge-success mr-1" style={{ width: "12px", height: "12px", borderRadius: "2px" }}>&nbsp;</span>
                  <span>قابلة للدفع إلكترونياً</span>
                </div>
                <div className="d-flex align-items-center">
                  <span className="badge badge-danger mr-1" style={{ width: "12px", height: "12px", borderRadius: "2px" }}>&nbsp;</span>
                  <span>غير قابلة للدفع إلكترونياً</span>
                </div>
              </div>

              {/* Status/Results */}
              {results && results.success && results.fines.length === 0 && (
                <div className="alert alert-info mt-4 text-center font-weight-bold" style={{ backgroundColor: "#d1ecf1", color: "#0c5460", borderColor: "#bee5eb" }}>
                  Person does not have any Violations
                </div>
              )}

              {results && results.success && results.fines.length > 0 && (
                <div className="mt-4">
                  <div className="d-flex justify-content-between border-bottom pb-2 mb-3" style={{ borderBottom: "2px solid #000576 !important" }}>
                    <span className="font-weight-bold">عدد المخالفات: {results.fines.length}</span>
                    <span className="font-weight-bold text-danger">الإجمالي: {results.totalAmount} د.ك</span>
                  </div>
                  <div className="table-responsive">
                    <table className="table table-bordered table-sm bg-white">
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
                    <button onClick={handlePay} disabled={selectedFines.length === 0} className="btn btn-moi-submit" style={{ width: "120px" }}>دفع</button>
                  </div>
                </div>
              )}
            </div>

            {/* Additional Sections - Matching Original Layout */}
            <div className="row no-gutters">
              {/* Payment Section */}
              <div className="col-12 col-md-6 pr-md-2 mb-3">
                <div className="moi-card-custom text-center h-100">
                  <h5 className="moi-title-main" style={{ fontSize: "1rem" }}>دفع المخالفات والغرامات</h5>
                  <img src="https://www.moi.gov.kw/main/images/assets/common/ico-horizontal-bar.svg" className="mb-3" alt="bar" />
                  <div className="px-3">
                    <select className="form-control mb-2"><option>المرور</option><option>الإقامة</option></select>
                    <input type="text" className="form-control mb-2" placeholder="الرقم المدني" />
                    <button className="btn btn-block btn-secondary mt-3">دفع</button>
                  </div>
                </div>
              </div>

              {/* Reference Number Inquiry Section */}
              <div className="col-12 col-md-6 pl-md-2 mb-3">
                <div className="moi-card-custom text-center h-100">
                  <h5 className="moi-title-main" style={{ fontSize: "1rem" }}>الإستعلام عن رقم مرجع الداخلية</h5>
                  <img src="https://www.moi.gov.kw/main/images/assets/common/ico-horizontal-bar.svg" className="mb-3" alt="bar" />
                  <div className="px-3">
                    <input type="text" className="form-control mb-3" placeholder="الرقم المدني" />
                    <div className="row no-gutters">
                      <div className="col-6 pr-1"><button className="btn btn-block btn-outline-secondary small">للكويتيين</button></div>
                      <div className="col-6 pl-1"><button className="btn btn-block btn-outline-secondary small">للمقيمين</button></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Case Track Section */}
              <div className="col-12 col-md-6 pr-md-2 mb-3">
                <div className="moi-card-custom text-center h-100">
                  <h5 className="moi-title-main" style={{ fontSize: "1rem" }}>الاستعلام عن سير القضية</h5>
                  <img src="https://www.moi.gov.kw/main/images/assets/common/ico-horizontal-bar.svg" className="mb-3" alt="bar" />
                  <div className="px-3">
                    <input type="text" className="form-control mb-2" placeholder="رقم المرجع" />
                    <button className="btn btn-block btn-secondary mt-3">إستعلم</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Section */}
        <footer className="footer-moi text-center">
          <div className="container">
            <div className="mb-2">
              <img src="https://www.moi.gov.kw/main/images/assets/social-media/ico-youtube.svg" className="social-media-icon" alt="YT" />
              <img src="https://www.moi.gov.kw/main/images/assets/social-media/ico-instagram.svg" className="social-media-icon" alt="IG" />
              <img src="https://www.moi.gov.kw/main/images/assets/social-media/ico-twitter.svg" className="social-media-icon" alt="TW" />
              <img src="https://www.moi.gov.kw/main/images/assets/social-media/ico-facebook.svg" className="social-media-icon" alt="FB" />
              &nbsp;&nbsp;
              <img src="https://www.moi.gov.kw/main/images/assets/common/ico-android.svg" className="social-media-icon" alt="Android" />
              &nbsp;&nbsp;
              <img src="https://www.moi.gov.kw/main/images/assets/common/ico-apple.svg" className="social-media-icon" alt="Apple" />
            </div>
            <div className="small">© جميع الحقوق محفوظة لوزارة الداخلية-دولة الكويت - 2026</div>
          </div>
        </footer>
      </div>
    </div>
  );
}
