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
    queryMutation.mutate({ civilId, enquiryType, lang: lang as "ar" | "en" });
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
    <div className="moi-theme" dir="rtl">
      <div className="container">
        {/* Header Section */}
        <header>
          <div className="row align-items-center py-2 bg-white">
            <div className="col-4 col-md-2 text-center">
              <a href="/">
                <img src="/main/images/assets/common/logo-moi.svg" style={{ height: "120px" }} alt="Logo" />
              </a>
            </div>
            <div className="col-8 col-md-4">
              <div className="d-flex flex-column align-items-start pr-3">
                <img src="/main/images/assets/common/ar/state-of-kuwait.svg" style={{ height: "40px", marginBottom: "10px" }} alt="Kuwait" />
                <img src="/main/images/assets/common/ar/ministry-of-interior.svg" style={{ height: "35px" }} alt="MOI" />
              </div>
            </div>
          </div>
          
          <nav className="navbar navbar-expand-lg navbar-dark shadow-sm mt-2">
            <div className="container p-0">
              <ul className="navbar-nav w-100 d-flex flex-row p-0">
                <li className="nav-item active">
                  <a className="nav-link" href="/">الرئيسيــة</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="#">الخدمات الإلكترونيـة</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="#">إدارات توعوية</a>
                </li>
                <li className="nav-item d-none d-md-block">
                  <a className="nav-link" href="#">أرقام الطوارئ</a>
                </li>
              </ul>
            </div>
          </nav>
        </header>

        {/* Main Content Area */}
        <div className="container-fluid content-main p-0 mt-0">
          <div className="row m-0">
            {/* Side Menu - Only visible on desktop */}
            <div className="col-md-4 side-menu d-none d-md-block p-0">
              <div className="side-menu-item p-3 border-bottom d-flex align-items-center">
                <img src="/main/images/assets/general-traffic/ico-renew-license.svg" className="side-menu-icon" />
                <span className="small font-weight-bold">الخدمات الالكترونية لرخص السوق</span>
              </div>
              <div className="side-menu-item p-3 border-bottom d-flex align-items-center active" style={{ backgroundColor: "#fff" }}>
                <img src="/main/images/assets/common/ico-payment.svg" className="side-menu-icon" />
                <span className="small font-weight-bold">دفع المخالفات</span>
              </div>
              <div className="side-menu-item p-3 border-bottom d-flex align-items-center">
                <img src="/main/images/assets/general-traffic/ico-booking.svg" className="side-menu-icon" />
                <span className="small font-weight-bold">نظام مواعيد اختبار القيادة</span>
              </div>
              <div className="side-menu-item p-3 border-bottom d-flex align-items-center">
                <img src="/main/images/assets/general-traffic/ico-procedures.svg" className="side-menu-icon" />
                <span className="small font-weight-bold">معاملات المرور</span>
              </div>
            </div>

            {/* Main Content */}
            <div className="col-12 col-md-8 p-4">
              <div className="title-section">
                الإدارة العامة للمرور
                <div className="mt-2">
                  <img src="/main/images/assets/common/ico-horizontal-bar.svg" alt="bar" />
                </div>
              </div>

              <form onSubmit={handleInquire} className="mt-4">
                <div className="form-group mb-4">
                  <label className="font-weight-bold mb-2">نوع الاستعلام</label>
                  <select 
                    className="form-control" 
                    value={enquiryType} 
                    onChange={(e) => setEnquiryType(e.target.value)}
                  >
                    <option value="1">الأفراد</option>
                    <option value="2">الشركات</option>
                  </select>
                </div>

                <div className="form-group mb-4">
                  <label className="font-weight-bold mb-2">
                    {enquiryType === "1" ? "الرقم المدني أو الرقم الموحد" : "الرقم الموحد للشركة"}
                  </label>
                  <input 
                    type="text"
                    className="form-control text-center font-weight-bold"
                    style={{ fontSize: "1.2rem", color: "#000576" }}
                    value={civilId}
                    onChange={(e) => setCivilId(e.target.value)}
                    maxLength={12}
                    placeholder="أدخل الرقم هنا"
                  />
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <button 
                      type="submit" 
                      className="btn btn-primary btn-block"
                      disabled={isSearching}
                    >
                      {isSearching ? "جاري البحث..." : "إستعلم"}
                    </button>
                  </div>
                </div>
              </form>

              {/* Results Display */}
              {results && (
                <div className="results-container mt-5">
                  <div className="d-flex justify-content-between border-bottom pb-2 mb-3 font-weight-bold">
                    <span>عدد المخالفات: {results.totalFines}</span>
                    <span className="text-danger">الإجمالي: {results.totalAmount} دك</span>
                  </div>

                  <div className="row">
                    {results.fines.map((fine: any, index: number) => (
                      <div key={index} className="col-12 mb-3">
                        <div className="card shadow-none mb-3" style={{ borderRight: `5px solid ${fine.status === 'payable' ? '#28a745' : '#dc3545'}`, borderRadius: '0' }}>
                          <div className="card-header bg-light d-flex justify-content-between align-items-center p-2">
                            <div className="d-flex align-items-center">
                              {fine.status === 'payable' && (
                                <input 
                                  type="checkbox" 
                                  checked={selectedFines.includes(fine.ticketNo)}
                                  onChange={() => toggleFine(fine.ticketNo)}
                                  className="ml-2"
                                  style={{ width: '18px', height: '18px' }}
                                />
                              )}
                              <span className="font-weight-bold small">رقم المخالفة: {fine.ticketNo}</span>
                            </div>
                            <span className={`badge ${fine.status === 'payable' ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '10px' }}>
                              {fine.status === 'payable' ? 'قابلة للدفع' : 'غير قابلة للدفع'}
                            </span>
                          </div>
                          <div className="card-body p-2 small">
                            <div className="row m-0">
                              <div className="col-6 p-1"><b>القيمة:</b> {fine.amount} دك</div>
                              <div className="col-6 p-1"><b>التاريخ:</b> {fine.dateTime}</div>
                              <div className="col-12 p-1 border-top mt-1 pt-1"><b>الوصف:</b> {fine.description}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {results.fines.length > 0 && (
                    <div className="mt-4 p-3 bg-white border shadow-sm">
                      <div className="d-flex justify-content-between align-items-center">
                        <h5 className="m-0 font-weight-bold text-success">
                          إجمالي المختار: {totalPayableAmount} دك
                        </h5>
                        <button 
                          className="btn btn-primary px-5"
                          onClick={handlePay}
                          disabled={selectedFines.length === 0}
                        >
                          إدفع
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="footer text-center mt-0">
          <div className="container">
            <p className="m-0">جميع الحقوق محفوظة © وزارة الداخلية - دولة الكويت 2026</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
