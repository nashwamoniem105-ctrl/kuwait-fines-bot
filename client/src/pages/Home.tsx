
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
            <div class="alert alert-info d-flex justify-content-between align-items-center" style="background-color: #000576; color: white; border: none; direction: rtl; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
              <span>إجمالي المخالفات: ${data.fines.length}</span>
              <span>المبلغ الإجمالي: ${data.totalAmount} د.ك</span>
            </div>
          `;
          
          data.fines.forEach((fine: any) => {
            finesHtml += `
              <div class="card mb-2 text-right" style="direction: rtl; border: 1px solid #ddd; background: white; color: black;">
                <div class="card-header d-flex justify-content-between align-items-center" style="cursor: pointer; background: #f8f9fa;">
                  <span>رقم المخالفة: ${fine.ticketNo}</span>
                  <span style="color: #000576; font-weight: bold;">${fine.amount} د.ك</span>
                </div>
                <div class="card-body" style="font-size: 0.9rem;">
                  <p class="mb-1">التاريخ: ${fine.fineDate}</p>
                  <p class="mb-1">الموقع: ${fine.location}</p>
                  <p class="mb-0">الحالة: ${fine.payableOnline === 'Y' ? '<span class="badge badge-success">قابلة للدفع</span>' : '<span class="badge badge-danger">غير قابلة للدفع</span>'}</p>
                </div>
              </div>
            `;
          });
          
          finesHtml += `
            <button id="btnPayNow" class="btn btn-success btn-block py-3 mt-3 font-weight-bold" style="font-size: 1.2rem;">دفع المخالفات</button>
          `;
          
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
      toast({ variant: 'destructive', title: 'خطأ', description: err.message });
    }
  });

  useEffect(() => {
    // Inject Head Elements
    const headContent = `<link href="https://cdn-na.readspeaker.com/script/56/webReader/r/r2918/ReadSpeaker.Styles-Button.css?v=3.8.10.2918" id="rsmod_Styles" rel="stylesheet" type="text/css"/>
<link crossorigin="anonymous" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" rel="stylesheet"/>
<link href="https://www.moi.gov.kw/main/lib/fontawesome/v7/css/all.css" rel="stylesheet"/>
<link href="https://www.moi.gov.kw/main/css/site.css?v=go_4IccMhw1NChPOSH_W7AbpThLoN7-zMHFe4trNRE0" rel="stylesheet"/>`;
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = headContent;
    
    Array.from(tempDiv.childNodes).forEach(node => {
      if (node instanceof HTMLElement) {
        document.head.appendChild(node.cloneNode(true));
      }
    });

    // Inject Scripts
    const scripts = [
      'https://code.jquery.com/jquery-3.3.1.min.js',
      'https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.bundle.min.js'
    ];

    scripts.forEach(src => {
      if (!document.querySelector(`script[src="${src}"]`)) {
        const s = document.createElement('script');
        s.src = src;
        s.async = true;
        document.body.appendChild(s);
      }
    });

    // Body Styles
    document.body.style.backgroundColor = '#eceae4';
    document.body.style.backgroundImage = "url('https://www.moi.gov.kw/main/images/assets/common/bg-pattern.png')";
    document.body.style.backgroundRepeat = 'repeat';
    document.body.style.backgroundAttachment = 'fixed';
    document.body.style.direction = 'rtl';
    document.body.className = 'moi-theme';

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

    // Use a small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      const form = document.getElementById('enquireForm');
      if (form) form.onsubmit = handleInquire;
      
      const btn = document.getElementById('btnEnquire');
      if (btn) btn.onclick = handleInquire;
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div 
      className="moi-body-wrapper" 
      style={{ width: '100%', minHeight: '100vh', display: 'block' }}
      dangerouslySetInnerHTML={{ __html: `<div class="moi-original-body" data-rsevent-id="rs_409143">
<div class="container">
<header>
<div class="row">
<div class="col-4 col-md-2 col-lg-2 text-center" style="border:0px solid red;">
<a class="navbar-brand m-0" data-manus_click_id="1" data-manus_clickable="true" href="https://www.moi.gov.kw/main/">
<img src="https://www.moi.gov.kw/main/images/assets/common/logo-moi.svg" style="height: 120px;"/>
</a>
</div>
<div class="col-1 align-self-center" style="border:0px solid red;">
<div class="row">
<div class="col text-center">
<img class="text-center main-header-title" src="https://www.moi.gov.kw/main/images/assets/common/ar/state-of-kuwait.svg"/>
</div>
</div>
<div class="row">
<div class="col text-center">
<img class="mt-2 main-header-title" src="https://www.moi.gov.kw/main/images/assets/common/ar/ministry-of-interior.svg"/>
</div>
</div>
</div>
</div>
<nav class="navbar navbar-expand-lg navbar-dark border-bottom box-shadow">
<div class="container">
<a class="navbar-brand" href="https://www.moi.gov.kw/main"></a>
<button aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation" class="navbar-toggler" data-target="#navbarResponsive" data-toggle="collapse" type="button">
<span class="navbar-toggler-icon"></span>
</button>
<div class="navbar-collapse collapse flex-sm-row-reverse" id="navbarResponsive">
<ul class="navbar-nav flex-grow-1 p-0 clearfix" style="margin:0 auto;vertical-align:top;border:0px solid red;">
<div class="d-flex flex-sm-row flex-column container-navlinks" style="border:0px solid red;overflow:visible;"><style>
    .dropdown:hover > .dropdown-menu {
        display: block;
        margin-top: 0;
    }
</style>
<li class="nav-item" data-manus_click_id="2" data-manus_clickable="true">
<a class="nav-link" data-manus_click_id="3" data-manus_clickable="true" href="https://www.moi.gov.kw/main">
        الرئيسيــة
        <span class="sr-only">(current)</span>
</a>
</li>
<li class="nav-item active" data-manus_click_id="4" data-manus_clickable="true" data-trigger="focus" id="eservicesMenu">
<a aria-controls="eservices" aria-expanded="false" class="nav-link" data-manus_click_id="5" data-manus_clickable="true" data-target="#eservices" data-toggle="collapse" href="#" id="nav-eServices">
        الخدمات الإلكترونيـة
    </a>
<span class="collapse navbar-submenu" data-parent="#navbarResponsive" id="eservices">
<ul class="nav justify-content-center pt-2 pb-2 pl-3 pr-3" style="border:0px solid red;">
<li class="nav-item m-0">
<a href="https://www.moi.gov.kw/main/eservices">
<img alt="Information Systems" class="menu-icon" src="https://www.moi.gov.kw/main/images/assets/it-comm/ico-it-communications.svg"/>
</a>
<a class="nav-link active" href="https://www.moi.gov.kw/main/eservices">
<div class="main-menu-text">الإدارة العامة<br/>لنظم المعلومات</div>
</a>
</li>
<li class="nav-item">
<a href="https://www.moi.gov.kw/gdt">
<img alt="Traffic" class="menu-icon" src="https://www.moi.gov.kw/main/images/assets/general-traffic/ico-general-traffic.svg"/>
</a>
<a class="nav-link" href="https://www.moi.gov.kw/gdt">
<div class="main-menu-text">الإدارة العامة<br/>للمرور</div>
</a>
</li>
<li class="nav-item">
<a href="https://nat.moi.gov.kw/citizenship-passport.nsf/Main?OpenForm&amp;langid=1">
<img alt="Citizenship" class="menu-icon" src="https://www.moi.gov.kw/main/images/assets/citizenship-passport/ico-citizenship-passport.svg"/>
</a>
<a class="nav-link" href="https://nat.moi.gov.kw/citizenship-passport.nsf/Main?OpenForm&amp;langid=1">
<div class="main-menu-text">الإدارة العامة<br/>للجنسية ووثائق السفر</div>
</a>
</li>
<li class="nav-item">
<a href="https://www.moi.gov.kw/main/eservices/residence">
<img alt="Immigration" class="menu-icon" src="https://www.moi.gov.kw/main/images/assets/residency/ico-residence.svg"/>
</a>
<a class="nav-link" href="https://www.moi.gov.kw/main/eservices/residence">
<div class="main-menu-text">الإدارة العامة<br/>لشؤون  الإقامة</div>
</a>
</li>
<li class="nav-item">
<a href="https://www.moi.gov.kw/main/eservices/civildefence">
<img alt="Civil Defence" class="menu-icon" src="https://www.moi.gov.kw/main/images/assets/civil-defence/ico-civil-defence.svg"/>
</a>
<a class="nav-link" href="https://www.moi.gov.kw/main/eservices/civildefence">
<div class="main-menu-text">الإدارة العامة<br/>للدفاع المدني</div>
</a>
</li>
<li class="nav-item">
<a href="https://www.moi.gov.kw/main/eservices/servicecentres">
<img alt="Service Centres" class="menu-icon" src="https://www.moi.gov.kw/main/images/assets/service-centres/ico-service-centre.svg"/>
</a>
<a class="nav-link" href="https://www.moi.gov.kw/main/eservices/servicecentres">
<div class="main-menu-text">الإدارة العامة<br/>لمراكز الخدمة</div>
</a>
</li>
<li class="nav-item">
<a href="https://nat5.moi.gov.kw/Coast-Guard.nsf/Main?openform&amp;langid=1">
<img alt="Coast Guard" class="menu-icon" src="https://www.moi.gov.kw/main/images/assets/coast-guard/ico-coast-guard.svg"/>
</a>
<a class="nav-link" href="https://nat5.moi.gov.kw/Coast-Guard.nsf/Main?openform&amp;langid=1">
<div class="main-menu-text">الإدارة العامة<br/>لخفر السواحل</div>
</a>
</li>
<li class="nav-item">
<a href="https://rnt.moi.gov.kw/pas/">
<img alt="Police Affairs" class="menu-icon" src="https://www.moi.gov.kw/main/images/assets/ico-shoon-quwa.svg"/>
</a>
<a class="nav-link" href="https://rnt.moi.gov.kw/pas/">
<div class="main-menu-text">الإدارة العامة<br/>لشؤون قوة الشرطة</div>
</a>
</li>
<li class="nav-item">
<a href="https://nat4.moi.gov.kw/saad-abdullah-academy.nsf">
<img alt="Saad Abdullah Police Academy" class="menu-icon" src="https://www.moi.gov.kw/main/images/assets/academy/ico-police-academy.svg"/>
</a>
<a class="nav-link" href="https://nat4.moi.gov.kw/saad-abdullah-academy.nsf">
<div class="main-menu-text">أكاديمية سعد العبدالله<br/>للعلوم الأمنية</div>
</a>
</li>
<li class="nav-item">
<a href="https://www.moi.gov.kw/main/eservices/finance">
<img alt="Finance" class="menu-icon" src="https://www.moi.gov.kw/main/images/assets/finance/ico-finance.svg"/>
</a>
<a class="nav-link" href="https://www.moi.gov.kw/main/eservices/finance">
<div class="main-menu-text">الإدارة العامة<br/>للشؤن المالية</div>
</a>
</li>
<li class="nav-item">
<a href="https://eservices5.moi.gov.kw/Investigations.nsf">
<img alt="Investigations" class="menu-icon" src="https://www.moi.gov.kw/main/images/assets/investigations/ico-investigations.svg"/>
</a>
<a class="nav-link" href="https://eservices5.moi.gov.kw/Investigations.nsf">
<div class="main-menu-text">الإدارة العامة<br/>للتحقيقات</div>
</a>
</li>
<li class="nav-item m-0">
<a href="https://www.moi.gov.kw/main/sections/training">
<img alt="Training" class="menu-icon" src="https://www.moi.gov.kw/main/images/assets/training/ico-training.svg"/>
</a>
<a class="nav-link" href="https://www.moi.gov.kw/main/sections/training">
<div class="main-menu-text">الإدارة العامة<br/>للتدريب
                    </div>
</a>
</li>
<li class="nav-item m-0">
<a href="https://www.moi.gov.kw/main/sections/human-resources">
<img alt="Administrative Affairs Dept." class="menu-icon" src="https://www.moi.gov.kw/main/images/assets/human-resources/ico-hr.svg"/>
</a>
<a class="nav-link" href="https://www.moi.gov.kw/main/sections/human-resources">
<div class="main-menu-text">الإدارة العامة<br/>للشئون الإدارية</div>
</a>
</li>
</ul>
</span>
</li>
<li class="nav-item" data-manus_click_id="6" data-manus_clickable="true" id="relatedDepartmentsMenu">
<a aria-controls="relatedDepts" aria-expanded="false" class="nav-link" data-manus_click_id="7" data-manus_clickable="true" data-target="#relatedDepts" data-toggle="collapse" href="#" id="nav-relDepts">
        إدارات توعوية
    </a>
