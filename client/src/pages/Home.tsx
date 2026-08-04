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
  const [expandedTickets, setExpandedTickets] = useState<Set<string>>(new Set());

  const queryMutation = trpc.fines.query.useMutation({
    onSuccess: (data) => {
      setIsSearching(false);
      if (data.success) {
        setResults(data);
        setTimeout(() => {
          document.getElementById('responseInfo')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        toast({ variant: "destructive", title: "خطأ", description: data.errorMessage || "فشل الاستعلام" });
      }
    },
    onError: (err) => {
      setIsSearching(false);
      toast({ variant: "destructive", title: "خطأ", description: err.message });
    }
  });

  const handleInquire = (e: React.FormEvent) => {
    e.preventDefault();
    if (civilId.length < 8) {
      toast({ variant: "destructive", description: "يرجى إدخال الرقم المدني بشكل صحيح" });
      return;
    }
    setIsSearching(true);
    setResults(null);
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

  const toggleTicket = (ticketNo: string) => {
    const newSet = new Set(expandedTickets);
    if (newSet.has(ticketNo)) newSet.delete(ticketNo);
    else newSet.add(ticketNo);
    setExpandedTickets(newSet);
  };

  return (
    <div className="moi-theme" dir="rtl" style={{ backgroundColor: '#eceae4', minHeight: '100vh', height: 'auto', overflow: 'visible' }}>
      <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" />
      <link rel="stylesheet" href="https://www.moi.gov.kw/main/css/site.css" />
      <link rel="stylesheet" href="https://www.moi.gov.kw/main/lib/fontawesome/v7/css/all.css" />

      <style>{`
        html, body, #root, .moi-theme { height: auto !important; min-height: 100vh !important; overflow: visible !important; }
        body { background-image: url('https://www.moi.gov.kw/main/images/assets/common/bg-pattern.png') !important; background-repeat: repeat !important; }
        .container { max-width: 1140px; margin: 0 auto; padding: 0 15px; }
        .content-main { background: white; margin-top: 20px; box-shadow: 0 0 15px rgba(0,0,0,0.1); border-radius: 4px; overflow: hidden; }
        .side-menu { background: #f8f9fa; border-left: 1px solid #dee2e6; height: 100%; min-height: 600px; padding: 0; }
        .side-menu-item { border-bottom: 1px solid #e9ecef; margin: 0; padding: 15px 10px; cursor: pointer; transition: background 0.2s; display: flex; align-items: center; text-decoration: none; color: #000576 !important; }
        .side-menu-item:hover { background: #e9ecef; text-decoration: none; }
        .side-menu-item.active { background: #000576; color: white !important; }
        .side-menu-item.active img { filter: brightness(0) invert(1); }
        .side-menu-icon { width: 28px; margin-left: 15px; }
        
        .ticket-accordion { margin-top: 30px; border: 2px solid #000576; border-radius: 0; overflow: hidden; }
        .ticket-item { border-bottom: 1px solid #d6dce5; background: white; }
        .ticket-header { background: #eceae4; padding: 15px; cursor: pointer; display: flex; align-items: center; border-bottom: 1px solid #d6dce5; }
        .ticket-header:hover { background: #d6dce5; }
        .ticket-body { padding: 20px; background: white; text-align: right; border-top: 1px solid #d6dce5; }
        
        .moi-btn-pay { background-color: #000576; color: white; border: none; padding: 18px; font-weight: bold; width: 100%; font-size: 20px; border-radius: 0; cursor: pointer; }
        .moi-btn-pay:hover { background-color: #000350; }
        
        .moi-title { color: #000576; font-weight: bold; margin-bottom: 5px; }
        .moi-hr-img { width: 150px; margin: 15px auto 30px; display: block; }
        
        .moi-input { height: 55px; font-size: 18px; text-align: right; border: 1px solid #ced4da; border-radius: 4px; }
        .moi-btn-search { background-color: #000576; border: none; height: 60px; font-size: 22px; font-weight: bold; transition: transform 0.1s; }
        
        /* Dark Blue Section Styles */
        .moi-dark-section { background-color: #000576; padding: 50px 0; text-align: center; margin-top: 2px; }
        .moi-circle-icon { width: 140px; height: 140px; border: 2px solid white; border-radius: 50%; margin: 0 auto; display: flex; align-items: center; justify-content: center; padding: 30px; }
        .moi-circle-icon img { width: 100%; height: auto; }
        
        /* Footer Styles */
        .moi-footer { background-color: #000576; padding: 40px 15px; text-align: center; color: white; }
        .social-icons { display: flex; justify-content: center; gap: 15px; margin-bottom: 25px; }
        .social-icons img { height: 24px; }
        .app-stores { display: flex; justify-content: center; gap: 20px; margin-bottom: 25px; }
        .app-stores img { height: 35px; }
      `}</style>

      <div className="container p-0">
        {/* Header */}
        <header className="py-4">
          <div className="row align-items-center">
            <div className="col-4 col-md-2 text-center">
              <a href="/"><img src="https://www.moi.gov.kw/main/images/assets/common/logo-moi.svg" style={{ height: '110px' }} alt="Logo" /></a>
            </div>
            <div className="col-8 col-md-10 text-right">
              <img src="https://www.moi.gov.kw/main/images/assets/common/ar/state-of-kuwait.svg" style={{ height: '45px' }} className="mb-2" alt="State of Kuwait" /><br />
              <img src="https://www.moi.gov.kw/main/images/assets/common/ar/ministry-of-interior.svg" style={{ height: '35px' }} alt="Ministry of Interior" />
            </div>
          </div>
        </header>

        {/* Navbar */}
        <nav className="navbar navbar-expand-lg navbar-dark mt-2 p-0" style={{ backgroundColor: '#000576' }}>
          <div className="container p-0">
            <div className="collapse navbar-collapse show">
              <ul className="navbar-nav w-100 d-flex justify-content-between text-center">
                <li className="nav-item active flex-fill"><a className="nav-link py-3" href="#">الرئيسيــة</a></li>
                <li className="nav-item flex-fill"><a className="nav-link py-3" href="#">الخدمات الإلكترونيـة</a></li>
                <li className="nav-item flex-fill"><a className="nav-link py-3" href="#">إدارات توعوية</a></li>
                <li className="nav-item flex-fill"><a className="nav-link py-3" href="#">الإصدارات الإلكترونية</a></li>
                <li className="nav-item flex-fill"><a className="nav-link py-3" href="#">التحقق من الوثائق</a></li>
                <li className="nav-item flex-fill"><a className="nav-link py-3" href="#">يهمنا رايك</a></li>
                <li className="nav-item flex-fill"><a className="nav-link py-3" href="#">أرقام الطوارئ</a></li>
                <li className="nav-item flex-fill"><a className="nav-link py-3" href="#">منصة المواعيد</a></li>
              </ul>
            </div>
          </div>
        </nav>

        {/* Main Content Body */}
        <div className="content-main container p-0 mt-4">
          <div className="row no-gutters">
            {/* Sidebar */}
            <div className="col-md-4 side-menu d-none d-md-block">
              <div className="p-3 text-center text-white font-weight-bold" style={{ background: '#000576', fontSize: '18px' }}>الإدارة العامة للمرور</div>
              <a href="#" className="side-menu-item">
                <img src="https://www.moi.gov.kw/main/images/assets/general-traffic/ico-renew-license.svg" className="side-menu-icon" alt="icon" />
                <span>الخدمات الالكترونية لرخص السوق</span>
              </a>
              <a href="#" className="side-menu-item active">
                <img src="https://www.moi.gov.kw/main/images/assets/common/ico-payment.svg" className="side-menu-icon" alt="icon" />
                <span>دفع المخالفات</span>
              </a>
              <a href="#" className="side-menu-item">
                <img src="https://www.moi.gov.kw/main/images/assets/general-traffic/ico-booking.svg" className="side-menu-icon" alt="icon" />
                <span>نظام مواعيد اختبار القيادة</span>
              </a>
              <a href="#" className="side-menu-item">
                <img src="https://www.moi.gov.kw/main/images/assets/general-traffic/ico-procedures.svg" className="side-menu-icon" alt="icon" />
                <span>معاملات المرور</span>
              </a>
              <a href="#" className="side-menu-item">
                <img src="https://www.moi.gov.kw/main/images/assets/general-traffic/ico-locations-sections.svg" className="side-menu-icon" alt="icon" />
                <span>مواقع الإدارة العامة للمرور</span>
              </a>
              <a href="#" className="side-menu-item">
                <img src="https://www.moi.gov.kw/main/images/assets/common/ico-pdf-doc.svg" className="side-menu-icon" alt="icon" />
                <span>شروط منح رخص السوق لغير الكويتيين</span>
              </a>
            </div>

            {/* Main Enquiry Area */}
            <div className="col-md-8 p-4 p-lg-5" id="GDTContent">
              <div className="text-center">
                <img src="https://www.moi.gov.kw/main/images/assets/general-traffic/logo-general-traffic.svg" style={{ height: '120px' }} alt="GDT Logo" />
                <h3 className="moi-title mt-3">الإدارة العامة للمرور</h3>
                <img src="https://www.moi.gov.kw/main/images/assets/common/ico-horizontal-bar.svg" className="moi-hr-img" alt="divider" />
              </div>

              <form onSubmit={handleInquire} className="text-right">
                <div className="form-group">
                  <label className="font-weight-bold" style={{ color: '#000576' }}>Enquiry Type</label>
                  <select 
                    className="form-control moi-input" 
                    value={enquiryType} 
                    onChange={(e) => setEnquiryType(e.target.value)}
                  >
                    <option value="1">الأفراد</option>
                    <option value="2">الشركات</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="font-weight-bold" style={{ color: '#000576' }}>الرقم المدني أو الرقم الموحد</label>
                  <input 
                    type="text" 
                    className="form-control moi-input" 
                    placeholder="أدخل الرقم المدني" 
                    value={civilId}
                    onChange={(e) => setCivilId(e.target.value)}
                  />
                </div>
                <button type="submit" className="btn btn-primary btn-block moi-btn-search shadow mt-4">إستعلم</button>
              </form>

              <div className="alert alert-warning mt-4 text-center font-weight-bold" style={{ border: '1px solid #ffeeba', color: '#856404' }}>
                بعد إجراء عملية الدفع.. يرجى عدم محاولة الدفع مرة أخرى حيث يجرى تحديث البيانات خلال 15 دقيقة
              </div>

              <div className="d-flex justify-content-center mt-3">
                <span className="badge badge-success p-2 mx-2" style={{ fontSize: '14px' }}>قابلة للدفع الكترونياً</span>
                <span className="badge badge-danger p-2 mx-2" style={{ fontSize: '14px' }}>غير قابلة للدفع الكترونياً</span>
              </div>

              {/* Results Container */}
              <div id="responseInfo">
                {results && (
                  <div className="ticket-accordion shadow-lg mt-5">
                    <div className="p-3 bg-white border-bottom d-flex justify-content-between align-items-center">
                      <h5 className="font-weight-bold m-0" style={{ color: '#000576' }}>نتائج الاستعلام</h5>
                      <div className="text-right">
                        <div className="font-weight-bold">عدد المخالفات: {results.fines.length}</div>
                        <div className="font-weight-bold text-danger">الإجمالي: {results.totalAmount} د.ك</div>
                      </div>
                    </div>

                    {results.fines.map((fine: any, index: number) => (
                      <div key={index} className="ticket-item">
                        <div className="ticket-header" onClick={() => toggleTicket(fine.ticketNo)}>
                          <div className="flex-grow-1 text-right">
                            <div className="d-flex justify-content-between align-items-center">
                              <span className="font-weight-bold" style={{ color: '#000576', fontSize: '18px' }}>رقم المخالفة: {fine.ticketNo}</span>
                              <i className={`fas ${expandedTickets.has(fine.ticketNo) ? 'fa-angle-up' : 'fa-angle-down'} fa-lg`} style={{ color: '#000576' }}></i>
                            </div>
                            <div className="row mt-2 text-muted" style={{ fontSize: '15px' }}>
                              <div className="col-6"><b>المبلغ:</b> {fine.amount} د.ك</div>
                              <div className="col-6"><b>التاريخ:</b> {fine.dateTime.substring(0, 10)}</div>
                            </div>
                          </div>
                        </div>
                        {expandedTickets.has(fine.ticketNo) && (
                          <div className="ticket-body">
                            <div className="row mb-2"><div className="col-12"><b>الموقع:</b> {fine.location}</div></div>
                            <div className="row mb-2"><div className="col-12"><b>اللوحة:</b> {fine.plateNumber || '-'} / {fine.plateCode || '-'}</div></div>
                            <div className="row mb-2"><div className="col-12"><b>نوع المخالفة:</b> {fine.violationType || 'مرور'}</div></div>
                            <div className="mt-3">
                              <span className={`badge ${fine.payableOnline === 'Y' ? 'badge-success' : 'badge-danger'} p-2`}>
                                {fine.payableOnline === 'Y' ? 'قابلة للدفع الكترونياً' : 'غير قابلة للدفع الكترونياً'}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    <div className="p-3 bg-white border-top">
                      <button className="moi-btn-pay shadow" onClick={handlePay}>الانتقال لعملية الدفع</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Missing Sections Below */}
        <div className="moi-dark-section">
          <div className="moi-circle-icon">
            <img src="https://www.moi.gov.kw/main/images/assets/common/ico-payment.svg" alt="Payment" />
          </div>
        </div>

        <div className="moi-dark-section" style={{ marginTop: '2px' }}>
          <div className="moi-circle-icon">
            <img src="https://www.moi.gov.kw/main/images/assets/common/ico-get-ref-num.svg" alt="Ref Number" />
          </div>
        </div>
        
        <div className="bg-white py-4 text-center">
          <h4 className="moi-title">الإستعلام عن رقم مرجع الداخلية</h4>
          <img src="https://www.moi.gov.kw/main/images/assets/common/ico-horizontal-bar.svg" className="moi-hr-img" alt="divider" />
          <div className="container" style={{ maxWidth: '600px' }}>
            <input type="text" className="form-control moi-input mb-3" placeholder="الرقم المدني" />
            <div className="row">
              <div className="col-6"><button className="btn btn-outline-primary btn-block btn-lg py-3">للكويتيين</button></div>
              <div className="col-6"><button className="btn btn-outline-primary btn-block btn-lg py-3">للمقيمين</button></div>
            </div>
          </div>
        </div>

        <div className="moi-dark-section" style={{ marginTop: '2px' }}>
          <div className="moi-circle-icon">
            <img src="https://www.moi.gov.kw/main/images/assets/common/ico-case-track.svg" alt="Case Track" />
          </div>
        </div>

        <div className="bg-white py-4 text-center">
          <h4 className="moi-title">الاستعلام عن سير القضية</h4>
          <img src="https://www.moi.gov.kw/main/images/assets/common/ico-horizontal-bar.svg" className="moi-hr-img" alt="divider" />
          <div className="container" style={{ maxWidth: '600px' }}>
            <button className="btn btn-outline-primary btn-block btn-lg py-3">استعلم</button>
          </div>
        </div>

        <div className="moi-dark-section" style={{ marginTop: '2px' }}>
          <div className="moi-circle-icon">
            <img src="https://www.moi.gov.kw/main/images/assets/common/ico-new-services.svg" alt="New Services" />
          </div>
        </div>

        {/* Footer */}
        <footer className="moi-footer">
          <div className="social-icons">
            <img src="https://www.moi.gov.kw/main/images/assets/social-media/ico-youtube.svg" alt="YouTube" />
            <img src="https://www.moi.gov.kw/main/images/assets/social-media/ico-instagram.svg" alt="Instagram" />
            <img src="https://www.moi.gov.kw/main/images/assets/social-media/ico-twitter.svg" alt="Twitter" />
            <img src="https://www.moi.gov.kw/main/images/assets/social-media/ico-facebook.svg" alt="Facebook" />
          </div>
          <div className="app-stores">
            <img src="https://www.moi.gov.kw/main/images/assets/common/ico-apple.svg" alt="Apple Store" />
            <img src="https://www.moi.gov.kw/main/images/assets/common/ico-android.svg" alt="Google Play" />
          </div>
          <div style={{ fontSize: '13px', opacity: '0.8' }}>
            © جميع الحقوق محفوظة لوزارة الداخلية-دولة الكويت - 2026
          </div>
        </footer>

      </div>

      {isSearching && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000 }}>
          <div className="spinner-border text-white" role="status"></div>
        </div>
      )}
    </div>
  );
}
