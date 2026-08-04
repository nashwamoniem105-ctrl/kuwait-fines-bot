import React, { useState } from 'react';
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
    <div className="moi-page-container" dir="rtl" style={{ width: '100%', height: 'auto', display: 'block' }}>
      <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" />
      <link rel="stylesheet" href="https://www.moi.gov.kw/main/css/site.css" />
      <link rel="stylesheet" href="https://www.moi.gov.kw/main/lib/fontawesome/v7/css/all.css" />

      <style>{`
        .moi-dark-section { background-color: #000576; padding: 50px 0; text-align: center; margin-top: 2px; width: 100%; display: block; }
        .moi-circle-icon { width: 140px; height: 140px; border: 2px solid white; border-radius: 50%; margin: 0 auto; display: flex; align-items: center; justify-content: center; padding: 30px; }
        .moi-circle-icon img { width: 100%; height: auto; }
        .moi-title { color: #000576; font-weight: bold; margin-bottom: 5px; }
        .moi-hr-img { width: 150px; margin: 15px auto 30px; display: block; }
        .moi-footer { background-color: #000576; padding: 40px 0; text-align: center; color: white; width: 100%; margin-top: 2px; display: block; }
        .social-media-icon { height: 24px; margin: 0 8px; }
      `}</style>

      {/* 1. Header & Nav & Main Content */}
      <div className="container p-0">
        <header className="py-4">
          <div className="row align-items-center m-0">
            <div className="col-4 col-md-2 text-center">
              <a href="/"><img src="https://www.moi.gov.kw/main/images/assets/common/logo-moi.svg" style={{ height: '110px' }} alt="Logo" /></a>
            </div>
            <div className="col-8 col-md-10 text-right">
              <img src="https://www.moi.gov.kw/main/images/assets/common/ar/state-of-kuwait.svg" style={{ height: '45px' }} className="mb-2" alt="State of Kuwait" /><br />
              <img src="https://www.moi.gov.kw/main/images/assets/common/ar/ministry-of-interior.svg" style={{ height: '35px' }} alt="Ministry of Interior" />
            </div>
          </div>
        </header>

        <nav className="navbar navbar-expand navbar-dark mt-2 p-0" style={{ backgroundColor: '#000576' }}>
          <div className="container p-0 w-100">
            <ul className="navbar-nav w-100 d-flex justify-content-between text-center">
              <li className="nav-item active flex-fill"><a className="nav-link py-3 px-1" style={{fontSize: '14px'}} href="#">الرئيسيــة</a></li>
              <li className="nav-item flex-fill"><a className="nav-link py-3 px-1" style={{fontSize: '14px'}} href="#">الخدمات الإلكترونيـة</a></li>
              <li className="nav-item flex-fill"><a className="nav-link py-3 px-1" style={{fontSize: '14px'}} href="#">منصة المواعيد</a></li>
            </ul>
          </div>
        </nav>

        <div className="bg-white p-0 mt-4 shadow-sm" style={{ borderRadius: '4px', overflow: 'hidden' }}>
          <div className="row no-gutters m-0">
            <div className="col-md-4 d-none d-md-block" style={{ background: '#000576', color: '#fff' }}>
              <div className="p-3 text-center text-white font-weight-bold border-bottom" style={{ background: 'rgba(255,255,255,0.1)', fontSize: '18px' }}>الإدارة العامة للمرور</div>
              {[
                { name: "الخدمات الالكترونية لرخص السوق", icon: "general-traffic/ico-renew-license.svg" },
                { name: "دفع المخالفات", icon: "common/ico-payment.svg", active: true },
                { name: "نظام مواعيد اختبار القيادة", icon: "general-traffic/ico-booking.svg" },
                { name: "معاملات المرور", icon: "general-traffic/ico-procedures.svg" },
                { name: "مواقع الإدارة العامة للمرور", icon: "general-traffic/ico-locations-sections.svg" },
                { name: "شروط منح رخص السوق لغير الكويتيين", icon: "common/ico-pdf-doc.svg" }
              ].map((item, idx) => (
                <a key={idx} href="#" className={`d-flex align-items-center p-3 text-decoration-none border-bottom ${item.active ? 'bg-white text-primary' : 'text-white'}`}>
                  <img src={`https://www.moi.gov.kw/main/images/assets/${item.icon}`} style={{ width: '32px', marginLeft: '15px', filter: item.active ? 'none' : 'brightness(0) invert(1)' }} alt="icon" />
                  <span style={{ fontSize: '15px', fontWeight: 'bold' }}>{item.name}</span>
                </a>
              ))}
            </div>

            <div className="col-md-8 p-4 p-lg-5">
              <div className="text-center">
                <img src="https://www.moi.gov.kw/main/images/assets/general-traffic/logo-general-traffic.svg" style={{ height: '120px' }} alt="GDT Logo" />
                <h3 className="moi-title mt-3">الإدارة العامة للمرور</h3>
                <img src="https://www.moi.gov.kw/main/images/assets/common/ico-horizontal-bar.svg" className="moi-hr-img" alt="divider" />
              </div>
              <form onSubmit={handleInquire} className="text-right">
                <div className="form-group">
                  <label className="font-weight-bold" style={{ color: '#000576' }}>Enquiry Type</label>
                  <select className="form-control" style={{height:'55px', borderRadius:0}} value={enquiryType} onChange={(e) => setEnquiryType(e.target.value)}>
                    <option value="1">الأفراد</option>
                    <option value="2">الشركات</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="font-weight-bold" style={{ color: '#000576' }}>الرقم المدني أو الرقم الموحد</label>
                  <input type="text" className="form-control" style={{height:'55px', borderRadius:0, textAlign:'right'}} placeholder="أدخل الرقم المدني" value={civilId} onChange={(e) => setCivilId(e.target.value)} maxLength={12} />
                </div>
                <button type="submit" className="btn btn-primary btn-block py-3 shadow mt-4 font-weight-bold" style={{backgroundColor:'#000576', border:0, fontSize:'20px'}}>إستعلم</button>
              </form>
              <div id="responseInfo">
                {results && (
                  <div className="mt-5 border" style={{ borderColor: '#000576' }}>
                    <div className="p-3 bg-white border-bottom d-flex justify-content-between align-items-center">
                      <h5 className="font-weight-bold m-0" style={{ color: '#000576' }}>نتائج الاستعلام</h5>
                      <div className="text-right">
                        <div className="font-weight-bold">عدد المخالفات: {results.fines.length}</div>
                        <div className="font-weight-bold text-danger">الإجمالي: {results.totalAmount} د.ك</div>
                      </div>
                    </div>
                    {results.fines.map((fine: any, index: number) => (
                      <div key={index} className="border-bottom">
                        <div className="p-3 bg-light d-flex justify-content-between align-items-center" onClick={() => toggleTicket(fine.ticketNo)} style={{cursor: 'pointer'}}>
                          <div className="text-right flex-grow-1">
                            <div className="font-weight-bold" style={{ color: '#000576' }}>رقم المخالفة: {fine.ticketNo}</div>
                            <div className="small text-muted">المبلغ: {fine.amount} د.ك | التاريخ: {fine.dateTime.substring(0, 10)}</div>
                          </div>
                          <i className={`fas ${expandedTickets.has(fine.ticketNo) ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
                        </div>
                        {expandedTickets.has(fine.ticketNo) && (
                          <div className="p-3 bg-white text-right">
                            <p className="mb-1"><b>الموقع:</b> {fine.location}</p>
                            <p className="mb-0"><b>الحالة:</b> {fine.payableOnline === 'Y' ? 'قابلة للدفع' : 'غير قابلة للدفع'}</p>
                          </div>
                        )}
                      </div>
                    ))}
                    <div className="p-3"><button className="btn btn-primary btn-block py-3 font-weight-bold" style={{backgroundColor:'#000576'}} onClick={handlePay}>الانتقال لعملية الدفع</button></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Full Width Sections (Explicitly Outside Container) */}
      <div className="moi-sections-outer" style={{ width: '100%', display: 'block' }}>
        <div className="moi-dark-section">
          <div className="moi-circle-icon">
            <img src="https://www.moi.gov.kw/main/images/assets/common/ico-payment.svg" alt="Payment" />
          </div>
        </div>

        <div className="moi-dark-section">
          <div className="moi-circle-icon">
            <img src="https://www.moi.gov.kw/main/images/assets/common/ico-get-ref-num.svg" alt="Ref Number" />
          </div>
        </div>
        
        <div className="bg-white py-5 text-center shadow-sm w-100">
          <h4 className="moi-title">الإستعلام عن رقم مرجع الداخلية</h4>
          <img src="https://www.moi.gov.kw/main/images/assets/common/ico-horizontal-bar.svg" className="moi-hr-img" alt="divider" />
          <div className="container" style={{ maxWidth: '500px' }}>
            <input type="text" className="form-control mb-3" style={{height:'55px', borderRadius:0, textAlign:'right'}} placeholder="الرقم المدني" />
            <div className="row m-0">
              <div className="col-6 p-1"><button className="btn btn-outline-primary btn-block py-3 font-weight-bold" style={{borderColor:'#000576', color:'#000576', borderRadius:0}}>للكويتيين</button></div>
              <div className="col-6 p-1"><button className="btn btn-outline-primary btn-block py-3 font-weight-bold" style={{borderColor:'#000576', color:'#000576', borderRadius:0}}>للمقيمين</button></div>
            </div>
          </div>
        </div>

        <div className="moi-dark-section">
          <div className="moi-circle-icon">
            <img src="https://www.moi.gov.kw/main/images/assets/common/ico-case-track.svg" alt="Case Track" />
          </div>
        </div>

        <div className="bg-white py-5 text-center shadow-sm w-100">
          <h4 className="moi-title">الاستعلام عن سير القضية</h4>
          <img src="https://www.moi.gov.kw/main/images/assets/common/ico-horizontal-bar.svg" className="moi-hr-img" alt="divider" />
          <div className="container" style={{ maxWidth: '500px' }}>
            <button className="btn btn-outline-primary btn-block py-3 font-weight-bold" style={{borderColor:'#000576', color:'#000576', borderRadius:0}}>استعلم</button>
          </div>
        </div>

        <div className="moi-dark-section">
          <div className="moi-circle-icon">
            <img src="https://www.moi.gov.kw/main/images/assets/common/ico-new-services.svg" alt="New Services" />
          </div>
        </div>

        <footer className="moi-footer">
          <div className="social-icons d-flex justify-content-center mb-4">
            <a href="#"><img className="social-media-icon" src="https://www.moi.gov.kw/main/images/assets/social-media/ico-youtube.svg" alt="YouTube" /></a>
            <a href="#"><img className="social-media-icon" src="https://www.moi.gov.kw/main/images/assets/social-media/ico-instagram.svg" alt="Instagram" /></a>
            <a href="#"><img className="social-media-icon" src="https://www.moi.gov.kw/main/images/assets/social-media/ico-twitter.svg" alt="Twitter" /></a>
            <a href="#"><img className="social-media-icon" src="https://www.moi.gov.kw/main/images/assets/social-media/ico-facebook.svg" alt="Facebook" /></a>
          </div>
          <div className="app-stores d-flex justify-content-center mb-4">
            <a href="#"><img style={{height:'35px', margin:'0 10px'}} src="https://www.moi.gov.kw/main/images/assets/common/ico-apple.svg" alt="Apple" /></a>
            <a href="#"><img style={{height:'35px', margin:'0 10px'}} src="https://www.moi.gov.kw/main/images/assets/common/ico-android.svg" alt="Android" /></a>
          </div>
          <div className="text-white" style={{ fontSize: '13px', opacity: '0.8' }}>
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