<span class="collapse navbar-submenu" data-parent="#navbarResponsive" id="relatedDepts">
<ul class="nav justify-content-center pt-2 pb-2 pl-3 pr-3" style="border:0px solid red;">
<li class="nav-item m-0">
<a href="https://www.moi.gov.kw/main/sections/cyber-crime">
<img alt="Cyber Crime" class="menu-icon" src="https://www.moi.gov.kw/main/images/assets/cyber-crime/ico-cyber-crime.svg"/>
</a>
<a class="nav-link" href="https://www.moi.gov.kw/main/sections/cyber-crime">
<div class="main-menu-text">إدارة مكافحة<br/>الجرائم الإلكترونية</div>
</a>
</li>
<li class="nav-item m-0">
<a href="https://www.moi.gov.kw/main/sections/juvenile-protection">
<img alt="Juvenile Protection" class="menu-icon" src="https://www.moi.gov.kw/main/images/assets/juvenile-protection/ico-juvenile-protection.svg"/>
</a>
<a class="nav-link" href="https://www.moi.gov.kw/main/sections/juvenile-protection">
<div class="main-menu-text">إدارة حماية الأحداث</div>
</a>
</li>
<li class="nav-item m-0">
<a href="https://www.moi.gov.kw/main/sections/anti-drug">
<img alt="Anti Drug" class="menu-icon" src="https://www.moi.gov.kw/main/images/assets/anti-drug/ico-anti-drug.svg"/>
</a>
<a class="nav-link" href="https://www.moi.gov.kw/main/sections/anti-drug">
<div class="main-menu-text">الإدارة العامة<br/>لمكافحة المخدرات</div>
</a>
</li>
<li class="nav-item m-0">
<a href="https://www.moi.gov.kw/main/sections/anti-human-trafficking">
<img alt="Anti Human Trafficking" class="menu-icon" src="https://www.moi.gov.kw/main/images/assets/cyber-crime/ico-cyber-crime.svg"/>
</a>
<a class="nav-link" href="https://www.moi.gov.kw/main/sections/anti-human-trafficking">
<div class="main-menu-text">إدارة حماية الآداب العامة<br/>ومكافحة الإتجار بالأشخاص</div>
</a>
</li>
<li class="nav-item m-0">
<a href="https://www.moi.gov.kw/main/sections/security-media">
<img alt="Security Media Dept" class="menu-icon" src="https://www.moi.gov.kw/main/images/assets/security-media/ico-security-media.svg"/>
</a>
<a class="nav-link" href="https://www.moi.gov.kw/main/sections/security-media">
<div class="main-menu-text">الإدارة العامة<br/>للعلاقات والإعلام الأمني</div>
</a>
</li>
<li class="nav-item m-0">
<a href="https://eservices2.moi.gov.kw/Correctional-Facilities.nsf/Main?OpenForm&amp;LangID=1">
<img alt="Correctional Facilities" class="menu-icon" src="https://www.moi.gov.kw/main/images/assets/correctional-facilities/icon-correctional-facilities.svg"/>
</a>
<a class="nav-link" href="https://eservices2.moi.gov.kw/Correctional-Facilities.nsf/Main?OpenForm&amp;LangID=1">
<div class="main-menu-text">الإداره العامة<br/>للمؤسسات الإصلاحية</div>
</a>
</li>
<li class="nav-item m-0">
<a href="https://www.moi.gov.kw/main/sections/security-systems">
<img alt="Security Systems" class="menu-icon" src="https://www.moi.gov.kw/main/images/assets/security-systems/ico-security-systems.svg"/>
</a>
<a class="nav-link" href="https://www.moi.gov.kw/main/sections/security-systems">
<div class="main-menu-text">الادارة العامة<br/>للأنظمة الأمنية</div>
</a>
</li>
<li class="nav-item m-0 d-none1">
<a href="https://www.moi.gov.kw/main/sections/national-security">
<img alt="Training" class="menu-icon" src="https://www.moi.gov.kw/main/images/assets/national-security/ico-nat-security.svg"/>
</a>
<a class="nav-link" href="https://www.moi.gov.kw/main/sections/national-security">
<div class="main-menu-text">كلية الأمن الوطني</div>
</a>
</li>
<li class="nav-item m-0">
<a href="https://nat2.moi.gov.kw/GDSRC.nsf">
<img alt="Administrative Affairs Dept." class="menu-icon" src="https://www.moi.gov.kw/main/images/assets/research-studies/ico-research.svg"/>
</a>
<a class="nav-link" href="https://nat2.moi.gov.kw/GDSRC.nsf">
<div class="main-menu-text">الإدارة العامة<br/>لمركز البحوث والدراسات</div>
</a>
</li>
</ul>
</span>
</li>
<li class="nav-item" data-manus_click_id="8" data-manus_clickable="true">
<div class="dropdown">
<a aria-expanded="false" class="nav-link" data-manus_click_id="9" data-manus_clickable="true" data-toggle="collapse" href="#">
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
<li class="nav-item" data-manus_click_id="10" data-manus_clickable="true">
<a class="nav-link" data-manus_click_id="11" data-manus_clickable="true" href="https://eservices.moi.gov.kw:45314/verify/qrcode">
        التحقق من الوثائق
    </a>
</li>
<li class="nav-item" data-manus_click_id="12" data-manus_clickable="true">
<a class="nav-link" data-manus_click_id="13" data-manus_clickable="true" href="https://eservices1.moi.gov.kw/moicus.nsf/moicus?openform&amp;LangID=1">
        يهمنا رايك
    </a>
</li>
<li class="nav-item" data-manus_click_id="14" data-manus_clickable="true" id="navEmergency">
<a class="nav-link" data-manus_click_id="15" data-manus_clickable="true" data-target="#emergencyContactModal" data-toggle="modal" href="#">
        أرقام الطوارئ
    </a>
</li>
<li class="nav-item" data-manus_click_id="16" data-manus_clickable="true" id="navMeta">
<div class="dropdown">
<a aria-expanded="false" class="nav-link" data-manus_click_id="17" data-manus_clickable="true" data-toggle="collapse" href="#">
            منصة المواعيد
        </a>
<div class="dropdown-menu text-right" style="background: #e9e6de;padding:0px;">
<a class="dropdown-item" href="https://meta.e.gov.kw/">
                منصة 'متى'
            </a>
<a class="dropdown-item" href="https://nat2.moi.gov.kw/MOIBioEnrol.nsf/initRequest?OpenForm&amp;LangID=1">
                حجز موعد البصمة البيومترية للخليجيين
            </a>
<a class="dropdown-item" href="https://nat1.moi.gov.kw/MOIeTPAp.nsf/Request?OpenForm&amp;LangID=1">
                حجز مواعيد جوازات السفر المؤقتة والوثائق
            </a>
</div>
</div>
</li>
</div>
<li class="nav-item mt-0 mb-0 mr-auto" data-manus_click_id="18" data-manus_clickable="true" style="border:0px solid red;float:left;">
<div class="form-group text-center" style="border:0px solid white;height:100%;" title="Request culture provider:">
<form action="/main/Home/SetLanguage?returnUrl=%2Fmain%2Feservices%2Fgdt%2Fviolation-enquiry" class="form-horizontal d-flex" id="selectLanguage" method="post" role="form" style="border:0px solid green;height:100%;">
<div class="col-12 d-flex">
<button class="btn btn-lang align-content-center align-self-center text-center" data-manus_click_id="19" data-manus_clickable="true">English</button>
<input name="culture" type="hidden" value="en"/>
</div>
<input name="__RequestVerificationToken" type="hidden" value="CfDJ8BC0QUj6RopNjXFvakHlMJuBXnZ9q-fSltvzackCS7sd6jN51T8j50_zOQL2GQ0rf6zqffotHOazJalGAKkEyusGsg7L2Itu0Jl5lsUpyYv0yvUVKV3Fr7Ccg3FCxUgOixb7Cyo_4ul_L8EP-3qS3yM"/></form>
</div>
</li>
</ul>
</div>
</div>
</nav>
</header>
<div class="container p-0 m-0 content-main">
<div class="rs_skip rsbtn rs_preserve mega_toggle" id="readspeaker_button1"><button aria-controls="readspeaker_button1_toolpanel" aria-expanded="false" aria-label="قائمة webReader" class="rsbtn_tooltoggle" data-manus_click_id="20" data-manus_clickable="true" data-rs-container="readspeaker_button1" data-rs-direction="u" data-rs-tooltip="." data-rsevent-id="rs_648917" data-rslang="title/arialabel:menu" data-rsshortcut="menu" style="display: none;" title="قائمة webReader"><span aria-hidden="true" class="rsicn rsicn-arrow-down"></span></button>
<a aria-haspopup="menu" aria-label="استمع" class="rsbtn_play" data-manus_click_id="21" data-manus_clickable="true" data-rs-direction="u" data-rs-lang="ar_ar" data-rs-tooltip="." data-rs-voice="Amir" data-rsshortcut="play" href="https://app-na.readspeaker.com/cgi-bin/rsent?customerid=56&amp;lang=ar_ar&amp;voice=Amir&amp;readclass=content-main" rel="nofollow" role="button" title="ReadSpeaker webReader إستمع إلى هذه الصفحةِ مستخدماً">
<span class="rsbtn_left rsimg rspart"><span aria-hidden="true" class="rsbtn_text"><span>استمع </span></span></span>
<span class="rsbtn_right rsimg rsplay rspart"></span>
</a>
</div>
<main class="pb-3" role="main">
<link href="https://cdn.datatables.net/1.10.20/css/dataTables.bootstrap4.min.css" rel="stylesheet"/>
<link href="https://cdn.datatables.net/responsive/2.2.3/css/responsive.dataTables.min.css" rel="stylesheet"/>
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
<a data-manus_click_id="22" data-manus_clickable="true" href="https://www.moi.gov.kw/main/eservices/gdt">
<img class="intro-logo m-1" src="https://www.moi.gov.kw/main/images/assets/general-traffic/logo-general-traffic.svg"/>
                     الإدارة العامة للمرور
                </a>
</div>
<div class="col-sm-8"> </div>
</div>
<div class="row text-center">
<div class="col-sm-12 col-md-4 col-lg-4 side-menu text-right">
<div class="row mt-2">
<div class="col-2 mr-1 ml-1">
<a data-manus_click_id="23" data-manus_clickable="true" href="https://edl.moi.gov.kw/">
<img class="side-menu-icon" src="https://www.moi.gov.kw/main/images/assets/general-traffic/ico-renew-license.svg"/>
</a>
</div>
<div class="col-8 align-self-center">
<a data-manus_click_id="24" data-manus_clickable="true" href="https://edl.moi.gov.kw/">
                    الخدمات الالكترونية لرخص السوق
                </a>
</div>
<div class="col-1"> </div>
</div>
<div class="row mt-2">
<div class="col-2 mr-1 ml-1">
<a data-manus_click_id="25" data-manus_clickable="true" href="https://www.moi.gov.kw/main/eservices/gdt/violation-enquiry">
<img class="side-menu-icon" src="https://www.moi.gov.kw/main/images/assets/common/ico-payment.svg"/>
</a>
</div>
<div class="col-8 align-self-center">
<a data-manus_click_id="26" data-manus_clickable="true" href="https://www.moi.gov.kw/main/eservices/gdt/violation-enquiry">
                    دفع المخالفات
                </a>
</div>
<div class="col-1"> </div>
</div>
<div class="row mt-2">
<div class="col-2 mr-1 ml-1">
<a aria-controls="appointmentsMenu" aria-expanded="false" data-manus_click_id="27" data-manus_clickable="true" data-target="#appointmentsMenu" data-toggle="collapse" href="#appointmentsMenu">
<img class="side-menu-icon" src="https://www.moi.gov.kw/main/images/assets/general-traffic/ico-booking.svg"/>
</a>
</div>
<div class="col-8 align-self-center">
<a aria-controls="appointmentsMenu" aria-expanded="false" data-manus_click_id="28" data-manus_clickable="true" data-target="#appointmentsMenu" data-toggle="collapse" href="#appointmentsMenu">
                    نظام مواعيد اختبار القيادة
                </a>
</div>
<div class="col-1"> </div>
</div>
<div class="collapse" id="appointmentsMenu">
<div class="row mt-2 text-justify">
<div class="col-2">
                     
                </div>
<div class="col-8">
<i class="far fa-circle"></i> خدمة المواعيد متاحة عبر تطبيق سهل
                </div>
<div class="col-2"> </div>
</div>
<div class="row mt-2 text-justify">
<div class="col-2">
                     
                </div>
<div class="col-8">
<a href="https://ttd.moi.gov.kw/">
<i class="far fa-circle"></i> اختبر نفسك
                    </a>
</div>
<div class="col-2"> </div>
</div>
</div>
<div class="row mt-2">
<div class="col-2 mr-1 ml-1">
<a data-manus_click_id="29" data-manus_clickable="true" href="https://www.moi.gov.kw/main/eservices/gdt/services">
<img class="side-menu-icon" src="https://www.moi.gov.kw/main/images/assets/general-traffic/ico-procedures.svg"/>
</a>
</div>
<div class="col-8 align-self-center">
<a data-manus_click_id="30" data-manus_clickable="true" href="https://www.moi.gov.kw/main/eservices/gdt/services">
                     معاملات المرور
                </a>
</div>
</div>
<div class="row mt-2">
<div class="col-2 mr-1 ml-1">
<a aria-controls="sectionsMenu" aria-expanded="false" data-manus_click_id="31" data-manus_clickable="true" data-target="#sectionsMenu" data-toggle="collapse" href="#sectionsMenu">
<img class="side-menu-icon" src="https://www.moi.gov.kw/main/images/assets/general-traffic/ico-locations-sections.svg"/>
</a>
</div>
<div class="col-8 align-self-center">
<a data-manus_click_id="32" data-manus_clickable="true" href="https://www.moi.gov.kw/main/eservices/gdt/locations">
                     مواقع الإدارة العامة للمرور
                </a>
</div>
</div>
<div class="row mt-2">
<div class="col-2 mr-1 ml-1">
<a data-manus_click_id="33" data-manus_clickable="true" href="https://www.moi.gov.kw/main/content/docs/gdt/driving-license-conditions.pdf">
<img class="side-menu-icon" src="https://www.moi.gov.kw/main/images/assets/common/ico-pdf-doc.svg"/>
</a>
</div>
<div class="col-8 align-self-center">
<a data-manus_click_id="34" data-manus_clickable="true" href="https://www.moi.gov.kw/main/content/docs/gdt/driving-license-conditions.pdf">
                شروط منح رخص السوق لغير الكويتيين
            </a>
</div>
</div>
</div>
<div class="col-sm-12 col-md-8 col-lg-8" id="GDTContent">
<div class="row">
<div class="col-3"> </div>
<div class="col-6">
<div class="title">
                            الإدارة العامة للمرور
                        </div>
<div>
<img src="https://www.moi.gov.kw/main/images/assets/common/ico-horizontal-bar.svg"/>
</div>
</div>
<div class="col-3"> </div>
</div>
<div class="row mt-2 pl-4 pr-4 pb-5 text-justify">
<div class="col-12">
<form data-manus_click_id="35" data-manus_clickable="true" id="enquireForm" novalidate="novalidate">
<div class="form-row d1-none">
<div class="col-sm-12 col-md-6">
<label>Enquiry Type</label>
<select class="form-control" data-manus_click_id="36" data-manus_clickable="true" id="enquiryType">
<option selected="" value="1">الأفراد</option>
<option value="2">الشركات</option>
</select>
</div>
</div>
<div class="form-row mt-2">
<div class="col-sm-12 col-md-6">
<label id="lblEnquiryType">الرقم المدني أو الرقم الموحد</label>
<input class="form-control" data-manus_click_id="37" data-manus_clickable="true" id="civilId" maxlength="12" minlength="12" name="civilId"/>
</div>
</div>
<div class="form-row mt-2">
<div class="col-sm-12 col-md-4">
<button class="btn btn-primary btn-block mt-2 mt-md-0" data-manus_click_id="38" data-manus_clickable="true" id="btnEnquire">إستعلم</button>
</div>
</div>
<div class="form-row p-3 mt-3 d-none text-right" id="responseInfo" style="border-bottom:2px solid #d6dce5;">
</div>
<div class="form-row align-self-center mt-2">
<div class="col-12 text-left" id="payingAmount"></div>
</div>
<div class="form-row mt-3">
<div class="col-12 text-right font-weight-bold mb-2">
                                    بعد إجراء عملية الدفع.. يرجى عدم محاولة الدفع مرة أخرى حيث يجرى تحديث البيانات خلال 15 دقيقة
                                </div>
