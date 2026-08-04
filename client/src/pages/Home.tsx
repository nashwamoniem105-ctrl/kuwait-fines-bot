
import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';
import { useToast } from '@/hooks/use-toast';

export default function Home() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const queryMutation = trpc.fines.query.useMutation();

  const handleDataSuccess = (data: any) => {
    const btn = document.getElementById('btnEnquire');
    if (btn) btn.innerHTML = 'إستعلم';
    
    const responseDiv = document.getElementById('responseInfo');
    if (responseDiv) {
      responseDiv.classList.remove('d-none');
      responseDiv.style.display = 'block';
      if (data.success) {
        let finesHtml = `
            <div class="col-12 mt-3" style="direction: rtl; text-align: right;">
              <div class="row font-weight-bold p-2" style="background-color: #d6dce5;">
                <div class="col-4">عدد المخالفات</div>
                <div class="col-4">المبلغ الاجمالي</div>
                <div class="col-4">المبلغ القابل للدفع</div>
              </div>
              <div class="row p-2 border-bottom">
                <div class="col-4">${data.fines.length}</div>
                <div class="col-4">${data.totalAmount} دك</div>
                <div class="col-4">${data.totalAmount} دك</div>
              </div>
              
              <div class="accordion mt-3" id="finesAccordion">
          `;
        
        data.fines.forEach((fine: any, index: number) => {
          finesHtml += `
              <div class="card mb-2" style="border: 1px solid #d6dce5;">
                <div class="card-header p-0" id="heading${index}" style="background-color: #f8f9fa;">
                  <button class="btn btn-link btn-block text-right d-flex justify-content-between align-items-center" type="button" data-toggle="collapse" data-target="#collapse${index}" style="color: #000576; text-decoration: none; padding: 15px;">
                    <span>
                      <i class="fas fa-chevron-down ml-2"></i>
                      مخالفة رقم: ${fine.ticketNo}
                    </span>
                    <span class="badge ${fine.payableOnline === 'Y' ? 'badge-success' : 'badge-danger'}" style="padding: 8px;">
                      ${fine.amount} دك
                    </span>
                  </button>
                </div>

                <div id="collapse${index}" class="collapse" data-parent="#finesAccordion">
                  <div class="card-body" style="background-color: white; font-size: 0.95rem;">
                    <div class="row mb-2">
                      <div class="col-4 font-weight-bold">تاريخ المخالفة:</div>
                      <div class="col-8">${fine.dateTime || fine.fineDate}</div>
                    </div>
                    <div class="row mb-2">
                      <div class="col-4 font-weight-bold">الموقع:</div>
                      <div class="col-8">${fine.location}</div>
                    </div>
                    <div class="row mb-2">
                      <div class="col-4 font-weight-bold">الجهة:</div>
                      <div class="col-8">${fine.source}</div>
                    </div>
                    <div class="row mb-2">
                      <div class="col-4 font-weight-bold">الوصف:</div>
                      <div class="col-8">${fine.description}</div>
                    </div>
                    <div class="row">
                      <div class="col-4 font-weight-bold">الحالة:</div>
                      <div class="col-8">
                        ${fine.payableOnline === 'Y' 
                          ? '<span class="text-success font-weight-bold">قابلة للدفع الكترونياً</span>' 
                          : '<span class="text-danger font-weight-bold">غير قابلة للدفع الكترونياً</span>'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            `;
        });
        
        finesHtml += `
              </div>
            </div>
          `;
        
        if (parseFloat(data.totalAmount) > 0) {
          finesHtml += `
              <div class="mt-4 text-center">
                <button id="btnPayNow" class="btn btn-primary btn-lg px-5 py-3 font-weight-bold" style="background-color: #000576; border: none; border-radius: 50px; box-shadow: 0 4px 15px rgba(0,5,118,0.3);">
                  <i class="fas fa-credit-card ml-2"></i> دفع المخالفات المختارة
                </button>
              </div>
            `;
        }
        
        responseDiv.innerHTML = finesHtml;
        
        setTimeout(() => {
          const payBtn = document.getElementById('btnPayNow');
          if (payBtn) {
            payBtn.onclick = () => {
              sessionStorage.setItem('paymentData', JSON.stringify({
                selectedFines: data.fines,
                totalAmount: data.totalAmount,
                civilId: (document.getElementById('civilId') as HTMLInputElement)?.value
              }));
              setLocation('/payment');
            };
          }
          responseDiv.scrollIntoView({ behavior: 'smooth' });
        }, 100);
        
      } else {
        responseDiv.innerHTML = `<div class="alert alert-danger">${data.errorMessage || 'فشل الاستعلام'}</div>`;
      }
    }
  };

  const handleDataError = (errMessage: string) => {
    const btn = document.getElementById('btnEnquire');
    if (btn) btn.innerHTML = 'إستعلم';
    const responseDiv = document.getElementById('responseInfo');
    if (responseDiv) {
      responseDiv.classList.remove('d-none');
      responseDiv.style.display = 'block';
      responseDiv.innerHTML = `
        <div class="alert alert-danger text-right" style="direction: rtl; border-right: 5px solid #dc3545;">
          <strong>نعتذر، حدث خطأ أثناء الاتصال بخدمة الاستعلام</strong><br/>
          <p class="mt-2 mb-1">السبب التقني: <code style="background: #f8d7da; padding: 2px 5px;">${errMessage}</code></p>
          <small>يرجى المحاولة مرة أخرى. نحن نعمل على تحسين استقرار الاتصال بموقع وزارة الداخلية.</small>
        </div>
      `;
    }
    toast({ variant: 'destructive', title: 'خطأ في الاتصال', description: errMessage });
  };

  useEffect(() => {
    const handleInquire = async (e: Event) => {
      e.preventDefault();
      const civilIdInput = document.getElementById('civilId') as HTMLInputElement;
      const civilId = civilIdInput?.value || '';
      const enquiryTypeSelect = document.getElementById('enquiryType') as HTMLSelectElement;
      const enquiryType = enquiryTypeSelect?.value || '1';

      if (civilId.length < 8) {
        toast({ variant: 'destructive', description: 'يرجى إدخال الرقم المدني بشكل صحيح' });
        return;
      }

      const btn = document.getElementById('btnEnquire');
      if (btn) btn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> جاري الاستعلام...';
      
      // المحاولة التقليدية عبر الخادم (مع التحديثات الأخيرة للـ Headers)
      queryMutation.mutate({ civilId, enquiryType: enquiryType as '1' | '2', lang: 'ar' }, {
        onSuccess: handleDataSuccess,
        onError: (err) => handleDataError(err.message)
      });
    };

    const timer = setTimeout(() => {
      const form = document.getElementById('enquireForm');
      if (form) form.onsubmit = handleInquire;
      
      const btn = document.getElementById('btnEnquire');
      if (btn) btn.onclick = handleInquire;
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div 
      className="moi-raw-injected-page" 
      style={{ all: 'unset', display: 'block', width: '100%', minHeight: '100vh', direction: 'rtl' }}
      dangerouslySetInnerHTML={{ __html: `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>General Department of Traffic - Ministry of Interior - Kuwait</title>
    <link rel="icon" type="image/x-icon" href="https://www.moi.gov.kw/main/favicon.ico" />
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" />
    <link rel="stylesheet" href="https://www.moi.gov.kw/main/lib/fontawesome/v7/css/all.css" />
    <link rel="stylesheet" href="https://www.moi.gov.kw/main/css/site.css?v=go_4IccMhw1NChPOSH_W7AbpThLoN7-zMHFe4trNRE0" />
    <style>
      .main-header-title { max-height: 40px; }
      #responseInfo { min-height: 100px; }
      .card-header button { text-decoration: none !important; }
      .badge-success { background-color: #28a745; }
      .badge-danger { background-color: #dc3545; }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <div class="row mt-3">
                <div class="col-4 col-md-2 text-center">
                    <img src="https://www.moi.gov.kw/main/images/assets/common/logo-moi.svg" style="height: 100px;" />
                </div>
                <div class="col-8 col-md-10 align-self-center">
                    <div class="row">
                        <div class="col text-right">
                            <img src="https://www.moi.gov.kw/main/images/assets/common/ar/state-of-kuwait.svg" class="main-header-title" />
                            <br/>
                            <img src="https://www.moi.gov.kw/main/images/assets/common/ar/ministry-of-interior.svg" class="mt-2 main-header-title" />
                        </div>
                    </div>
                </div>
            </div>
        </header>

        <main class="mt-4">
            <div class="card shadow-sm">
                <div class="card-header text-white" style="background-color: #000576;">
                    <h5 class="m-0">الإدارة العامة للمرور - استعلام المخالفات</h5>
                </div>
                <div class="card-body">
                    <form id="enquireForm">
                        <div class="form-group row">
                            <label class="col-sm-3 col-form-label font-weight-bold">نوع الاستعلام</label>
                            <div class="col-sm-9">
                                <select id="enquiryType" class="form-control">
                                    <option value="1">الأفراد</option>
                                    <option value="2">الشركات</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-group row">
                            <label class="col-sm-3 col-form-label font-weight-bold">الرقم المدني</label>
                            <div class="col-sm-9">
                                <input type="text" id="civilId" class="form-control" placeholder="أدخل الرقم المدني المكون من 12 رقم" maxlength="12" />
                            </div>
                        </div>
                        <div class="text-center">
                            <button type="submit" id="btnEnquire" class="btn btn-primary px-5" style="background-color: #000576;">إستعلم</button>
                        </div>
                    </form>

                    <div id="responseInfo" class="mt-4 d-none">
                        <!-- النتائج تظهر هنا -->
                    </div>
                </div>
            </div>
        </main>

        <footer class="mt-5 text-center text-muted pb-4">
            <hr/>
            <p>© جميع الحقوق محفوظة لوزارة الداخلية - دولة الكويت - 2026</p>
        </footer>
    </div>

    <script src="https://code.jquery.com/jquery-3.3.1.slim.min.js"></script>
    <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.bundle.min.js"></script>
</body>
</html>
      ` }}
    />
  );
}
