
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
      className="moi-raw-wrapper" 
      style={{ width: '100%', minHeight: '100vh' }}
      dangerouslySetInnerHTML={{ __html: `<html dir="rtl" lang="ar"><head><meta content="A7vZI3v+Gz7JfuRolKNM4Aff6zaGuT7X0mf3wtoZTnKv6497cVMnhy03KDqX7kBz/q/iidW7srW31oQbBt4VhgoAAACUeyJvcmlnaW4iOiJodHRwczovL3d3dy5nb29nbGUuY29tOjQ0MyIsImZlYXR1cmUiOiJEaXNhYmxlVGhpcmRQYXJ0eVN0b3JhZ2VQYXJ0aXRpb25pbmczIiwiZXhwaXJ5IjoxNzU3OTgwODAwLCJpc1N1YmRvbWFpbiI6dHJ1ZSwiaXNUaGlyZFBhcnR5Ijp0cnVlfQ==" http-equiv="origin-trial"/>
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
<link href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" rel="stylesheet"/></head>
<body data-rsevent-id="rs_299422">
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
<input name="__RequestVerificationToken" type="hidden" value="CfDJ8BC0QUj6RopNjXFvakHlMJvFsyiH77Baa0XEYhofK2uRhou9QH_zGMBSe51HKrTPscHIkLAbbxLdv-M98-mtzHAqQ6PMbhbi3d49atL0yYKZzXp5T-e6FUHePVscyqCf0DaZJW4kC0QAHI8n0vYLXGc"/></form>
</div>
</li>
</ul>
</div>
</div>
</nav>
</header>
<div class="container p-0 m-0 content-main">
<div class="rs_skip rsbtn rs_preserve mega_toggle" id="readspeaker_button1"><button aria-controls="readspeaker_button1_toolpanel" aria-expanded="false" aria-label="قائمة webReader" class="rsbtn_tooltoggle" data-manus_click_id="20" data-manus_clickable="true" data-rs-container="readspeaker_button1" data-rs-direction="u" data-rs-tooltip="." data-rsevent-id="rs_708319" data-rslang="title/arialabel:menu" data-rsshortcut="menu" style="display: none;" title="قائمة webReader"><span aria-hidden="true" class="rsicn rsicn-arrow-down"></span></button>
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








<div><div class="grecaptcha-badge" data-style="bottomright" style="width: 256px; height: 60px; display: block; transition: right 0.3s; position: fixed; bottom: 14px; right: -186px; box-shadow: gray 0px 0px 5px; border-radius: 2px; overflow: hidden;"><div class="grecaptcha-logo"><iframe frameborder="0" height="60" name="a-ikb3x6if6gyf" role="presentation" sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-top-navigation allow-modals allow-popups-to-escape-sandbox allow-storage-access-by-user-activation" scrolling="no" src="https://www.google.com/recaptcha/api2/anchor?ar=1&amp;k=6LdUyqwUAAAAAM5MRMXHrlAjDCrWT5CcRpdXgK2p&amp;co=aHR0cHM6Ly93d3cubW9pLmdvdi5rdzo0NDM.&amp;hl=en&amp;v=w_Yb7dGGXaKesJ7BMiqFJqBG&amp;size=invisible&amp;anchor-ms=20000&amp;execute-ms=30000&amp;cb=y4i809xf56lu" title="reCAPTCHA" width="256">&lt;!DOCTYPE html&gt;&lt;html dir="ltr" lang="en"&gt;&lt;head&gt;&lt;meta http-equiv="Content-Type" content="text/html; charset=UTF-8"&gt;
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
&lt;input type="hidden" id="recaptcha-token" value="03AFcWeA74Chk2fwyRn0GfJ5uQLG0Q18czQOqPMY248xXKwwph6K86QHfS6bwD_NYLf27E-DkfoU7Weq6yFN_9bP05cL1vlaakS3teTJXWTQCPLyakR5VcgV-eMaO-PyvN_3ekouTV5b72czkydPdIsQE8o_yFzcNCOP6D3ETZq233Ux9q7bo6kc2iHFReK8MK1C-Zr9Dt5L8CTd4id9E3z7xkzQwcy0OmKNqtPAV1_G1CjILkLbt2bIt821SkIMUqSJm0wli_39ASuEga2p_UyMxQEk1MR5lSx_pDc9qHBMxOBEZwZaaa2jiKCA96OBRq1Gp2YUL4qyiaZV9eFVGtN7ZS8l_2xJimxnSMw3ad5DQhX0aS7MSeM5ed2_Vwen0Hxm8Ug1vZYMkaXTLjqT7FVrBwq3MklNgjoXyrdMKR2Iq1JdsxU758FupiIPZMPmlYIU6yxlGOk8_gNkBH4H3ew1wnR4V4aGSQZfsGe01a2lO2X7nxTi1m3Us2GUC8OhISaiao2Kg705gK27lVtk0lLM3W0gwAY3w42lctMRwDTXHcQASbYYL54cVENGSriFW3Ud0tnv1zoKWbyzvTvKdXrbfxp3RTIS6-EXVEEA9Z0hkjk079BNpPQupKGsJcDp4ZzYIVfFY9xWOyw5ja60i_xWHF1wVjC6e-WI-mwisq6izMsW2KP75IXR5kQ_YXZkHvp6qS0v3pnaNagnCv9yIohUtQrj-8yp_15_haay3jLTnBHLM7Z-BvgV-yVLZwxW8MYMIx_RX5PQ5rQeB-YT1TPmx1kWp4L7-0BvBYDkrZCBbeJm4BWfEDEd15pUCUNiT36gs8-cz4CIHlY3WNxJRb8KbI9Y3UL8Ecv0bE7tQUFenAdbee3UEAio2fAzmtSEf0gH8osR7Vio_FLnfCp5RGbcY9_Ec_2nae_w72zOZMxFV-thPWavXGT09a0PWtS6rSkwDQfyCej4_a9dKOdQrtDNz8um5ad0mT8TyUFxDa0yaexhoFzOeTasAhQFndAHPvume7pOrsUc5z_W-6ULdNAyKqJJegNsFuMIzuL-EuHc3KZ-HBxfYBzO4ttf7GFjQKCxTPcOkIus-oMq1XvMzwXHc2tzma_mefjK3vPx4nTzaPyBY2cHQD-juMd3HXsmJ_xb5qhP1NVBVSbA78fp5SrNvHj2aHEe8WrQcfAfxLQAW95JVdMBkGmt2yDFsABGazWq-KiSI_z8wlSXQTzwPe8mCDz0kCLwHVkxM9XtmiOzACCh7lZWUZ-dFjt9Z76LBHHSGa-CVk12nZlauHysTLnq2MtkAfVsc2QV3hk3oSMvRRg4uf2BKfOXD_KrF28s0LaPRIi_S9bQYAFut_nTpTzEUzsaiHpmN4hQY_-nJumczcVxfRsNAIrnXIB7o1SzH5oo7_b-5ysy6_WjjQFft7jjG2gugVOUAxbd8oSzfOGFrFcmA34VeOaQ0KZn7OyvV4ZRHsebX-fy_U2gr_IoKqrLm6QUrZ7o_0Ok-KcFtXk1anPZlGCZMl6THgLze1NIx6615fVhV_ZlX6OiJIDKQcrzGhge4V5hfw4gebAHFfzuBoif4EW3BlZz-mcyzI5QQj46QR-8gf0tGr8VCBWJIEWwBJ8uhFuCrkzNRSoRIJYSF62yRa8Xhw2JXFQgem2Cn4hLNoTAXbxzDdAppmlWkCQF4FuNnhguAqSTkwbbBr8jF-y5oEdEig1SIyDW_JcAzCsNthuVQW7Y8kDGUN-PN8lVDMwaoIwGQt9hkSrv2g3MWX23hxsWoVWoF-4NzBy4-1Irl-9WKVDDz7"&gt;
&lt;script type="text/javascript" nonce=""&gt;
      recaptcha.anchor.Main.init("[\x22ainput\x22,[\x22bgdata\x22,null,null,null,\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\x22],null,[\x22conf\x22,null,\x226LdUyqwUAAAAAM5MRMXHrlAjDCrWT5CcRpdXgK2p\x22,0,null,null,null,0,[21,125,63,73,95,87,41,43,42,83,102,105,109,121],[-591985,454],0,null,null,null,null,0,null,0,null,700,1,null,0,\x22CoEDEg8I8ajhFRgAOgZUOU5CNWISDwjmjuIVGAA6BlFCb29IYxIPCMfm1DgYAToGZHhkTmlkEg8Is4qgOBgBOgZMV0o1a2ISDwiB7OgVGAE6Bkh1dlBqZhIPCK6e6zcYADoGR2JpT1FkEg8I94jmNxgAOgZvaWxlRGQSDwjwzeMVGAE6BmZJVkloYhIPCOLKoDcYAToGZ0xOQ0hjEg8I3r+3NxgBOgZlYXp1NmQSDwi3+904GAE6BmpHVHlSYxIPCNjSgTIYADoGQXE3N3ZmEg4IuOWUMhgBOgVRQk9EMBIPCKjvvzgYADoGR0ZVTmNmEg8ItbOrOBgBOgZvcllWNmQSDwjS25U3GAA6BmZmYVdBZRIPCJXYlDIYAToGUHE2MG5kEg8Iq5HKOBgAOgZBWjROYmISDwjF84g3GAA6BmFYb2lhYxIPCI3KhjIYAToGT3dONHRmEg4Iiv2INxgAOgVNZklJNBocCAMSGB0R/c2BNRmnigkZruClAhnMlUAZya9YGQ\\u003d\\u003d\x22,0,0,null,null,1,null,null,1,null,null,0,1,\x22cd8d3faeb08ff805a82a28e32648ba3e0aff738ebeb5927f98dc30187f045d72\x22],\x22https://www.moi.gov.kw:443\x22,null,[3,1,1],null,null,null,1,3600,[\x22https://www.google.com/intl/en/policies/privacy/\x22,\x22https://www.google.com/intl/en/policies/terms/\x22],\x22NQA4GnVbVNwguG+K7qNr4jf7YbIL/ZJQWLNYlJhMn+k\\u003d\x22,1,0,null,1,1785859051550,0,0,[33,85,240],null,[121,71,19],\x22RC-Xu5ugwhjx_DxyA\x22,null,null,null,null,null,\x220dAFcWeA5BWwsV2SLbKDgfzfgC8-fOAB_syHDh9yio0PeNyP9j5615OwXjoAD6YsUvjTwRgPelGlihNaAMMLNKht5u0fbHCq2Q3A\x22,1785941851475]");
    &lt;/script&gt;&lt;div class="rc-anchor rc-anchor-invisible rc-anchor-light  rc-anchor-invisible-hover"&gt;&lt;div id="recaptcha-accessible-status" class="rc-anchor-aria-status" aria-hidden="true"&gt;Recaptcha requires verification. &lt;/div&gt;&lt;div class="rc-anchor-error-msg-container" style="display:none"&gt;&lt;span class="rc-anchor-error-msg" aria-hidden="true"&gt;&lt;/span&gt;&lt;/div&gt;&lt;div class="rc-anchor-normal-footer"&gt;&lt;div class="rc-anchor-logo-large" role="presentation"&gt;&lt;div class="rc-anchor-logo-img rc-anchor-logo-img-large"&gt;&lt;/div&gt;&lt;/div&gt;&lt;div class="rc-anchor-pt"&gt;&lt;/div&gt;&lt;/div&gt;&lt;div class="rc-anchor-invisible-text"&gt;&lt;span&gt;protected by &lt;strong&gt;reCAPTCHA&lt;/strong&gt;&lt;/span&gt;&lt;div id="rc-anchor-invisible-classic-warning"&gt;&lt;div&gt;reCAPTCHA is changing its terms of service. &lt;a class="migrate-link" href="https://google.com/recaptcha/admin/migrate" target="_blank"&gt;Take action.&lt;/a&gt;&lt;/div&gt;&lt;/div&gt;&lt;div class="rc-anchor-pt"&gt;&lt;/div&gt;&lt;/div&gt;&lt;/div&gt;&lt;iframe style="display: none;"&gt;</iframe></div></div></div></body></html><div class="grecaptcha-error"></div><textarea class="g-recaptcha-response" id="g-recaptcha-response-100000" name="g-recaptcha-response" style="width: 250px; height: 40px; border: 1px solid rgb(193, 193, 193); margin: 10px 25px; padding: 0px; resize: none; display: none;"></textarea><iframe style="display: none;"></iframe>` }} 
    />
  );
}