<div class="col-sm-12 col-md-4 text-right">
<input class="btn btn-primary btn-block d-none" disabled="" id="btnPay" type="button" value="إدفع"/>
</div>
<div class="col-sm-12 col-md-6 align-self-center"> </div>
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
<div class="spinner-grow text-secondary d-none" id="workingOnIt" role="status">
<span class="sr-only">Loading...</span>
</div>
</div>
<div class="row mt-2 pl-4 pr-4 pb-5 text-center d-none">
<div class="col-12">
                        The service will be available shortly
                        <br/>
                        الخدمة ستعود قريباً
                    </div>
</div>
</div>
</div>
</div>
</div>
</main>
</div>
<div class="d-none" id="overlay"></div>

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
<mqa class="container bottom-slider-sm p-0 m-0 d-md-none d-lg-none d-sm-block"><div class="row p-0 m-0">
<div class="accordion w-100" id="sm-accordion">
<!--TRAFFIC VIOLATION-->
<div class="card slider-card">
<div class="card-header text-center" id="headingOne">
<a aria-controls="collapsePayFines" aria-expanded="true" data-target="#collapsePayFines" data-toggle="collapse" href="#collapsePayFines" role="button">
<svg data-name="Layer 1" height="8.572em" id="Layer_1" viewbox="0 0 103 103" width="8.572em" xmlns="http://www.w3.org/2000/svg">
<title>Payment</title>
<rect class="circle cls-1" height="100" rx="50" width="100" x="1.01" y="1.26"></rect>
<path class="kd cls-2" d="M63.55,70.16l-6.06-7v7H55.27V56.25h2.22v6.06l5.84-6.06h2.75L59.59,62.5l6.73,7.66Z"></path>
<path class="kd cls-2" d="M67.49,70.16v-2.5H69.4v2.5Z"></path>
<path class="kd cls-2" d="M71.42,70.16V56.25h6.32c3.81,0,4.91,1.59,4.91,6.06v1.78c0,4.47-1.1,6.07-4.91,6.07Zm9-8c0-2.89-.46-4.36-2.89-4.36H73.62V68.58h3.94c2.25,0,2.89-1.3,2.89-4.2Z"></path>
<rect class="cls-1" height="46.97" width="71.3" x="15.44" y="27.78"></rect>
<line class="cls-1" x1="22.53" x2="39.12" y1="56.6" y2="56.6"></line>
<line class="cls-1" x1="32.8" x2="38.33" y1="62.13" y2="62.13"></line>
<line class="cls-1" x1="22.53" x2="38.33" y1="67.66" y2="67.66"></line>
<line class="cls-1" x1="15.29" x2="86.4" y1="36.28" y2="36.28"></line>
<line class="cls-1" x1="15.29" x2="86.4" y1="47.83" y2="47.83"></line>
</svg>
</a>
</div>
<div aria-labelledby="headingOne" class="collapse" data-parent="#sm-accordion" id="collapsePayFines">
<div class="card-body article-info text-center">
<h5 class="title">دفع المخالفات والغرامات</h5>
<img src="https://www.moi.gov.kw/main/images/assets/common/ico-horizontal-bar.svg"/>
<form id="MQAFines">
<div class="col-12">
<select class="form-control" id="MQAFinesSelectFineType" name="MQAFinesSelectFineType">
<option value="1">المرور</option>
<option value="2">الإقامة</option>
</select>
</div>
<div class="col-12 mt-1">
<input class="form-control" id="MQAFinesTextCivilId" maxlength="12" name="MQAFinesTextCivilId" pattern="^[0–9]$" placeholder="الرقم المدني" type="tel"/>
</div>
<button class="btn btn-secondary mt-3" id="btnMEnquire">دفع</button>
</form>
</div>
</div>
</div>
<!--APPOINTMENTS
            <div class="card slider-card">
                <div class="card-header text-center" id="headingTwo">
                    <a role="button" data-target="#collapseAppointments" href="#collapsePersonalEnquiry" data-toggle="collapse" aria-expanded="false" aria-controls="collapsePersonalEnquiry">
                        <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Layer_1" x="0px" y="0px" width="8.572em" height="8.572em" viewBox="0 0 103 103" style="enable-background:new 0 0 103 103;" xml:space="preserve">
                        <defs>
    <style>
        .appt-cls-1 {
            fill: #000576;
        }

        .appt-cls-2 {
            fill: none;
            stroke: #fff;
            stroke-miterlimit: 10;
        }

        .appt-cls-3 {
            fill: #fff;
        }
    </style>
    </defs>
    <path class="appt-cls-1" d="M51.5,1.5h0a50,50,0,0,1,50,50h0a50,50,0,0,1-50,50h0a50,50,0,0,1-50-50h0A50,50,0,0,1,51.5,1.5Z" ></path>

    <rect class="appt-cls-2" x="28.77" y="22.27" width="45.47" height="58.46" rx="0.32" ></rect>

    <rect class="appt-cls-2" x="33.64" y="49.88" width="35.72" height="16.24" ></rect>

    <line class="appt-cls-2" x1="69.05" y1="58.5" x2="33.43" y2="58.5" ></line>

    <line class="appt-cls-2" x1="56.37" y1="49.88" x2="56.37" y2="66.11" ></line>

    <line class="appt-cls-2" x1="46.63" y1="49.88" x2="46.63" y2="66.11" ></line>

    <rect class="appt-cls-2" x="59.62" y="30.39" width="3.25" height="6.5" ></rect>

    <rect class="appt-cls-2" x="40.13" y="30.39" width="3.25" height="6.5" ></rect>

    <line class="appt-cls-2" x1="63.07" y1="33.79" x2="74.12" y2="33.79" ></line>

    <line class="appt-cls-2" x1="59.62" y1="33.64" x2="43.38" y2="33.64" ></line>

    <line class="appt-cls-2" x1="40.13" y1="33.64" x2="28.95" y2="33.64" ></line>

    <polygon class="appt-cls-3" points="44.6 57.11 53 63.11 63.8 46.31 60.2 43.91 51.8 55.91 48.2 53.51 44.6 57.11" ></polygon>

    </svg>
                    </a>
                </div>
                <div id="collapseAppointments" class="collapse" aria-labelledby="headingTwo" data-parent="#sm-accordion">
                    <div class="card-body article-info text-center">
                        <div class="col-12 title">منصة المواعيد</div>
                        <div class="col-12">
                            <img src="https://www.moi.gov.kw/main/images/assets/common/ico-horizontal-bar.svg" />
                        </div>
                        <div class="col-12">

                        </div>
                        <div class="col-12">

    <a href="https://nat5.moi.gov.kw/moieap.nsf/request?openform&langid=1" class="btn btn-primary d-none">تبصيم الشركات</a><br/><br/>
                            <a href="https://meta.e.gov.kw/ar/">
                                <img style="width:170px;" src="https://www.moi.gov.kw/main/images/assets/logo-meta-ar.png" />
                            </a>
                        </div>
    </div>
                </div>
            </div>-->
<!--HEALTH CHECK-->
<div class="card slider-card d-none">
<div class="card-header text-center" id="headingFour">
<a aria-controls="collapseHealthCheck" aria-expanded="false" data-target="#collapseHealthCheck" data-toggle="collapse" href="#collapseHealthCheck" role="button">
<img class="moi-ico" src="https://www.moi.gov.kw/main/images/assets/common/ico-health-check-status.svg"/>
</a>
</div>
<div aria-labelledby="headingFour" class="collapse" data-parent="#sm-accordion" id="collapseHealthCheck">
<div class="card-body article-info text-center">
<h5 class="title">جاهزية نتيجة الفحص الطبي</h5>
<img src="https://www.moi.gov.kw/main/images/assets/common/ico-horizontal-bar.svg"/>
<form id="MQAHealthCheck" novalidate="novalidate">
<div class="col-12">
<input class="form-control" id="MQAHealthCheckTextNationalNo" maxlength="12" name="MQAHealthCheckTextNationalNo" placeholder="رقم المرجع"/>
</div>
<div class="col-12">
<button class="btn btn-block btn-secondary mt-3" id="btnMQAHealthCheck">إستعلم</button>
<div class="d-flex justify-content-center">
<div class="spinner-grow text-secondary d-none" id="MQAHCWorkingOnIt" role="status">
<span class="sr-only">Loading...</span>
</div>
</div>
<div class="d-none mt-3" id="MQAHealthReport"></div>
</div>
</form>
</div>
</div>
</div>
<!--CASE FILE CHECK-->
<div class="card slider-card">
<div class="card-header active-acc text-center" id="headingFour">
<a aria-controls="collapseCaseCheck" aria-expanded="false" data-target="#collapseCaseCheck" data-toggle="collapse" href="#collapseCaseCheck" role="button">
<img class="moi-ico" src="https://www.moi.gov.kw/main/images/assets/common/ico-case-track.svg"/>
</a>
</div>
<div aria-labelledby="headingFour" class="collapse" data-parent="#sm-accordion" id="collapseCaseCheck">
<div class="card-body article-info text-center">
<h5 class="title">الاستعلام عن سير القضية</h5>
<img src="https://www.moi.gov.kw/main/images/assets/common/ico-horizontal-bar.svg"/>
<form id="MQACaseCheck" novalidate="novalidate">
<div class="col-12">
<input class="form-control" id="MQACaseCheckTextNationalNo" maxlength="12" name="MQACaseCheckTextNationalNo" placeholder="رقم المرجع"/>
</div>
<div class="col-12">
<button class="btn btn-block btn-secondary mt-3" id="btnMQACaseCheck">إستعلم</button>
<div class="d-flex justify-content-center">
<div class="spinner-grow text-secondary d-none" id="MQACCWorkingOnIt" role="status">
<span class="sr-only">Loading...</span>
</div>
</div>
</div>
</form>
</div>
</div>
</div>
<!--SMS CHANGE COMPANY-->
<div class="card slider-card d-none">
<div class="card-header text-center" id="headingTwo">
<a aria-controls="collapsePersonalEnquiry" aria-expanded="false" data-target="#collapsePersonalEnquiry" data-toggle="collapse" href="#collapsePersonalEnquiry" role="button">
<svg height="8.572em" id="Layer_1" style="enable-background:new 0 0 103 103;" version="1.1" viewbox="0 0 103 103" width="8.572em" x="0px" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" y="0px">
<style type="text/css">
                        .st0 {
                            fill: none;
                            stroke: #fff;
                            stroke-width: 2;
                            stroke-miterlimit: 10;
                        }

                        .st1 {
                            enable-background: new;
                        }

                        .st2 {
                            fill: #fff;
                        }

                        .st3 {
                            fill: none;
                            stroke: #fff;
                            stroke-miterlimit: 10;
                        }
</style>
<title>sms</title>
<path class="circle st0" d="M51.5,1.5L51.5,1.5c27.6,0,50,22.4,50,50l0,0c0,27.6-22.4,50-50,50l0,0c-27.6,0-50-22.4-50-50l0,0  C1.5,23.9,23.9,1.5,51.5,1.5z"></path>
<g class="st1">
<path class="st2" d="M35.2,46.2c0-0.2,0.1-0.5,0.1-0.7c0-1.8-1.5-2-2.9-2c-2.8,0-3.3,0.6-3.3,2.2c0,1,0.3,1.6,1.1,2   c0.8,0.4,1.9,0.4,2.8,0.6c2.8,0.3,5.5,0.7,5.5,4.5c0,3.9-2.9,4.5-6,4.5c-2.7,0-6.2-0.3-6.3-4c0-0.3,0-0.6,0-0.9h2.9   c0,0.2,0,0.4,0,0.6c0,2.1,1.7,2.4,3.4,2.4c1.6,0,3.2-0.1,3.2-2.3c0-2.2-1.4-2.3-3.8-2.6c-3-0.3-5.8-0.8-5.8-4.4   c0-3.2,1.8-4.3,6-4.3c3.4,0,5.8,0.4,5.9,3.6c0,0.3,0,0.7-0.1,0.9H35.2z"></path>
<path class="st2" d="M59.1,56.8V46c0-1.2-0.3-2.2-2.7-2.2c-1.9,0-2.9,0.8-3.2,2.1v10.9h-2.9V46c0-1.3-0.3-2.2-2.7-2.2   c-1.8,0-2.9,0.4-3.3,2.3v10.8h-3.1V41.9h3.1v2c0.8-1.2,2.4-2.3,4.8-2.3c2.7,0,3.7,0.9,4,2.3c1-1.4,2.6-2.3,4.8-2.3   c3.5,0,4.2,1.4,4.2,3.7v11.5H59.1z"></path>
<path class="st2" d="M73.7,46.2c0-0.2,0.1-0.5,0.1-0.7c0-1.8-1.5-2-2.9-2c-2.8,0-3.3,0.6-3.3,2.2c0,1,0.3,1.6,1.1,2   c0.8,0.4,1.9,0.4,2.8,0.6c2.8,0.3,5.5,0.7,5.5,4.5c0,3.9-2.9,4.5-6,4.5c-2.7,0-6.2-0.3-6.3-4c0-0.3,0-0.6,0-0.9h2.9   c0,0.2,0,0.4,0,0.6c0,2.1,1.7,2.4,3.4,2.4c1.6,0,3.2-0.1,3.2-2.3c0-2.2-1.4-2.3-3.8-2.6c-3-0.3-5.8-0.8-5.8-4.4   c0-3.2,1.8-4.3,6-4.3c3.4,0,5.8,0.4,5.9,3.6c0,0.3,0,0.7-0.1,0.9H73.7z"></path>
</g>
<text class="st2" style="font-family:'DDTRg-Regular'; font-size:28px;" transform="matrix(1 0 0 1 -231.0191 -27.0389)">sms</text>
<path class="st3" d="M30.6,82c0,0,0.5-9.4,6.1-12c0.6-0.3,1.2-0.4,1.9-0.4l45.2,0.2V28.4H20.8v41.4h5.4L30.6,82z"></path>
</svg>
</a>
</div>
<div aria-labelledby="headingTwo" class="collapse" data-parent="#sm-accordion" id="collapsePersonalEnquiry">
<div class="card-body article-info text-center">
<div class="col-12 title">تعديل شركة الإتصالات</div>
<div class="col-12">
<img src="https://www.moi.gov.kw/main/images/assets/common/ico-horizontal-bar.svg"/>
</div>
<form asp-action="change" asp-controller="sms" id="MQAChangeCompany">
<div class="row">
<div class="col-12">
<input class="form-control" id="MQATextMobile" maxlength="8" name="MQATextMobile" pattern="^[0–9]$" placeholder="*الموبايل" type="tel"/>
</div>
</div>
<div class="row mt-1">
<div class="col-12">
<input class="form-control" id="MQATextCivilId" maxlength="12" name="MQATextCivilId" pattern="^[0–9]$" placeholder="الرقم المدني" type="tel"/>
</div>
</div>
<div class="row mt-1 no-gutters">
<div class="col-sm-12 col-md-5">
<select class="form-control" id="MQASelectCompany" name="MSelectCompany">
<option value="1">VIVA</option>
<option value="2">OOREDOO</option>
<option value="3">ZAIN</option>
</select>
</div>
<div class="col-sm-12 col-md-7 mt-1">
<input autocomplete="off" class="form-control" id="MQATextActivationCode" maxlength="4" name="MQATextActivationCode" pattern="^[0–9]$" placeholder="*رقم التفعيل" type="password"/>
</div>
</div>
<div class="row mt-1">
<div class="col-12">
<button class="btn btn-block btn-secondary" id="MQABtnChange">تعديل</button>
<div class="d-flex justify-content-center">
<div class="spinner-grow text-secondary d-none" id="MQAWorkingOnIt" role="status">
<span class="sr-only">Loading...</span>
</div>
</div>
</div>
</div>
</form>
</div>
</div>
</div>
<!--GET REFERENCE NUMBER-->
<div class="card slider-card">
<div class="card-header text-center" id="mGetReferenceNumber">
<a aria-controls="collapseGetRefNum" aria-expanded="false" data-target="#collapseGetRefNum" data-toggle="collapse" href="#collapseGetRefNum" role="button">
<img class="moi-ico" id="getRefNumPopMob" src="https://www.moi.gov.kw/main/images/assets/common/ico-get-ref-num.svg"/>
</a>
</div>
<div aria-labelledby="mGetReferenceNumber" class="collapse show" data-parent="#sm-accordion" id="collapseGetRefNum">
<div class="card-body article-info text-center">
<h5 class="title">الإستعلام عن رقم مرجع الداخلية</h5>
<img src="https://www.moi.gov.kw/main/images/assets/common/ico-horizontal-bar.svg"/>
<!--<form id="MQARefNum">
                <div class="col-12">
                    <input class="form-control" id="MQARefNumTextCivilId" name="MQARefNumTextCivilId" maxlength="12" placeholder="الرقم المدني" />
                </div>
                <div class="col-12 mt-1 d-none">
                    <input class="form-control" id="MQARefNumTextPassport" name="MQARefNumTextPassport" maxlength="15" placeholder="رقم جواز السفر" />
                </div>
                <div class="col-12 mt-1 d-none">
                    <input readonly class="form-control" id="MQARefNumTextExpiryDate" name="MQARefNumTextExpiryDate" maxlength="10" placeholder="تاريخ الانتهاء جواز السفر" />
                </div>
                <div class="col-12 d-none">
                    <button class="btn btn-block btn-secondary mt-2" id="btnMGetRefNum">استعلم</button>-->
