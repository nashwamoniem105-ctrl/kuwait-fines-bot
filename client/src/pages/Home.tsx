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

  const toggleTicket = (ticketNo: string) => {
    const newSet = new Set(expandedTickets);
    if (newSet.has(ticketNo)) newSet.delete(ticketNo);
    else newSet.add(ticketNo);
    setExpandedTickets(newSet);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const input = document.getElementById('civilId') as HTMLInputElement;
      const select = document.getElementById('enquiryType') as HTMLSelectElement;
      const btn = document.getElementById('btnEnquire');

      if (input && !input.dataset.bound) {
        input.oninput = (e) => setCivilId((e.target as HTMLInputElement).value);
        input.dataset.bound = "true";
      }
      if (select && !select.dataset.bound) {
        select.onchange = (e) => setEnquiryType((e.target as HTMLSelectElement).value);
        select.dataset.bound = "true";
      }
      if (btn && !btn.dataset.bound) {
        btn.onclick = (e) => {
          e.preventDefault();
          handleInquire();
        };
        btn.dataset.bound = "true";
      }
    }, 500);

    return () => clearInterval(interval);
  }, [civilId, enquiryType, results]);

  return (
    <div className="moi-theme" dir="rtl" style={{ backgroundColor: '#e9e6de', minHeight: '100vh', height: 'auto', overflow: 'visible' }}>
      <style>{`
        /* Force visibility and height expansion */
        html, body, #root, .moi-theme { height: auto !important; min-height: 100vh !important; overflow: visible !important; }
        .container-fluid { display: block !important; width: 100% !important; }
        
        /* Results Styling */
        .results-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); display: flex; justify-content: center; align-items: flex-start; z-index: 10000; padding: 20px; overflow-y: auto; }
        .results-container-scroll { background: #e9e6de; padding: 0; border-radius: 0; width: 100%; max-width: 900px; border: 4px solid #000576; margin-top: 20px; margin-bottom: 50px; }
        .loading-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 10001; }
        
        /* MOI Style Icons */
        .social-media-icon { height: 1.8em; margin: 0 8px; }
        .circular-icon-container { background-color: #000576; width: 160px; height: 160px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 4px 15px rgba(0,0,0,0.2); margin: 20px auto; transition: transform 0.3s; }
        .circular-icon-container:hover { transform: scale(1.05); }
        .circular-icon-container img { width: 80px; filter: brightness(0) invert(1); }
        
        /* Accordion Results */
        .ticket-card { border-top: 5px solid #000576; margin-bottom: 10px; background: white; border-radius: 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .ticket-header { background: #eceae4 !important; padding: 12px; cursor: pointer; border-bottom: 1px solid #d6dce5; }
        .ticket-body { padding: 20px; border-top: 2px solid #d6dce5; background: white; text-align: right; }
        .moi-btn-pay { background-color: #000576; color: white; border: none; padding: 18px; font-weight: bold; width: 100%; font-size: 20px; border-radius: 0; }
        
        /* Section Title Line */
        .section-divider { height: 2px; background-color: #333; width: 40%; }
        .section-square { width: 15px; height: 15px; background-color: black; margin: 0 15px; }
      `}</style>

      <div dangerouslySetInnerHTML={{ __html: `
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css">
        <link rel="stylesheet" href="https://www.moi.gov.kw/main/css/site.css?v=go_4IccMhw1NChPOSH_W7AbpThLoN7-zMHFe4trNRE0">
        <link rel="stylesheet" href="https://www.moi.gov.kw/main/lib/fontawesome/v7/css/all.css">
        
        <div class="container-fluid p-0" style="background-image: url('https://www.moi.gov.kw/main/images/assets/common/bg-pattern.png'); background-repeat: repeat; display: block;">
          <div class="container pb-5">
            <header>
              <div class="row pt-3">
                <div class="col-4 col-md-2 text-center">
                  <a class="navbar-brand m-0" href="#"><img src="https://www.moi.gov.kw/main/images/assets/common/ar/logo-moi.svg" style="height: 120px;"></a>
                </div>
                <div class="col-8 col-md-10 align-self-center text-right">
                  <div class="row"><div class="col text-right"><img src="https://www.moi.gov.kw/main/images/assets/common/ar/state-of-kuwait.svg" style="height: 45px;"></div></div>
                  <div class="row mt-2"><div class="col text-right"><img src="https://www.moi.gov.kw/main/images/assets/common/ar/ministry-of-interior.svg" style="height: 35px;"></div></div>
                </div>
              </div>
            </header>

            <nav class="navbar navbar-expand-lg navbar-dark border-bottom box-shadow mt-3" style="background-color: #000576;">
              <div class="container">
                <div class="navbar-collapse collapse show">
                  <ul class="navbar-nav ml-auto">
                    <li class="nav-item active"><a class="nav-link" href="#">الرئيسيــة</a></li>
                    <li class="nav-item"><a class="nav-link" href="#">الخدمات الإلكترونيـة</a></li>
                    <li class="nav-item"><a class="nav-link" href="#">إدارات توعوية</a></li>
                    <li class="nav-item"><a class="nav-link" href="#">الإصدارات الإلكترونية</a></li>
                    <li class="nav-item"><a class="nav-link" href="#">التحقق من الوثائق</a></li>
                    <li class="nav-item"><a class="nav-link" href="#">يهمنا رايك</a></li>
                    <li class="nav-item"><a class="nav-link" href="#">أرقام الطوارئ</a></li>
                    <li class="nav-item"><a class="nav-link" href="#">منصة المواعيد</a></li>
                  </ul>
                </div>
              </div>
            </nav>

            <div class="row mt-4">
              <!-- Sidebar -->
              <div class="col-lg-3 d-none d-lg-block">
                <div class="list-group shadow-sm">
                  <div class="p-3 text-center text-white font-weight-bold" style="background-color: #000576;">الإدارة العامة للمرور</div>
                  <a href="#" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center">الخدمات الالكترونية لرخص السوق <img src="https://www.moi.gov.kw/main/images/assets/general-traffic/ico-renew-license.svg" style="width: 24px;"></a>
                  <a href="#" class="list-group-item list-group-item-action active d-flex justify-content-between align-items-center" style="background-color: #000576; border-color: #000576;">دفع المخالفات <img src="https://www.moi.gov.kw/main/images/assets/common/ico-payment.svg" style="width: 24px; filter: brightness(0) invert(1);"></a>
                  <a href="#" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center">نظام مواعيد اختبار القيادة <img src="https://www.moi.gov.kw/main/images/assets/general-traffic/ico-booking.svg" style="width: 24px;"></a>
                  <a href="#" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center">معاملات المرور <img src="https://www.moi.gov.kw/main/images/assets/general-traffic/ico-procedures.svg" style="width: 24px;"></a>
                  <a href="#" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center">مواقع الإدارة العامة للمرور <img src="https://www.moi.gov.kw/main/images/assets/general-traffic/ico-locations-sections.svg" style="width: 24px;"></a>
                  <a href="#" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center">شروط منح رخص السوق لغير الكويتيين <img src="https://www.moi.gov.kw/main/images/assets/common/ico-pdf-doc.svg" style="width: 24px;"></a>
                </div>
              </div>

              <!-- Main Content -->
              <div class="col-lg-9">
                <div class="card p-4 shadow-sm" style="border-radius: 0; border: none; background: rgba(255,255,255,0.9);">
                  <div class="text-center mb-4">
                    <img src="https://www.moi.gov.kw/main/images/assets/general-traffic/logo-general-traffic.svg" style="height: 110px;">
                    <h3 class="mt-3" style="color: #000576; font-weight: bold;">الإدارة العامة للمرور</h3>
                    <img src="https://www.moi.gov.kw/main/images/assets/common/ico-horizontal-bar.svg" class="mt-2" style="width: 60%;">
                  </div>

                  <div class="form-group text-right">
                    <label class="font-weight-bold" style="color: #000576;">Enquiry Type</label>
                    <select id="enquiryType" class="form-control">
                      <option value="1">الأفراد</option>
                      <option value="2">الشركات</option>
                    </select>
                  </div>

                  <div class="form-group text-right">
                    <label class="font-weight-bold" style="color: #000576;">الرقم المدني أو الرقم الموحد</label>
                    <input type="text" id="civilId" class="form-control text-right" placeholder="أدخل الرقم المدني" style="height: 50px; font-size: 18px;">
                  </div>

                  <button id="btnEnquire" class="btn btn-primary btn-block font-weight-bold mt-4 shadow" style="background-color: #000576; border: none; height: 60px; font-size: 22px;">إستعلم</button>
                  
                  <p class="text-center mt-4 font-weight-bold" style="color: #333; font-size: 16px;">بعد إجراء عملية الدفع.. يرجى عدم محاولة الدفع مرة أخرى حيث يجرى تحديث البيانات خلال 15 دقيقة</p>

                  <div class="d-flex justify-content-center mt-3">
                    <span class="badge badge-success p-2 mx-2" style="font-size: 14px;">قابلة للدفع الكترونياً</span>
                    <span class="badge badge-danger p-2 mx-2" style="font-size: 14px;">غير قابلة للدفع الكترونياً</span>
                  </div>
                </div>

                <!-- Three Circular Icons -->
                <div class="row mt-5 text-center">
                  <div class="col-md-4 mb-4">
                    <div class="circular-icon-container"><img src="https://www.moi.gov.kw/main/images/assets/common/ico-payment.svg"></div>
                  </div>
                  <div class="col-md-4 mb-4">
                    <div class="circular-icon-container"><img src="https://www.moi.gov.kw/main/images/assets/common/ico-case-track.svg"></div>
                  </div>
                  <div class="col-md-4 mb-4">
                    <div class="circular-icon-container"><img src="https://www.moi.gov.kw/main/images/assets/common/ico-get-ref-num.svg"></div>
                  </div>
                </div>

                <!-- Reference Number Inquiry Section -->
                <div class="col-12 text-center mt-3">
                  <h4 class="font-weight-bold" style="color: #000576; font-size: 24px;">الإستعلام عن رقم مرجع الداخلية</h4>
                  <div class="d-flex justify-content-center align-items-center mt-3 mb-4">
                    <div class="section-divider"></div>
                    <div class="section-square"></div>
                    <div class="section-divider"></div>
                  </div>
                  
                  <div class="card p-4 mx-auto shadow-sm" style="max-width: 550px; background: white; border: 1px solid #d6dce5; border-radius: 0;">
                    <div class="form-group">
                      <input type="text" class="form-control text-right" placeholder="الرقم المدني" style="height: 55px; font-size: 18px;">
                    </div>
                    <button class="btn btn-light border-dark w-100 font-weight-bold mb-3" style="height: 50px; background: #f8f9fa; color: #000576; font-size: 18px;">للكويتين</button>
                    <button class="btn btn-light border-dark w-100 font-weight-bold" style="height: 50px; background: #f8f9fa; color: #000576; font-size: 18px;">للمقيمين</button>
                  </div>
                </div>

                <!-- New Services Banner -->
                <div class="col-12 mt-5 p-0 shadow">
                  <div style="background-color: #000576; padding: 20px; text-align: center; color: white;">
                    <h3 class="font-weight-bold mb-0">أحدث الخدمات <span style="font-size: 14px; font-weight: normal; border: 1px solid white; padding: 2px 6px; margin-left: 10px; vertical-align: middle;">New Services</span></h3>
                  </div>
                </div>
              </div>
            </div>

            <!-- Footer -->
            <footer class="mt-5 text-center text-white shadow-lg" style="background-color: #000576; border-radius: 0; padding: 40px 20px;">
              <div class="mb-4">
                <a href="#"><img src="https://www.moi.gov.kw/main/images/assets/social-media/ico-youtube.svg" class="social-media-icon"></a>
                <a href="#"><img src="https://www.moi.gov.kw/main/images/assets/social-media/ico-instagram.svg" class="social-media-icon"></a>
                <a href="#"><img src="https://www.moi.gov.kw/main/images/assets/social-media/ico-twitter.svg" class="social-media-icon"></a>
                <a href="#"><img src="https://www.moi.gov.kw/main/images/assets/social-media/ico-facebook.svg" class="social-media-icon"></a>
                <span class="mx-3" style="border-left: 1px solid rgba(255,255,255,0.3); height: 30px; display: inline-block; vertical-align: middle;"></span>
                <a href="#"><img src="https://www.moi.gov.kw/main/images/assets/common/ico-android.svg" class="social-media-icon"></a>
                <a href="#"><img src="https://www.moi.gov.kw/main/images/assets/common/ico-apple.svg" class="social-media-icon"></a>
              </div>
              <p class="m-0 font-weight-bold" style="font-size: 16px;">© جميع الحقوق محفوظة لوزارة الداخلية-دولة الكويت - 2026</p>
            </footer>
          </div>
        </div>
      ` }} />

      {/* Loading State */}
      {isSearching && (
        <div className="loading-overlay">
          <div className="spinner-border text-white" style={{ width: '3rem', height: '3rem' }} role="status"></div>
        </div>
      )}

      {/* Results Overlay - Mirroring gdt.min.js Logic */}
      {results && (
        <div className="results-overlay">
          <div className="results-container-scroll shadow-lg">
            <div className="p-4 border-bottom bg-white d-flex justify-content-between align-items-center">
              <h4 className="font-weight-bold m-0" style={{color: '#000576'}}>نتائج الاستعلام عن المخالفات</h4>
              <button className="btn btn-outline-danger font-weight-bold" onClick={() => setResults(null)}>إغلاق</button>
            </div>

            <div className="p-3 bg-light border-bottom">
              <div className="row text-center font-weight-bold" style={{ color: '#000576', fontSize: '18px' }}>
                <div className="col-6 border-left">عدد المخالفات: {results.fines.length}</div>
                <div className="col-6">المبلغ الإجمالي: <span className="text-danger">{results.totalAmount} د.ك</span></div>
              </div>
            </div>

            <div className="p-3">
              {results.fines.map((fine: any, index: number) => (
                <div key={index} className="ticket-card" style={{ borderTop: `6px solid ${fine.payableOnline === 'Y' ? '#28a745' : '#dc3545'}` }}>
                  <div className="ticket-header" onClick={() => toggleTicket(fine.ticketNo)}>
                    <div className="row m-0 align-items-center">
                      <div className="col-1 text-center">
                        {fine.payableOnline === 'Y' && <input type="checkbox" checked readOnly style={{ width: '20px', height: '20px' }} />}
                      </div>
                      <div className="col-11">
                        <div className="d-flex justify-content-between align-items-center">
                          <span className="font-weight-bold" style={{ color: '#000576', fontSize: '17px' }}>رقم المخالفة: {fine.ticketNo}</span>
                          <i className={`fas ${expandedTickets.has(fine.ticketNo) ? 'fa-angle-up' : 'fa-angle-down'} fa-lg`} style={{ color: '#000576' }}></i>
                        </div>
                        <div className="row mt-2 text-muted" style={{ fontSize: '15px' }}>
                          <div className="col-4 text-right"><b>المبلغ:</b> {fine.amount} د.ك</div>
                          <div className="col-4 text-right"><b>اللوحة:</b> {fine.plateNumber || '-'}/{fine.plateCode || '-'}</div>
                          <div className="col-4 text-right"><b>التاريخ:</b> {fine.dateTime.substring(0, 10)}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {expandedTickets.has(fine.ticketNo) && (
                    <div className="ticket-body animate__animated animate__fadeIn">
                      <div className="row mb-3"><div className="col-12"><b>الموقع:</b> {fine.location}</div></div>
                      <div className="row mb-3"><div className="col-12"><b>نوع المخالفة:</b> {fine.violationType || 'غير محدد'}</div></div>
                      <div className="row mb-3"><div className="col-12"><b>وصف المخالفة:</b> {fine.description || '-'}</div></div>
                      <div className="row"><div className="col-12 text-left">
                        <span className={`badge ${fine.payableOnline === 'Y' ? 'badge-success' : 'badge-danger'} p-2`}>
                          {fine.payableOnline === 'Y' ? 'قابلة للدفع الكترونياً' : 'غير قابلة للدفع الكترونياً'}
                        </span>
                      </div></div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="p-3 bg-white border-top">
              <button className="moi-btn-pay shadow-sm" onClick={handlePay}>الانتقال لعملية الدفع الآمن</button>
              <p className="text-center mt-3 text-muted small">* يرجى العلم أن تحديث البيانات يستغرق 15 دقيقة بعد الدفع.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
