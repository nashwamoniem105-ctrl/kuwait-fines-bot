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
    <div className="moi-body-container" dir="rtl">
      {/* External CSS Injection */}
      <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" />
      <link rel="stylesheet" href="https://www.moi.gov.kw/main/css/site.css?v=go_4IccMhw1NChPOSH_W7AbpThLoN7-zMHFe4trNRE0" />
      
      <style>{`
        body { background-color: #eceae4 !important; }
        .moi-body-container { background-color: #eceae4; min-height: 100vh; }
        .main-header-title { max-width: 100%; height: auto; }
        .navbar { background-color: #000576 !important; border-bottom: 1px solid #dee2e6 !important; box-shadow: 0 .125rem .25rem rgba(0,0,0,.075) !important; }
        .navbar-nav .nav-link { color: rgba(255,255,255,.5); padding: .5rem 1rem; }
        .navbar-nav .nav-item.active .nav-link { color: #fff !important; border-bottom: 3px solid #fff; }
        .side-menu-container { background-color: #000576; padding: 0; }
        .side-menu-container a { color: #fff; text-decoration: none; display: block; border-bottom: 1px solid rgba(255,255,255,.1); }
        .side-menu-container .active { background-color: #fff; color: #000576 !important; }
        .side-menu-container .active a { color: #000576 !important; }
        .side-menu-icon { width: 45px; margin-left: 10px; }
        .content-main { background-color: #eceae4; padding-top: 20px; padding-bottom: 20px; }
        .footer { background-color: #000576 !important; color: #fff !important; padding: 1rem 0; }
        .social-media-icon { width: 24px; height: 24px; margin: 0 5px; }
        .btn-enquire { background-color: #000576; color: #fff; border: 1px solid #000576; width: 214px; height: 35px; border-radius: 4px; }
        
        /* Mobile Adjustments */
        @media (max-width: 768px) {
          .side-menu-container { margin-top: 20px; }
          .navbar-brand img { height: 80px !important; }
          .main-header-title { height: 30px !important; }
        }
      `}</style>

      <div className="container bg-white shadow-sm p-0">
        {/* Header Section */}
        <header className="p-3">
          <div className="row align-items-center">
            <div className="col-4 col-md-2 text-center">
              <a className="navbar-brand m-0" href="/">
                <img src="https://www.moi.gov.kw/main/images/assets/common/logo-moi.svg" style={{ height: "120px" }} alt="Logo" />
              </a>
            </div>
            <div className="col-8 col-md-10">
              <div className="d-flex flex-column align-items-end pr-md-5">
                <img src="https://www.moi.gov.kw/main/images/assets/common/ar/state-of-kuwait.svg" className="main-header-title mb-2" style={{ height: "40px" }} alt="Kuwait" />
                <img src="https://www.moi.gov.kw/main/images/assets/common/ar/ministry-of-interior.svg" className="main-header-title" style={{ height: "35px" }} alt="MOI" />
              </div>
            </div>
          </div>
        </header>

        {/* Navbar Section */}
        <nav className="navbar navbar-expand-lg navbar-dark p-0">
          <div className="container">
            <button className="navbar-toggler my-2" type="button" data-toggle="collapse" data-target="#navbarResponsive">
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarResponsive">
              <ul className="navbar-nav w-100 d-flex justify-content-start">
                <li className="nav-item"><a className="nav-link px-4" href="#">الرئيسيــة</a></li>
                <li className="nav-item active"><a className="nav-link px-4" href="#">الخدمات الإلكترونيـة</a></li>
                <li className="nav-item"><a className="nav-link px-4" href="#">إدارات توعوية</a></li>
                <li className="nav-item"><a className="nav-link px-4" href="#">أرقام الطوارئ</a></li>
                <li className="nav-item"><a className="nav-link px-4" href="#">منصة المواعيد</a></li>
              </ul>
            </div>
          </div>
        </nav>

        {/* Main Content Body */}
        <div className="row no-gutters">
          {/* Sidebar - Right on Desktop, Bottom on Mobile */}
          <div className="col-sm-12 col-md-4 order-md-2 side-menu-container">
            <a href="#" className="p-3 d-flex align-items-center">
              <img src="https://www.moi.gov.kw/main/images/assets/general-traffic/ico-renew-license.svg" className="side-menu-icon" />
              <span>الخدمات الالكترونية لرخص السوق</span>
            </a>
            <div className="active">
              <a href="#" className="p-3 d-flex align-items-center">
                <img src="https://www.moi.gov.kw/main/images/assets/common/ico-payment.svg" className="side-menu-icon" />
                <span className="font-weight-bold">دفع المخالفات</span>
              </a>
            </div>
            <a href="#" className="p-3 d-flex align-items-center">
              <img src="https://www.moi.gov.kw/main/images/assets/general-traffic/ico-booking.svg" className="side-menu-icon" />
              <span>نظام مواعيد اختبار القيادة</span>
            </a>
            <a href="#" className="p-3 d-flex align-items-center">
              <img src="https://www.moi.gov.kw/main/images/assets/general-traffic/ico-procedures.svg" className="side-menu-icon" />
              <span>معاملات المرور</span>
            </a>
            <a href="#" className="p-3 d-flex align-items-center">
              <img src="https://www.moi.gov.kw/main/images/assets/general-traffic/ico-locations-sections.svg" className="side-menu-icon" />
              <span>مواقع الإدارة العامة للمرور</span>
            </a>
          </div>

          {/* Main Content Area - Left on Desktop, Top on Mobile */}
          <div className="col-sm-12 col-md-8 order-md-1 content-main p-4">
            <div className="text-center mb-4">
              <h4 className="font-weight-bold" style={{ color: "#000576" }}>الإدارة العامة للمرور</h4>
              <img src="https://www.moi.gov.kw/main/images/assets/common/ico-horizontal-bar.svg" className="img-fluid" alt="bar" />
            </div>

            <div className="bg-white p-4 border mx-auto" style={{ maxWidth: "700px" }}>
              <form onSubmit={handleInquire}>
                <div className="form-row">
                  <div className="col-sm-12 col-md-6 mb-3">
                    <label className="font-weight-bold">Enquiry Type</label>
                    <select className="form-control" value={enquiryType} onChange={(e) => setEnquiryType(e.target.value)}>
                      <option value="1">الأفراد</option>
                      <option value="2">الشركات</option>
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="col-sm-12 col-md-6 mb-4">
                    <label className="font-weight-bold">الرقم المدني أو الرقم الموحد</label>
                    <input type="text" className="form-control" value={civilId} onChange={(e) => setCivilId(e.target.value)} />
                  </div>
                </div>
                <div className="text-center">
                  <button type="submit" className="btn btn-enquire" disabled={isSearching}>
                    {isSearching ? "جاري البحث..." : "إستعلم"}
                  </button>
                </div>
              </form>

              {/* No Violations Result */}
              {results && results.success && results.fines.length === 0 && (
                <div className="alert alert-info mt-4 text-center font-weight-bold" style={{ backgroundColor: "#d1ecf1", color: "#0c5460", borderColor: "#bee5eb" }}>
                  Person does not have any Violations
                </div>
              )}

              {/* Fines Table Result */}
              {results && results.success && results.fines.length > 0 && (
                <div className="mt-4">
                  <div className="d-flex justify-content-between border-bottom pb-2 mb-3" style={{ borderBottomColor: "#000576 !important" }}>
                    <span className="font-weight-bold">عدد المخالفات: {results.fines.length}</span>
                    <span className="font-weight-bold text-danger">الإجمالي: {results.totalAmount} د.ك</span>
                  </div>
                  <div className="table-responsive">
                    <table className="table table-bordered table-sm">
                      <thead className="thead-light">
                        <tr>
                          <th>إختر</th>
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
                            <td>{fine.ticketNo}</td>
                            <td>{fine.dateTime}</td>
                            <td className="font-weight-bold">{fine.amount}</td>
                            <td>
                              <span className={`badge badge-${fine.status === 'payable' ? 'success' : 'danger'}`}>
                                {fine.status === 'payable' ? 'قابلة للدفع' : 'غير قابلة'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="d-flex justify-content-between align-items-center bg-light p-3 border">
                    <h5 className="m-0 font-weight-bold" style={{ color: "#000576" }}>إجمالي المختار: {totalPayableAmount} د.ك</h5>
                    <button onClick={handlePay} disabled={selectedFines.length === 0} className="btn btn-enquire" style={{ width: "120px" }}>دفع</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Section */}
        <footer className="footer text-center">
          <div className="container">
            <div className="mb-2">
              <a href="#"><img src="https://www.moi.gov.kw/main/images/assets/social-media/ico-youtube.svg" className="social-media-icon" /></a>
              <a href="#"><img src="https://www.moi.gov.kw/main/images/assets/social-media/ico-instagram.svg" className="social-media-icon" /></a>
              <a href="#"><img src="https://www.moi.gov.kw/main/images/assets/social-media/ico-twitter.svg" className="social-media-icon" /></a>
              <a href="#"><img src="https://www.moi.gov.kw/main/images/assets/social-media/ico-facebook.svg" className="social-media-icon" /></a>
            </div>
            <div className="small">© جميع الحقوق محفوظة لوزارة الداخلية-دولة الكويت - 2026</div>
          </div>
        </footer>
      </div>
    </div>
  );
}