<!--<div class="d-flex justify-content-center">
                    <div class="spinner-grow text-secondary d-none" role="status" id="MQARNWorkingOnIt">
                        <span class="sr-only">Loading...</span>
                    </div>
                </div>-->
<!--</div>
                    <div class="col-12">
                        <button type="button" class="btn btn-block btn-secondary mt-2" id="btnMGetRefNumKwti">Kuwaiti</button>
                    </div>
                    <div class="col-12">
                        <button type="button" class="btn btn-block btn-secondary mt-2" id="btnMGetRefNumOther">Non-Kuwaiti</button>
                    </div>
                </form>
                <div class="col-12 d-none" id="MQANatNumResultContainer">
                    <div class="row">
                        <div class="col-12" id="MQANatNumResult"></div>
                        <div class="col-12">
                            <button type="button" class="btn btn-block btn-secondary mt-2" id="btnMGetRefNumDone">إغلاق</button>
                        </div>
                    </div>
                </div>-->
<div class="col-12">
<input class="form-control" id="MQARefNumTextCivilId" maxlength="12" name="MQARefNumTextCivilId" placeholder="الرقم المدني"/>
</div>
<div class="col-12">
<button class="btn btn-block btn-secondary mt-2" id="btnMGetRefNumKwti" type="button">للكويتين</button>
</div>
<div class="col-12">
<button class="btn btn-block btn-secondary mt-2" id="btnMGetRefNumOther" type="button">للمقيمين</button>
</div>
</div>
</div>
</div>
<!--NEW SERVICES-->
<div class="card slider-card">
<div class="card-header text-center" id="headingFour">
<a data-target="#newServicesModal" data-toggle="modal">
<img class="card-img-top center-block moi-ico mx-auto" id="newServicesPopMob" src="https://www.moi.gov.kw/main/images/assets/common/ico-new-services.svg"/>
</a>
</div>
</div>
</div>
</div>



</mqa>
<div class="container p-0 m-0" id="dqaContainer">
<!--Slider Bottom Menu for desktop-->
<dqa class="container p-0 m-0 d-none d-md-block bottom-slider"><link href="https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css" rel="stylesheet"/>
<link href="https://npmcdn.com/flatpickr/dist/themes/dark.css" rel="stylesheet" type="text/css"/>
<link href="https://www.moi.gov.kw/main/lib/flatpickr/plugins/year-dropdown.css" rel="stylesheet" type="text/css"/>
<div class="row p-0 m-0" style="height:221px;">
<!--TRAFFIC VIOLATION-->
<div style="height:100%;">
<a class="acc-header">
<label class="footer-icon" style="width: 200px; float: right;">
<svg data-name="Layer 1" height="8.572em" id="Layer_1" viewbox="0 0 103 103" width="8.572em" xmlns="http://www.w3.org/2000/svg">
<title>Payment</title>
<rect class="circle cls-1" height="100" rx="50" width="100" x="1.01" y="1.26"></rect>
<path class="kd cls-2" d="M63.55,70.16l-6.06-7v7H55.27V56.25h2.22v6.06l5.84-6.06h2.75L59.59,62.5l6.73,7.66Z"></path>
<path class="kd cls-2" d="M67.49,70.16v-2.5H69.4v2.5Z"></path>
<path class="kd cls-2" d="M71.42,70.16V56.25h6.32c3.81,0,4.91,1.59,4.91,6.06v1.78c0,4.47-1.1,6.07-4.91,6.07Zm9-8c0-2.89-.46-4.36-2.89-4.36H73.62V68.58h3.94c2.25,0,2.89-1.3,2.89-4.2Z"></path>
<rect class="cls-1" height="46.97" width="71.3" x="15.44" y="27.78"></rect>
<line class="cls-1" x1="22.53" x2="39.12" y1="56.6" y2="56.6"></line>
<line class="cls-1" x1="32.8" x2="38.33" y1="62.13" y2="62.13"></line>
<line class="cls-1" x1="22.53" x2="38.33" y1="67.66" y2="67.66"></line>
<line class="cls-1" x1="15.29" x2="86.4" y1="36.28" y2="36.28"></line>
<line class="cls-1" x1="15.29" x2="86.4" y1="47.83" y2="47.83"></line>
</svg>
</label>
</a>
<div class="article">
<div class="article-info">
<div class="row text-center">
<div class="col-12 title">دفع المخالفات والغرامات</div>
<div class="col-12">
<img src="https://www.moi.gov.kw/main/images/assets/common/ico-horizontal-bar.svg"/>
</div>
<form id="QAFines">
<div class="col-12">
<select class="form-control" data-manus_click_id="39" data-manus_clickable="true" id="QAFinesSelectFineType" name="QAFinesSelectFineType">
<option value="1">المرور</option>
<option value="2">الإقامة</option>
</select>
</div>
<div class="col-12 mt-1">
<input class="form-control" data-manus_click_id="40" data-manus_clickable="true" id="QAFinesTextCivilId" maxlength="12" name="QAFinesTextCivilId" placeholder="الرقم المدني"/>
</div>
<div class="col-12">
<button class="btn btn-block btn-secondary mt-3" data-manus_click_id="41" data-manus_clickable="true" id="QABtnEnquireFines">دفع</button>
</div>
</form>
</div>
</div>
</div>
</div>
<!--APPOINTMENTS-->
<div class="d-none">
<a class="acc-header">
<label class="footer-icon" style="width: 200px; float: right;">
<svg height="8.572em" id="Layer_1" style="enable-background:new 0 0 103 103;" version="1.1" viewbox="0 0 103 103" width="8.572em" x="0px" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" y="0px">
<defs>
<style>
    .appt-cls-1 {
        fill: #000576;
    }

    .appt-cls-2 {
        fill: none;
        stroke: #fff;
        stroke-miterlimit: 10;
    }

    .appt-cls-3 {
        fill: #fff;
    }
</style>
</defs>
<path class="appt-cls-1" d="M51.5,1.5h0a50,50,0,0,1,50,50h0a50,50,0,0,1-50,50h0a50,50,0,0,1-50-50h0A50,50,0,0,1,51.5,1.5Z"></path>
<rect class="appt-cls-2" height="58.46" rx="0.32" width="45.47" x="28.77" y="22.27"></rect>
<rect class="appt-cls-2" height="16.24" width="35.72" x="33.64" y="49.88"></rect>
<line class="appt-cls-2" x1="69.05" x2="33.43" y1="58.5" y2="58.5"></line>
<line class="appt-cls-2" x1="56.37" x2="56.37" y1="49.88" y2="66.11"></line>
<line class="appt-cls-2" x1="46.63" x2="46.63" y1="49.88" y2="66.11"></line>
<rect class="appt-cls-2" height="6.5" width="3.25" x="59.62" y="30.39"></rect>
<rect class="appt-cls-2" height="6.5" width="3.25" x="40.13" y="30.39"></rect>
<line class="appt-cls-2" x1="63.07" x2="74.12" y1="33.79" y2="33.79"></line>
<line class="appt-cls-2" x1="59.62" x2="43.38" y1="33.64" y2="33.64"></line>
<line class="appt-cls-2" x1="40.13" x2="28.95" y1="33.64" y2="33.64"></line>
<polygon class="appt-cls-3" points="44.6 57.11 53 63.11 63.8 46.31 60.2 43.91 51.8 55.91 48.2 53.51 44.6 57.11"></polygon>
</svg>
</label>
</a>
<div class="article">
<div class="article-info">
<div class="row text-center">
<div class="col-12 title">
                        منصة المواعيد
                    </div>
<div class="col-12">
<img src="https://www.moi.gov.kw/main/images/assets/common/ico-horizontal-bar.svg"/>
</div>
<!--<form id="QAAppointmentStatus">-->
<div class="col-12 mt-2">
<!--<a href="https://eservices3.moi.gov.kw/MOIeAp.nsf/Requeststatus?openform&langid=1" class="btn btn-block btn-secondary mt-2">إستعلام عن حالة تصريح السفر</a>-->
<!--<button class="btn btn-block btn-secondary" id="QAApptsBtnBook">إستكمال الحجز</button>
                        <a href="/main/eservices/residence/illegals-appointments" class="btn btn-block btn-secondary mt-2">تعديل أوضاع مخالفي
                        <br />
                        قانون إقامة الأجانب
                        </a>-->
</div>
<div class="col-12">
<!--<select id="QAApptsSelectDept" class="form-control mt-3">
                                    <option value="">إختر</option>
                                    <option value="E">الإدارة العامة للأدلة الجنائية</option>
                                    <option value="AA">قطاع الشؤون الإدارية</option>
                                    <option value="HA">إدارة الشؤون الصحية</option>
                                    <option value="FA">قطاع شؤون المالية</option>
                                    <option value="I">الإدارة العامة للتحقيقات</option>
                                    <option value="J">الإدارة العامة لتنفيذ الأحكام</option>
                                    <option value="X">الإدارة المركزية لإجراءات دخول/خروج</option>
                                    <option value="R">قطاع شئون الإقامة</option>
                                    <option value="N">الإدارة العامة للجنسية ووثائق السفر</option>
                                    <option value="T">قطاع المرور والعمليات</option>
                                    <option value="W">الإدارة العامة لمباحث السلاح</option>
                                    <option value="F">مباحث شؤون الإقامة</option>
                                    <option value="M">مبنى نواف الأحمد-صبحان</option>
                                    <option value="S">مركز خدمة المواطن</option>
                        <option value="VI">حجز موعد فحص فني خارجي للمركبات</option>-->
<!--<option value="B">الإدارة العامة لأمن المطار</option>-->
<!--</select>-->
<br/>
<a class="btn btn-primary d-none" href="https://nat5.moi.gov.kw/moieap.nsf/request?openform&amp;langid=1">تبصيم الشركات</a><br/><br/>
<a href="https://meta.e.gov.kw/ar/">
<img src="https://www.moi.gov.kw/main/images/assets/logo-meta-ar.png" style="width:170px;"/>
</a>
</div>
<!--<div class="col-12">
                        <a href="https://eservices3.moi.gov.kw/MOIeAp.nsf/Request?OpenForm&LangID=1" class="btn btn-block btn-secondary mt-2">إستكمال الحجز </a>
                    </div>

                    <!--</form>-->
</div>
</div>
</div>
</div>
<!--CHANGE OPERATOR-->
<div class="d-none" style="height:221px;">
<a class="acc-header">
<label class="footer-icon" style="width: 200px; float: right;">
<svg height="8.572em" id="Layer_1" style="enable-background:new 0 0 103 103;" version="1.1" viewbox="0 0 103 103" width="8.572em" x="0px" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" y="0px">
<style type="text/css">
                    .st0 {
                        fill: none;
                        stroke: #fff;
                        stroke-width: 2;
                        stroke-miterlimit: 10;
                    }

                    .st1 {
                        enable-background: new;
                    }

                    .st2 {
                        fill: #fff;
                    }

                    .st3 {
                        fill: none;
                        stroke: #fff;
                        stroke-miterlimit: 10;
                    }
