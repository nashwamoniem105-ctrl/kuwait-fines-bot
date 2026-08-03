import { useState, useEffect } from "react";
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
        setSelectedFines(data.fines.filter((f: any) => f.fineType === "payable").map((f: any) => f.ticketNo));
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
        <header>
          <div className="row">
            <div className="col-4 col-md-2 col-lg-2 text-center">
              <a className="navbar-brand m-0" href="/">
                <img src="/main/images/assets/common/logo-moi.svg" style={{ height: "120px" }} alt="Logo" />
              </a>
            </div>
            <div className="col-1 align-self-center">
              <div className="row">
                <div className="col text-center">
                  <img src="/main/images/assets/common/ar/state-of-kuwait.svg" className="text-center main-header-title" alt="State of Kuwait" />
                </div>
              </div>
              <div className="row">
                <div className="col text-center">
                  <img src="/main/images/assets/common/ar/ministry-of-interior.svg" className="mt-2 main-header-title" alt="MOI" />
                </div>
              </div>
            </div>
          </div>
          <nav className="navbar navbar-expand-lg navbar-dark border-bottom box-shadow">
            <div className="container">
              <div className="navbar-collapse collapse flex-sm-row-reverse" id="navbarResponsive">
                <ul className="navbar-nav flex-grow-1 p-0 clearfix" style={{ margin: "0 auto", verticalAlign: "top" }}>
                  <div className="d-flex flex-sm-row flex-column container-navlinks">
                    <li className="nav-item active">
                      <a className="nav-link" href="/">الرئيسيــة</a>
                    </li>
                    <li className="nav-item">
                      <a className="nav-link" href="#">الخدمات الإلكترونيـة</a>
                    </li>
                    <li className="nav-item">
                      <a className="nav-link" href="#">إدارات توعوية</a>
                    </li>
                  </div>
                </ul>
              </div>
            </div>
          </nav>
        </header>

        <div className="container-fluid">
          <div className="row">
            <main role="main" className="col-12 pb-3">
              <div className="row mt-3">
                <div className="col-12 text-right">
                  <h4 className="font-weight-bold" style={{ color: "#000576" }}>
                    <img src="/main/images/assets/general-traffic/logo-general-traffic.svg" style={{ height: "40px" }} className="ml-2" alt="Traffic" />
                    الإدارة العامة للمرور
                  </h4>
                </div>
              </div>

              <div className="row mt-2">
                <div className="col-12">
                  <div className="card shadow-sm p-4">
                    <form id="enquireForm" onSubmit={handleInquire}>
                      <div className="form-row">
                        <div className="col-sm-12 col-md-6">
                          <label className="font-weight-bold">نوع الاستعلام</label>
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
                      <div className="form-row mt-2">
                        <div className="col-sm-12 col-md-4">
                          <label id="lblEnquiryType" className="font-weight-bold">
                            {enquiryType === "1" ? "الرقم المدني أو الرقم الموحد" : "الرقم الموحد للشركة"}
                          </label>
                          <input 
                            className="form-control form-control-lg text-center font-weight-bold" 
                            id="civilId" 
                            name="civilId" 
                            value={civilId}
                            onChange={(e) => setCivilId(e.target.value)}
                            maxLength={12} 
                            style={{ fontSize: "1.5rem", color: "#000576" }}
                          />
                        </div>
                      </div>
                      <div className="form-row mt-4">
                        <div className="col-sm-12 col-md-4">
                          <button 
                            id="btnEnquire" 
                            type="submit" 
                            className="btn btn-primary btn-block btn-lg"
                            disabled={isSearching}
                            style={{ backgroundColor: "#000576", borderColor: "#000576" }}
                          >
                            {isSearching ? "جاري البحث..." : "إستعلم"}
                          </button>
                        </div>
                      </div>
                    </form>

                    {isSearching && (
                      <div className="d-flex justify-content-center mt-4">
                        <div className="spinner-grow text-primary" role="status">
                          <span className="sr-only">Loading...</span>
                        </div>
                      </div>
                    )}

                    {results && (
                      <div id="responseInfo" className="mt-4">
                        <div className="row alert alert-secondary" role="alert">
                          <div className="col-md-6 col-sm-12 text-right">
                            <b className="ml-2">عدد المخالفات:</b> {results.totalFines}
                          </div>
                          <div className="col-md-6 col-sm-12 text-right">
                            <b className="ml-2">المبلغ الاجمالي:</b> {results.totalAmount} دك
                          </div>
                        </div>

                        <div className="row">
                          {results.fines.map((fine: any, index: number) => (
                            <div key={index} className="col-sm-12 col-md-6 mt-3">
                              <div className="card" style={{ borderTop: `5px solid ${fine.fineType === 'payable' ? 'green' : 'red'}` }}>
                                <div className="card-header p-2 bg-light">
                                  <div className="row align-items-center">
                                    <div className="col-2 text-center">
                                      {fine.fineType === 'payable' && (
                                        <input 
                                          type="checkbox" 
                                          checked={selectedFines.includes(fine.ticketNo)}
                                          onChange={() => toggleFine(fine.ticketNo)}
                                          style={{ width: "20px", height: "20px" }}
                                        />
                                      )}
                                    </div>
                                    <div className="col-10 text-right">
                                      <b style={{ color: "#000576" }}>رقم المخالفة:</b> {fine.ticketNo}
                                    </div>
                                  </div>
                                </div>
                                <div className="card-body text-right">
                                  <div className="mb-1"><b>القيمة:</b> {fine.amount} دك</div>
                                  <div className="mb-1"><b>اللوحة:</b> {fine.plateNumber} / {fine.plateCode}</div>
                                  <div className="mb-1"><b>التاريخ:</b> {fine.fineDate}</div>
                                  <div className="mt-2 p-2 bg-light rounded small">
                                    {fine.description}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {results.fines.length > 0 && (
                          <div className="mt-4 border-top pt-4">
                            <div className="row align-items-center">
                              <div className="col-md-6 text-right">
                                <h5 className="font-weight-bold text-success">
                                  إجمالي القيمة المختارة: {totalPayableAmount} دك
                                </h5>
                              </div>
                              <div className="col-md-6 text-left">
                                <button 
                                  className="btn btn-success btn-lg px-5"
                                  onClick={handlePay}
                                  disabled={selectedFines.length === 0}
                                >
                                  إدفع المختارة
                                </button>
                              </div>
                            </div>
                            <div className="alert alert-warning mt-3 text-right">
                              بعد إجراء عملية الدفع.. يرجى عدم محاولة الدفع مرة أخرى حيث يجرى تحديث البيانات خلال 15 دقيقة
                            </div>
                          </div>
                        )}

                        {results.fines.length === 0 && !isSearching && (
                          <div className="alert alert-success mt-4 text-center py-4">
                            <h5>لا يوجد مخالفات مسجلة</h5>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>

      <footer className="footer mt-auto py-4 bg-light border-top">
        <div className="container text-center">
          <div className="mb-3">
            <img src="/main/images/assets/social-media/ico-youtube.svg" className="mx-2" style={{ height: "24px" }} alt="Youtube" />
            <img src="/main/images/assets/social-media/ico-instagram.svg" className="mx-2" style={{ height: "24px" }} alt="Instagram" />
            <img src="/main/images/assets/social-media/ico-twitter.svg" className="mx-2" style={{ height: "24px" }} alt="Twitter" />
            <img src="/main/images/assets/social-media/ico-facebook.svg" className="mx-2" style={{ height: "24px" }} alt="Facebook" />
          </div>
          <span className="text-muted">© جميع الحقوق محفوظة لوزارة الداخلية - دولة الكويت - 2026</span>
        </div>
      </footer>
    </div>
  );
}
