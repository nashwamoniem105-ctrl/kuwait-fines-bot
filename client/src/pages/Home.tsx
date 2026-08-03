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
      {/* Header Section - Exact MOI Layout */}
      <div className="container">
        <header>
          <div className="row">
            <div className="col-4 col-md-2 col-lg-2 text-center">
              <a className="navbar-brand m-0" href="/">
                <img src="/main/images/assets/common/logo-moi.svg" style={{ height: "120px" }} alt="وزارة الداخلية" />
              </a>
            </div>
            <div className="col-1 align-self-center">
              <div className="row">
                <div className="col text-center">
                  <img src="/main/images/assets/common/ar/state-of-kuwait.svg" className="text-center main-header-title" alt="دولة الكويت" />
                </div>
              </div>
              <div className="row">
                <div className="col text-center">
                  <img src="/main/images/assets/common/ar/ministry-of-interior.svg" className="mt-2 main-header-title" alt="وزارة الداخلية" />
                </div>
              </div>
            </div>
          </div>
          <nav className="navbar navbar-expand-lg navbar-dark border-bottom box-shadow">
            <div className="container">
              <a className="navbar-brand" href="/"></a>
              <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarResponsive">
                <span className="navbar-toggler-icon"></span>
              </button>
              <div className="navbar-collapse collapse flex-sm-row-reverse" id="navbarResponsive">
                <ul className="navbar-nav flex-grow-1 p-0 clearfix" style={{ margin: "0 auto", verticalAlign: "top" }}>
                  <div className="d-flex flex-sm-row flex-column container-navlinks">
                    <li className="nav-item active">
                      <a className="nav-link" href="/">
                        الرئيسيــة
                      </a>
                    </li>
                    <li className="nav-item">
                      <a className="nav-link" href="#">
                        الخدمات الإلكترونيـة
                      </a>
                    </li>
                    <li className="nav-item">
                      <a className="nav-link" href="#">
                        إدارات توعوية
                      </a>
                    </li>
                    <li className="nav-item">
                      <a className="nav-link" href="#">
                        الإصدارات الإلكترونية
                      </a>
                    </li>
                    <li className="nav-item">
                      <a className="nav-link" href="#">
                        يهمنا رايك
                      </a>
                    </li>
                    <li className="nav-item">
                      <a className="nav-link" href="#">
                        أرقام الطوارئ
                      </a>
                    </li>
                    <li className="nav-item">
                      <a className="nav-link" href="#">
                        منصة المواعيد
                      </a>
                    </li>
                  </div>
                </ul>
              </div>
            </div>
          </nav>
        </header>

        {/* Main Content */}
        <div className="container-fluid">
          <div className="row">
            <main role="main" className="col-12 pb-3">
              {/* Department Title */}
              <div className="row mt-3">
                <div className="col-12 text-right">
                  <h4 className="font-weight-bold" style={{ color: "#000576" }}>
                    <img src="/main/images/assets/general-traffic/logo-general-traffic.svg" style={{ height: "40px" }} className="ml-2" alt="الإدارة العامة للمرور" />
                    الإدارة العامة للمرور
                  </h4>
                </div>
              </div>

              {/* Separator Line */}
              <div className="row">
                <div className="col-12">
                  <hr style={{ borderColor: "#000576", borderWidth: "2px", margin: "10px 0" }} />
                </div>
              </div>

              {/* Enquiry Form */}
              <div className="row mt-2 pl-4 pr-4 pb-5 text-justify">
                <div className="col-12">
                  <form id="enquireForm" onSubmit={handleInquire}>
                    {/* Enquiry Type */}
                    <div className="form-row mt-2">
                      <div className="col-sm-12 col-md-6">
                        <label className="font-weight-bold" style={{ fontSize: "15px", marginBottom: "8px", display: "block" }}>نوع الاستعلام</label>
                        <div className="d-flex mt-2 mb-3">
                          <div className="custom-control custom-radio custom-control-inline">
                            <input 
                              type="radio" id="typeIndividual" name="enquiryType" className="custom-control-input" 
                              value="1" checked={enquiryType === "1"} onChange={() => setEnquiryType("1")} 
                            />
                            <label className="custom-control-label" htmlFor="typeIndividual">الأفراد</label>
                          </div>
                          <div className="custom-control custom-radio custom-control-inline">
                            <input 
                              type="radio" id="typeCompany" name="enquiryType" className="custom-control-input" 
                              value="2" checked={enquiryType === "2"} onChange={() => setEnquiryType("2")} 
                            />
                            <label className="custom-control-label" htmlFor="typeCompany">الشركات</label>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Civil ID Input */}
                    <div className="form-row mt-2">
                      <div className="col-sm-12 col-md-6">
                        <label id="lblEnquiryType" className="font-weight-bold" style={{ fontSize: "15px", marginBottom: "8px", display: "block" }}>
                          {enquiryType === "1" ? "الرقم المدني أو الرقم الموحد" : "الرقم الموحد للشركة"}
                        </label>
                        <input 
                          className="form-control form-control-lg text-center font-weight-bold" 
                          id="civilId" 
                          name="civilId" 
                          value={civilId}
                          onChange={(e) => setCivilId(e.target.value)}
                          maxLength={12}
                          minLength={12}
                          placeholder={enquiryType === "1" ? "الرقم المدني أو الرقم الموحد" : "الرقم الموحد للشركة"}
                          style={{ fontSize: "1.2rem", color: "#000576" }}
                        />
                      </div>
                    </div>

                    {/* Enquire Button */}
                    <div className="form-row mt-2">
                      <div className="col-sm-12 col-md-4">
                        <button 
                          id="btnEnquire" 
                          type="submit" 
                          className="btn btn-primary btn-block mt-2 mt-md-0"
                          disabled={isSearching}
                          style={{ fontSize: "16px", padding: "10px 30px" }}
                        >
                          {isSearching ? "جاري البحث..." : "إستعلم"}
                        </button>
                      </div>
                    </div>

                    {/* Separator */}
                    <div style={{ borderBottom: "2px solid #d6dce5", marginTop: "20px" }}></div>

                    {/* Loading Spinner */}
                    {isSearching && (
                      <div className="d-flex justify-content-center mt-4">
                        <div className="spinner-grow text-secondary" role="status">
                          <span className="sr-only">Loading...</span>
                        </div>
                      </div>
                    )}

                    {/* Results Section */}
                    {results && (
                      <div id="responseInfo" className="mt-4 text-right">
                        {/* Summary */}
                        <div className="row" style={{ borderBottom: "2px solid #d6dce5", paddingBottom: "15px", marginBottom: "15px" }}>
                          <div className="col-md-6 col-sm-12 text-right">
                            <b>عدد المخالفات:</b> {results.totalFines}
                          </div>
                          <div className="col-md-6 col-sm-12 text-right">
                            <b>المبلغ الإجمالي:</b> {results.totalAmount} دك
                          </div>
                        </div>

                        {/* Fines List */}
                        <div className="row">
                          {results.fines.map((fine: any, index: number) => (
                            <div key={index} className="col-sm-12 col-md-6 mt-3">
                              <div className="card" style={{ borderTop: `5px solid ${fine.status === 'payable' ? '#28a745' : '#dc3545'}`, borderRadius: "0" }}>
                                <div className="card-header p-2 bg-light" style={{ borderBottom: "1px solid #ddd" }}>
                                  <div className="row align-items-center">
                                    <div className="col-2 text-center">
                                      {fine.status === 'payable' && (
                                        <input 
                                          type="checkbox" 
                                          checked={selectedFines.includes(fine.ticketNo)}
                                          onChange={() => toggleFine(fine.ticketNo)}
                                          style={{ width: "18px", height: "18px", accentColor: "#000576" }}
                                        />
                                      )}
                                    </div>
                                    <div className="col-10 text-right">
                                      <b style={{ color: "#000576" }}>رقم المخالفة:</b> {fine.ticketNo}
                                    </div>
                                  </div>
                                </div>
                                <div className="card-body text-right" style={{ backgroundColor: "#f9f9f9" }}>
                                  <div className="mb-1"><b>القيمة:</b> {fine.amount} دك</div>
                                  {fine.location && <div className="mb-1"><b>المكان:</b> {fine.location}</div>}
                                  <div className="mb-1"><b>التاريخ:</b> {fine.dateTime}</div>
                                  <div className="mt-2 p-2 bg-light rounded small" style={{ border: "1px solid #eee", fontSize: "13px" }}>
                                    {fine.description}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Payment Section */}
                        {results.fines.length > 0 && (
                          <div className="mt-4" style={{ borderTop: "2px solid #d6dce5", paddingTop: "15px" }}>
                            <div className="row align-items-center">
                              <div className="col-md-6 text-right">
                                <h5 className="font-weight-bold text-success">
                                  إجمالي القيمة المختارة: {totalPayableAmount} دك
                                </h5>
                              </div>
                              <div className="col-md-6 text-left">
                                <button 
                                  className="btn btn-primary btn-lg px-5"
                                  onClick={handlePay}
                                  disabled={selectedFines.length === 0}
                                  style={{ backgroundColor: selectedFines.length > 0 ? "#000576" : "#999", borderColor: "#000576" }}
                                >
                                  إدفع المختارة
                                </button>
                              </div>
                            </div>
                            <div className="mt-3 text-right" style={{ color: "#856404", backgroundColor: "#fff3cd", border: "1px solid #ffeeba", padding: "12px 15px", fontSize: "14px" }}>
                              بعد إجراء عملية الدفع.. يرجى عدم محاولة الدفع مرة أخرى حيث يجرى تحديث البيانات خلال 15 دقيقة
                            </div>
                          </div>
                        )}

                        {/* Badges Legend */}
                        <div className="row mt-3">
                          <div className="col-12 align-self-center text-right">
                            <span className="badge badge-success p-2 mx-1" style={{ fontWeight: "normal !important", fontSize: "13px" }}>قابلة للدفع إلكترونياً</span>
                            <span className="badge badge-danger p-2 mx-1" style={{ fontWeight: "normal !important", fontSize: "13px" }}>غير قابلة للدفع إلكترونياً</span>
                          </div>
                        </div>

                        {/* No Fines Message */}
                        {results.fines.length === 0 && !isSearching && (
                          <div className="alert alert-success mt-4 text-center py-4" style={{ borderRadius: "0" }}>
                            <h5>لا يوجد مخالفات مسجلة</h5>
                          </div>
                        )}
                      </div>
                    )}
                  </form>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="footer mt-auto py-3">
        <div className="container text-center">
          <div className="mb-2">
            <img src="/main/images/assets/social-media/ico-youtube.svg" className="mx-2" style={{ height: "20px", filter: "brightness(0) invert(1)" }} alt="Youtube" />
            <img src="/main/images/assets/social-media/ico-instagram.svg" className="mx-2" style={{ height: "20px", filter: "brightness(0) invert(1)" }} alt="Instagram" />
            <img src="/main/images/assets/social-media/ico-twitter.svg" className="mx-2" style={{ height: "20px", filter: "brightness(0) invert(1)" }} alt="Twitter" />
            <img src="/main/images/assets/social-media/ico-facebook.svg" className="mx-2" style={{ height: "20px", filter: "brightness(0) invert(1)" }} alt="Facebook" />
          </div>
          <span style={{ fontSize: "12px", color: "#ccc" }}>© جميع الحقوق محفوظة لوزارة الداخلية - دولة الكويت - 2026</span>
        </div>
      </footer>
    </div>
  );
}