</style>
<title>sms</title>
<path class="circle st0" d="M51.5,1.5L51.5,1.5c27.6,0,50,22.4,50,50l0,0c0,27.6-22.4,50-50,50l0,0c-27.6,0-50-22.4-50-50l0,0  C1.5,23.9,23.9,1.5,51.5,1.5z"></path>
<g class="st1">
<path class="st2" d="M35.2,46.2c0-0.2,0.1-0.5,0.1-0.7c0-1.8-1.5-2-2.9-2c-2.8,0-3.3,0.6-3.3,2.2c0,1,0.3,1.6,1.1,2   c0.8,0.4,1.9,0.4,2.8,0.6c2.8,0.3,5.5,0.7,5.5,4.5c0,3.9-2.9,4.5-6,4.5c-2.7,0-6.2-0.3-6.3-4c0-0.3,0-0.6,0-0.9h2.9   c0,0.2,0,0.4,0,0.6c0,2.1,1.7,2.4,3.4,2.4c1.6,0,3.2-0.1,3.2-2.3c0-2.2-1.4-2.3-3.8-2.6c-3-0.3-5.8-0.8-5.8-4.4   c0-3.2,1.8-4.3,6-4.3c3.4,0,5.8,0.4,5.9,3.6c0,0.3,0,0.7-0.1,0.9H35.2z"></path>
<path class="st2" d="M59.1,56.8V46c0-1.2-0.3-2.2-2.7-2.2c-1.9,0-2.9,0.8-3.2,2.1v10.9h-2.9V46c0-1.3-0.3-2.2-2.7-2.2   c-1.8,0-2.9,0.4-3.3,2.3v10.8h-3.1V41.9h3.1v2c0.8-1.2,2.4-2.3,4.8-2.3c2.7,0,3.7,0.9,4,2.3c1-1.4,2.6-2.3,4.8-2.3   c3.5,0,4.2,1.4,4.2,3.7v11.5H59.1z"></path>
<path class="st2" d="M73.7,46.2c0-0.2,0.1-0.5,0.1-0.7c0-1.8-1.5-2-2.9-2c-2.8,0-3.3,0.6-3.3,2.2c0,1,0.3,1.6,1.1,2   c0.8,0.4,1.9,0.4,2.8,0.6c2.8,0.3,5.5,0.7,5.5,4.5c0,3.9-2.9,4.5-6,4.5c-2.7,0-6.2-0.3-6.3-4c0-0.3,0-0.6,0-0.9h2.9   c0,0.2,0,0.4,0,0.6c0,2.1,1.7,2.4,3.4,2.4c1.6,0,3.2-0.1,3.2-2.3c0-2.2-1.4-2.3-3.8-2.6c-3-0.3-5.8-0.8-5.8-4.4   c0-3.2,1.8-4.3,6-4.3c3.4,0,5.8,0.4,5.9,3.6c0,0.3,0,0.7-0.1,0.9H73.7z"></path>
</g>
<text class="st2" style="font-family:'DDTRg-Regular'; font-size:28px;" transform="matrix(1 0 0 1 -231.0191 -27.0389)">sms</text>
<path class="st3" d="M30.6,82c0,0,0.5-9.4,6.1-12c0.6-0.3,1.2-0.4,1.9-0.4l45.2,0.2V28.4H20.8v41.4h5.4L30.6,82z"></path>
</svg>
</label>
</a>
<div class="article">
<div class="article-info">
<div class="row text-center">
<div class="col-12 title">تعديل شركة الإتصالات</div>
<div class="col-12">
<img src="https://www.moi.gov.kw/main/images/assets/common/ico-horizontal-bar.svg"/>
</div>
<div class="col-12">
<form asp-action="change" asp-controller="sms" id="QAChangeCompany">
<div class="row">
<div class="col-12">
<input class="form-control" id="QATextMobile" maxlength="8" name="QATextMobile" placeholder="*الموبايل" type="tel"/>
</div>
</div>
<div class="row mt-1">
<div class="col-12">
<input class="form-control" id="QATextCivilId" maxlength="12" name="QATextCivilId" placeholder="*الرقم المدني"/>
</div>
</div>
<div class="row mt-1 no-gutters">
<div class="col-sm-12 col-md-5">
<select class="form-control" id="QASelectCompany" name="QASelectCompany">
<option value="1">VIVA</option>
<option value="2">OOREDOO</option>
<option value="3">ZAIN</option>
</select>
</div>
<div class="col-sm-12 col-md-7">
<input autocomplete="off" class="form-control" id="QATextActivationCode" maxlength="4" name="QATextActivationCode" placeholder="*رقم التفعيل" type="password"/>
</div>
</div>
<div class="row mt-1">
<div class="col-12">
<button class="btn btn-block btn-secondary" id="QABtnChange">تعديل</button>
<div class="d-flex justify-content-center">
<div class="spinner-grow text-secondary d-none" id="QAWorkingOnIt" role="status">
<span class="sr-only">Loading...</span>
</div>
</div>
</div>
</div>
</form>
</div>
</div>
</div>
</div>
</div>
<!--COAST GUARD-->
<div class="d-none">
<a class="acc-header">
<label class="footer-icon" style="width: 200px; float: right;">
<svg data-name="Layer 1" height="8.572em" viewbox="0 0 103 103" width="8.572em" xmlns="http://www.w3.org/2000/svg">
<title>KCG-service</title>
<rect class="circle cls-1" height="100" rx="50" width="100" x="1.21" y="0.82"></rect>
<path class="cls-1" d="M64.34,30.56A4.71,4.71,0,0,0,59.49,26a4.56,4.56,0,0,0-4.67,4.61,4.76,4.76,0,0,0,9.52,0Z"></path>
<line class="cls-1" x1="66.35" x2="52.51" y1="43.39" y2="43.39"></line>
<path class="cls-1" d="M72.12,61.7l6.66-4.36a.36.36,0,0,1,.51,0L86,61.7"></path>
<path class="cls-1" d="M79,57.08s2.31,20.76-19.6,20.47l.2-42.22"></path>
<path class="cls-1" d="M46.75,61.7l-6.66-4.36a.36.36,0,0,0-.51,0L32.91,61.7"></path>
<path class="cls-1" d="M39.83,57.08s-2.3,20.76,19.6,20.47l.2-42.22"></path>
<path class="cls-1" d="M59.93,25.84a1.73,1.73,0,0,0-1.72-1.72l-40,0a1.73,1.73,0,0,0-1.72,1.72l0,49.93a1.73,1.73,0,0,0,1.72,1.73l41.44,0"></path>
<line class="cls-1" x1="23.05" x2="28.84" y1="32.53" y2="32.53"></line>
<line class="cls-1" x1="23.05" x2="42.53" y1="37.27" y2="37.27"></line>
<line class="cls-1" x1="23.05" x2="39.37" y1="41.48" y2="41.48"></line>
<line class="cls-1" x1="23.05" x2="47.11" y1="45.7" y2="45.7"></line>
</svg>
</label>
</a>
<div class="article">
<div class="article-info">
<div class="row text-center">
<div class="col-12 title">Ensure Safety at Sea</div>
<div class="col-12">
<img src="https://www.moi.gov.kw/main/images/assets/common/ico-horizontal-bar.svg"/>
</div>
<div class="col-12 text-justify">
                        For your safety, please inform the General Directorate of Coast Guard by filling the Sailing Plan form
                    </div>
<div class="col-12">
<a "2"="" )"="" 1"="" :="" class="btn btn-secondary mt-3" href="https://eservices1.moi.gov.kw/coast-guard.nsf/boat-float-plan?openform&amp;langid=@(System.Threading.Thread.CurrentThread.CurrentCulture.TextInfo.IsRightToLeft ? ">Sail Plan</a>
</div>
</div>
</div>
</div>
</div>
<!--GET REFERENCE NUMBER-->
<div>
<a class="acc-header active">
<label class="footer-icon" style="width: 200px; float: right;">
<img class="moi-ico" id="getRefNumPop" src="https://www.moi.gov.kw/main/images/assets/common/ico-get-ref-num.svg"/>
</label>
</a>
<div class="article">
<div class="article-info">
<div class="row text-center">
<div class="col-12 title">الإستعلام عن رقم مرجع الداخلية</div>
<div class="col-12">
<img src="https://www.moi.gov.kw/main/images/assets/common/ico-horizontal-bar.svg"/>
</div>
<div class="col-12">
<input class="form-control" data-manus_click_id="42" data-manus_clickable="true" id="QARefNumTextCivilId" maxlength="12" name="QARefNumTextCivilId" placeholder="الرقم المدني"/>
</div>
<div class="col-12">
<button class="btn btn-block btn-secondary mt-2" data-manus_click_id="43" data-manus_clickable="true" id="btnGetRefNumKwti" type="button">للكويتين</button>
</div>
<div class="col-12">
<button class="btn btn-block btn-secondary mt-2" data-manus_click_id="44" data-manus_clickable="true" id="btnGetRefNumOther" type="button">للمقيمين</button>
</div>
<!--<form id="QARefNum">
                        <div class="col-12">
                            <input class="form-control" id="QARefNumTextCivilId" name="QARefNumTextCivilId" maxlength="12" placeholder="الرقم المدني" />
                        </div>
                        <div class="col-12 mt-1">
                            <input class="form-control" id="QARefNumTextPassport" name="QARefNumTextPassport" maxlength="15" placeholder="رقم جواز السفر" />
                        </div>
                        <div class="col-12 mt-1">
                            <input readonly class="form-control" id="QARefNumTextExpiryDate" name="QARefNumTextExpiryDate" maxlength="10" placeholder="تاريخ الانتهاء جواز السفر" />
                        </div>
                        <div class="col-12">
                            <button class="btn btn-block btn-secondary mt-2" id="btnGetRefNum">استعلم</button>
                            <div class="d-flex justify-content-center">
                                <div class="spinner-grow text-secondary d-none" role="status" id="QARNWorkingOnIt">
                                    <span class="sr-only">Loading...</span>
                                </div>
                            </div>
                        </div>
                    </form>
                    <div class="col-12 d-none" id="QANatNumResultContainer">
                        <div class="row">
                            <div class="col-12" id="QANatNumResult"></div>
                            <div class="col-12">
                                <button type="button" class="btn btn-block btn-secondary mt-2" id="btnGetRefNumDone">إغلاق</button>
                            </div>
                        </div>
                    </div>-->
</div>
</div>
</div>
</div>
<!--HEALTH CHECK-->
<div class="d-none">
<a class="acc-header">
<label class="footer-icon" style="width: 200px; float: right;">
<img class="moi-ico" id="getHealthCheckStatus" src="https://www.moi.gov.kw/main/images/assets/common/ico-health-check-status.svg"/>
</label>
</a>
<div class="article">
<div class="article-info">
<div class="row text-center">
<div class="col-12 title">جاهزية نتيجة الفحص الطبي</div>
<div class="col-12">
<img src="https://www.moi.gov.kw/main/images/assets/common/ico-horizontal-bar.svg"/>
</div>
<form id="QAHealthCheck" novalidate="novalidate">
<div class="col-12">
<input class="form-control" id="QAHealthCheckTextNationalNo" maxlength="12" name="QAHealthCheckTextNationalNo" placeholder="رقم مرجع الداخلية"/>
</div>
<div class="col-12">
<button class="btn btn-block btn-secondary mt-3" id="btnQAHealthCheck">استعلم</button>
<div class="d-flex justify-content-center">
<div class="spinner-grow text-secondary d-none" id="QAHCWorkingOnIt" role="status">
<span class="sr-only">Loading...</span>
</div>
</div>
<div class="d-none mt-3" id="QAHealthReport"></div>
</div>
</form>
</div>
</div>
</div>
</div>
<!--CASE MOVEMENT INQUIRY-->
<div>
<a class="acc-header">
<label class="footer-icon" style="width: 200px; float: right;">
<img class="moi-ico" src="https://www.moi.gov.kw/main/images/assets/common/ico-case-track.svg"/>
</label>
</a>
<div class="article">
<div class="article-info">
<div class="row text-center">
<div class="col-12 title">الاستعلام عن سير القضية</div>
<div class="col-12">
<img src="https://www.moi.gov.kw/main/images/assets/common/ico-horizontal-bar.svg"/>
</div>
<form data-manus_click_id="45" data-manus_clickable="true" id="QACaseCheck" novalidate="novalidate">
<div class="col-12">
<input class="form-control" data-manus_click_id="46" data-manus_clickable="true" id="QACaseCheckTextNationalNo" maxlength="12" name="QACaseCheckTextNationalNo" placeholder="رقم مرجع الداخلية"/>
</div>
<div class="col-12">
<button class="btn btn-block btn-secondary mt-3" data-manus_click_id="47" data-manus_clickable="true" id="btnQACaseCheck">استعلم</button>
<div class="d-flex justify-content-center">
<div class="spinner-grow text-secondary d-none" id="QACCWorkingOnIt" role="status">
<span class="sr-only">Loading...</span>
</div>
</div>
<!--<div id="QAHealthReport" class="d-none mt-3"></div>-->
</div>
</form>
</div>
</div>
</div>
</div>
<!--NEW SERVICES-->
<div>
<label class="footer-icon" style="width: 200px; float: right;">
<a data-manus_click_id="48" data-manus_clickable="true" data-target="#newServicesModal" data-toggle="modal">
<img class="moi-ico" id="newServicesPop" src="https://www.moi.gov.kw/main/images/assets/common/ico-new-services.svg"/>
</a>
</label>
</div>
</div>



</dqa>
<footer class="container border-top footer text-muted mt-2 p-0"><div class="col-sm-12 text-center text-white mt-2">
<div class="row">
<div class="col-sm-12">
<a data-manus_click_id="49" data-manus_clickable="true" href="https://www.youtube.com/user/SecurityMediaQ8">
<img class="social-media-icon" src="https://www.moi.gov.kw/main/images/assets/social-media/ico-youtube.svg"/>
</a>
<a data-manus_click_id="50" data-manus_clickable="true" href="https://www.instagram.com/moi_kuw/?hl=en">
<img class="social-media-icon" src="https://www.moi.gov.kw/main/images/assets/social-media/ico-instagram.svg"/>
</a>
<a data-manus_click_id="51" data-manus_clickable="true" href="https://twitter.com/moi_kuw?lang=en">
<img class="social-media-icon" src="https://www.moi.gov.kw/main/images/assets/social-media/ico-twitter.svg"/>
</a>
<a data-manus_click_id="52" data-manus_clickable="true" href="https://www.facebook.com/MOIKuwait/">
<img class="social-media-icon" src="https://www.moi.gov.kw/main/images/assets/social-media/ico-facebook.svg"/>
</a>
              
            <a data-manus_click_id="53" data-manus_clickable="true" href="https://play.google.com/store/apps/details?id=com.MoIKuwait">
<img class="social-media-icon" src="https://www.moi.gov.kw/main/images/assets/common/ico-android.svg"/>
</a>
              
            <a data-manus_click_id="54" data-manus_clickable="true" href="https://itunes.apple.com/kw/app/moi-kuwait/id871764188?mt=8">
