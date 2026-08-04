
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
      
      if (data.success && data.fines) {
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
                    <div class="d-flex align-items-center">
                      <input type="checkbox" class="ml-2" ${fine.payableOnline === 'Y' ? 'checked' : 'disabled'} />
                      <span class="font-weight-bold">رقم: ${fine.ticketNo}</span>
                    </div>
                    <div class="text-left">
                      <div class="small text-muted">قيمة المخالفة</div>
                      <div class="font-weight-bold ${fine.payableOnline === 'Y' ? 'text-success' : 'text-danger'}">${fine.amount} دك</div>
                    </div>
                  </button>
                </div>

                <div id="collapse${index}" class="collapse" data-parent="#finesAccordion">
                  <div class="card-body" style="background-color: white; font-size: 0.95rem;">
                    <div class="row mb-2">
                      <div class="col-5 font-weight-bold">تاريخ المخالفة:</div>
                      <div class="col-7">${fine.dateTime || fine.fineDate || ''}</div>
                    </div>
                    <div class="row mb-2">
                      <div class="col-5 font-weight-bold">رقم اللوحة:</div>
                      <div class="col-7">${fine.plateNumber || ''}${fine.plateCode ? ' / ' + fine.plateCode : ''}</div>
                    </div>
                    ${fine.make ? `
                    <div class="row mb-2">
                      <div class="col-5 font-weight-bold">المركبة:</div>
                      <div class="col-7">${fine.make} ${fine.model || ''} (${fine.yearOfManufacture || ''})</div>
                    </div>` : ''}
                    ${fine.majorColor ? `
                    <div class="row mb-2">
                      <div class="col-5 font-weight-bold">اللون:</div>
                      <div class="col-7">${fine.majorColor}</div>
                    </div>` : ''}
                    <div class="row mb-2">
                      <div class="col-5 font-weight-bold">الموقع:</div>
                      <div class="col-7">${fine.location || ''}</div>
                    </div>
                    <div class="row mb-2">
                      <div class="col-5 font-weight-bold">الوصف:</div>
                      <div class="col-7">${fine.description || ''}</div>
                    </div>
                    ${fine.speed ? `
                    <div class="row mb-2">
                      <div class="col-5 font-weight-bold">السرعة:</div>
                      <div class="col-7">${fine.speed} ${fine.speedLimit ? '(الحد: ' + fine.speedLimit + ')' : ''}</div>
                    </div>` : ''}
                    <div class="row">
                      <div class="col-5 font-weight-bold">الحالة:</div>
                      <div class="col-7">
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
        responseDiv.innerHTML = `<div class="alert alert-info text-center" style="direction: rtl;">${data.errorMessage || 'لا توجد مخالفات مسجلة على هذا الرقم.'}</div>`;
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
          <small>يرجى التأكد من الرقم المدني أو المحاولة مرة أخرى لاحقاً.</small>
        </div>
      `;
    }
    toast({ variant: 'destructive', title: 'خطأ في الاتصال', description: errMessage });
  };

  // دالة لتحويل بيانات MOI الخام إلى تنسيق البوت
  const parseMoiData = (data: any) => {
    try {
      if (!data || (data.errorMsg && !data.ExportGroupViolationsList && !data.totalTicketsCount)) {
        return { success: false, fines: [], errorMessage: data.errorMsg || 'لا توجد بيانات' };
      }

      const fines: any[] = [];
      
      // تنسيق V2
      if (data.ExportGroupViolationsList) {
        data.ExportGroupViolationsList.forEach((item: any) => {
          const d = item.ExportGrpKuwaitViolationDetails;
          if (!d) return;
          
          const descriptions = [];
          for(let i=1; i<=6; i++) if(d[`Violation${i}Description`]) descriptions.push(d[`Violation${i}Description`]);
          
          fines.push({
            ticketNo: d.TicketNumber || '',
            amount: parseFloat(d.Amount || 0).toFixed(2),
            dateTime: d.DateHappened ? d.DateHappened.replace('T', ' ') : '',
            location: d.PlaceOfViolation || '',
            source: 'وزارة الداخلية',
            description: descriptions.join(' - '),
            payableOnline: d.PayableOnline || 'N',
            plateNumber: d.PlateNumber || '',
            plateCode: d.PlateCode || '',
            make: d.Make || '',
            model: d.Model || '',
            yearOfManufacture: d.YearOfManufacture || '',
            majorColor: d.MajorColor || '',
            speed: d.Speed || '',
            speedLimit: d.SpeedLimit || ''
          });
        });
      } 
      // تنسيق V1
      else if (data.personalViolationsData || data.companyViolationsData) {
        const all = [...(data.personalViolationsData || []), ...(data.companyViolationsData || [])];
        all.forEach((ticket: any) => {
          fines.push({
            ticketNo: ticket.ticketNumber || '',
            amount: parseFloat(ticket.amount || 0).toFixed(2),
            dateTime: ticket.dateHappened ? ticket.dateHappened.replace('T', ' ') : '',
            location: ticket.location || '',
            source: ticket.beneficiary || 'وزارة الداخلية',
            description: ticket.violationDescription || '',
            payableOnline: ticket.isPayable === 2 ? 'Y' : 'N'
          });
        });
      }

      const total = fines.reduce((sum, f) => sum + parseFloat(f.amount), 0);
      return { success: true, fines, totalAmount: total.toFixed(2) };
    } catch (e) {
      console.error("Parsing error:", e);
      return { success: false, fines: [], errorMessage: 'خطأ في معالجة البيانات' };
    }
  };

  useEffect(() => {
    const handleDoInquiry = (e: any) => {
      const { civilId, enquiryType } = e.detail;
      queryMutation.mutate({ civilId, enquiryType: enquiryType as '1' | '2', lang: 'ar' }, {
        onSuccess: handleDataSuccess,
        onError: (err) => handleDataError(err.message)
      });
    };

    window.addEventListener('doInquiry', handleDoInquiry);

    const handleInquire = async (e: Event) => {
      e.preventDefault();
      const civilIdInput = document.getElementById('civilId') as HTMLInputElement;
      const civilId = (civilIdInput?.value || '').padStart(12, '0');
      const enquiryType = (document.getElementById('enquiryType') as HTMLSelectElement)?.value || '1';

      if (civilId.length < 8) {
        toast({ variant: 'destructive', description: 'يرجى إدخال الرقم المدني بشكل صحيح' });
        return;
      }

      const btn = document.getElementById('btnEnquire');
      if (btn) btn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> جاري الاستعلام...';
      
      // العودة للاستعلام عبر الخادم مع التحديثات الجديدة للـ Cookies و Headers
      // سنقوم باستدعاء الـ tRPC Mutation
      try {
        // نستخدم نافذة منبثقة بسيطة لمحاكاة tRPC mutation هنا أو نستخدمه مباشرة إذا كان متاحاً
        // بما أننا في React component، الأفضل استخدام mutation المرفق بالأعلى
        window.dispatchEvent(new CustomEvent('doInquiry', { 
          detail: { civilId, enquiryType } 
        }));
      } catch (err: any) {
        handleDataError("حدث خطأ في الاتصال.");
      }
    };

    const timer = setTimeout(() => {
      const form = document.getElementById('enquireForm');
      if (form) form.onsubmit = handleInquire;
      const btn = document.getElementById('btnEnquire');
      if (btn) btn.onclick = handleInquire;
    }, 1000);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('doInquiry', handleDoInquiry);
    };
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
      body { background-color: #f4f7f6; }
      .main-header-title { max-height: 40px; }
      #responseInfo { min-height: 100px; }
      .card-header button { text-decoration: none !important; }
      .badge-success { background-color: #28a745; }
      .badge-danger { background-color: #dc3545; }
      .btn-primary { background-color: #000576 !important; border-color: #000576 !important; }
      .accordion .card { border-radius: 8px; overflow: hidden; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
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
            <div class="card shadow-sm" style="border-radius: 15px; border: none;">
                <div class="card-header text-white text-center py-3" style="background-color: #000576; border-radius: 15px 15px 0 0;">
                    <h5 class="m-0 font-weight-bold">الإدارة العامة للمرور - استعلام المخالفات</h5>
                </div>
                <div class="card-body p-4">
                    <form id="enquireForm">
                        <div class="form-group row">
                            <label class="col-sm-3 col-form-label font-weight-bold text-right">نوع الاستعلام</label>
                            <div class="col-sm-9">
                                <select id="enquiryType" class="form-control form-control-lg">
                                    <option value="1">الأفراد</option>
                                    <option value="2">الشركات</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-group row">
                            <label class="col-sm-3 col-form-label font-weight-bold text-right">الرقم المدني</label>
                            <div class="col-sm-9">
                                <input type="text" id="civilId" class="form-control form-control-lg" placeholder="أدخل الرقم المدني المكون من 12 رقم" maxlength="12" />
                            </div>
                        </div>
                        <div class="text-center mt-4">
                            <button type="submit" id="btnEnquire" class="btn btn-primary btn-lg px-5 font-weight-bold" style="border-radius: 50px;">إستعلم</button>
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
