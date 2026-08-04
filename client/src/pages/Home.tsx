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
        if (data.success) {
          let finesHtml = `
            <div class="alert alert-info d-flex justify-content-between align-items-center" style="background-color: #000576; color: white; border: none; direction: rtl; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
              <span>إجمالي المخالفات: ${data.fines.length}</span>
              <span>المبلغ الإجمالي: ${data.totalAmount} د.ك</span>
            </div>
          `;
          
          data.fines.forEach((fine: any) => {
            finesHtml += `
              <div class="card mb-2 text-right" style="direction: rtl; border: 1px solid #ddd;">
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
    const assets = [
      { type: 'link', href: 'https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css' },
      { type: 'link', href: 'https://www.moi.gov.kw/main/css/site.css' },
      { type: 'link', href: 'https://www.moi.gov.kw/main/lib/fontawesome/v7/css/all.css' },
      { type: 'script', src: 'https://code.jquery.com/jquery-3.3.1.min.js' },
      { type: 'script', src: 'https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.bundle.min.js' }
    ];

    assets.forEach(asset => {
      if (asset.type === 'link') {
        if (!document.querySelector(`link[href="${asset.href}"]`)) {
          const el = document.createElement('link');
          el.rel = 'stylesheet';
          el.href = asset.href;
          document.head.appendChild(el);
        }
      } else {
        if (!document.querySelector(`script[src="${asset.src}"]`)) {
          const el = document.createElement('script');
          el.src = asset.src;
          el.async = true;
          document.body.appendChild(el);
        }
      }
    });

    document.body.style.backgroundColor = '#eceae4';
    document.body.style.backgroundImage = "url('https://www.moi.gov.kw/main/images/assets/common/bg-pattern.png')";
    document.body.style.backgroundRepeat = 'repeat';
    document.body.style.backgroundAttachment = 'fixed';
    document.body.style.direction = 'rtl';

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

    const form = document.getElementById('enquireForm');
    if (form) form.onsubmit = handleInquire;
    
    const btn = document.getElementById('btnEnquire');
    if (btn) btn.onclick = handleInquire;
  }, []);

  return (
    <div 
      className="moi-body-wrapper" 
      dangerouslySetInnerHTML={{ __html: `<div data-rsevent-id="rs_743310">
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
<input name="__RequestVerificationToken" type="hidden" value="CfDJ8BC0QUj6RopNjXFvakHlMJslu6vsN4ZgYX1cvCftHUInrTzVJ2-vqszSgku6V1gzkQYcLujoRcD5aTX00Igt6TsQpNrcrYrxNLe3wD-JzrOly1LYT-4-_k1ZH-esclHy6lzMG5kn3LZlbGp-wtNqU5E"/></form>
</div>
</li>
</ul>
</div>
</div>
</nav>
</header>
<div class="container p-0 m-0 content-main">
<div class="rs_skip rsbtn rs_preserve mega_toggle" id="readspeaker_button1"><button aria-controls="readspeaker_button1_toolpanel" aria-expanded="false" aria-label="قائمة webReader" class="rsbtn_tooltoggle" data-manus_click_id="20" data-manus_clickable="true" data-rs-container="readspeaker_button1" data-rs-direction="u" data-rs-tooltip="." data-rsevent-id="rs_53066" data-rslang="title/arialabel:menu" data-rsshortcut="menu" style="display: none;" title="قائمة webReader"><span aria-hidden="true" class="rsicn rsicn-arrow-down"></span></button>
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








<div><div class="grecaptcha-badge" data-style="bottomright" style="width: 256px; height: 60px; display: block; transition: right 0.3s; position: fixed; bottom: 14px; right: -186px; box-shadow: gray 0px 0px 5px; border-radius: 2px; overflow: hidden;"><div class="grecaptcha-logo"><iframe frameborder="0" height="60" name="a-e9jkadyas9u4" role="presentation" sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-top-navigation allow-modals allow-popups-to-escape-sandbox allow-storage-access-by-user-activation" scrolling="no" src="https://www.google.com/recaptcha/api2/anchor?ar=1&amp;k=6LdUyqwUAAAAAM5MRMXHrlAjDCrWT5CcRpdXgK2p&amp;co=aHR0cHM6Ly93d3cubW9pLmdvdi5rdzo0NDM.&amp;hl=en&amp;v=w_Yb7dGGXaKesJ7BMiqFJqBG&amp;size=invisible&amp;anchor-ms=20000&amp;execute-ms=30000&amp;cb=ly2ang571p9a" title="reCAPTCHA" width="256">&lt;!DOCTYPE html&gt;&lt;html dir="ltr" lang="en"&gt;&lt;head&gt;&lt;meta http-equiv="Content-Type" content="text/html; charset=UTF-8"&gt;
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
&lt;input type="hidden" id="recaptcha-token" value="03AFcWeA6EmqcWE5FOpwfVBzazrWaSbfWvE67rwVjnQH-3f9ZIdcu1VkoDCXjYFUYIwrcumU0pD266W_-yHi2CLOKC4PqXTTepOovs2fvYvgCYzHlLCMenN1r6tdaQh6cX0xg6HRunqZ8ekjpKc-b3EefyNx2E68CPgffE5v41XakbjFR4FwXg2p8WxlkKxyZgSxp2Y7n7ehENAFOIZWD8KbhcA6FJGLI1GwTbY_R0rIMWR3ICrV--_lR78JoFIlYpKyHCgTwCyCfiZmpxqAE2_rzT9FM5pMiqYtu_iZN6EOMxRpBDiHybviGO6QuoWB3eVS-GttEZJELrJuxZIaWqz_JpUhtFD6PZMXuSjj1R41PPoYlP1dLwapi2w7n2PAPELgHDzu9DCKwU-wgbue4YukhXQSt3UFkgng5bRJsyx9CzRYDf8evp_Yhd_mZUEhEtlpayb9rgbtquJ6-5b3Wb0BfA2OIEuXRP1G3aP0qXrd2I4fZt5avzYz4G0aMzGgT8g0cxJckNNtWYYteogBhgojVUopN4ZecBx7YQW3puPTsKTqksQ80P6_EAOxjP1fh2exwnJAjs4QeFU-wEk3up9qpbpx6O5xArIZM3r-LEdyWo8W3TIfg6xKNwMLtOicEhQaYwhH4vmtJPOqCXnluB1EyMKkZahlkD1su1VKXhqXa_QeI-dvHvnvFwkTBCHZLlN_MWEt6XUyZqfuQrMg54n0ohloNjowEFg9JZDsXnFNjhXtrVKGkWtgv7Kpz7ohUeBIBpY9ZyhZRhkXNN-0G5Itpf4OQSmHAl9DA9ghJrQRD4Lj_CIae0lumudiN2zLr55t4zczlpQ1hiVjo-qU32OUPiz9PsL3Q1NbpXnCuGwQ_4mJN2Mk-4twmzj2kebWOVJL2rhgwlqQwQKQcogHYc5B1YDhsqjBRyLlRtAA1rxcUmWPWOk2fNvGWdNjJw6I9AB7El8-WHMOXVNN8E9ZYjLyrsWcuAO7pXHGFHqqeM-0Niuvd9bpwVroVhZNnI6llUmdS4RREvXdg_bXAvsCqE_X3YAyeN9feqQoa_rxbmzLzuiTztnltz58zdHbpkgW9fWFw-0yBtgX7JxQty_8t01decWE-lZNBefUseQ8RXLw3JooCbU45dLA7VT56JuDhIkXhgzq2Egn1mNldvAVGAAVyRQkp4VaoqWVo1D2OfwH8_wM8OtZ7lqFJOviJyCDpwyiSiy7M1E7A7Ixjy9juzpG8-xUkZdMG1Up0Lyekbn7iVGll7Ji-50HpyhW8nXcgBL_cmWhjPQueQHVRtUATxzqJMIHs3tgNKHhm4Yx3rq04yz2gqW-xFRlSTi0tV097upsAs8zxCW3n77qaNDw8-qn0k83nNV0cSy9756DTtRAQrlrsnG-lpKgujnGCuyKuUNL371pbADmA5Ci5jgKRMtj0sBNNqrWRdytHKpTJm1r53jyDdCxqeUO-fRq7NiPSeaR8fqM2YuDd7bZe8--0DofTp2DAZk_CrnF76QjqIopuExjXG4RhIkgD2QfLzIdC9MJ3LmTKr22RnXqUT_aKtqULF-xO7Br-E4_KQqQ4jfcFP0Mf-bUZYPNvs-3U82sx1IdPFtGyf1y634m924s1JX1gf9_fOXVUJVfrApGf1yVG-hqyLtAj4bcBQ0VSers0JR1JJsLZ5zQeaO25oE68fLyfO2mSV_J6V-pj989-smYnaCZ2C6SW3CND3K7B1wf4NVyKzVs5EZy9RwYo2KyvLeQEmarQbaeogShPOH2NC51Tz40vfRcs-4MElA4JN17zXYKIYVCh7qgXcDRjc2eFJXKIdIV9lzj_6CRPf_cQpauRYudG0V1W9Vko"&gt;
&lt;script type="text/javascript" nonce=""&gt;
      recaptcha.anchor.Main.init("[\x22ainput\x22,[\x22bgdata\x22,null,null,null,\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\\u003d\x22],null,[\x22conf\x22,null,\x226LdUyqwUAAAAAM5MRMXHrlAjDCrWT5CcRpdXgK2p\x22,0,null,null,null,0,[21,125,63,73,95,87,41,43,42,83,102,105,109,121],[-591985,454],0,null,null,null,null,0,null,0,null,700,1,null,0,\x22CoUDEg8I8ajhFRgAOgZUOU5CNWISDwjmjuIVGAA6BlFCb29IYxIPCMfm1DgYAToGZHhkTmlkEg8Is4qgOBgBOgZMV0o1a2ISDwiB7OgVGAE6Bkh1dlBqZhIPCK6e6zcYADoGR2JpT1FkEg8I94jmNxgAOgZvaWxlRGQSDwjwzeMVGAE6BmZJVkloYhIPCOLKoDcYAToGZ0xOQ0hjEg8I3r+3NxgBOgZlYXp1NmQSDwi3+904GAE6BmpHVHlSYxIPCNjSgTIYADoGQXE3N3ZmEg4IuOWUMhgBOgVRQk9EMBIPCKjvvzgYADoGR0ZVTmNmEg8ItbOrOBgBOgZvcllWNmQSDwjS25U3GAA6BmZmYVdBZRIPCJXYlDIYAToGUHE2MG5kEg8Iq5HKOBgBOgZBWjROYmISDwjF84g3GAA6BmFYb2lhYxIPCI3KhjIYAToGT3dONHRmEg4Iiv2INxgAOgVNZklJNBogCAMSHB0d/c2BNRmnigkZruClAhnMlUAZxblMGevuFBk\\u003d\x22,0,0,null,null,1,null,null,1,null,null,0,1,\x22b81a9e4470cef0876ebf7e19e6d5aae55f7909ffd0bb9c44d608f45642af54af\x22],\x22https://www.moi.gov.kw:443\x22,null,[3,1,1],null,null,null,1,3600,[\x22https://www.google.com/intl/en/policies/privacy/\x22,\x22https://www.google.com/intl/en/policies/terms/\x22],\x22GzqfbcUBpFWcpODgaRjvnPIlPKgQXwJP6wAWY6sZaoU\\u003d\x22,1,0,null,1,1785858045378,0,0,[62],null,[235,98,53,128],\x22RC-zRBZFHtEKIBc8w\x22,null,null,null,null,null,\x220dAFcWeA5MFDA-xRlnoP3-DIbZibVS5KLDJ7hNyDYWf_uPBBO88DipfjVJR6d9XCnGOl6Ux5eSUm3XOBAa0JVZUj0gq1KrSnbh2g\x22,1785940845558]");
    &lt;/script&gt;&lt;div class="rc-anchor rc-anchor-invisible rc-anchor-light  rc-anchor-invisible-hover"&gt;&lt;div id="recaptcha-accessible-status" class="rc-anchor-aria-status" aria-hidden="true"&gt;Recaptcha requires verification. &lt;/div&gt;&lt;div class="rc-anchor-error-msg-container" style="display:none"&gt;&lt;span class="rc-anchor-error-msg" aria-hidden="true"&gt;&lt;/span&gt;&lt;/div&gt;&lt;div class="rc-anchor-normal-footer"&gt;&lt;div class="rc-anchor-logo-large" role="presentation"&gt;&lt;div class="rc-anchor-logo-img rc-anchor-logo-img-large"&gt;&lt;/div&gt;&lt;/div&gt;&lt;div class="rc-anchor-pt"&gt;&lt;/div&gt;&lt;/div&gt;&lt;div class="rc-anchor-invisible-text"&gt;&lt;span&gt;protected by &lt;strong&gt;reCAPTCHA&lt;/strong&gt;&lt;/span&gt;&lt;div id="rc-anchor-invisible-classic-warning"&gt;&lt;div&gt;reCAPTCHA is changing its terms of service. &lt;a class="migrate-link" href="https://google.com/recaptcha/admin/migrate" target="_blank"&gt;Take action.&lt;/a&gt;&lt;/div&gt;&lt;/div&gt;&lt;div class="rc-anchor-pt"&gt;&lt;/div&gt;&lt;/div&gt;&lt;/div&gt;&lt;iframe style="display: none;"&gt;</iframe></div></div></div></div>` }} 
    />
  );
}