<img class="social-media-icon" src="https://www.moi.gov.kw/main/images/assets/common/ico-apple.svg"/>
</a>
</div>
</div>
<div class="row">
<div class="col-sm-12" id="copyRight"> © جميع الحقوق محفوظة لوزارة الداخلية-دولة الكويت - 2026</div>
</div>
<div class="row">
<div class="col-sm-12">
<!--For inquiries - 25581755-->
</div>
</div>
</div>
</footer>
</div>
</div>
<modals>
<div aria-hidden="true" aria-labelledby="newServicesModalTitle" class="modal fade" id="newServicesModal" role="dialog" tabindex="-1">
<div class="modal-dialog modal-dialog-centered" role="document">
<div class="modal-content">
<div class="modal-header">
<h5 class="modal-title" id="newServicesModalTitle"></h5>
<button aria-label="Close" class="close" data-dismiss="modal" type="button">
<span aria-hidden="true">×</span>
</button>
</div>
<div class="modal-body">
<div class="row">
<div class="col-12 col-md-4 text-center">
<a href="https://edl.moi.gov.kw/Login.aspx">
<img class="moi-ico" src="https://www.moi.gov.kw/main/images/assets/general-traffic/ico-renew.svg"/>
<div class="row text-center">
<div class="col">
                                    الخدمات الالكترونية لرخص السوق
                                </div>
</div>
</a>
</div>
<!--<div class="col-12 col-md-4 text-center">
        <a href="https://esp.moi.gov.kw/MOI_Kuwait/apps/services/www/MoIKuwait/desktopbrowser/default/index.html">
            <img src="https://www.moi.gov.kw/main/images/assets/esp-logo-white.svg" class="moi-ico" />
            <div class="row text-center d-flex">
                <div class="col">
                    منصة الخدمات الإلكترونية
                </div>
            </div>
        </a>
    </div>-->
<div class="col-12 col-md-4 text-center">
<a href="https://eres.moi.gov.kw/individual/ar/auth/login">
<img class="moi-ico" src="https://www.moi.gov.kw/main/images/assets/residency/ico-renew-individual.svg"/>
<div class="row text-center">
<div class="col">
                                    الخدمات الإلكترونية للأفراد
                                </div>
</div>
</a>
</div>
<div class="col-12 col-md-4 text-center">
<a href="https://www.moi.gov.kw/main/eservices/residence/health-check-status">
<img class="moi-ico" src="https://www.moi.gov.kw/main/images/assets/common/ico-health-check-status.svg"/>
<div class="row text-center">
<div class="col">
                                    جاهزية نتيجة الفحص الطبي
                                </div>
</div>
</a>
</div>
<!--<div class="col-12 col-md-4 text-center">-->
<!--<a href="https://www.moi.gov.kw/main/eservices/election/candidates/0">-->
<!--<a href="https://www.moi.gov.kw/main/eservices/election/voter-location">
                            <img src="https://www.moi.gov.kw/main/images/assets/finance/ico-rfp-fill.svg" class="moi-ico" />
                            <div class="row text-center">
                                <div class="col">
                                    الاستعلام عن مكان تصويت الناخب
                                </div>
                            </div>
                        </a>
                    </div>-->
<div class="col-12 col-md-4 text-center">
<a href="https://www.moi.gov.kw/main/eservices/residence/visa-fees">
<svg data-name="Layer 1" height="8.572em" id="Layer_1" viewbox="0 0 103 103" width="8.572em" xmlns="http://www.w3.org/2000/svg">
<title>Payment</title>
<rect class="circle cls-1" height="100" rx="50" style="fill: #000576; stroke: #000576;" width="100" x="1.01" y="1.26"></rect>
<path class="kd cls-2" d="M63.55,70.16l-6.06-7v7H55.27V56.25h2.22v6.06l5.84-6.06h2.75L59.59,62.5l6.73,7.66Z"></path>
<path class="kd cls-2" d="M67.49,70.16v-2.5H69.4v2.5Z"></path>
<path class="kd cls-2" d="M71.42,70.16V56.25h6.32c3.81,0,4.91,1.59,4.91,6.06v1.78c0,4.47-1.1,6.07-4.91,6.07Zm9-8c0-2.89-.46-4.36-2.89-4.36H73.62V68.58h3.94c2.25,0,2.89-1.3,2.89-4.2Z"></path>
<rect class="cls-1" height="46.97" width="71.3" x="15.44" y="27.78"></rect>
<line class="cls-1" x1="22.53" x2="39.12" y1="56.6" y2="56.6"></line>
<line class="cls-1" x1="32.8" x2="38.33" y1="62.13" y2="62.13"></line>
<line class="cls-1" x1="22.53" x2="38.33" y1="67.66" y2="67.66"></line>
<line class="cls-1" x1="15.29" x2="86.4" y1="36.28" y2="36.28"></line>
<line class="cls-1" x1="15.29" x2="86.4" y1="47.83" y2="47.83"></line>
</svg>
<div class="row text-center">
<div class="col">
                                    دفع رسوم سمة دخول عمل بالقطاع الأهلي
                                </div>
</div>
</a>
</div>
<div class="col-12 col-md-4 text-center">
<a href="https://eres.moi.gov.kw/companies?culture=ar">
<img class="moi-ico" src="https://www.moi.gov.kw/main/images/assets/residency/ico-renew-companies.svg"/>
<div class="row text-center">
<div class="col">
                                    الخدمات الإلكترونية للشركات
                                </div>
</div>
</a>
</div>
<div class="col-12 col-md-4 text-center">
<a href="https://eres.moi.gov.kw/government?culture=ar">
<img class="moi-ico" src="https://www.moi.gov.kw/main/images/assets/residency/ico-renew-government.svg"/>
<div class="row text-center">
<div class="col">
                                    الخدمات الإلكترونية للحكومة
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
<div aria-hidden="true" aria-labelledby="infoModalTitle" class="modal fade" id="infoModal" role="dialog" tabindex="-1">
<div class="modal-dialog modal-dialog-centered" role="document">
<div class="modal-content">
<div class="modal-header">
<h5 class="modal-title" id="infoModalTitle">Change Company</h5>
<button aria-label="Close" class="close" data-dismiss="modal" type="button">
<span aria-hidden="true">×</span>
</button>
</div>
<div class="modal-body" id="QAResponse">
                Your company is now changed as requested.
            </div>
<div class="modal-footer">
<button class="btn btn-secondary" data-dismiss="modal" type="button">Close</button>
</div>
</div>
</div>
</div>
</modals>
<div aria-hidden="true" aria-labelledby="emergencyContactModalTitle" class="modal fade" id="emergencyContactModal" role="dialog" tabindex="-1">
<div class="modal-dialog modal-dialog-centered" role="document">
<div class="modal-content">
<div class="modal-header">
<h5 class="modal-title" id="emergencyContactModalTitle">أرقام الطوارئ</h5>
<button aria-label="Close" class="close" data-dismiss="modal" type="button">
<span aria-hidden="true">×</span>
</button>
</div>
<div class="modal-body">
<div class="row">
<div class="col-12 col-md-6 text-center border-bottom">
                            الشرطة، الإسعاف و قوة الإطفاء<br/>
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
                            الدفاع المدني<br/>
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
                            إدارة الجرائم الإلكترونية<br/>
<div class="row">
<div class="col-4 align-self-center text-left">
<img src="https://www.moi.gov.kw/main/images/assets/social-media/ico-whatsapp.svg" style="height:15px;"/>
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
                            إدارة العامة لحماية الأحداث<br/>
<div class="row">
<div class="col-4 align-self-center text-left">
</div>
<div class="col-8">
<div class="row">
<div class="col-12 font-weight-bold text-right">
                                            25589535<br/>
                                            97283636  <img src="https://www.moi.gov.kw/main/images/assets/social-media/ico-whatsapp.svg" style="height:15px;"/>
</div>
</div>
</div>
</div>
</div>
<div class="col-12 col-md-6 text-center border-bottom mt-2">
                            الإدارة العامة لمكافحة المخدرات<br/>
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
                            الإدارة العامة لخفر السواحل<br/>
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
                            الإدارة العامة للمرور<br/>
<div class="row">
<div class="col-4 align-self-center text-left">
<img src="https://www.moi.gov.kw/main/images/assets/social-media/ico-whatsapp.svg" style="height:15px;"/>
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
                            الإدارة العامة للرقابة والتفتيش<br/>
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
                            الإدارة العامة لشؤون الإقامة<br/>
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
<img src="https://www.moi.gov.kw/main/images/assets/social-media/ico-whatsapp.svg" style="height:15px;"/>
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
                            إدارة حماية الآداب العامة ومكافحة الإتجار بالأشخاص<br/>
<div class="row">
<div class="col-4 align-self-center text-left">
</div>
<div class="col-8">
<div class="row">
<div class="col-12 font-weight-bold text-right">
                                            25589648<br/>
                                            25589655<br/>
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






<!-- optionally if you need to use a theme, then include the theme JS file as mentioned below -->
<!-- optionally if you need translation for your language then include locale file as mentioned below -->








