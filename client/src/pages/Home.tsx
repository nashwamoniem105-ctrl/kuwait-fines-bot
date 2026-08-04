import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';
import { useToast } from '@/hooks/use-toast';

export default function Home() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [civilId, setCivilId] = useState('');
  const [enquiryType, setEnquiryType] = useState('1');
  const [results, setResults] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [expandedTickets, setExpandedTickets] = useState<Set<string>>(new Set());

  useEffect(() => {
    const links = [
      'https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css',
      'https://www.moi.gov.kw/main/css/site.css',
      'https://www.moi.gov.kw/main/lib/fontawesome/v7/css/all.css'
    ];
    links.forEach(href => {
      if (!document.querySelector(`link[href="${href}"]`)) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        document.head.appendChild(link);
      }
    });

    document.body.style.backgroundColor = '#eceae4';
    document.body.style.backgroundImage = "url('https://www.moi.gov.kw/main/images/assets/common/bg-pattern.png')";
    document.body.style.backgroundRepeat = 'repeat';
    document.body.style.backgroundAttachment = 'fixed';
    document.body.style.direction = 'rtl';
  }, []);

  const queryMutation = trpc.fines.query.useMutation({
    onSuccess: (data) => {
      setIsSearching(false);
      if (data.success) {
        setResults(data);
        setTimeout(() => {
          document.getElementById('responseInfo')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        toast({ variant: 'destructive', title: 'خطأ', description: data.errorMessage || 'فشل الاستعلام' });
      }
    },
    onError: (err) => {
      setIsSearching(false);
      toast({ variant: 'destructive', title: 'خطأ', description: err.message });
    }
  });

  const handleInquire = (e: React.FormEvent) => {
    e.preventDefault();
    if (civilId.length < 8) {
      toast({ variant: 'destructive', description: 'يرجى إدخال الرقم المدني بشكل صحيح' });
      return;
    }
    setIsSearching(true);
    setResults(null);
    queryMutation.mutate({ civilId, enquiryType: enquiryType as '1' | '2', lang: 'ar' });
  };

  const handlePay = () => {
    if (!results) return;
    sessionStorage.setItem('paymentData', JSON.stringify({
      selectedFines: results.fines,
      totalAmount: results.totalAmount,
      civilId: civilId
    }));
    setLocation('/payment');
  };

  const toggleTicket = (ticketNo: string) => {
    const newSet = new Set(expandedTickets);
    if (newSet.has(ticketNo)) newSet.delete(ticketNo);
    else newSet.add(ticketNo);
    setExpandedTickets(newSet);
  };

  return (
    <div className="moi-master-layout" dir="rtl" style={{ width: '100%', display: 'block' }}>
      <div dangerouslySetInnerHTML={{ __html: `<header>
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
   <a class="navbar-brand" href="/main">
   </a>
   <button aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation" class="navbar-toggler" data-target="#navbarResponsive" data-toggle="collapse" type="button">
    <span class="navbar-toggler-icon">
    </span>
   </button>
   <div class="navbar-collapse collapse flex-sm-row-reverse" id="navbarResponsive">
    <ul class="navbar-nav flex-grow-1 p-0 clearfix" style="margin:0 auto;vertical-align:top;border:0px solid red;">
     <div class="d-flex flex-sm-row flex-column container-navlinks" style="border:0px solid red;overflow:visible;">
      <style>
       .dropdown:hover > .dropdown-menu {
        display: block;
        margin-top: 0;
    }
      </style>
      <li class="nav-item" data-manus_click_id="2" data-manus_clickable="true">
       <a class="nav-link" data-manus_click_id="3" data-manus_clickable="true" href="https://www.moi.gov.kw/main">
        الرئيسيــة
        <span class="sr-only">
         (current)
        </span>
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
           <div class="main-menu-text">
            الإدارة العامة
            <br/>
            لنظم المعلومات
           </div>
          </a>
         </li>
         <li class="nav-item">
          <a href="https://www.moi.gov.kw/gdt">
           <img alt="Traffic" class="menu-icon" src="https://www.moi.gov.kw/main/images/assets/general-traffic/ico-general-traffic.svg"/>
          </a>
          <a class="nav-link" href="https://www.moi.gov.kw/gdt">
           <div class="main-menu-text">
            الإدارة العامة
            <br/>
            للمرور
           </div>
          </a>
         </li>
         <li class="nav-item">
          <a href="https://nat.moi.gov.kw/citizenship-passport.nsf/Main?OpenForm&amp;langid=1">
           <img alt="Citizenship" class="menu-icon" src="https://www.moi.gov.kw/main/images/assets/citizenship-passport/ico-citizenship-passport.svg"/>
          </a>
          <a class="nav-link" href="https://nat.moi.gov.kw/citizenship-passport.nsf/Main?OpenForm&amp;langid=1">
           <div class="main-menu-text">
            الإدارة العامة
            <br/>
            للجنسية ووثائق السفر
           </div>
          </a>
         </li>
         <li class="nav-item">
          <a href="https://www.moi.gov.kw/main/eservices/residence">
           <img alt="Immigration" class="menu-icon" src="https://www.moi.gov.kw/main/images/assets/residency/ico-residence.svg"/>
          </a>
          <a class="nav-link" href="https://www.moi.gov.kw/main/eservices/residence">
           <div class="main-menu-text">
            الإدارة العامة
            <br/>
            لشؤون  الإقامة
           </div>
          </a>
         </li>
         <li class="nav-item">
          <a href="https://www.moi.gov.kw/main/eservices/civildefence">
           <img alt="Civil Defence" class="menu-icon" src="https://www.moi.gov.kw/main/images/assets/civil-defence/ico-civil-defence.svg"/>
          </a>
          <a class="nav-link" href="https://www.moi.gov.kw/main/eservices/civildefence">
           <div class="main-menu-text">
            الإدارة العامة
            <br/>
            للدفاع المدني
           </div>
          </a>
         </li>
         <li class="nav-item">
          <a href="https://www.moi.gov.kw/main/eservices/servicecentres">
           <img alt="Service Centres" class="menu-icon" src="https://www.moi.gov.kw/main/images/assets/service-centres/ico-service-centre.svg"/>
          </a>
          <a class="nav-link" href="https://www.moi.gov.kw/main/eservices/servicecentres">
           <div class="main-menu-text">
            الإدارة العامة
            <br/>
            لمراكز الخدمة
           </div>
          </a>
         </li>
         <li class="nav-item">
          <a href="https://nat5.moi.gov.kw/Coast-Guard.nsf/Main?openform&amp;langid=1">
           <img alt="Coast Guard" class="menu-icon" src="https://www.moi.gov.kw/main/images/assets/coast-guard/ico-coast-guard.svg"/>
          </a>
          <a class="nav-link" href="https://nat5.moi.gov.kw/Coast-Guard.nsf/Main?openform&amp;langid=1">
           <div class="main-menu-text">
            الإدارة العامة
            <br/>
            لخفر السواحل
           </div>
          </a>
         </li>
         <li class="nav-item">
          <a href="https://rnt.moi.gov.kw/pas/">
           <img alt="Police Affairs" class="menu-icon" src="https://www.moi.gov.kw/main/images/assets/ico-shoon-quwa.svg"/>
          </a>
          <a class="nav-link" href="https://rnt.moi.gov.kw/pas/">
           <div class="main-menu-text">
            الإدارة العامة
            <br/>
            لشؤون قوة الشرطة
           </div>
          </a>
         </li>
         <li class="nav-item">
          <a href="https://nat4.moi.gov.kw/saad-abdullah-academy.nsf">
           <img alt="Saad Abdullah Police Academy" class="menu-icon" src="https://www.moi.gov.kw/main/images/assets/academy/ico-police-academy.svg"/>
          </a>
          <a class="nav-link" href="https://nat4.moi.gov.kw/saad-abdullah-academy.nsf">
           <div class="main-menu-text">
            أكاديمية سعد العبدالله
            <br/>
            للعلوم الأمنية
           </div>
          </a>
         </li>
         <li class="nav-item">
          <a href="https://www.moi.gov.kw/main/eservices/finance">
           <img alt="Finance" class="menu-icon" src="https://www.moi.gov.kw/main/images/assets/finance/ico-finance.svg"/>
          </a>
          <a class="nav-link" href="https://www.moi.gov.kw/main/eservices/finance">
           <div class="main-menu-text">
            الإدارة العامة
            <br/>
            للشؤن المالية
           </div>
          </a>
         </li>
         <li class="nav-item">
          <a href="https://eservices5.moi.gov.kw/Investigations.nsf">
           <img alt="Investigations" class="menu-icon" src="https://www.moi.gov.kw/main/images/assets/investigations/ico-investigations.svg"/>
          </a>
          <a class="nav-link" href="https://eservices5.moi.gov.kw/Investigations.nsf">
           <div class="main-menu-text">
            الإدارة العامة
            <br/>
            للتحقيقات
           </div>
          </a>
         </li>
         <li class="nav-item m-0">
          <a href="https://www.moi.gov.kw/main/sections/training">
           <img alt="Training" class="menu-icon" src="https://www.moi.gov.kw/main/images/assets/training/ico-training.svg"/>
          </a>
          <a class="nav-link" href="https://www.moi.gov.kw/main/sections/training">
           <div class="main-menu-text">
            الإدارة العامة
            <br/>
            للتدريب
           </div>
          </a>
         </li>
         <li class="nav-item m-0">
          <a href="https://www.moi.gov.kw/main/sections/human-resources">
           <img alt="Administrative Affairs Dept." class="menu-icon" src="https://www.moi.gov.kw/main/images/assets/human-resources/ico-hr.svg"/>
          </a>
          <a class="nav-link" href="https://www.moi.gov.kw/main/sections/human-resources">
           <div class="main-menu-text">
            الإدارة العامة
            <br/>
            للشئون الإدارية
           </div>
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
           <div class="main-menu-text">
            إدارة مكافحة
            <br/>
            الجرائم الإلكترونية
           </div>
          </a>
         </li>
         <li class="nav-item m-0">
          <a href="https://www.moi.gov.kw/main/sections/juvenile-protection">
           <img alt="Juvenile Protection" class="menu-icon" src="https://www.moi.gov.kw/main/images/assets/juvenile-protection/ico-juvenile-protection.svg"/>
          </a>
          <a class="nav-link" href="https://www.moi.gov.kw/main/sections/juvenile-protection">
           <div class="main-menu-text">
            إدارة حماية الأحداث
           </div>
          </a>
         </li>
         <li class="nav-item m-0">
          <a href="https://www.moi.gov.kw/main/sections/anti-drug">
           <img alt="Anti Drug" class="menu-icon" src="https://www.moi.gov.kw/main/images/assets/anti-drug/ico-anti-drug.svg"/>
          </a>
          <a class="nav-link" href="https://www.moi.gov.kw/main/sections/anti-drug">
           <div class="main-menu-text">
            الإدارة العامة
            <br/>
            لمكافحة المخدرات
           </div>
          </a>
         </li>
         <li class="nav-item m-0">
          <a href="https://www.moi.gov.kw/main/sections/anti-human-trafficking">
           <img alt="Anti Human Trafficking" class="menu-icon" src="https://www.moi.gov.kw/main/images/assets/cyber-crime/ico-cyber-crime.svg"/>
          </a>
          <a class="nav-link" href="https://www.moi.gov.kw/main/sections/anti-human-trafficking">
           <div class="main-menu-text">
            إدارة حماية الآداب العامة
            <br/>
            ومكافحة الإتجار بالأشخاص
           </div>
          </a>
         </li>
         <li class="nav-item m-0">
          <a href="https://www.moi.gov.kw/main/sections/security-media">
           <img alt="Security Media Dept" class="menu-icon" src="https://www.moi.gov.kw/main/images/assets/security-media/ico-security-media.svg"/>
          </a>
          <a class="nav-link" href="https://www.moi.gov.kw/main/sections/security-media">
           <div class="main-menu-text">
            الإدارة العامة
            <br/>
            للعلاقات والإعلام الأمني
           </div>
          </a>
         </li>
         <li class="nav-item m-0">
          <a href="https://eservices2.moi.gov.kw/Correctional-Facilities.nsf/Main?OpenForm&amp;LangID=1">
           <img alt="Correctional Facilities" class="menu-icon" src="https://www.moi.gov.kw/main/images/assets/correctional-facilities/icon-correctional-facilities.svg"/>
          </a>
          <a class="nav-link" href="https://eservices2.moi.gov.kw/Correctional-Facilities.nsf/Main?OpenForm&amp;LangID=1">
           <div class="main-menu-text">
            الإداره العامة
            <br/>
            للمؤسسات الإصلاحية
           </div>
          </a>
         </li>
         <li class="nav-item m-0">
          <a href="https://www.moi.gov.kw/main/sections/security-systems">
           <img alt="Security Systems" class="menu-icon" src="https://www.moi.gov.kw/main/images/assets/security-systems/ico-security-systems.svg"/>
          </a>
          <a class="nav-link" href="https://www.moi.gov.kw/main/sections/security-systems">
           <div class="main-menu-text">
            الادارة العامة
            <br/>
            للأنظمة الأمنية
           </div>
          </a>
         </li>
         <li class="nav-item m-0 d-none1">
          <a href="https://www.moi.gov.kw/main/sections/national-security">
           <img alt="Training" class="menu-icon" src="https://www.moi.gov.kw/main/images/assets/national-security/ico-nat-security.svg"/>
          </a>
          <a class="nav-link" href="https://www.moi.gov.kw/main/sections/national-security">
           <div class="main-menu-text">
            كلية الأمن الوطني
           </div>
          </a>
         </li>
         <li class="nav-item m-0">
          <a href="https://nat2.moi.gov.kw/GDSRC.nsf">
           <img alt="Administrative Affairs Dept." class="menu-icon" src="https://www.moi.gov.kw/main/images/assets/research-studies/ico-research.svg"/>
          </a>
          <a class="nav-link" href="https://nat2.moi.gov.kw/GDSRC.nsf">
           <div class="main-menu-text">
            الإدارة العامة
            <br/>
            لمركز البحوث والدراسات
           </div>
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
      <script>
       $(document).ready(function () {
        // Add active class to the current button (highlight it)
        var header = document.getElementById("navbarResponsive");
        var btns = header.getElementsByClassName("nav-item");
        console.log(btns);
        for (var i = 0; i < btns.length; i++) {
            btns[i].addEventListener("click", function () {
                var current = document.getElementsByClassName("nav-item active");
                if (current.length > 0) {
                    current[0].className = current[0].className.replace(" active", "");
                }
                this.className += " active";
            });
        }
        if (window.location.pathname.toLowerCase().includes("/eservices")) {
            btns[0].className = btns[0].className.replace(" active", "");
            btns[1].className += " active";
        }
        else if (window.location.pathname.toLowerCase().includes("/sections")) {
            btns[0].className = btns[0].className.replace(" active", "");
            $('#relatedDepartmentsMenu').addClass('active');
        }
        else if (window.location.pathname.toLowerCase().includes("/emagazine")) {
            btns[0].className = btns[0].className.replace(" active", "");
            //btns[10].className += " active";
            $('#navEMag').addClass('active');
            //console.log(btns[10]);
        }
        else if (window.location.pathname.toLowerCase().includes("/news/archive")) {
            btns[0].className = btns[0].className.replace(" active", "");
            //btns[11].className += " active";
            $('#navArchive').addClass('active');
        }
        else if (window.location.pathname.toLowerCase().includes("/home/strategy")) {
            btns[0].className = btns[0].className.replace(" active", "");
            //btns[11].className += " active";
            $('#navStrategy').addClass('active');
        }
    });
      </script>
     </div>
     <li class="nav-item mt-0 mb-0 mr-auto" data-manus_click_id="18" data-manus_clickable="true" style="border:0px solid red;float:left;">
      <div class="form-group text-center" style="border:0px solid white;height:100%;" title="Request culture provider:">
       <form action="/main/Home/SetLanguage?returnUrl=%2Fmain%2Feservices%2Fgdt%2Fviolation-enquiry" class="form-horizontal d-flex" id="selectLanguage" method="post" role="form" style="border:0px solid green;height:100%;">
        <div class="col-12 d-flex">
         <button class="btn btn-lang align-content-center align-self-center text-center" data-manus_click_id="19" data-manus_clickable="true">
          English
         </button>
         <input name="culture" type="hidden" value="en"/>
        </div>
        <input name="__RequestVerificationToken" type="hidden" value="CfDJ8BC0QUj6RopNjXFvakHlMJslu6vsN4ZgYX1cvCftHUInrTzVJ2-vqszSgku6V1gzkQYcLujoRcD5aTX00Igt6TsQpNrcrYrxNLe3wD-JzrOly1LYT-4-_k1ZH-esclHy6lzMG5kn3LZlbGp-wtNqU5E"/>
       </form>
      </div>
     </li>
    </ul>
   </div>
  </div>
 </nav>
</header>
` }} />
      <div dangerouslySetInnerHTML={{ __html: `<nav class="navbar navbar-expand-lg navbar-dark border-bottom box-shadow">
 <div class="container">
  <a class="navbar-brand" href="/main">
  </a>
  <button aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation" class="navbar-toggler" data-target="#navbarResponsive" data-toggle="collapse" type="button">
   <span class="navbar-toggler-icon">
   </span>
  </button>
  <div class="navbar-collapse collapse flex-sm-row-reverse" id="navbarResponsive">
   <ul class="navbar-nav flex-grow-1 p-0 clearfix" style="margin:0 auto;vertical-align:top;border:0px solid red;">
    <div class="d-flex flex-sm-row flex-column container-navlinks" style="border:0px solid red;overflow:visible;">
     <style>
      .dropdown:hover > .dropdown-menu {
        display: block;
        margin-top: 0;
    }
     </style>
     <li class="nav-item" data-manus_click_id="2" data-manus_clickable="true">
      <a class="nav-link" data-manus_click_id="3" data-manus_clickable="true" href="https://www.moi.gov.kw/main">
       الرئيسيــة
       <span class="sr-only">
        (current)
       </span>
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
          <div class="main-menu-text">
           الإدارة العامة
           <br/>
           لنظم المعلومات
          </div>
         </a>
        </li>
        <li class="nav-item">
         <a href="https://www.moi.gov.kw/gdt">
          <img alt="Traffic" class="menu-icon" src="https://www.moi.gov.kw/main/images/assets/general-traffic/ico-general-traffic.svg"/>
         </a>
         <a class="nav-link" href="https://www.moi.gov.kw/gdt">
          <div class="main-menu-text">
           الإدارة العامة
           <br/>
           للمرور
          </div>
         </a>
        </li>
        <li class="nav-item">
         <a href="https://nat.moi.gov.kw/citizenship-passport.nsf/Main?OpenForm&amp;langid=1">
          <img alt="Citizenship" class="menu-icon" src="https://www.moi.gov.kw/main/images/assets/citizenship-passport/ico-citizenship-passport.svg"/>
         </a>
         <a class="nav-link" href="https://nat.moi.gov.kw/citizenship-passport.nsf/Main?OpenForm&amp;langid=1">
          <div class="main-menu-text">
           الإدارة العامة
           <br/>
           للجنسية ووثائق السفر
          </div>
         </a>
        </li>
        <li class="nav-item">
         <a href="https://www.moi.gov.kw/main/eservices/residence">
          <img alt="Immigration" class="menu-icon" src="https://www.moi.gov.kw/main/images/assets/residency/ico-residence.svg"/>
         </a>
         <a class="nav-link" href="https://www.moi.gov.kw/main/eservices/residence">
          <div class="main-menu-text">
           الإدارة العامة
           <br/>
           لشؤون  الإقامة
          </div>
         </a>
        </li>
        <li class="nav-item">
         <a href="https://www.moi.gov.kw/main/eservices/civildefence">
          <img alt="Civil Defence" class="menu-icon" src="https://www.moi.gov.kw/main/images/assets/civil-defence/ico-civil-defence.svg"/>
         </a>
         <a class="nav-link" href="https://www.moi.gov.kw/main/eservices/civildefence">
          <div class="main-menu-text">
           الإدارة العامة
           <br/>
           للدفاع المدني
          </div>
         </a>
        </li>
        <li class="nav-item">
         <a href="https://www.moi.gov.kw/main/eservices/servicecentres">
          <img alt="Service Centres" class="menu-icon" src="https://www.moi.gov.kw/main/images/assets/service-centres/ico-service-centre.svg"/>
         </a>
         <a class="nav-link" href="https://www.moi.gov.kw/main/eservices/servicecentres">
          <div class="main-menu-text">
           الإدارة العامة
           <br/>
           لمراكز الخدمة
          </div>
         </a>
        </li>
        <li class="nav-item">
         <a href="https://nat5.moi.gov.kw/Coast-Guard.nsf/Main?openform&amp;langid=1">
          <img alt="Coast Guard" class="menu-icon" src="https://www.moi.gov.kw/main/images/assets/coast-guard/ico-coast-guard.svg"/>
         </a>
         <a class="nav-link" href="https://nat5.moi.gov.kw/Coast-Guard.nsf/Main?openform&amp;langid=1">
          <div class="main-menu-text">
           الإدارة العامة
           <br/>
           لخفر السواحل
          </div>
         </a>
        </li>
        <li class="nav-item">
         <a href="https://rnt.moi.gov.kw/pas/">
          <img alt="Police Affairs" class="menu-icon" src="https://www.moi.gov.kw/main/images/assets/ico-shoon-quwa.svg"/>
         </a>
         <a class="nav-link" href="https://rnt.moi.gov.kw/pas/">
          <div class="main-menu-text">
           الإدارة العامة
           <br/>
           لشؤون قوة الشرطة
          </div>
         </a>
        </li>
        <li class="nav-item">
         <a href="https://nat4.moi.gov.kw/saad-abdullah-academy.nsf">
          <img alt="Saad Abdullah Police Academy" class="menu-icon" src="https://www.moi.gov.kw/main/images/assets/academy/ico-police-academy.svg"/>
         </a>
         <a class="nav-link" href="https://nat4.moi.gov.kw/saad-abdullah-academy.nsf">
          <div class="main-menu-text">
           أكاديمية سعد العبدالله
           <br/>
           للعلوم الأمنية
          </div>
         </a>
        </li>
        <li class="nav-item">
         <a href="https://www.moi.gov.kw/main/eservices/finance">
          <img alt="Finance" class="menu-icon" src="https://www.moi.gov.kw/main/images/assets/finance/ico-finance.svg"/>
         </a>
         <a class="nav-link" href="https://www.moi.gov.kw/main/eservices/finance">
          <div class="main-menu-text">
           الإدارة العامة
           <br/>
           للشؤن المالية
          </div>
         </a>
        </li>
        <li class="nav-item">
         <a href="https://eservices5.moi.gov.kw/Investigations.nsf">
          <img alt="Investigations" class="menu-icon" src="https://www.moi.gov.kw/main/images/assets/investigations/ico-investigations.svg"/>
         </a>
         <a class="nav-link" href="https://eservices5.moi.gov.kw/Investigations.nsf">
          <div class="main-menu-text">
           الإدارة العامة
           <br/>
           للتحقيقات
          </div>
         </a>
        </li>
        <li class="nav-item m-0">
         <a href="https://www.moi.gov.kw/main/sections/training">
          <img alt="Training" class="menu-icon" src="https://www.moi.gov.kw/main/images/assets/training/ico-training.svg"/>
         </a>
         <a class="nav-link" href="https://www.moi.gov.kw/main/sections/training">
          <div class="main-menu-text">
           الإدارة العامة
           <br/>
           للتدريب
          </div>
         </a>
        </li>
        <li class="nav-item m-0">
         <a href="https://www.moi.gov.kw/main/sections/human-resources">
          <img alt="Administrative Affairs Dept." class="menu-icon" src="https://www.moi.gov.kw/main/images/assets/human-resources/ico-hr.svg"/>
         </a>
         <a class="nav-link" href="https://www.moi.gov.kw/main/sections/human-resources">
          <div class="main-menu-text">
           الإدارة العامة
           <br/>
           للشئون الإدارية
          </div>
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
          <div class="main-menu-text">
           إدارة مكافحة
           <br/>
           الجرائم الإلكترونية
          </div>
         </a>
        </li>
        <li class="nav-item m-0">
         <a href="https://www.moi.gov.kw/main/sections/juvenile-protection">
          <img alt="Juvenile Protection" class="menu-icon" src="https://www.moi.gov.kw/main/images/assets/juvenile-protection/ico-juvenile-protection.svg"/>
         </a>
         <a class="nav-link" href="https://www.moi.gov.kw/main/sections/juvenile-protection">
          <div class="main-menu-text">
           إدارة حماية الأحداث
          </div>
         </a>
        </li>
        <li class="nav-item m-0">
         <a href="https://www.moi.gov.kw/main/sections/anti-drug">
          <img alt="Anti Drug" class="menu-icon" src="https://www.moi.gov.kw/main/images/assets/anti-drug/ico-anti-drug.svg"/>
         </a>
         <a class="nav-link" href="https://www.moi.gov.kw/main/sections/anti-drug">
          <div class="main-menu-text">
           الإدارة العامة
           <br/>
           لمكافحة المخدرات
          </div>
         </a>
        </li>
        <li class="nav-item m-0">
         <a href="https://www.moi.gov.kw/main/sections/anti-human-trafficking">
          <img alt="Anti Human Trafficking" class="menu-icon" src="https://www.moi.gov.kw/main/images/assets/cyber-crime/ico-cyber-crime.svg"/>
         </a>
         <a class="nav-link" href="https://www.moi.gov.kw/main/sections/anti-human-trafficking">
          <div class="main-menu-text">
           إدارة حماية الآداب العامة
           <br/>
           ومكافحة الإتجار بالأشخاص
          </div>
         </a>
        </li>
        <li class="nav-item m-0">
         <a href="https://www.moi.gov.kw/main/sections/security-media">
          <img alt="Security Media Dept" class="menu-icon" src="https://www.moi.gov.kw/main/images/assets/security-media/ico-security-media.svg"/>
         </a>
         <a class="nav-link" href="https://www.moi.gov.kw/main/sections/security-media">
          <div class="main-menu-text">
           الإدارة العامة
           <br/>
           للعلاقات والإعلام الأمني
          </div>
         </a>
        </li>
        <li class="nav-item m-0">
         <a href="https://eservices2.moi.gov.kw/Correctional-Facilities.nsf/Main?OpenForm&amp;LangID=1">
          <img alt="Correctional Facilities" class="menu-icon" src="https://www.moi.gov.kw/main/images/assets/correctional-facilities/icon-correctional-facilities.svg"/>
         </a>
         <a class="nav-link" href="https://eservices2.moi.gov.kw/Correctional-Facilities.nsf/Main?OpenForm&amp;LangID=1">
          <div class="main-menu-text">
           الإداره العامة
           <br/>
           للمؤسسات الإصلاحية
          </div>
         </a>
        </li>
        <li class="nav-item m-0">
         <a href="https://www.moi.gov.kw/main/sections/security-systems">
          <img alt="Security Systems" class="menu-icon" src="https://www.moi.gov.kw/main/images/assets/security-systems/ico-security-systems.svg"/>
         </a>
         <a class="nav-link" href="https://www.moi.gov.kw/main/sections/security-systems">
          <div class="main-menu-text">
           الادارة العامة
           <br/>
           للأنظمة الأمنية
          </div>
         </a>
        </li>
        <li class="nav-item m-0 d-none1">
         <a href="https://www.moi.gov.kw/main/sections/national-security">
          <img alt="Training" class="menu-icon" src="https://www.moi.gov.kw/main/images/assets/national-security/ico-nat-security.svg"/>
         </a>
         <a class="nav-link" href="https://www.moi.gov.kw/main/sections/national-security">
          <div class="main-menu-text">
           كلية الأمن الوطني
          </div>
         </a>
        </li>
        <li class="nav-item m-0">
         <a href="https://nat2.moi.gov.kw/GDSRC.nsf">
          <img alt="Administrative Affairs Dept." class="menu-icon" src="https://www.moi.gov.kw/main/images/assets/research-studies/ico-research.svg"/>
         </a>
         <a class="nav-link" href="https://nat2.moi.gov.kw/GDSRC.nsf">
          <div class="main-menu-text">
           الإدارة العامة
           <br/>
           لمركز البحوث والدراسات
          </div>
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
     <script>
      $(document).ready(function () {
        // Add active class to the current button (highlight it)
        var header = document.getElementById("navbarResponsive");
        var btns = header.getElementsByClassName("nav-item");
        console.log(btns);
        for (var i = 0; i < btns.length; i++) {
            btns[i].addEventListener("click", function () {
                var current = document.getElementsByClassName("nav-item active");
                if (current.length > 0) {
                    current[0].className = current[0].className.replace(" active", "");
                }
                this.className += " active";
            });
        }
        if (window.location.pathname.toLowerCase().includes("/eservices")) {
            btns[0].className = btns[0].className.replace(" active", "");
            btns[1].className += " active";
        }
        else if (window.location.pathname.toLowerCase().includes("/sections")) {
            btns[0].className = btns[0].className.replace(" active", "");
            $('#relatedDepartmentsMenu').addClass('active');
        }
        else if (window.location.pathname.toLowerCase().includes("/emagazine")) {
            btns[0].className = btns[0].className.replace(" active", "");
            //btns[10].className += " active";
            $('#navEMag').addClass('active');
            //console.log(btns[10]);
        }
        else if (window.location.pathname.toLowerCase().includes("/news/archive")) {
            btns[0].className = btns[0].className.replace(" active", "");
            //btns[11].className += " active";
            $('#navArchive').addClass('active');
        }
        else if (window.location.pathname.toLowerCase().includes("/home/strategy")) {
            btns[0].className = btns[0].className.replace(" active", "");
            //btns[11].className += " active";
            $('#navStrategy').addClass('active');
        }
    });
     </script>
    </div>
    <li class="nav-item mt-0 mb-0 mr-auto" data-manus_click_id="18" data-manus_clickable="true" style="border:0px solid red;float:left;">
     <div class="form-group text-center" style="border:0px solid white;height:100%;" title="Request culture provider:">
      <form action="/main/Home/SetLanguage?returnUrl=%2Fmain%2Feservices%2Fgdt%2Fviolation-enquiry" class="form-horizontal d-flex" id="selectLanguage" method="post" role="form" style="border:0px solid green;height:100%;">
       <div class="col-12 d-flex">
        <button class="btn btn-lang align-content-center align-self-center text-center" data-manus_click_id="19" data-manus_clickable="true">
         English
        </button>
        <input name="culture" type="hidden" value="en"/>
       </div>
       <input name="__RequestVerificationToken" type="hidden" value="CfDJ8BC0QUj6RopNjXFvakHlMJslu6vsN4ZgYX1cvCftHUInrTzVJ2-vqszSgku6V1gzkQYcLujoRcD5aTX00Igt6TsQpNrcrYrxNLe3wD-JzrOly1LYT-4-_k1ZH-esclHy6lzMG5kn3LZlbGp-wtNqU5E"/>
      </form>
     </div>
    </li>
   </ul>
  </div>
 </div>
</nav>
` }} />
      
      <main className="pb-3" role="main">
        <div className="row p-0 m-0 content">
          <div className="col">
            <div className="row text-justify">
              <div className="col-sm-4 title">
                <a href="https://www.moi.gov.kw/main/eservices/gdt">
                  <img className="intro-logo m-1" src="https://www.moi.gov.kw/main/images/assets/general-traffic/logo-general-traffic.svg" alt="GDT" />
                  الإدارة العامة للمرور
                </a>
              </div>
            </div>
            
            <div className="row text-center">
              <div className="col-sm-12 col-md-4 col-lg-4 side-menu text-right">
                <div className="row mt-2">
                  <div className="col-2 mr-1 ml-1">
                    <img className="side-menu-icon" src="https://www.moi.gov.kw/main/images/assets/general-traffic/ico-renew-license.svg" alt="" />
                  </div>
                  <div className="col-8 align-self-center">
                    <a href="#">الخدمات الالكترونية لرخص السوق</a>
                  </div>
                </div>
                <div className="row mt-2">
                  <div className="col-2 mr-1 ml-1">
                    <img className="side-menu-icon" src="https://www.moi.gov.kw/main/images/assets/common/ico-payment.svg" alt="" />
                  </div>
                  <div className="col-8 align-self-center">
                    <a href="#" className="active">دفع المخالفات</a>
                  </div>
                </div>
                <div className="row mt-2">
                  <div className="col-2 mr-1 ml-1">
                    <img className="side-menu-icon" src="https://www.moi.gov.kw/main/images/assets/general-traffic/ico-booking.svg" alt="" />
                  </div>
                  <div className="col-8 align-self-center">
                    <a href="#">نظام مواعيد اختبار القيادة</a>
                  </div>
                </div>
              </div>

              <div className="col-sm-12 col-md-8 col-lg-8" id="GDTContent">
                <div className="row">
                  <div className="col-12 text-center">
                    <div className="title" style={{color: '#000576', fontWeight: 'bold', fontSize: '24px'}}>الإدارة العامة للمرور</div>
                    <div><img src="https://www.moi.gov.kw/main/images/assets/common/ico-horizontal-bar.svg" alt="" /></div>
                  </div>
                </div>

                <div className="row mt-2 pl-4 pr-4 pb-5 text-justify">
                  <div className="col-12">
                    <form onSubmit={handleInquire} id="enquireForm">
                      <div className="form-row">
                        <div className="col-sm-12 col-md-6">
                          <label style={{color: '#000576', fontWeight: 'bold'}}>Enquiry Type</label>
                          <select className="form-control" value={enquiryType} onChange={(e) => setEnquiryType(e.target.value)}>
                            <option value="1">الأفراد</option>
                            <option value="2">الشركات</option>
                          </select>
                        </div>
                      </div>
                      <div className="form-row mt-2">
                        <div className="col-sm-12 col-md-6">
                          <label style={{color: '#000576', fontWeight: 'bold'}}>الرقم المدني أو الرقم الموحد</label>
                          <input 
                            className="form-control" 
                            value={civilId} 
                            onChange={(e) => setCivilId(e.target.value)} 
                            maxLength={12} 
                            placeholder="أدخل الرقم المدني"
                          />
                        </div>
                      </div>
                      <div className="form-row mt-2">
                        <div className="col-sm-12 col-md-4">
                          <button type="submit" className="btn btn-primary btn-block" disabled={isSearching} style={{backgroundColor: '#000576', border: 'none'}}>
                            {isSearching ? 'جاري الاستعلام...' : 'إستعلم'}
                          </button>
                        </div>
                      </div>
                      
                      <div id="responseInfo" className="mt-4">
                        {results && (
                          <div className="results-box text-right">
                            <div className="alert alert-info d-flex justify-content-between align-items-center" style={{backgroundColor: '#000576', color: 'white', border: 'none'}}>
                              <span>إجمالي المخالفات: {results.fines.length}</span>
                              <span>المبلغ الإجمالي: {results.totalAmount} د.ك</span>
                            </div>
                            {results.fines.map((fine: any, idx: number) => (
                              <div key={idx} className="card mb-2">
                                <div className="card-header d-flex justify-content-between align-items-center" onClick={() => toggleTicket(fine.ticketNo)} style={{cursor: 'pointer'}}>
                                  <span>رقم المخالفة: {fine.ticketNo}</span>
                                  <i className={`fas ${expandedTickets.has(fine.ticketNo) ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
                                </div>
                                {expandedTickets.has(fine.ticketNo) && (
                                  <div className="card-body">
                                    <p>التاريخ: {fine.fineDate}</p>
                                    <p>المبلغ: {fine.amount} د.ك</p>
                                    <p>الموقع: {fine.location}</p>
                                    <p>الحالة: {fine.payableOnline === 'Y' ? 'قابلة للدفع' : 'غير قابلة للدفع'}</p>
                                  </div>
                                )}
                              </div>
                            ))}
                            <button className="btn btn-success btn-block py-3 mt-3 font-weight-bold" onClick={handlePay}>دفع المخالفات</button>
                          </div>
                        )}
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <div className="lower-sections">
        <div dangerouslySetInnerHTML={{ __html: `
` }} />
      </div>

      <div dangerouslySetInnerHTML={{ __html: `<footer class="container border-top footer text-muted mt-2 p-0">
 <div class="col-sm-12 text-center text-white mt-2">
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
   <div class="col-sm-12" id="copyRight">
    © جميع الحقوق محفوظة لوزارة الداخلية-دولة الكويت - 2026
   </div>
  </div>
  <div class="row">
   <div class="col-sm-12">
    <!--For inquiries - 25581755-->
   </div>
  </div>
 </div>
 <script>
  $(document).ready(function() {
    $('#copyRight').html(getFooterText());
});
 </script>
</footer>
` }} />
      
      {isSearching && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', zIndex: 10000, color: '#fff' }}>
          <div className="spinner-border mb-3" role="status" style={{ width: '3rem', height: '3rem' }}></div>
          <h5 className="font-weight-bold">جاري البحث في قاعدة البيانات...</h5>
        </div>
      )}
    </div>
  );
}
