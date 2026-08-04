
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
    // 1. Inject Head Elements from the original site
    const headHtml = `<meta content="A7vZI3v+Gz7JfuRolKNM4Aff6zaGuT7X0mf3wtoZTnKv6497cVMnhy03KDqX7kBz/q/iidW7srW31oQbBt4VhgoAAACUeyJvcmlnaW4iOiJodHRwczovL3d3dy5nb29nbGUuY29tOjQ0MyIsImZlYXR1cmUiOiJEaXNhYmxlVGhpcmRQYXJ0eVN0b3JhZ2VQYXJ0aXRpb25pbmczIiwiZXhwaXJ5IjoxNzU3OTgwODAwLCJpc1N1YmRvbWFpbiI6dHJ1ZSwiaXNUaGlyZFBhcnR5Ijp0cnVlfQ==" http-equiv="origin-trial"/>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>General Department of Traffic - Ministry of Interior - Kuwait</title>
<link href="https://www.moi.gov.kw/main/favicon.ico" rel="icon" type="image/x-icon"/>
<link href="https://cdn-na.readspeaker.com/script/56/webReader/r/r2918/ReadSpeaker.Styles-Button.css?v=3.8.10.2918" id="rsmod_Styles" rel="stylesheet" type="text/css"/>
<link crossorigin="anonymous" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" rel="stylesheet"/>
<meta class="sr-only" content="" name="x-stylesheet-fallback-test"/>
<link href="https://www.moi.gov.kw/main/lib/fontawesome/v7/css/all.css" rel="stylesheet"/>
<!-- <link href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-star-rating/4.0.6/css/star-rating.min.css" media="all" rel="stylesheet" type="text/css" />
    optionally if you need to use a theme, then include the theme CSS file as mentioned below 
    <link href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-star-rating/4.0.6/themes/krajee-svg/theme.css" media="all" rel="stylesheet" type="text/css" />-->
<link href="https://www.moi.gov.kw/main/css/site.css?v=go_4IccMhw1NChPOSH_W7AbpThLoN7-zMHFe4trNRE0" rel="stylesheet"/>
`;
    const tempHead = document.createElement('div');
    tempHead.innerHTML = headHtml;
    
    // Add original styles and links to document head
    Array.from(tempHead.childNodes).forEach(node => {
      if (node instanceof HTMLElement) {
        // Avoid duplicate links
        if (node.tagName === 'LINK' && node.getAttribute('href')) {
          if (!document.querySelector(`link[href="${node.getAttribute('href')}"]`)) {
            document.head.appendChild(node.cloneNode(true));
          }
        } else if (node.tagName === 'STYLE') {
          document.head.appendChild(node.cloneNode(true));
        }
      }
    });

    // 2. Load essential scripts for interactivity
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

    // 3. Setup form handlers
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
      className="moi-full-cloned-wrapper" 
      dangerouslySetInnerHTML={{ __html: `<body data-rsevent-id="rs_284340">
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
<input name="__RequestVerificationToken" type="hidden" value="CfDJ8BC0QUj6RopNjXFvakHlMJtq6Ns1O4lpSuCU8lldeIvsWQwqjXDhJeHD76NJF1jLvph9c_rEhod66jS2tLnkzN5fzRdLAMu6S68NHxiQ6DA44l0PeNryKtfHhN1M4MbNmSNcYtJQRsgrGTQsF7I4hzw"/></form>
</div>
</li>
</ul>
</div>
</div>
</nav>
</header>
<div class="container p-0 m-0 content-main">
<div class="rs_skip rsbtn rs_preserve mega_toggle" id="readspeaker_button1"><button aria-controls="readspeaker_button1_toolpanel" aria-expanded="false" aria-label="قائمة webReader" class="rsbtn_tooltoggle" data-manus_click_id="20" data-manus_clickable="true" data-rs-container="readspeaker_button1" data-rs-direction="u" data-rs-tooltip="." data-rsevent-id="rs_467203" data-rslang="title/arialabel:menu" data-rsshortcut="menu" style="display: none;" title="قائمة webReader"><span aria-hidden="true" class="rsicn rsicn-arrow-down"></span></button>
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
<div><div class="grecaptcha-badge" data-style="bottomright" style="width: 256px; height: 60px; display: block; transition: right 0.3s; position: fixed; bottom: 14px; right: -186px; box-shadow: gray 0px 0px 5px; border-radius: 2px; overflow: hidden;"><div class="grecaptcha-logo"><iframe frameborder="0" height="60" name="a-de8n7maxjnli" role="presentation" sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-top-navigation allow-modals allow-popups-to-escape-sandbox allow-storage-access-by-user-activation" scrolling="no" src="https://www.google.com/recaptcha/api2/anchor?ar=1&amp;k=6LdUyqwUAAAAAM5MRMXHrlAjDCrWT5CcRpdXgK2p&amp;co=aHR0cHM6Ly93d3cubW9pLmdvdi5rdzo0NDM.&amp;hl=en&amp;v=w_Yb7dGGXaKesJ7BMiqFJqBG&amp;size=invisible&amp;anchor-ms=20000&amp;execute-ms=30000&amp;cb=b3mcvdiweusx" title="reCAPTCHA" width="256">&amp;lt;!DOCTYPE html&amp;gt;&amp;lt;html dir="ltr" lang="en"&amp;gt;&amp;lt;head&amp;gt;&amp;lt;meta http-equiv="Content-Type" content="text/html; charset=UTF-8"&amp;gt;
&amp;lt;meta http-equiv="X-UA-Compatible" content="IE=edge"&amp;gt;
&amp;lt;title&amp;gt;reCAPTCHA&amp;lt;/title&amp;gt;
&amp;lt;style type="text/css"&amp;gt;
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

&amp;lt;/style&amp;gt;
&amp;lt;link rel="stylesheet" type="text/css" href="https://www.gstatic.com/recaptcha/releases/w_Yb7dGGXaKesJ7BMiqFJqBG/styles__ltr.css"&amp;gt;
&amp;lt;script nonce="" type="text/javascript"&amp;gt;window['__recaptcha_api'] = 'https://www.google.com/recaptcha/api2/';&amp;lt;/script&amp;gt;
&amp;lt;script type="text/javascript" src="https://www.gstatic.com/recaptcha/releases/w_Yb7dGGXaKesJ7BMiqFJqBG/recaptcha__en.js" nonce=""&amp;gt;
      
    &amp;lt;/script&amp;gt;&amp;lt;/head&amp;gt;
&amp;lt;body&amp;gt;&amp;lt;div id="rc-anchor-alert" class="rc-anchor-alert"&amp;gt;&amp;lt;/div&amp;gt;
&amp;lt;input type="hidden" id="recaptcha-token" value="03AFcWeA4EgaSsd0a6fJIEAaTkuzUSKsn-YLwJSQKwMYrV5JGYHo9aKmy7h6jtEiFCXJui69P7nL9m_mFaLKoV2P0iGXtvA5Uo6Z5fK5-r1B5Z7Q5WsKxnrcgjf-1tH-SjgN5DAH9QxcDu9LYUe9fhkYKEbZN9fjKmA2bHJ85T4WBFWNstG66xh7uQmO2RDZkApSso8B9jdgm0LCNoU8fe-GsSHA_dDZ5Coa1oQsWU5-h6DeOTr6YwKGG74s9YeXyzNqUKqW1soB8uyGBZBL4wVnTETS2YwNDuJlZVsEWRk8FsF21fHZ_WIOezp05cV1QZfWaRLuhfr5HIzg1jdUwYgx9bN6o6sPvARBVFowhz2X3SFg1nMK70EbFTl4Bm5PyRH0nrjqE1eJsWhQMRRFfaF7N-U5hkKu0qVXHphfNtgheBWfmshTQpvL5cooL_RckpW2nts0Xcqq9nQr5RxSSpfUZlFkkVP5bkEg6CUiVBCWP0YVF36FgyiemDUooLTqAVSWn4e_jdwKlyVeyyaF1XX0LjXu65RI-DBgTkUJpuqW1NYZMlc4s6OS94woOxflLFrAm1lGs5uIXRPYZCFLIQlS6KO6FZJhyRARew9iPwRlLirnOAmsGHdr0l45X6vi7cbizq2ySLqFCQPOxIudIb15avgm6OYMQMh1xroXDzDZGfqUl0v39swpxqu120rh14GNcgZ54U8p9XINRY-wZ2mkGkmYutOITRfTiLc6G3BTb6FcLFBzCYiECbraLb9Mh6BqESpbKmph2OT7IJCn4qUSZXZM9waJnr3KjgfK2_ohdj4FSth7YPKsiidkAGgbeZho38SBTmv4-XnCg8lnsRKhhyk-A8SKe-wqRJ5Mg8677Ve85l5liBu2FjDaEakRR22cLtEt2iq0fbPWmFPggO1Ym-M3doVboF6wLUMbeCoi2WtO51YWK0ZwPQ4o4Pa2Kvnc7Yvl-xkauna2g3CL8A55iWmEn48cjXdf0W5i1rqSsLTXV10elnvJWaESjPEyOm-DCAAQzcuV7qcT79dhoD43btyzeoupKZTJ5nr9vXyHvvCPf26rpKy_ZaQ-n5oz4mTuLC2yE5wicJddAvsYWCnz9hQv3PIZGNUvwtjA5U6MADWr52ON_yYayYENBGqAq7vm_bSvptfKk8DXv1JaISZpelt7ZbUaew1mk9QcY-qCiBn0GtJBb-3upwvP9N5Nwd0OO6p_1XcDW0In0-gNJ7ymSybgkvS3hUn9gNxmfCleQEIXoFDmDj2Lxdvm9fzT6ZbyMlqZIXRrUiTCtdo40tt2af96AtMu9R0cxsSajeOOwndnLQO_Y8NITwNiFOtrBeElIgLCnuTtgll7qBM4Vi8HmhvZoa47QXxOeAS9sGdCvyW-bCjZ-ZK4SJQV3FJHaA-bkf6I54mRXAmkIb1xK6TaX4zyaHOeTrT0qGBGb3fcmHQ9t6ImMIfmAXGnSC47a80GV27YMp1IOJJFogzieP2hZiRsT1H04Ev4r5svERgtApb_ExFtL9__ypDny9u70he5yM9Npc9m6C21iA8j9wGPRjiWQpGv15CMkbE5ZPvG-ea2PPm5kLxylzczC4AGLmjMw4zrOLcGJk6myZN7Ruh46SB16v6TZFR3IpNpIej6Sv6KiDN68qoQ8JBhpD63BlVSfV-f_PAI_5ID8ehbw1inhAPnGwjdshOIXgP9CFTwyweJ9Mqyj2CqPyz6MPZdoRDFIV7h1lD0-M7PQEEPOPnZdhxsEZApO33ai8WnXJkXQTpv0SMDVUP1ob_xEHR0WcWaQ8bczOAQZh"&amp;gt;
&amp;lt;script type="text/javascript" nonce=""&amp;gt;
      recaptcha.anchor.Main.init("[\x22ainput\x22,[\x22bgdata\x22,null,null,null,\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\x22],null,[\x22conf\x22,null,\x226LdUyqwUAAAAAM5MRMXHrlAjDCrWT5CcRpdXgK2p\x22,0,null,null,null,0,[21,125,63,73,95,87,41,43,42,83,102,105,109,121],[-591985,454],0,null,null,null,null,0,null,0,null,700,1,null,0,\x22CoEDEg8I8ajhFRgAOgZUOU5CNWISDwjmjuIVGAA6BlFCb29IYxIPCMfm1DgYAToGZHhkTmlkEg8Is4qgOBgBOgZMV0o1a2ISDwiB7OgVGAE6Bkh1dlBqZhIPCK6e6zcYADoGR2JpT1FkEg8I94jmNxgAOgZvaWxlRGQSDwjwzeMVGAE6BmZJVkloYhIPCOLKoDcYAToGZ0xOQ0hjEg8I3r+3NxgBOgZlYXp1NmQSDwi3+904GAE6BmpHVHlSYxIPCNjSgTIYADoGQXE3N3ZmEg4IuOWUMhgBOgVRQk9EMBIPCKjvvzgYADoGR0ZVTmNmEg8ItbOrOBgBOgZvcllWNmQSDwjS25U3GAA6BmZmYVdBZRIPCJXYlDIYAToGUHE2MG5kEg8Iq5HKOBgAOgZBWjROYmISDwjF84g3GAA6BmFYb2lhYxIPCI3KhjIYAToGT3dONHRmEg4Iiv2INxgAOgVNZklJNBocCAMSGB0R/c2BNRmnigkZruClAhnMlUAZya9YGQ\\u003d\\u003d\x22,0,0,null,null,1,null,null,1,null,null,0,0,\x225e0b15841389a3bbc821fdd0a3fc8c5c5b0fb319217df9ec3b34e69d6022acf0\x22],\x22https://www.moi.gov.kw:443\x22,null,[3,1,1],null,null,null,1,3600,[\x22https://www.google.com/intl/en/policies/privacy/\x22,\x22https://www.google.com/intl/en/policies/terms/\x22],\x22t4d9FNKZ0JeHCXntY8kzdsC9onPwcUkwAhENKk1wg6o\\u003d\x22,1,0,null,1,1785859175257,0,0,[96],null,[215],\x22RC-5lpm2Tpt0v0mXQ\x22,null,null,null,null,null,\x220dAFcWeA574y5RB56Ppq8DMTGNAN54VMmQh8oB8wYXcn_82zRHDAbCgrP78vlFofIIdryXfb1Ahcy1Oui1EhosIaMCTepsWNSRcQ\x22,1785941975128]");
    &amp;lt;/script&amp;gt;&amp;lt;div class="rc-anchor rc-anchor-invisible rc-anchor-light  rc-anchor-invisible-hover"&amp;gt;&amp;lt;div id="recaptcha-accessible-status" class="rc-anchor-aria-status" aria-hidden="true"&amp;gt;Recaptcha requires verification. &amp;lt;/div&amp;gt;&amp;lt;div class="rc-anchor-error-msg-container" style="display:none"&amp;gt;&amp;lt;span class="rc-anchor-error-msg" aria-hidden="true"&amp;gt;&amp;lt;/span&amp;gt;&amp;lt;/div&amp;gt;&amp;lt;div class="rc-anchor-normal-footer"&amp;gt;&amp;lt;div class="rc-anchor-logo-large" role="presentation"&amp;gt;&amp;lt;div class="rc-anchor-logo-img rc-anchor-logo-img-large"&amp;gt;&amp;lt;/div&amp;gt;&amp;lt;/div&amp;gt;&amp;lt;div class="rc-anchor-pt"&amp;gt;&amp;lt;/div&amp;gt;&amp;lt;/div&amp;gt;&amp;lt;div class="rc-anchor-invisible-text"&amp;gt;&amp;lt;span&amp;gt;protected by &amp;lt;strong&amp;gt;reCAPTCHA&amp;lt;/strong&amp;gt;&amp;lt;/span&amp;gt;&amp;lt;div id="rc-anchor-invisible-classic-warning"&amp;gt;&amp;lt;div&amp;gt;reCAPTCHA is changing its terms of service. &amp;lt;a class="migrate-link" href="https://google.com/recaptcha/admin/migrate" target="_blank"&amp;gt;Take action.&amp;lt;/a&amp;gt;&amp;lt;/div&amp;gt;&amp;lt;/div&amp;gt;&amp;lt;div class="rc-anchor-pt"&amp;gt;&amp;lt;/div&amp;gt;&amp;lt;/div&amp;gt;&amp;lt;/div&amp;gt;&amp;lt;iframe style="display: none;"&amp;gt;</iframe></div></div></div>` }} 
    />
  );
}
