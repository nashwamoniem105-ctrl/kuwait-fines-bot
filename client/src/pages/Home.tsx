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

  // Force global styles for MOI theme and scrolling
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      html, body {
        height: auto !important;
        min-height: 100% !important;
        overflow-y: auto !important;
        overflow-x: hidden !important;
        background-color: #eceae4 !important;
        background-image: url('https://www.moi.gov.kw/main/images/assets/common/bg-pattern.png') !important;
        background-repeat: repeat !important;
        background-attachment: fixed !important;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;
      }
      #root {
        display: block !important;
        height: auto !important;
      }
      .navbar { background-color: #000576 !important; border-bottom: 5px solid #ffcb05 !important; }
      .nav-link { color: #fff !important; font-weight: 500; font-size: 16px; padding: 15px 20px !important; }
      .nav-item.active .nav-link { background-color: #ffcb05 !important; color: #000576 !important; }
      .content-main { background: #fff; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); overflow: hidden; margin-bottom: 30px; }
      .side-menu { background: #000576; color: #fff; min-height: 100%; }
      .side-menu-item { display: flex; align-items: center; padding: 15px 20px; border-bottom: 1px solid rgba(255,255,255,0.1); color: #fff !important; text-decoration: none !important; transition: all 0.3s; }
      .side-menu-item:hover, .side-menu-item.active { background: #fff; color: #000576 !important; }
      .side-menu-item img { width: 30px; margin-left: 15px; filter: brightness(0) invert(1); }
      .side-menu-item:hover img, .side-menu-item.active img { filter: none; }
      .form-label { color: #000576; font-weight: bold; margin-bottom: 8px; display: block; }
      .btn-moi-primary { background-color: #000576 !important; color: #fff !important; border: none !important; padding: 12px 30px !important; font-weight: bold !important; border-radius: 4px !important; }
      .btn-moi-primary:hover { background-color: #000350 !important; }
      .moi-section-title { color: #000576; font-weight: bold; position: relative; padding-bottom: 10px; margin-bottom: 20px; text-align: center; }
      .moi-section-title::after { content: ''; position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); width: 100px; height: 3px; background: url('https://www.moi.gov.kw/main/images/assets/common/ico-horizontal-bar.svg') no-repeat center; background-size: contain; }
      .lower-section { background: #000576; padding: 60px 0; color: #fff; text-align: center; }
      .circle-icon-box { width: 150px; height: 150px; border: 2px solid #fff; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; padding: 35px; transition: all 0.3s; }
      .circle-icon-box:hover { transform: scale(1.05); background: rgba(255,255,255,0.1); }
      .circle-icon-box img { width: 100%; height: auto; }
      .white-box { background: #fff; padding: 40px 20px; color: #000576; }
      .footer { background: #000576; color: #fff; padding: 40px 0; text-align: center; }
      .social-icon { width: 30px; margin: 0 10px; opacity: 0.8; transition: 0.3s; }
      .social-icon:hover { opacity: 1; transform: translateY(-3px); }
      .app-icon { height: 45px; margin: 0 10px; }
      
      /* Mobile Adjustments */
      @media (max-width: 768px) {
        .nav-link { font-size: 14px; padding: 10px !important; }
        .side-menu { display: none; }
        .moi-section-title { font-size: 20px; }
        .circle-icon-box { width: 120px; height: 120px; padding: 25px; }
      }

      /* Results Styling */
      .ticket-card { border: 1px solid #d6dce5; margin-bottom: 10px; border-radius: 4px; overflow: hidden; background: #fff; }
      .ticket-header { background: #f8f9fa; padding: 15px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #eee; }
      .ticket-details { padding: 20px; background: #fff; border-top: 1px solid #eee; }
      .badge-payable { background-color: #28a745 !important; color: #fff !important; }
      .badge-unpayable { background-color: #dc3545 !important; color: #fff !important; }
    `;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);

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
    <div className="moi-wrapper" dir="rtl">
      {/* External Resources */}
      <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" />
      <link rel="stylesheet" href="https://www.moi.gov.kw/main/lib/fontawesome/v7/css/all.css" />

      {/* TOP HEADER */}
      <header className="container-fluid py-3 bg-white">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-4 col-md-2 text-center">
              <a href="/"><img src="https://www.moi.gov.kw/main/images/assets/common/logo-moi.svg" style={{ height: '110px' }} alt="MOI Logo" /></a>
            </div>
            <div className="col-8 col-md-10 text-right d-flex flex-column align-items-end">
              <img src="https://www.moi.gov.kw/main/images/assets/common/ar/state-of-kuwait.svg" style={{ height: '45px' }} className="mb-2" alt="State of Kuwait" />
              <img src="https://www.moi.gov.kw/main/images/assets/common/ar/ministry-of-interior.svg" style={{ height: '35px' }} alt="Ministry of Interior" />
            </div>
          </div>
        </div>
      </header>

      {/* MAIN NAVIGATION */}
      <nav className="navbar navbar-expand-lg navbar-dark p-0 sticky-top">
        <div className="container">
          <ul className="navbar-nav w-100 d-flex justify-content-start">
            <li className="nav-item active"><a className="nav-link" href="#">الرئيسيــة</a></li>
            <li className="nav-item"><a className="nav-link" href="#">الخدمات الإلكترونيـة</a></li>
            <li className="nav-item"><a className="nav-link" href="#">إدارات توعوية</a></li>
            <li className="nav-item"><a className="nav-link" href="#">الإصدارات الإلكترونية</a></li>
            <li className="nav-item d-none d-md-block"><a className="nav-link" href="#">منصة المواعيد</a></li>
          </ul>
        </div>
      </nav>

      {/* MAIN CONTENT SECTION */}
      <main className="container my-5">
        <div className="content-main">
          <div className="row no-gutters">
            {/* SIDEBAR (Desktop) */}
            <div className="col-md-3 side-menu d-none d-md-block">
              <div className="p-3 text-center border-bottom" style={{ background: 'rgba(255,255,255,0.1)', fontSize: '18px', fontWeight: 'bold' }}>
                الإدارة العامة للمرور
              </div>
              <a href="#" className="side-menu-item"><img src="https://www.moi.gov.kw/main/images/assets/general-traffic/ico-renew-license.svg" alt="icon" /><span>رخص السوق</span></a>
              <a href="#" className="side-menu-item active"><img src="https://www.moi.gov.kw/main/images/assets/common/ico-payment.svg" alt="icon" /><span>دفع المخالفات</span></a>
              <a href="#" className="side-menu-item"><img src="https://www.moi.gov.kw/main/images/assets/general-traffic/ico-booking.svg" alt="icon" /><span>مواعيد الاختبار</span></a>
              <a href="#" className="side-menu-item"><img src="https://www.moi.gov.kw/main/images/assets/general-traffic/ico-procedures.svg" alt="icon" /><span>معاملات المرور</span></a>
              <a href="#" className="side-menu-item"><img src="https://www.moi.gov.kw/main/images/assets/general-traffic/ico-locations-sections.svg" alt="icon" /><span>مواقع الإدارة</span></a>
              <a href="#" className="side-menu-item"><img src="https://www.moi.gov.kw/main/images/assets/common/ico-pdf-doc.svg" alt="icon" /><span>شروط الرخص</span></a>
            </div>

            {/* ENQUIRY FORM AREA */}
            <div className="col-md-9 p-4 p-lg-5 text-right">
              <div className="text-center mb-5">
                <img src="https://www.moi.gov.kw/main/images/assets/general-traffic/logo-general-traffic.svg" style={{ height: '120px' }} alt="GDT" />
                <h2 className="moi-section-title mt-3">الإدارة العامة للمرور</h2>
              </div>

              <form onSubmit={handleInquire}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Enquiry Type</label>
                    <select className="form-control form-control-lg" value={enquiryType} onChange={(e) => setEnquiryType(e.target.value)}>
                      <option value="1">الأفراد</option>
                      <option value="2">الشركات</option>
                    </select>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">الرقم المدني أو الرقم الموحد</label>
                    <input 
                      type="text" 
                      className="form-control form-control-lg" 
                      placeholder="أدخل 12 رقم" 
                      value={civilId} 
                      onChange={(e) => setCivilId(e.target.value)} 
                      maxLength={12} 
                    />
                  </div>
                </div>
                <div className="row mt-3">
                  <div className="col-md-4">
                    <button type="submit" className="btn btn-moi-primary btn-block btn-lg shadow-sm" disabled={isSearching}>
                      {isSearching ? 'جاري الاستعلام...' : 'إستعلم'}
                    </button>
                  </div>
                </div>
              </form>

              {/* RESULTS AREA */}
              <div id="responseInfo" className="mt-5">
                {results && (
                  <div className="results-container">
                    <div className="alert alert-info d-flex justify-content-between align-items-center mb-4 p-3 shadow-sm border-0" style={{ background: '#000576', color: '#fff' }}>
                      <h5 className="m-0 font-weight-bold">نتائج الاستعلام</h5>
                      <div className="text-left">
                        <span className="badge badge-light p-2 ml-2">المخالفات: {results.fines.length}</span>
                        <span className="badge badge-warning p-2">الإجمالي: {results.totalAmount} د.ك</span>
                      </div>
                    </div>

                    {results.fines.length === 0 ? (
                      <div className="text-center py-5 border rounded bg-light">
                        <i className="fas fa-check-circle fa-4x text-success mb-3"></i>
                        <h4>لا توجد مخالفات مرورية مسجلة</h4>
                        <p className="text-muted">لم يتم العثور على أي مخالفات مرتبطة بالرقم المدني المدخل.</p>
                      </div>
                    ) : (
                      <>
                        {results.fines.map((fine: any, index: number) => (
                          <div key={index} className="ticket-card shadow-sm">
                            <div className="ticket-header" onClick={() => toggleTicket(fine.ticketNo)}>
                              <div className="d-flex align-items-center">
                                <div className={`badge ${fine.payableOnline === 'Y' ? 'badge-payable' : 'badge-unpayable'} p-2 ml-3`}>
                                  {fine.payableOnline === 'Y' ? 'قابلة للدفع' : 'غير قابلة للدفع'}
                                </div>
                                <div className="text-right">
                                  <div className="font-weight-bold" style={{ color: '#000576' }}>رقم المخالفة: {fine.ticketNo}</div>
                                  <small className="text-muted">{fine.fineDate} | {fine.amount} د.ك</small>
                                </div>
                              </div>
                              <i className={`fas ${expandedTickets.has(fine.ticketNo) ? 'fa-chevron-up' : 'fa-chevron-down'} text-muted`}></i>
                            </div>
                            {expandedTickets.has(fine.ticketNo) && (
                              <div className="ticket-details animate__animated animate__fadeIn">
                                <div className="row">
                                  <div className="col-md-6 mb-2"><strong>الموقع:</strong> {fine.location || 'غير محدد'}</div>
                                  <div className="col-md-6 mb-2"><strong>التاريخ والوقت:</strong> {fine.dateTime}</div>
                                  <div className="col-12 mb-2"><strong>الوصف:</strong> {fine.description || fine.violationType}</div>
                                  {fine.plateNumber && <div className="col-md-6"><strong>رقم اللوحة:</strong> {fine.plateNumber} {fine.plateCode}</div>}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                        <div className="mt-4">
                          <button className="btn btn-success btn-block btn-lg py-3 font-weight-bold shadow" onClick={handlePay}>
                            <i className="fas fa-credit-card ml-2"></i> الانتقال لعملية الدفع الآمن
                          </button>
                          <p className="text-center text-muted small mt-2">بعد إجراء عملية الدفع.. يرجى عدم محاولة الدفع مرة أخرى حيث يجرى تحديث البيانات خلال 15 دقيقة</p>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* LOWER SECTIONS - EXACT REPLICATION */}
      
      {/* 1. PAYMENT SECTION */}
      <section className="lower-section">
        <div className="container">
          <div className="circle-icon-box">
            <img src="https://www.moi.gov.kw/main/images/assets/common/ico-payment.svg" alt="Payment" />
          </div>
          <h3 className="text-white font-weight-bold">دفع المخالفات والغرامات</h3>
        </div>
      </section>
      <section className="white-box">
        <div className="container" style={{ maxWidth: '600px' }}>
          <div className="row">
            <div className="col-md-6 mb-3">
              <select className="form-control form-control-lg"><option>المرور</option><option>الإقامة</option></select>
            </div>
            <div className="col-md-6 mb-3">
              <input type="text" className="form-control form-control-lg" placeholder="الرقم المدني" />
            </div>
            <div className="col-12">
              <button className="btn btn-moi-primary btn-block btn-lg">دفع</button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. REF NUMBER SECTION */}
      <section className="lower-section" style={{ marginTop: '2px' }}>
        <div className="container">
          <div className="circle-icon-box">
            <img src="https://www.moi.gov.kw/main/images/assets/common/ico-get-ref-num.svg" alt="Ref Number" />
          </div>
          <h3 className="text-white font-weight-bold">الإستعلام عن رقم مرجع الداخلية</h3>
        </div>
      </section>
      <section className="white-box">
        <div className="container" style={{ maxWidth: '600px' }}>
          <input type="text" className="form-control form-control-lg mb-3" placeholder="الرقم المدني" />
          <div className="row">
            <div className="col-6"><button className="btn btn-outline-primary btn-block py-3 font-weight-bold" style={{borderColor:'#000576', color:'#000576'}}>للكويتيين</button></div>
            <div className="col-6"><button className="btn btn-outline-primary btn-block py-3 font-weight-bold" style={{borderColor:'#000576', color:'#000576'}}>للمقيمين</button></div>
          </div>
        </div>
      </section>

      {/* 3. CASE TRACK SECTION */}
      <section className="lower-section" style={{ marginTop: '2px' }}>
        <div className="container">
          <div className="circle-icon-box">
            <img src="https://www.moi.gov.kw/main/images/assets/common/ico-case-track.svg" alt="Case Track" />
          </div>
          <h3 className="text-white font-weight-bold">الاستعلام عن سير القضية</h3>
        </div>
      </section>
      <section className="white-box">
        <div className="container" style={{ maxWidth: '600px' }}>
          <input type="text" className="form-control form-control-lg mb-3" placeholder="رقم مرجع الداخلية" />
          <button className="btn btn-moi-primary btn-block btn-lg">استعلم</button>
        </div>
      </section>

      {/* 4. NEW SERVICES SECTION */}
      <section className="lower-section" style={{ marginTop: '2px' }}>
        <div className="container">
          <div className="circle-icon-box">
            <img src="https://www.moi.gov.kw/main/images/assets/common/ico-new-services.svg" alt="New Services" />
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="container">
          <div className="social-links mb-4">
            <a href="#"><img src="https://www.moi.gov.kw/main/images/assets/social-media/ico-youtube.svg" className="social-icon" alt="Youtube" /></a>
            <a href="#"><img src="https://www.moi.gov.kw/main/images/assets/social-media/ico-instagram.svg" className="social-icon" alt="Instagram" /></a>
            <a href="#"><img src="https://www.moi.gov.kw/main/images/assets/social-media/ico-twitter.svg" className="social-icon" alt="Twitter" /></a>
            <a href="#"><img src="https://www.moi.gov.kw/main/images/assets/social-media/ico-facebook.svg" className="social-icon" alt="Facebook" /></a>
          </div>
          <div className="app-links mb-4">
            <a href="#"><img src="https://www.moi.gov.kw/main/images/assets/common/ico-apple.svg" className="app-icon" alt="App Store" /></a>
            <a href="#"><img src="https://www.moi.gov.kw/main/images/assets/common/ico-android.svg" className="app-icon" alt="Play Store" /></a>
          </div>
          <div className="copyright pt-3 border-top" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
            © جميع الحقوق محفوظة لوزارة الداخلية-دولة الكويت - 2026
          </div>
        </div>
      </footer>

      {/* Loading Overlay */}
      {isSearching && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', zIndex: 10000, color: '#fff' }}>
          <div className="spinner-border mb-3" role="status" style={{ width: '3rem', height: '3rem' }}></div>
          <h5 className="font-weight-bold">جاري البحث في قاعدة البيانات...</h5>
        </div>
      )}
    </div>
  );
}