<div><div class="grecaptcha-badge" data-style="bottomright" style="width: 256px; height: 60px; display: block; transition: right 0.3s; position: fixed; bottom: 14px; right: -186px; box-shadow: gray 0px 0px 5px; border-radius: 2px; overflow: hidden;"><div class="grecaptcha-logo"><iframe frameborder="0" height="60" name="a-lnwhx4t8at3d" role="presentation" sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-top-navigation allow-modals allow-popups-to-escape-sandbox allow-storage-access-by-user-activation" scrolling="no" src="https://www.google.com/recaptcha/api2/anchor?ar=1&amp;k=6LdUyqwUAAAAAM5MRMXHrlAjDCrWT5CcRpdXgK2p&amp;co=aHR0cHM6Ly93d3cubW9pLmdvdi5rdzo0NDM.&amp;hl=en&amp;v=w_Yb7dGGXaKesJ7BMiqFJqBG&amp;size=invisible&amp;anchor-ms=20000&amp;execute-ms=30000&amp;cb=t86ibmx39qdu" title="reCAPTCHA" width="256">&lt;!DOCTYPE html&gt;&lt;html dir="ltr" lang="en"&gt;&lt;head&gt;&lt;meta http-equiv="Content-Type" content="text/html; charset=UTF-8"&gt;
&lt;meta http-equiv="X-UA-Compatible" content="IE=edge"&gt;
&lt;title&gt;reCAPTCHA&lt;/title&gt;
&lt;style type="text/css"&gt;
/* cyrillic-ext */
@font-face {
  font-family: 'Roboto';
  font-style: normal;
  font-weight: 400;
  font-stretch: 100%;
  src: url(//fonts.gstatic.com/s/roboto/v48/KFO7CnqEu92Fr1ME7kSn66aGLdTylUAMa3GUBGEe.woff2) format('woff2');
  unicode-range: U+0460-052F, U+1C80-1C8A, U+20B4, U+2DE0-2DFF, U+A640-A69F, U+FE2E-FE2F;
}
/* cyrillic */
@font-face {
  font-family: 'Roboto';
  font-style: normal;
  font-weight: 400;
  font-stretch: 100%;
  src: url(//fonts.gstatic.com/s/roboto/v48/KFO7CnqEu92Fr1ME7kSn66aGLdTylUAMa3iUBGEe.woff2) format('woff2');
  unicode-range: U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116;
}
/* greek-ext */
@font-face {
  font-family: 'Roboto';
  font-style: normal;
  font-weight: 400;
  font-stretch: 100%;
  src: url(//fonts.gstatic.com/s/roboto/v48/KFO7CnqEu92Fr1ME7kSn66aGLdTylUAMa3CUBGEe.woff2) format('woff2');
  unicode-range: U+1F00-1FFF;
}
/* greek */
@font-face {
  font-family: 'Roboto';
  font-style: normal;
  font-weight: 400;
  font-stretch: 100%;
  src: url(//fonts.gstatic.com/s/roboto/v48/KFO7CnqEu92Fr1ME7kSn66aGLdTylUAMa3-UBGEe.woff2) format('woff2');
  unicode-range: U+0370-0377, U+037A-037F, U+0384-038A, U+038C, U+038E-03A1, U+03A3-03FF;
}
/* math */
@font-face {
  font-family: 'Roboto';
  font-style: normal;
  font-weight: 400;
  font-stretch: 100%;
  src: url(//fonts.gstatic.com/s/roboto/v48/KFO7CnqEu92Fr1ME7kSn66aGLdTylUAMawCUBGEe.woff2) format('woff2');
  unicode-range: U+0302-0303, U+0305, U+0307-0308, U+0310, U+0312, U+0315, U+031A, U+0326-0327, U+032C, U+032F-0330, U+0332-0333, U+0338, U+033A, U+0346, U+034D, U+0391-03A1, U+03A3-03A9, U+03B1-03C9, U+03D1, U+03D5-03D6, U+03F0-03F1, U+03F4-03F5, U+2016-2017, U+2034-2038, U+203C, U+2040, U+2043, U+2047, U+2050, U+2057, U+205F, U+2070-2071, U+2074-208E, U+2090-209C, U+20D0-20DC, U+20E1, U+20E5-20EF, U+2100-2112, U+2114-2115, U+2117-2121, U+2123-214F, U+2190, U+2192, U+2194-21AE, U+21B0-21E5, U+21F1-21F2, U+21F4-2211, U+2213-2214, U+2216-22FF, U+2308-230B, U+2310, U+2319, U+231C-2321, U+2336-237A, U+237C, U+2395, U+239B-23B7, U+23D0, U+23DC-23E1, U+2474-2475, U+25AF, U+25B3, U+25B7, U+25BD, U+25C1, U+25CA, U+25CC, U+25FB, U+266D-266F, U+27C0-27FF, U+2900-2AFF, U+2B0E-2B11, U+2B30-2B4C, U+2BFE, U+3030, U+FF5B, U+FF5D, U+1D400-1D7FF, U+1EE00-1EEFF;
}
/* symbols */
@font-face {
  font-family: 'Roboto';
  font-style: normal;
  font-weight: 400;
  font-stretch: 100%;
  src: url(//fonts.gstatic.com/s/roboto/v48/KFO7CnqEu92Fr1ME7kSn66aGLdTylUAMaxKUBGEe.woff2) format('woff2');
  unicode-range: U+0001-000C, U+000E-001F, U+007F-009F, U+20DD-20E0, U+20E2-20E4, U+2150-218F, U+2190, U+2192, U+2194-2199, U+21AF, U+21E6-21F0, U+21F3, U+2218-2219, U+2299, U+22C4-22C6, U+2300-243F, U+2440-244A, U+2460-24FF, U+25A0-27BF, U+2800-28FF, U+2921-2922, U+2981, U+29BF, U+29EB, U+2B00-2BFF, U+4DC0-4DFF, U+FFF9-FFFB, U+10140-1018E, U+10190-1019C, U+101A0, U+101D0-101FD, U+102E0-102FB, U+10E60-10E7E, U+1D2C0-1D2D3, U+1D2E0-1D37F, U+1F000-1F0FF, U+1F100-1F1AD, U+1F1E6-1F1FF, U+1F30D-1F30F, U+1F315, U+1F31C, U+1F31E, U+1F320-1F32C, U+1F336, U+1F378, U+1F37D, U+1F382, U+1F393-1F39F, U+1F3A7-1F3A8, U+1F3AC-1F3AF, U+1F3C2, U+1F3C4-1F3C6, U+1F3CA-1F3CE, U+1F3D4-1F3E0, U+1F3ED, U+1F3F1-1F3F3, U+1F3F5-1F3F7, U+1F408, U+1F415, U+1F41F, U+1F426, U+1F43F, U+1F441-1F442, U+1F444, U+1F446-1F449, U+1F44C-1F44E, U+1F453, U+1F46A, U+1F47D, U+1F4A3, U+1F4B0, U+1F4B3, U+1F4B9, U+1F4BB, U+1F4BF, U+1F4C8-1F4CB, U+1F4D6, U+1F4DA, U+1F4DF, U+1F4E3-1F4E6, U+1F4EA-1F4ED, U+1F4F7, U+1F4F9-1F4FB, U+1F4FD-1F4FE, U+1F503, U+1F507-1F50B, U+1F50D, U+1F512-1F513, U+1F53E-1F54A, U+1F54F-1F5FA, U+1F610, U+1F650-1F67F, U+1F687, U+1F68D, U+1F691, U+1F694, U+1F698, U+1F6AD, U+1F6B2, U+1F6B9-1F6BA, U+1F6BC, U+1F6C6-1F6CF, U+1F6D3-1F6D7, U+1F6E0-1F6EA, U+1F6F0-1F6F3, U+1F6F7-1F6FC, U+1F700-1F7FF, U+1F800-1F80B, U+1F810-1F847, U+1F850-1F859, U+1F860-1F887, U+1F890-1F8AD, U+1F8B0-1F8BB, U+1F8C0-1F8C1, U+1F900-1F90B, U+1F93B, U+1F946, U+1F984, U+1F996, U+1F9E9, U+1FA00-1FA6F, U+1FA70-1FA7C, U+1FA80-1FA89, U+1FA8F-1FAC6, U+1FACE-1FADC, U+1FADF-1FAE9, U+1FAF0-1FAF8, U+1FB00-1FBFF;
}
/* vietnamese */
@font-face {
  font-family: 'Roboto';
  font-style: normal;
  font-weight: 400;
  font-stretch: 100%;
  src: url(//fonts.gstatic.com/s/roboto/v48/KFO7CnqEu92Fr1ME7kSn66aGLdTylUAMa3OUBGEe.woff2) format('woff2');
  unicode-range: U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+0300-0301, U+0303-0304, U+0308-0309, U+0323, U+0329, U+1EA0-1EF9, U+20AB;
}
/* latin-ext */
@font-face {
  font-family: 'Roboto';
  font-style: normal;
  font-weight: 400;
  font-stretch: 100%;
  src: url(//fonts.gstatic.com/s/roboto/v48/KFO7CnqEu92Fr1ME7kSn66aGLdTylUAMa3KUBGEe.woff2) format('woff2');
  unicode-range: U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF;
}
/* latin */
@font-face {
  font-family: 'Roboto';
  font-style: normal;
  font-weight: 400;
  font-stretch: 100%;
  src: url(//fonts.gstatic.com/s/roboto/v48/KFO7CnqEu92Fr1ME7kSn66aGLdTylUAMa3yUBA.woff2) format('woff2');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}
/* cyrillic-ext */
@font-face {
  font-family: 'Roboto';
  font-style: normal;
  font-weight: 500;
  font-stretch: 100%;
  src: url(//fonts.gstatic.com/s/roboto/v48/KFO7CnqEu92Fr1ME7kSn66aGLdTylUAMa3GUBGEe.woff2) format('woff2');
  unicode-range: U+0460-052F, U+1C80-1C8A, U+20B4, U+2DE0-2DFF, U+A640-A69F, U+FE2E-FE2F;
}
/* cyrillic */
@font-face {
  font-family: 'Roboto';
  font-style: normal;
  font-weight: 500;
  font-stretch: 100%;
  src: url(//fonts.gstatic.com/s/roboto/v48/KFO7CnqEu92Fr1ME7kSn66aGLdTylUAMa3iUBGEe.woff2) format('woff2');
  unicode-range: U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116;
}
/* greek-ext */
@font-face {
  font-family: 'Roboto';
  font-style: normal;
  font-weight: 500;
  font-stretch: 100%;
  src: url(//fonts.gstatic.com/s/roboto/v48/KFO7CnqEu92Fr1ME7kSn66aGLdTylUAMa3CUBGEe.woff2) format('woff2');
  unicode-range: U+1F00-1FFF;
}
/* greek */
@font-face {
  font-family: 'Roboto';
  font-style: normal;
  font-weight: 500;
  font-stretch: 100%;
  src: url(//fonts.gstatic.com/s/roboto/v48/KFO7CnqEu92Fr1ME7kSn66aGLdTylUAMa3-UBGEe.woff2) format('woff2');
  unicode-range: U+0370-0377, U+037A-037F, U+0384-038A, U+038C, U+038E-03A1, U+03A3-03FF;
}
/* math */
@font-face {
  font-family: 'Roboto';
  font-style: normal;
  font-weight: 500;
  font-stretch: 100%;
  src: url(//fonts.gstatic.com/s/roboto/v48/KFO7CnqEu92Fr1ME7kSn66aGLdTylUAMawCUBGEe.woff2) format('woff2');
  unicode-range: U+0302-0303, U+0305, U+0307-0308, U+0310, U+0312, U+0315, U+031A, U+0326-0327, U+032C, U+032F-0330, U+0332-0333, U+0338, U+033A, U+0346, U+034D, U+0391-03A1, U+03A3-03A9, U+03B1-03C9, U+03D1, U+03D5-03D6, U+03F0-03F1, U+03F4-03F5, U+2016-2017, U+2034-2038, U+203C, U+2040, U+2043, U+2047, U+2050, U+2057, U+205F, U+2070-2071, U+2074-208E, U+2090-209C, U+20D0-20DC, U+20E1, U+20E5-20EF, U+2100-2112, U+2114-2115, U+2117-2121, U+2123-214F, U+2190, U+2192, U+2194-21AE, U+21B0-21E5, U+21F1-21F2, U+21F4-2211, U+2213-2214, U+2216-22FF, U+2308-230B, U+2310, U+2319, U+231C-2321, U+2336-237A, U+237C, U+2395, U+239B-23B7, U+23D0, U+23DC-23E1, U+2474-2475, U+25AF, U+25B3, U+25B7, U+25BD, U+25C1, U+25CA, U+25CC, U+25FB, U+266D-266F, U+27C0-27FF, U+2900-2AFF, U+2B0E-2B11, U+2B30-2B4C, U+2BFE, U+3030, U+FF5B, U+FF5D, U+1D400-1D7FF, U+1EE00-1EEFF;
}
/* symbols */
@font-face {
  font-family: 'Roboto';
  font-style: normal;
  font-weight: 500;
  font-stretch: 100%;
  src: url(//fonts.gstatic.com/s/roboto/v48/KFO7CnqEu92Fr1ME7kSn66aGLdTylUAMaxKUBGEe.woff2) format('woff2');
  unicode-range: U+0001-000C, U+000E-001F, U+007F-009F, U+20DD-20E0, U+20E2-20E4, U+2150-218F, U+2190, U+2192, U+2194-2199, U+21AF, U+21E6-21F0, U+21F3, U+2218-2219, U+2299, U+22C4-22C6, U+2300-243F, U+2440-244A, U+2460-24FF, U+25A0-27BF, U+2800-28FF, U+2921-2922, U+2981, U+29BF, U+29EB, U+2B00-2BFF, U+4DC0-4DFF, U+FFF9-FFFB, U+10140-1018E, U+10190-1019C, U+101A0, U+101D0-101FD, U+102E0-102FB, U+10E60-10E7E, U+1D2C0-1D2D3, U+1D2E0-1D37F, U+1F000-1F0FF, U+1F100-1F1AD, U+1F1E6-1F1FF, U+1F30D-1F30F, U+1F315, U+1F31C, U+1F31E, U+1F320-1F32C, U+1F336, U+1F378, U+1F37D, U+1F382, U+1F393-1F39F, U+1F3A7-1F3A8, U+1F3AC-1F3AF, U+1F3C2, U+1F3C4-1F3C6, U+1F3CA-1F3CE, U+1F3D4-1F3E0, U+1F3ED, U+1F3F1-1F3F3, U+1F3F5-1F3F7, U+1F408, U+1F415, U+1F41F, U+1F426, U+1F43F, U+1F441-1F442, U+1F444, U+1F446-1F449, U+1F44C-1F44E, U+1F453, U+1F46A, U+1F47D, U+1F4A3, U+1F4B0, U+1F4B3, U+1F4B9, U+1F4BB, U+1F4BF, U+1F4C8-1F4CB, U+1F4D6, U+1F4DA, U+1F4DF, U+1F4E3-1F4E6, U+1F4EA-1F4ED, U+1F4F7, U+1F4F9-1F4FB, U+1F4FD-1F4FE, U+1F503, U+1F507-1F50B, U+1F50D, U+1F512-1F513, U+1F53E-1F54A, U+1F54F-1F5FA, U+1F610, U+1F650-1F67F, U+1F687, U+1F68D, U+1F691, U+1F694, U+1F698, U+1F6AD, U+1F6B2, U+1F6B9-1F6BA, U+1F6BC, U+1F6C6-1F6CF, U+1F6D3-1F6D7, U+1F6E0-1F6EA, U+1F6F0-1F6F3, U+1F6F7-1F6FC, U+1F700-1F7FF, U+1F800-1F80B, U+1F810-1F847, U+1F850-1F859, U+1F860-1F887, U+1F890-1F8AD, U+1F8B0-1F8BB, U+1F8C0-1F8C1, U+1F900-1F90B, U+1F93B, U+1F946, U+1F984, U+1F996, U+1F9E9, U+1FA00-1FA6F, U+1FA70-1FA7C, U+1FA80-1FA89, U+1FA8F-1FAC6, U+1FACE-1FADC, U+1FADF-1FAE9, U+1FAF0-1FAF8, U+1FB00-1FBFF;
}
/* vietnamese */
@font-face {
  font-family: 'Roboto';
  font-style: normal;
  font-weight: 500;
  font-stretch: 100%;
  src: url(//fonts.gstatic.com/s/roboto/v48/KFO7CnqEu92Fr1ME7kSn66aGLdTylUAMa3OUBGEe.woff2) format('woff2');
  unicode-range: U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+0300-0301, U+0303-0304, U+0308-0309, U+0323, U+0329, U+1EA0-1EF9, U+20AB;
}
/* latin-ext */
@font-face {
  font-family: 'Roboto';
  font-style: normal;
  font-weight: 500;
  font-stretch: 100%;
  src: url(//fonts.gstatic.com/s/roboto/v48/KFO7CnqEu92Fr1ME7kSn66aGLdTylUAMa3KUBGEe.woff2) format('woff2');
  unicode-range: U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF;
}
/* latin */
@font-face {
  font-family: 'Roboto';
  font-style: normal;
  font-weight: 500;
  font-stretch: 100%;
  src: url(//fonts.gstatic.com/s/roboto/v48/KFO7CnqEu92Fr1ME7kSn66aGLdTylUAMa3yUBA.woff2) format('woff2');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}
/* cyrillic-ext */
@font-face {
  font-family: 'Roboto';
  font-style: normal;
  font-weight: 900;
  font-stretch: 100%;
  src: url(//fonts.gstatic.com/s/roboto/v48/KFO7CnqEu92Fr1ME7kSn66aGLdTylUAMa3GUBGEe.woff2) format('woff2');
  unicode-range: U+0460-052F, U+1C80-1C8A, U+20B4, U+2DE0-2DFF, U+A640-A69F, U+FE2E-FE2F;
}
/* cyrillic */
@font-face {
  font-family: 'Roboto';
  font-style: normal;
  font-weight: 900;
  font-stretch: 100%;
  src: url(//fonts.gstatic.com/s/roboto/v48/KFO7CnqEu92Fr1ME7kSn66aGLdTylUAMa3iUBGEe.woff2) format('woff2');
  unicode-range: U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116;
}
/* greek-ext */
@font-face {
  font-family: 'Roboto';
  font-style: normal;
  font-weight: 900;
  font-stretch: 100%;
  src: url(//fonts.gstatic.com/s/roboto/v48/KFO7CnqEu92Fr1ME7kSn66aGLdTylUAMa3CUBGEe.woff2) format('woff2');
  unicode-range: U+1F00-1FFF;
}
/* greek */
@font-face {
  font-family: 'Roboto';
  font-style: normal;
  font-weight: 900;
  font-stretch: 100%;
  src: url(//fonts.gstatic.com/s/roboto/v48/KFO7CnqEu92Fr1ME7kSn66aGLdTylUAMa3-UBGEe.woff2) format('woff2');
  unicode-range: U+0370-0377, U+037A-037F, U+0384-038A, U+038C, U+038E-03A1, U+03A3-03FF;
}
/* math */
@font-face {
  font-family: 'Roboto';
  font-style: normal;
  font-weight: 900;
  font-stretch: 100%;
  src: url(//fonts.gstatic.com/s/roboto/v48/KFO7CnqEu92Fr1ME7kSn66aGLdTylUAMawCUBGEe.woff2) format('woff2');
  unicode-range: U+0302-0303, U+0305, U+0307-0308, U+0310, U+0312, U+0315, U+031A, U+0326-0327, U+032C, U+032F-0330, U+0332-0333, U+0338, U+033A, U+0346, U+034D, U+0391-03A1, U+03A3-03A9, U+03B1-03C9, U+03D1, U+03D5-03D6, U+03F0-03F1, U+03F4-03F5, U+2016-2017, U+2034-2038, U+203C, U+2040, U+2043, U+2047, U+2050, U+2057, U+205F, U+2070-2071, U+2074-208E, U+2090-209C, U+20D0-20DC, U+20E1, U+20E5-20EF, U+2100-2112, U+2114-2115, U+2117-2121, U+2123-214F, U+2190, U+2192, U+2194-21AE, U+21B0-21E5, U+21F1-21F2, U+21F4-2211, U+2213-2214, U+2216-22FF, U+2308-230B, U+2310, U+2319, U+231C-2321, U+2336-237A, U+237C, U+2395, U+239B-23B7, U+23D0, U+23DC-23E1, U+2474-2475, U+25AF, U+25B3, U+25B7, U+25BD, U+25C1, U+25CA, U+25CC, U+25FB, U+266D-266F, U+27C0-27FF, U+2900-2AFF, U+2B0E-2B11, U+2B30-2B4C, U+2BFE, U+3030, U+FF5B, U+FF5D, U+1D400-1D7FF, U+1EE00-1EEFF;
}
/* symbols */
@font-face {
  font-family: 'Roboto';
  font-style: normal;
  font-weight: 900;
  font-stretch: 100%;
  src: url(//fonts.gstatic.com/s/roboto/v48/KFO7CnqEu92Fr1ME7kSn66aGLdTylUAMaxKUBGEe.woff2) format('woff2');
  unicode-range: U+0001-000C, U+000E-001F, U+007F-009F, U+20DD-20E0, U+20E2-20E4, U+2150-218F, U+2190, U+2192, U+2194-2199, U+21AF, U+21E6-21F0, U+21F3, U+2218-2219, U+2299, U+22C4-22C6, U+2300-243F, U+2440-244A, U+2460-24FF, U+25A0-27BF, U+2800-28FF, U+2921-2922, U+2981, U+29BF, U+29EB, U+2B00-2BFF, U+4DC0-4DFF, U+FFF9-FFFB, U+10140-1018E, U+10190-1019C, U+101A0, U+101D0-101FD, U+102E0-102FB, U+10E60-10E7E, U+1D2C0-1D2D3, U+1D2E0-1D37F, U+1F000-1F0FF, U+1F100-1F1AD, U+1F1E6-1F1FF, U+1F30D-1F30F, U+1F315, U+1F31C, U+1F31E, U+1F320-1F32C, U+1F336, U+1F378, U+1F37D, U+1F382, U+1F393-1F39F, U+1F3A7-1F3A8, U+1F3AC-1F3AF, U+1F3C2, U+1F3C4-1F3C6, U+1F3CA-1F3CE, U+1F3D4-1F3E0, U+1F3ED, U+1F3F1-1F3F3, U+1F3F5-1F3F7, U+1F408, U+1F415, U+1F41F, U+1F426, U+1F43F, U+1F441-1F442, U+1F444, U+1F446-1F449, U+1F44C-1F44E, U+1F453, U+1F46A, U+1F47D, U+1F4A3, U+1F4B0, U+1F4B3, U+1F4B9, U+1F4BB, U+1F4BF, U+1F4C8-1F4CB, U+1F4D6, U+1F4DA, U+1F4DF, U+1F4E3-1F4E6, U+1F4EA-1F4ED, U+1F4F7, U+1F4F9-1F4FB, U+1F4FD-1F4FE, U+1F503, U+1F507-1F50B, U+1F50D, U+1F512-1F513, U+1F53E-1F54A, U+1F54F-1F5FA, U+1F610, U+1F650-1F67F, U+1F687, U+1F68D, U+1F691, U+1F694, U+1F698, U+1F6AD, U+1F6B2, U+1F6B9-1F6BA, U+1F6BC, U+1F6C6-1F6CF, U+1F6D3-1F6D7, U+1F6E0-1F6EA, U+1F6F0-1F6F3, U+1F6F7-1F6FC, U+1F700-1F7FF, U+1F800-1F80B, U+1F810-1F847, U+1F850-1F859, U+1F860-1F887, U+1F890-1F8AD, U+1F8B0-1F8BB, U+1F8C0-1F8C1, U+1F900-1F90B, U+1F93B, U+1F946, U+1F984, U+1F996, U+1F9E9, U+1FA00-1FA6F, U+1FA70-1FA7C, U+1FA80-1FA89, U+1FA8F-1FAC6, U+1FACE-1FADC, U+1FADF-1FAE9, U+1FAF0-1FAF8, U+1FB00-1FBFF;
}
/* vietnamese */
@font-face {
  font-family: 'Roboto';
  font-style: normal;
  font-weight: 900;
  font-stretch: 100%;
  src: url(//fonts.gstatic.com/s/roboto/v48/KFO7CnqEu92Fr1ME7kSn66aGLdTylUAMa3OUBGEe.woff2) format('woff2');
  unicode-range: U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+0300-0301, U+0303-0304, U+0308-0309, U+0323, U+0329, U+1EA0-1EF9, U+20AB;
}
/* latin-ext */
@font-face {
  font-family: 'Roboto';
  font-style: normal;
  font-weight: 900;
  font-stretch: 100%;
  src: url(//fonts.gstatic.com/s/roboto/v48/KFO7CnqEu92Fr1ME7kSn66aGLdTylUAMa3KUBGEe.woff2) format('woff2');
  unicode-range: U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF;
}
/* latin */
@font-face {
  font-family: 'Roboto';
  font-style: normal;
  font-weight: 900;
  font-stretch: 100%;
  src: url(//fonts.gstatic.com/s/roboto/v48/KFO7CnqEu92Fr1ME7kSn66aGLdTylUAMa3yUBA.woff2) format('woff2');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}

&lt;/style&gt;
&lt;link rel="stylesheet" type="text/css" href="https://www.gstatic.com/recaptcha/releases/w_Yb7dGGXaKesJ7BMiqFJqBG/styles__ltr.css"&gt;
&lt;script nonce="" type="text/javascript"&gt;window['__recaptcha_api'] = 'https://www.google.com/recaptcha/api2/';&lt;/script&gt;
&lt;script type="text/javascript" src="https://www.gstatic.com/recaptcha/releases/w_Yb7dGGXaKesJ7BMiqFJqBG/recaptcha__en.js" nonce=""&gt;
      
    &lt;/script&gt;&lt;/head&gt;
&lt;body&gt;&lt;div id="rc-anchor-alert" class="rc-anchor-alert"&gt;&lt;/div&gt;
&lt;input type="hidden" id="recaptcha-token" value="03AFcWeA7sHQhB52NLBdx8OuYxGqXHnXo5Vq9oU7sXEOmrD4KkTj6TgVOrznp4BzgG4wOM5-K4eXzFdsK0jKYAfwMLxd9juCq1l3D5jXg-Vx81A4OUxd-e9QekW_TMXxTA4sgwfHyqwBRlYcjMr0e-SOFMugv8ikR00qbYtws_qF152cBEouoeDGbf3NpWDO30HX8oB6CntYc4LT7hbL2BJvSvOTD_i1ZCO1-ufVl7b7zMi5WodEOPzx0AeYOTIXeY2EjfMDDwE5pxpIA9Ie1vZESizaYxQ8_mnYcstpNdcYTmlVSDAi1wnL7WVyugeiRQGEebXfAHJTWs-UDySRg1rKWwTaVg1JFvRKzXY0zy7Dm1VkfSPVHIvLTw6h-HES8qVPKZVuRasDW99cesrvIwZIaRYRDCrxwiwLG6ACX1PRtT6sjTIh7eD0g3QczDJv_8e3LSd_dP0vFN9QrL7G8vpmyfOSLSxxbkbyEmEYBm4sjT2JQpgU587_z3QhJiAGWNDC8HOAZv5Og_QvQ0a_JaQagfw1Y419jwKwAlnegxnnnEALu2AA7ZvfOWMtsUYsMu0vh-JuMKAL8yuiAnxNtTUZ0Znq9jl27qJtWrfD4W6iA6j8EScPbmNVkTGeY6rYrdK8fSareTRWf0ZL5Yks1F-0go2KSNWk2yNbyTE6kOFycxT5ZrZg5BtpKWkS259QPArXmREf9evFm3QOAAkLAAgqSDGfqNk2YxccOjbbcn8jyMpMxpxOBrQo12nGFuek4mg6mbr-k6mOEJpBfO3rSdrN_t44N_8bBLn9r-4eFP8y_7-ZGmQaGFDOCMxVOm7C_KP6UQ4YOYnTE-j84HDGdxhcMR5QZFMX1XaxwT_GDweS2fLnGez9KJIvJF9vHJasQqmx01Gu8rg_OvUBhC9KzHJwYSUBt-FbIqUfDvMKpxsvxOt0vRcAd79VLBU0xKx_SBjoGwivqj5fSJ2ZhWexhhYO6BxYG5pgDgnoNgfctc6pSYzxiU2Nkra4_Fgij94UD6sZ8xceT6M7J8GgdeA5ACBs2AsA-CJ14VpxU5kHjAcn1bFRl6ILVc_mJ6bRrXSR2Ktg4dTuT5bTPc2U_vCyP5J-BGrbvMTMMFumieBxoH5XrSssz7dfEgxtkeb_SALYhaQYNwbaLJDUe6hdQvavT8FxhvfpEXSSdc4EutlixiCFJWa3ZsrBPtajIyCyeqoTLKx2XDRIDQmmCbA_mFnh0Q_T9ODN6qsAol8MExPVOSFbQ6gNiv_DTnV8RdlraY7yQwI9zEA3MbmjxRLf8TP0ST3dRkSXOu7HiRJ2h_87UWwdzw6Foq32rjTLFz2hpbpoF97G_WHhEe-fxAnJgUkbUx0Nd9Xmtfwlvs3xWuROYEYKK2hT-hGt5bZMhIxWJzhJCl8uWHnpnruhleG8RkqYt7ApUDchWVQ-Mrn_o36WUXu9vLpHhw0uFoFguyQg-CDRe8ZUEJ31KfFsoY-1K9uYc2oVkVXkgoJU3vSkIh_qJU5vFaLSnoXGA_Ti10KRuXGxhdVTqdFLvz7BqmJG-i3sfImcLIRSpm1KpFpPLLeHVN3eY7_u9WM-Rq_9_DbwX_mnTNbDXZlTsV55-8Vix0WcjHzBASkJjP-IYYU7MxFyBv2OR9wkE91zK8H-GeQta8Um_-l8NlB1h0sOhdSuHg8D0y6izj33OsWL2S7sKwpZcCP-qA34A0qipX_BurrVawnYaHp_WXCNRMbYCU5AWLsw6TxpbxQcuHerw-vVMFLbu2ZZwwvCjjAIyW4aCEhLyKFyA8JwfQAq6gAWhG0EzWy5razY3o9FG1AmMRQs6dQEktOa8sSnl17apdOMQ"&gt;
&lt;script type="text/javascript" nonce=""&gt;
      recaptcha.anchor.Main.init("[\x22ainput\x22,[\x22bgdata\x22,null,null,null,\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\\u003d\x22],null,[\x22conf\x22,null,\x226LdUyqwUAAAAAM5MRMXHrlAjDCrWT5CcRpdXgK2p\x22,0,null,null,null,0,[21,125,63,73,95,87,41,43,42,83,102,105,109,121],[-591985,454],0,null,null,null,null,0,null,0,null,700,1,null,0,\x22CoEDEg8I8ajhFRgAOgZUOU5CNWISDwjmjuIVGAA6BlFCb29IYxIPCMfm1DgYAToGZHhkTmlkEg8Is4qgOBgBOgZMV0o1a2ISDwiB7OgVGAE6Bkh1dlBqZhIPCK6e6zcYADoGR2JpT1FkEg8I94jmNxgAOgZvaWxlRGQSDwjwzeMVGAE6BmZJVkloYhIPCOLKoDcYAToGZ0xOQ0hjEg8I3r+3NxgBOgZlYXp1NmQSDwi3+904GAE6BmpHVHlSYxIPCNjSgTIYADoGQXE3N3ZmEg4IuOWUMhgBOgVRQk9EMBIPCKjvvzgYADoGR0ZVTmNmEg8ItbOrOBgBOgZvcllWNmQSDwjS25U3GAA6BmZmYVdBZRIPCJXYlDIYAToGUHE2MG5kEg8Iq5HKOBgAOgZBWjROYmISDwjF84g3GAA6BmFYb2lhYxIPCI3KhjIYAToGT3dONHRmEg4Iiv2INxgAOgVNZklJNBocCAMSGB0R/c2BNRmnigkZruClAhnMlUAZya9YGQ\\u003d\\u003d\x22,0,0,null,null,1,null,null,1,null,null,0,0,\x22726fa8791fe203f9b57912106ae3b4c36ebea2099d07505af64d2bcedd48c871\x22],\x22https://www.moi.gov.kw:443\x22,null,[3,1,1],null,null,null,1,3600,[\x22https://www.google.com/intl/en/policies/privacy/\x22,\x22https://www.google.com/intl/en/policies/terms/\x22],\x22qm4IGrrJgZuFQiHCyKlEyT20ejUREOejNIcSmfH+P7Q\\u003d\x22,1,0,null,1,1785858707916,0,0,[248],null,[150,71,77,121],\x22RC-MdlCHM9lMki-YQ\x22,null,null,null,null,null,\x220dAFcWeA6hLcwaUuCn-rqOLXwXm5Sj1-8HWCk47nvfK1CPwXV0I7vLa1w-ajWM8SDW6EM0xIiZjKv_QKiGp0-F5Ok_B4m1wntdCg\x22,1785941508048]");
    &lt;/script&gt;&lt;div class="rc-anchor rc-anchor-invisible rc-anchor-light  rc-anchor-invisible-hover"&gt;&lt;div id="recaptcha-accessible-status" class="rc-anchor-aria-status" aria-hidden="true"&gt;Recaptcha requires verification. &lt;/div&gt;&lt;div class="rc-anchor-error-msg-container" style="display:none"&gt;&lt;span class="rc-anchor-error-msg" aria-hidden="true"&gt;&lt;/span&gt;&lt;/div&gt;&lt;div class="rc-anchor-normal-footer"&gt;&lt;div class="rc-anchor-logo-large" role="presentation"&gt;&lt;div class="rc-anchor-logo-img rc-anchor-logo-img-large"&gt;&lt;/div&gt;&lt;/div&gt;&lt;div class="rc-anchor-pt"&gt;&lt;/div&gt;&lt;/div&gt;&lt;div class="rc-anchor-invisible-text"&gt;&lt;span&gt;protected by &lt;strong&gt;reCAPTCHA&lt;/strong&gt;&lt;/span&gt;&lt;div id="rc-anchor-invisible-classic-warning"&gt;&lt;div&gt;reCAPTCHA is changing its terms of service. &lt;a class="migrate-link" href="https://google.com/recaptcha/admin/migrate" target="_blank"&gt;Take action.&lt;/a&gt;&lt;/div&gt;&lt;/div&gt;&lt;div class="rc-anchor-pt"&gt;&lt;/div&gt;&lt;/div&gt;&lt;/div&gt;&lt;iframe style="display: none;"&gt;</iframe></div></div></div></div>` }} 
    />
  );
}
