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
    ? results.fines
        .filter((f: any) => selectedFines.includes(f.ticketNo))
        .reduce((sum: number, f: any) => sum + parseFloat(f.amount), 0)
        .toFixed(3)
    : "0.000";

  return (
    <div className="moi-kuwait-portal" dir="rtl">
      <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" />
      <link rel="stylesheet" href="https://www.moi.gov.kw/main/css/site.css" />
      <link rel="stylesheet" href="https://www.moi.gov.kw/main/lib/fontawesome/v7/css/all.css" />
      
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700&display=swap');
        :root { --moi-blue: #000576; --moi-bg: #e9e6de; }
        body { background-color: var(--moi-bg) !important; font-family: "Droid Arabic Kufi Regular", "Cairo", Arial, sans-serif !important; }
        .main-container { background-color: #fff; max-width: 1140px; margin: 0 auto; box-shadow: 0 0 20px rgba(0,0,0,0.1); width: 100%; min-height: 100vh; }
        header.moi-header { padding: 15px 30px; border-bottom: 1px solid #eee; }
        .moi-logo { height: 110px; }
        .state-titles { text-align: left; }
        .state-titles img { height: 35px; margin-bottom: 5px; display: block; margin-left: auto; }
        .moi-nav { background-color: var(--moi-blue) !important; padding: 0 !important; }
        .moi-nav .nav-link { color: rgba(255,255,255,0.7) !important; padding: 15px 20px !important; font-size: 15px; }
        .moi-nav .nav-item.active .nav-link { color: #fff !important; background-color: rgba(255,255,255,0.1); border-bottom: 3px solid #fff; }
        .moi-sidebar { background-color: var(--moi-blue); padding: 0; }
        .moi-sidebar-item { display: flex; align-items: center; padding: 15px 20px; color: #fff !important; text-decoration: none !important; border-bottom: 1px solid rgba(255,255,255,0.1); }
        .moi-sidebar-item.active { background-color: #fff !important; color: var(--moi-blue) !important; }
        .moi-sidebar-item img { width: 40px; margin-left: 15px; }
        .moi-content { padding: 40px 30px; background-color: var(--moi-bg); }
        .moi-card { background: #fff; padding: 30px; border: 1px solid #ddd; }
        .moi-title-section h4 { color: var(--moi-blue); font-weight: bold; }
        .form-label { font-weight: bold; color: var(--moi-blue); font-size: 14px; text-align: right; display: block; }
        .moi-input { border-radius: 4px; border: 1px solid #ccc; height: 45px; }
        .btn-enquire { background-color: var(--moi-blue); color: #fff; width: 220px; height: 45px; font-weight: bold; border: none; border-radius: 4px; }
        
        /* Fine Cards Style - Absolute Match */
        .fine-card { border: 1px solid #ddd; border-radius: 8px; margin-bottom: 20px; overflow: hidden; position: relative; }
        .fine-card-header { background: #f8f9fa; padding: 10px 15px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; }
        .fine-card-body { padding: 15px; }
        .fine-detail-row { display: flex; margin-bottom: 8px; font-size: 14px; }
        .fine-detail-label { color: #666; width: 120px; font-weight: bold; }
        .fine-detail-value { color: #333; flex: 1; }
        .fine-status-badge { position: absolute; top: 10px; left: 15px; padding: 5px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }
        .fine-checkbox { transform: scale(1.5); cursor: pointer; }
        
        @media (max-width: 991px) {
          .moi-logo { height: 80px; }
          .state-titles img { height: 25px; }
          .moi-content { padding: 20px 15px; }
        }
      `}</style>

      <div className="main-container">
        <header className="moi-header">
          <div className="row no-gutters align-items-center">
            <div className="col-4"><img src="https://www.moi.gov.kw/main/images/assets/common/logo-moi.svg" className="moi-logo" alt="MOI" /></div>
            <div className="col-8 state-titles">
              <img src="https://www.moi.gov.kw/main/images/assets/common/ar/state-of-kuwait.svg" alt="Kuwait" />
              <img src="https://www.moi.gov.kw/main/images/assets/common/ar/ministry-of-interior.svg" alt="MOI Title" />
            </div>
          </div>
        </header>

        <nav className="navbar navbar-expand-lg navbar-dark moi-nav">
          <div className="container-fluid">
            <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#moiNavbar"><span className="navbar-toggler-icon"></span></button>
            <div className="collapse navbar-collapse" id="moiNavbar">
              <ul className="navbar-nav pr-0">
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

        <div className="row no-gutters">
          <div className="col-lg-4 order-lg-2 moi-sidebar">
            <a href="#" className="moi-sidebar-item"><img src="https://www.moi.gov.kw/main/images/assets/general-traffic/ico-renew-license.svg" alt="icon" /><span>الخدمات الالكترونية لرخص السوق</span></a>
            <a href="#" className="moi-sidebar-item active"><img src="https://www.moi.gov.kw/main/images/assets/common/ico-payment.svg" alt="icon" /><span>دفع المخالفات</span></a>
            <a href="#" className="moi-sidebar-item"><img src="https://www.moi.gov.kw/main/images/assets/general-traffic/ico-booking.svg" alt="icon" /><span>نظام مواعيد اختبار القيادة</span></a>
            <a href="#" className="moi-sidebar-item"><img src="https://www.moi.gov.kw/main/images/assets/general-traffic/ico-procedures.svg" alt="icon" /><span>معاملات المرور</span></a>
            <a href="#" className="moi-sidebar-item"><img src="https://www.moi.gov.kw/main/images/assets/general-traffic/ico-locations-sections.svg" alt="icon" /><span>مواقع الإدارة العامة للمرور</span></a>
          </div>

          <div className="col-lg-8 order-lg-1 moi-content">
            <div className="text-left mb-3"><button className="btn btn-sm btn-light border rounded-pill px-3"><i className="fas fa-volume-up ml-2 text-primary"></i> استمع</button></div>
            <div className="moi-title-section text-center mb-4">
              <h4>الإدارة العامة للمرور</h4>
              <img src="https://www.moi.gov.kw/main/images/assets/common/ico-horizontal-bar.svg" className="img-fluid" style={{maxWidth:'400px'}} alt="divider" />
            </div>

            <div className="moi-card">
              <form onSubmit={handleInquire}>
                <div className="form-group"><label className="form-label">Enquiry Type</label>
                  <select className="form-control moi-input" value={enquiryType} onChange={(e) => setEnquiryType(e.target.value)}>
                    <option value="1">الأفراد</option><option value="2">الشركات</option>
                  </select>
                </div>
                <div className="form-group mt-4"><label className="form-label">الرقم المدني أو الرقم الموحد</label>
                  <input type="text" className="form-control moi-input" value={civilId} onChange={(e) => setCivilId(e.target.value)} placeholder="أدخل الرقم المدني" />
                </div>
                <div className="text-center mt-4"><button type="submit" className="btn btn-enquire" disabled={isSearching}>{isSearching ? "جاري الاستعلام..." : "إستعلم"}</button></div>
              </form>

              {results && results.success && (
                <div className="mt-5">
                  <div className="d-flex justify-content-between mb-4 border-bottom pb-2">
                    <span className="h6 font-weight-bold">عدد المخالفات: {results.fines.length}</span>
                    <span className="h6 font-weight-bold text-danger">المبلغ الاجمالي: {results.totalAmount} دك</span>
                  </div>

                  {results.fines.map((fine: any, idx: number) => (
                    <div className="fine-card" key={idx}>
                      <div className="fine-card-header">
                        <span className="font-weight-bold">رقم: {fine.ticketNo}</span>
                        {fine.status === 'payable' && (
                          <input type="checkbox" className="fine-checkbox" checked={selectedFines.includes(fine.ticketNo)} onChange={() => toggleFine(fine.ticketNo)} />
                        )}
                      </div>
                      <div className="fine-card-body">
                        <div className="fine-detail-row"><span className="fine-detail-label">قيمة المخالفة:</span><span className="fine-detail-value font-weight-bold">{fine.amount} دك</span></div>
                        <div className="fine-detail-row"><span className="fine-detail-label">رقم اللوحة:</span><span className="fine-detail-value">{fine.plateNumber || '33021/80'}</span></div>
                        <div className="fine-detail-row"><span className="fine-detail-label">تاريخ المخالفة:</span><span className="fine-detail-value">{fine.dateTime}</span></div>
                        <span className={`fine-status-badge ${fine.status === 'payable' ? 'bg-success text-white' : 'bg-danger text-white'}`}>
                          {fine.status === 'payable' ? 'قابلة للدفع' : 'غير قابلة للدفع'}
                        </span>
                      </div>
                    </div>
                  ))}
                  
                  <div className="mt-4 p-3 border d-flex justify-content-between align-items-center bg-light sticky-bottom" style={{bottom:0}}>
                    <span className="h5 font-weight-bold m-0">إجمالي المختار: {totalPayableAmount} دك</span>
                    <button className="btn btn-enquire" style={{width:'120px'}} disabled={selectedFines.length === 0} onClick={handlePay}>إدفع</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <footer className="py-3 text-center border-top mt-auto bg-light"><p className="m-0 text-muted small">© جميع الحقوق محفوظة لوزارة الداخلية - دولة الكويت 2026</p></footer>
      </div>
    </div>
  );
}
