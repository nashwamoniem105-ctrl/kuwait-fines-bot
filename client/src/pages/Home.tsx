
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
      if (data.success && data.fines) {
        // Clear previous results
        responseDiv.innerHTML = '';
        responseDiv.className = 'form-row p-3 mt-3 text-right';
        responseDiv.style.borderBottom = '2px solid #d6dce5';
        responseDiv.classList.remove('d-none');
        responseDiv.style.display = 'block';
        
        // Reset paying amount and pay button
        const payingAmountDiv = document.getElementById('payingAmount');
        if (payingAmountDiv) payingAmountDiv.innerHTML = '';
        const btnPay = document.getElementById('btnPay');
        if (btnPay) {
          btnPay.classList.add('d-none');
          btnPay.disabled = true;
        }
        
        let finesHtml = `
          <div class="col-12">
            <div class="row alert alert-secondary" role="alert">
              <div class="col-md-6 col-sm-12">
                <b>عدد المخالفات</b>: ${data.fines.length}
              </div>
              <div class="col-md-6 col-sm-12">
                <b>المبلغ الاجمالي</b>: ${parseInt(parseFloat(data.totalAmount).toString())} دك
              </div>
            </div>
          </div>
          <div class="row">
        `;
        
        data.fines.forEach((fine: any, index: number) => {
          const isPayable = fine.payableOnline === 'Y';
          const borderColor = isPayable ? 'green' : 'red';
          const ticketId = `accTicket${fine.ticketNo}`;
          const collapseId = `t${fine.ticketNo}`;
          
          finesHtml += `
            <div class="col-sm-12 col-md-6 mt-2">
              <div class="accordion" id="${ticketId}">
                <div class="card">
                  <div class="card-header p-1" style="background:#eceae4 !important; border-top:5px solid ${borderColor}" id="hdr${fine.ticketNo}">
                    <div class="row">
                      <div class="col-2 align-self-center">
                        ${isPayable ? `<input type="checkbox" id="${fine.ticketNo}" class="select-ticket" />` : ''}
                      </div>
                      <div class="col-10">
                        <div class="row m-0 p-0">
                          <div class="align-self-center m-2" style="color:#000576;"><b>رقم:</b>${fine.ticketNo}</div>
                        </div>
                      </div>
                      <div class="col-12" style="border-top:2px solid #d6dce5;"></div>
                      <div class="col-12 m-0">
                        <a style="color:#000576;" href="#" data-target="#${collapseId}" data-toggle="collapse" aria-expanded="false" aria-controls="#${fine.ticketNo}">
                          <div class="row m-0 p-0">
                            <div class="align-self-center m-2"><b>قيمة المخالفة:</b>${parseInt(parseFloat(fine.amount).toString())} دك</div>
                          </div>
                          <div class="row m-0 p-0">
                            <div class="align-self-center m-2"><b>رقم اللوحة:</b>${fine.plateNumber || ''}/${fine.plateCode || ''}</div>
                          </div>
                          <div class="row m-0 p-0">
                            <div class="align-self-center m-2"><b>تاريخ المخالفة:</b>${(fine.dateTime || fine.fineDate || '').substring(0, 10)}</div>
                          </div>
                          <div class="row m-0 p-0">
                            <div class="col-12 text-left">
                              <i class="fas fa-angle-down"></i>
                            </div>
                          </div>
                        </a>
                      </div>
                    </div>
                  </div>
                  <div id="${collapseId}" class="collapse" aria-labelledby="hdr${fine.ticketNo}" data-parent="#${ticketId}">
                    <div class="card-body">
                      <div class="row">
                        <div class="col-12"><b>النوع:</b>${fine.violationType === 'D' ? 'مباشرة' : 'غير مباشرة'}</div>
                      </div>
                      <div class="row">
                        <div class="col-12"><b>المكان:</b>${fine.location || ''}</div>
                      </div>
                      <div class="row">
                        ${fine.description ? `<div class="col-12"><b>- </b>${fine.description}</div>` : ''}
                        ${fine.violation2Description ? `<div class="col-12"><b>- </b>${fine.violation2Description}</div>` : ''}
                        ${fine.violation3Description ? `<div class="col-12"><b>- </b>${fine.violation3Description}</div>` : ''}
                        ${fine.violation4Description ? `<div class="col-12"><b>- </b>${fine.violation4Description}</div>` : ''}
                        ${fine.violation5Description ? `<div class="col-12"><b>- </b>${fine.violation5Description}</div>` : ''}
                        ${fine.violation6Description ? `<div class="col-12"><b>- </b>${fine.violation6Description}</div>` : ''}
                      </div>
                      <div class="row">
                        <div class="col-12"><b>الوقت:</b>${(fine.dateTime || fine.fineDate || '').substring(11, 16) || ''}</div>
                      </div>
                      ${fine.make ? `<div class="row"><div class="col-12"><b>المركبة:</b>${fine.make} ${fine.model || ''} (${fine.yearOfManufacture || ''})</div></div>` : ''}
                      ${fine.majorColor ? `<div class="row"><div class="col-12"><b>اللون:</b>${fine.majorColor}</div></div>` : ''}
                      ${fine.speed ? `<div class="row"><div class="col-12"><b>السرعة:</b>${fine.speed} ${fine.speedLimit ? '(الحد: ' + fine.speedLimit + ')' : ''}</div></div>` : ''}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          `;
        });
        
        finesHtml += `</div>`;
        
        responseDiv.innerHTML = finesHtml;
        
        // Show payingAmount and btnPay if there are payable tickets
        const payableTickets = data.fines.filter((f: any) => f.payableOnline === 'Y');
        if (payableTickets.length > 0 && btnPay) {
          btnPay.classList.remove('d-none');
          
          // Set up checkbox selection logic (matching original MOI behavior)
          setTimeout(() => {
            let payingAmount = 0;
            
            const checkboxes = document.querySelectorAll('.select-ticket');
            checkboxes.forEach(cb => {
              cb.addEventListener('click', function(this: HTMLInputElement) {
                payingAmount = 0;
                
                const checkedBoxes = document.querySelectorAll('.select-ticket:checked');
                checkedBoxes.forEach(box => {
                  const ticketNo = box.id;
                  const ticket = data.fines.find((f: any) => f.ticketNo == ticketNo);
                  if (ticket) {
                    payingAmount += parseInt(parseFloat(ticket.amount).toString());
                  }
                });
                
                if (payingAmountDiv) {
                  payingAmountDiv.innerHTML = checkedBoxes.length > 0 
                    ? `<b>المبلغ المحدد:</b> ${payingAmount} دك` 
                    : '';
                }
                
                if (btnPay) {
                  if (checkedBoxes.length > 0) {
                    btnPay.disabled = false;
                  } else {
                    btnPay.disabled = true;
                  }
                }
              });
            });
            
            // Wire up the pay button to navigate to payment page
            btnPay.onclick = () => {
              const selectedTickets: any[] = [];
              document.querySelectorAll('.select-ticket:checked').forEach(box => {
                const ticket = data.fines.find((f: any) => f.ticketNo == box.id);
                if (ticket) selectedTickets.push(ticket);
              });
              
              if (selectedTickets.length === 0) return;
              
              const totalSelected = selectedTickets.reduce((sum: number, t: any) => sum + parseFloat(t.amount), 0);
              
              sessionStorage.setItem('paymentData', JSON.stringify({
                selectedFines: selectedTickets,
                totalAmount: totalSelected.toFixed(2),
                civilId: (document.getElementById('civilId') as HTMLInputElement)?.value
              }));
              setLocation('/payment');
            };
          }, 200);
        }
        
        responseDiv.scrollIntoView({ behavior: 'smooth' });
      } else {
        responseDiv.classList.remove('d-none');
        responseDiv.style.display = 'block';
        responseDiv.innerHTML = `
          <div class="col-12">
            <div class="alert alert-info text-center" style="direction: rtl;">
              ${data.errorMessage || 'لا توجد مخالفات مسجلة على هذا الرقم.'}
            </div>
          </div>
        `;
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
      body { background-color: #eceae4; font-family: 'Droid Arabic Kufi Regular', 'Skia Regular', Arial, Tahoma, sans-serif; }
      .main-header-title { max-height: 40px; }
      #responseInfo { min-height: 100px; }
      .card-header a { text-decoration: none !important; }
      .badge-success { background-color: #28a745; }
      .badge-danger { background-color: #dc3545; }
      .btn-primary { background-color: #000576 !important; border-color: #000576 !important; }
      .accordion .card { border: 1px solid #ccc; }
      .accordion .card-header { background: #eceae4 !important; }
      .accordion .card { border-radius: 0; overflow: visible; }
      .select-ticket { cursor: pointer; width: 18px; height: 18px; }
      .alert-secondary { background-color: #e9ecef; color: #1a1a1a; }
      a { color: #000576; text-decoration: none; }
      a:hover { text-decoration: none; }
      .form-row { display: flex; }
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
            <div class="row mt-2 pl-4 pr-4 pb-5">
                <div class="col-12">
                    <form id="enquireForm">
                        <div class="form-row d1-none">
                            <div class="col-sm-12 col-md-6">
                                <label>Enquiry Type</label>
                                <select class="form-control" id="enquiryType">
                                    <option selected value="1">الأفراد</option>
                                    <option value="2">الشركات</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-row mt-2">
                            <div class="col-sm-12 col-md-6">
                                <label id="lblEnquiryType">الرقم المدني أو الرقم الموحد</label>
                                <input class="form-control" id="civilId" name="civilId" maxlength="12" minlength="12" />
                            </div>
                        </div>
                        <div class="form-row mt-2">
                            <div class="col-sm-12 col-md-4">
                                <button id="btnEnquire" class="btn btn-primary btn-block mt-2 mt-md-0">إستعلم</button>
                            </div>
                        </div>
                    </form>

                    <div id="responseInfo" class="form-row p-3 mt-3 d-none text-right" style="border-bottom:2px solid #d6dce5;">
                    </div>
                    <div class="form-row align-self-center mt-2">
                        <div class="col-12 text-left" id="payingAmount"></div>
                    </div>
                    <div class="form-row mt-3">
                        <div class="col-12 text-right font-weight-bold mb-2">
                            بعد إجراء عملية الدفع.. يرجى عدم محاولة الدفع مرة أخرى حيث يجرى تحديث البيانات خلال 15 دقيقة
                        </div>
                        <div class="col-sm-12 col-md-4 text-right">
                            <input type="button" id="btnPay" class="btn btn-primary btn-block d-none" disabled value="إدفع">
                        </div>
                        <div class="col-sm-12 col-md-6 align-self-center">&nbsp;</div>
                    </div>
                    <div class="form-row mt-3">
                        <div class="col-12 align-self-center">
                            <span class="badge badge-success p-2" style="font-weight:normal !important;">قابلة للدفع الكترونياً</span>
                            <span class="badge badge-danger p-2" style="font-weight:normal !important;">غير قابلة للدفع الكترونياً</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="d-flex justify-content-center">
                <div class="spinner-grow text-secondary d-none" role="status" id="workingOnIt">
                    <span class="sr-only">Loading...</span>
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
