import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export default function Home() {
  const { lang } = useLanguage();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [results, setResults] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);

  const queryMutation = trpc.fines.query.useMutation({
    onSuccess: (data) => {
      setIsSearching(false);
      if (data.success) {
        setResults(data);
        // Custom logic to show results in the original UI
        renderResults(data);
      } else {
        toast({ variant: "destructive", title: "خطأ", description: data.errorMessage || "فشل الاستعلام" });
      }
    },
  });

  const renderResults = (data: any) => {
    const container = document.getElementById('responseInfo');
    if (!container) return;
    
    let html = `<div class="mt-4">
      <div class="d-flex justify-content-between mb-3 border-bottom pb-2">
        <span class="font-weight-bold">عدد المخالفات: ${data.fines.length}</span>
        <span class="font-weight-bold text-danger">الإجمالي: ${data.totalAmount} د.ك</span>
      </div>
      <div class="table-responsive">
        <table class="table table-bordered table-sm bg-white">
          <thead class="thead-light">
            <tr>
              <th class="text-center">إختر</th>
              <th>رقم المخالفة</th>
              <th>التاريخ</th>
              <th>القيمة</th>
            </tr>
          </thead>
          <tbody>`;
          
    data.fines.forEach((fine: any) => {
      html += `<tr>
        <td class="text-center"><input type="checkbox" checked /></td>
        <td>${fine.ticketNo}</td>
        <td>${fine.dateTime}</td>
        <td class="font-weight-bold">${fine.amount}</td>
      </tr>`;
    });
    
    html += `</tbody></table></div>
    <div class="text-center mt-3">
      <button id="customPayBtn" class="btn btn-primary" style="background:#000576; width:200px">دفع</button>
    </div></div>`;
    
    container.innerHTML = html;
    document.getElementById('customPayBtn')?.addEventListener('click', () => {
        sessionStorage.setItem("paymentData", JSON.stringify({
            selectedFines: data.fines,
            totalAmount: data.totalAmount,
            civilId: (document.getElementById('civilId') as HTMLInputElement).value
        }));
        setLocation("/payment");
    });
  };

  useEffect(() => {
    const form = document.getElementById('enquireForm');
    if (form) {
      form.onsubmit = (e) => {
        e.preventDefault();
        const cid = (document.getElementById('civilId') as HTMLInputElement).value;
        const type = (document.getElementById('enquiryType') as HTMLSelectElement).value;
        if (cid.length < 8) return;
        setIsSearching(true);
        queryMutation.mutate({ civilId: cid, enquiryType: type as "1" | "2", lang: "ar" });
      };
    }
  }, []);

  return (
    <div className="moi-raw-clone">
      <link rel="stylesheet" href="https://cdn-na.readspeaker.com/script/56/webReader/r/r2918/ReadSpeaker.Styles-Button.css?v=3.8.10.2918" />
<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" />
<link rel="stylesheet" href="/main/lib/fontawesome/v7/css/all.css" />
<link rel="stylesheet" href="/main/css/site.css?v=go_4IccMhw1NChPOSH_W7AbpThLoN7-zMHFe4trNRE0" />
<link rel="stylesheet" href="https://cdn.datatables.net/1.10.20/css/dataTables.bootstrap4.min.css" />
<link rel="stylesheet" href="https://cdn.datatables.net/responsive/2.2.3/css/responsive.dataTables.min.css" />
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css" />
<link rel="stylesheet" href="https://npmcdn.com/flatpickr/dist/themes/dark.css" />
<link rel="stylesheet" href="/main/lib/flatpickr/plugins/year-dropdown.css" />
      <style>{`
        .moi-raw-clone { font-family: sans-serif; }
        body { background-color: #e9e6de !important; }
      `}</style>
      <div dangerouslySetInnerHTML={ __html: `
<div className="container">
<header>
<div className="row">
<div className="col-4 col-md-2 col-lg-2 text-center" style="border:0px solid red;">
<a className="navbar-brand m-0"   href="https://www.moi.gov.kw/main/">
<img src="https://www.moi.gov.kw/main/images/assets/common/logo-moi.svg" style="height: 120px;"/>
</a>
</div>
<div className="col-1 align-self-center" style="border:0px solid red;">
<div className="row">
<div className="col text-center">
<img className="text-center main-header-title" src="https://www.moi.gov.kw/main/images/assets/common/ar/state-of-kuwait.svg"/>
</div>
</div>
<div className="row">
<div className="col text-center">
<img className="mt-2 main-header-title" src="https://www.moi.gov.kw/main/images/assets/common/ar/ministry-of-interior.svg"/>
</div>
</div>
</div>
</div>
<nav className="navbar navbar-expand-lg navbar-dark border-bottom box-shadow">
<div className="container">
<a className="navbar-brand" href="/main"></a>
<button aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation" className="navbar-toggler" data-target="#navbarResponsive" data-toggle="collapse" type="button">
<span className="navbar-toggler-icon"></span>
</button>
<div className="navbar-collapse collapse flex-sm-row-reverse" id="navbarResponsive">
<ul className="navbar-nav flex-grow-1 p-0 clearfix" style="margin:0 auto;vertical-align:top;border:0px solid red;">
<div className="d-flex flex-sm-row flex-column container-navlinks" style="border:0px solid red;overflow:visible;"><style>
    .dropdown:hover > .dropdown-menu {
        display: block;
        margin-top: 0;
    }
</style>
<li className="nav-item"  >
<a className="nav-link"   href="https://www.moi.gov.kw/main">
        الرئيسيــة
        <span className="sr-only">(current)</span>
</a>
</li>
<li className="nav-item active"   data-trigger="focus" id="eservicesMenu">
<a aria-controls="eservices" aria-expanded="false" className="nav-link"   data-target="#eservices" data-toggle="collapse" href="#" id="nav-eServices">
        الخدمات الإلكترونيـة
    </a>
<span className="collapse navbar-submenu" data-parent="#navbarResponsive" id="eservices">
<ul className="nav justify-content-center pt-2 pb-2 pl-3 pr-3" style="border:0px solid red;">
<li className="nav-item m-0">
<a href="https://www.moi.gov.kw/main/eservices">
<img alt="Information Systems" className="menu-icon" src="https://www.moi.gov.kw/main/images/assets/it-comm/ico-it-communications.svg"/>
</a>
<a className="nav-link active" href="https://www.moi.gov.kw/main/eservices">
<div className="main-menu-text">الإدارة العامة<br/>لنظم المعلومات</div>
</a>
</li>
<li className="nav-item">
<a href="https://www.moi.gov.kw/gdt">
<img alt="Traffic" className="menu-icon" src="https://www.moi.gov.kw/main/images/assets/general-traffic/ico-general-traffic.svg"/>
</a>
<a className="nav-link" href="https://www.moi.gov.kw/gdt">
<div className="main-menu-text">الإدارة العامة<br/>للمرور</div>
</a>
</li>
<li className="nav-item">
<a href="https://nat.moi.gov.kw/citizenship-passport.nsf/Main?OpenForm&amp;langid=1">
<img alt="Citizenship" className="menu-icon" src="https://www.moi.gov.kw/main/images/assets/citizenship-passport/ico-citizenship-passport.svg"/>
</a>
<a className="nav-link" href="https://nat.moi.gov.kw/citizenship-passport.nsf/Main?OpenForm&amp;langid=1">
<div className="main-menu-text">الإدارة العامة<br/>للجنسية ووثائق السفر</div>
</a>
</li>
<li className="nav-item">
<a href="https://www.moi.gov.kw/main/eservices/residence">
<img alt="Immigration" className="menu-icon" src="https://www.moi.gov.kw/main/images/assets/residency/ico-residence.svg"/>
</a>
<a className="nav-link" href="https://www.moi.gov.kw/main/eservices/residence">
<div className="main-menu-text">الإدارة العامة<br/>لشؤون  الإقامة</div>
</a>
</li>
<li className="nav-item">
<a href="https://www.moi.gov.kw/main/eservices/civildefence">
<img alt="Civil Defence" className="menu-icon" src="https://www.moi.gov.kw/main/images/assets/civil-defence/ico-civil-defence.svg"/>
</a>
<a className="nav-link" href="https://www.moi.gov.kw/main/eservices/civildefence">
<div className="main-menu-text">الإدارة العامة<br/>للدفاع المدني</div>
</a>
</li>
<li className="nav-item">
<a href="https://www.moi.gov.kw/main/eservices/servicecentres">
<img alt="Service Centres" className="menu-icon" src="https://www.moi.gov.kw/main/images/assets/service-centres/ico-service-centre.svg"/>
</a>
<a className="nav-link" href="https://www.moi.gov.kw/main/eservices/servicecentres">
<div className="main-menu-text">الإدارة العامة<br/>لمراكز الخدمة</div>
</a>
</li>
<li className="nav-item">
<a href="https://nat5.moi.gov.kw/Coast-Guard.nsf/Main?openform&amp;langid=1">
<img alt="Coast Guard" className="menu-icon" src="https://www.moi.gov.kw/main/images/assets/coast-guard/ico-coast-guard.svg"/>
</a>
<a className="nav-link" href="https://nat5.moi.gov.kw/Coast-Guard.nsf/Main?openform&amp;langid=1">
<div className="main-menu-text">الإدارة العامة<br/>لخفر السواحل</div>
</a>
</li>
<li className="nav-item">
<a href="https://rnt.moi.gov.kw/pas/">
<img alt="Police Affairs" className="menu-icon" src="https://www.moi.gov.kw/main/images/assets/ico-shoon-quwa.svg"/>
</a>
<a className="nav-link" href="https://rnt.moi.gov.kw/pas/">
<div className="main-menu-text">الإدارة العامة<br/>لشؤون قوة الشرطة</div>
</a>
</li>
<li className="nav-item">
<a href="https://nat4.moi.gov.kw/saad-abdullah-academy.nsf">
<img alt="Saad Abdullah Police Academy" className="menu-icon" src="https://www.moi.gov.kw/main/images/assets/academy/ico-police-academy.svg"/>
</a>
<a className="nav-link" href="https://nat4.moi.gov.kw/saad-abdullah-academy.nsf">
<div className="main-menu-text">أكاديمية سعد العبدالله<br/>للعلوم الأمنية</div>
</a>
</li>
<li className="nav-item">
<a href="https://www.moi.gov.kw/main/eservices/finance">
<img alt="Finance" className="menu-icon" src="https://www.moi.gov.kw/main/images/assets/finance/ico-finance.svg"/>
</a>
<a className="nav-link" href="https://www.moi.gov.kw/main/eservices/finance">
<div className="main-menu-text">الإدارة العامة<br/>للشؤن المالية</div>
</a>
</li>
<li className="nav-item">
<a href="https://eservices5.moi.gov.kw/Investigations.nsf">
<img alt="Investigations" className="menu-icon" src="https://www.moi.gov.kw/main/images/assets/investigations/ico-investigations.svg"/>
</a>
<a className="nav-link" href="https://eservices5.moi.gov.kw/Investigations.nsf">
<div className="main-menu-text">الإدارة العامة<br/>للتحقيقات</div>
</a>
</li>
<li className="nav-item m-0">
<a href="https://www.moi.gov.kw/main/sections/training">
<img alt="Training" className="menu-icon" src="https://www.moi.gov.kw/main/images/assets/training/ico-training.svg"/>
</a>
<a className="nav-link" href="https://www.moi.gov.kw/main/sections/training">
<div className="main-menu-text">الإدارة العامة<br/>للتدريب
                    </div>
</a>
</li>
<li className="nav-item m-0">
<a href="https://www.moi.gov.kw/main/sections/human-resources">
<img alt="Administrative Affairs Dept." className="menu-icon" src="https://www.moi.gov.kw/main/images/assets/human-resources/ico-hr.svg"/>
</a>
<a className="nav-link" href="https://www.moi.gov.kw/main/sections/human-resources">
<div className="main-menu-text">الإدارة العامة<br/>للشئون الإدارية</div>
</a>
</li>
</ul>
</span>
</li>
<li className="nav-item"   id="relatedDepartmentsMenu">
<a aria-controls="relatedDepts" aria-expanded="false" className="nav-link"   data-target="#relatedDepts" data-toggle="collapse" href="#" id="nav-relDepts">
        إدارات توعوية
    </a>
<span className="collapse navbar-submenu" data-parent="#navbarResponsive" id="relatedDepts">
<ul className="nav justify-content-center pt-2 pb-2 pl-3 pr-3" style="border:0px solid red;">
<li className="nav-item m-0">
<a href="https://www.moi.gov.kw/main/sections/cyber-crime">
<img alt="Cyber Crime" className="menu-icon" src="https://www.moi.gov.kw/main/images/assets/cyber-crime/ico-cyber-crime.svg"/>
</a>
<a className="nav-link" href="https://www.moi.gov.kw/main/sections/cyber-crime">
<div className="main-menu-text">إدارة مكافحة<br/>الجرائم الإلكترونية</div>
</a>
</li>
<li className="nav-item m-0">
<a href="https://www.moi.gov.kw/main/sections/juvenile-protection">
<img alt="Juvenile Protection" className="menu-icon" src="https://www.moi.gov.kw/main/images/assets/juvenile-protection/ico-juvenile-protection.svg"/>
</a>
<a className="nav-link" href="https://www.moi.gov.kw/main/sections/juvenile-protection">
<div className="main-menu-text">إدارة حماية الأحداث</div>
</a>
</li>
<li className="nav-item m-0">
<a href="https://www.moi.gov.kw/main/sections/anti-drug">
<img alt="Anti Drug" className="menu-icon" src="https://www.moi.gov.kw/main/images/assets/anti-drug/ico-anti-drug.svg"/>
</a>
<a className="nav-link" href="https://www.moi.gov.kw/main/sections/anti-drug">
<div className="main-menu-text">الإدارة العامة<br/>لمكافحة المخدرات</div>
</a>
</li>
<li className="nav-item m-0">
<a href="https://www.moi.gov.kw/main/sections/anti-human-trafficking">
<img alt="Anti Human Trafficking" className="menu-icon" src="https://www.moi.gov.kw/main/images/assets/cyber-crime/ico-cyber-crime.svg"/>
</a>
<a className="nav-link" href="https://www.moi.gov.kw/main/sections/anti-human-trafficking">
<div className="main-menu-text">إدارة حماية الآداب العامة<br/>ومكافحة الإتجار بالأشخاص</div>
</a>
</li>
<li className="nav-item m-0">
<a href="https://www.moi.gov.kw/main/sections/security-media">
<img alt="Security Media Dept" className="menu-icon" src="https://www.moi.gov.kw/main/images/assets/security-media/ico-security-media.svg"/>
</a>
<a className="nav-link" href="https://www.moi.gov.kw/main/sections/security-media">
<div className="main-menu-text">الإدارة العامة<br/>للعلاقات والإعلام الأمني</div>
</a>
</li>
<li className="nav-item m-0">
<a href="https://eservices2.moi.gov.kw/Correctional-Facilities.nsf/Main?OpenForm&amp;LangID=1">
<img alt="Correctional Facilities" className="menu-icon" src="https://www.moi.gov.kw/main/images/assets/correctional-facilities/icon-correctional-facilities.svg"/>
</a>
<a className="nav-link" href="https://eservices2.moi.gov.kw/Correctional-Facilities.nsf/Main?OpenForm&amp;LangID=1">
<div className="main-menu-text">الإداره العامة<br/>للمؤسسات الإصلاحية</div>
</a>
</li>
<li className="nav-item m-0">
<a href="https://www.moi.gov.kw/main/sections/security-systems">
<img alt="Security Systems" className="menu-icon" src="https://www.moi.gov.kw/main/images/assets/security-systems/ico-security-systems.svg"/>
</a>
<a className="nav-link" href="https://www.moi.gov.kw/main/sections/security-systems">
<div className="main-menu-text">الادارة العامة<br/>للأنظمة الأمنية</div>
</a>
</li>
<li className="nav-item m-0 d-none1">
<a href="https://www.moi.gov.kw/main/sections/national-security">
<img alt="Training" className="menu-icon" src="https://www.moi.gov.kw/main/images/assets/national-security/ico-nat-security.svg"/>
</a>
<a className="nav-link" href="https://www.moi.gov.kw/main/sections/national-security">
<div className="main-menu-text">كلية الأمن الوطني</div>
</a>
</li>
<li className="nav-item m-0">
<a href="https://nat2.moi.gov.kw/GDSRC.nsf">
<img alt="Administrative Affairs Dept." className="menu-icon" src="https://www.moi.gov.kw/main/images/assets/research-studies/ico-research.svg"/>
</a>
<a className="nav-link" href="https://nat2.moi.gov.kw/GDSRC.nsf">
<div className="main-menu-text">الإدارة العامة<br/>لمركز البحوث والدراسات</div>
</a>
</li>
</ul>
</span>
</li>
<li className="nav-item"  >
<div className="dropdown">
<a aria-expanded="false" className="nav-link"   data-toggle="collapse" href="#">
            الإصدارات الإلكترونية
        </a>
<div className="dropdown-menu text-right" style="background: #e9e6de;padding:0px;">
<a className="dropdown-item" href="https://www.moi.gov.kw/main/emagazine">
                المجلة الإلكترونية
            </a>
<a className="dropdown-item" href="https://www.moi.gov.kw/main/news/archive">
                أرشيـف الأخبار
            </a>
</div>
</div>
</li>
<li className="nav-item"  >
<a className="nav-link"   href="https://eservices.moi.gov.kw:45314/verify/qrcode">
        التحقق من الوثائق
    </a>
</li>
<li className="nav-item"  >
<a className="nav-link"   href="https://eservices1.moi.gov.kw/moicus.nsf/moicus?openform&amp;LangID=1">
        يهمنا رايك
    </a>
</li>
<li className="nav-item"   id="navEmergency">
<a className="nav-link"   data-target="#emergencyContactModal" data-toggle="modal" href="#">
        أرقام الطوارئ
    </a>
</li>
<li className="nav-item"   id="navMeta">
<div className="dropdown">
<a aria-expanded="false" className="nav-link"   data-toggle="collapse" href="#">
            منصة المواعيد
        </a>
<div className="dropdown-menu text-right" style="background: #e9e6de;padding:0px;">
<a className="dropdown-item" href="https://meta.e.gov.kw/">
                منصة 'متى'
            </a>
<a className="dropdown-item" href="https://nat2.moi.gov.kw/MOIBioEnrol.nsf/initRequest?OpenForm&amp;LangID=1">
                حجز موعد البصمة البيومترية للخليجيين
            </a>
<a className="dropdown-item" href="https://nat1.moi.gov.kw/MOIeTPAp.nsf/Request?OpenForm&amp;LangID=1">
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
</script></div>
<li className="nav-item mt-0 mb-0 mr-auto"   style="border:0px solid red;float:left;">
<div className="form-group text-center" style="border:0px solid white;height:100%;" title="Request culture provider:">
<form action="/main/Home/SetLanguage?returnUrl=%2Fmain%2Feservices%2Fgdt%2Fviolation-enquiry" className="form-horizontal d-flex" id="selectLanguage" method="post" role="form" style="border:0px solid green;height:100%;">
<div className="col-12 d-flex">
<button className="btn btn-lang align-content-center align-self-center text-center"  >English</button>
<input name="culture" type="hidden" value="en"/>
</div>
<input name="__RequestVerificationToken" type="hidden" value="CfDJ8BC0QUj6RopNjXFvakHlMJtKwYMgPA8aDXWwhQkjqzvJ0LpkK11m_sMMuh39DAqk9-O1lRv4jOSd3TyCsR-yjGmzHLReq0ulOC8r2cDcCoVumMFjivdbOqRD4d4rzZ7sqHQtp4wZ5cD4Tflro67OmaY"/></form>
</div>
</li>
</ul>
</div>
</div>
</nav>
</header>
<div className="container p-0 m-0 content-main">
<div className="rs_skip rsbtn rs_preserve mega_toggle" id="readspeaker_button1"><button aria-controls="readspeaker_button1_toolpanel" aria-expanded="false" aria-label="قائمة webReader" className="rsbtn_tooltoggle"   data-rs-container="readspeaker_button1" data-rs-direction="u" data-rs-tooltip="." data-rsevent-id="rs_956058" data-rslang="title/arialabel:menu" data-rsshortcut="menu" style="display: none;" title="قائمة webReader"><span aria-hidden="true" className="rsicn rsicn-arrow-down"></span></button>
<a aria-haspopup="menu" aria-label="استمع" className="rsbtn_play"   data-rs-direction="u" data-rs-lang="ar_ar" data-rs-tooltip="." data-rs-voice="Amir" data-rsshortcut="play" href="https://app-na.readspeaker.com/cgi-bin/rsent?customerid=56&amp;lang=ar_ar&amp;voice=Amir&amp;readclassName=content-main" rel="nofollow" role="button" title="ReadSpeaker webReader إستمع إلى هذه الصفحةِ مستخدماً">
<span className="rsbtn_left rsimg rspart"><span aria-hidden="true" className="rsbtn_text"><span>استمع </span></span></span>
<span className="rsbtn_right rsimg rsplay rspart"></span>
</a>
</div>
<main className="pb-3" role="main">
<link href="https://cdn.datatables.net/1.10.20/css/dataTables.bootstrap4.min.css" rel="stylesheet"/>
<link href="https://cdn.datatables.net/responsive/2.2.3/css/responsive.dataTables.min.css" rel="stylesheet"/>
<style>
    .page-item.active .page-link{
        background-color:#000576;
        border-color: #000576;
    }
</style>
<div className="row p-0 m-0 content">
<div className="col">
<div className="row text-justify">
<div className="col-sm-4 title">
<a   href="https://www.moi.gov.kw/main/eservices/gdt">
<img className="intro-logo m-1" src="https://www.moi.gov.kw/main/images/assets/general-traffic/logo-general-traffic.svg"/>
                     الإدارة العامة للمرور
                </a>
</div>
<div className="col-sm-8"> </div>
</div>
<div className="row text-center">
<div className="col-sm-12 col-md-4 col-lg-4 side-menu text-right">
<div className="row mt-2">
<div className="col-2 mr-1 ml-1">
<a   href="https://edl.moi.gov.kw/">
<img className="side-menu-icon" src="https://www.moi.gov.kw/main/images/assets/general-traffic/ico-renew-license.svg"/>
</a>
</div>
<div className="col-8 align-self-center">
<a   href="https://edl.moi.gov.kw/">
                    الخدمات الالكترونية لرخص السوق
                </a>
</div>
<div className="col-1"> </div>
</div>
<div className="row mt-2">
<div className="col-2 mr-1 ml-1">
<a   href="https://www.moi.gov.kw/main/eservices/gdt/violation-enquiry">
<img className="side-menu-icon" src="https://www.moi.gov.kw/main/images/assets/common/ico-payment.svg"/>
</a>
</div>
<div className="col-8 align-self-center">
<a   href="https://www.moi.gov.kw/main/eservices/gdt/violation-enquiry">
                    دفع المخالفات
                </a>
</div>
<div className="col-1"> </div>
</div>
<div className="row mt-2">
<div className="col-2 mr-1 ml-1">
<a aria-controls="appointmentsMenu" aria-expanded="false"   data-target="#appointmentsMenu" data-toggle="collapse" href="#appointmentsMenu">
<img className="side-menu-icon" src="https://www.moi.gov.kw/main/images/assets/general-traffic/ico-booking.svg"/>
</a>
</div>
<div className="col-8 align-self-center">
<a aria-controls="appointmentsMenu" aria-expanded="false"   data-target="#appointmentsMenu" data-toggle="collapse" href="#appointmentsMenu">
                    نظام مواعيد اختبار القيادة
                </a>
</div>
<div className="col-1"> </div>
</div>
<div className="collapse" id="appointmentsMenu">
<div className="row mt-2 text-justify">
<div className="col-2">
                     
                </div>
<div className="col-8">
<i className="far fa-circle"></i> خدمة المواعيد متاحة عبر تطبيق سهل
                </div>
<div className="col-2"> </div>
</div>
<div className="row mt-2 text-justify">
<div className="col-2">
                     
                </div>
<div className="col-8">
<a href="https://ttd.moi.gov.kw/">
<i className="far fa-circle"></i> اختبر نفسك
                    </a>
</div>
<div className="col-2"> </div>
</div>
</div>
<div className="row mt-2">
<div className="col-2 mr-1 ml-1">
<a   href="https://www.moi.gov.kw/main/eservices/gdt/services">
<img className="side-menu-icon" src="https://www.moi.gov.kw/main/images/assets/general-traffic/ico-procedures.svg"/>
</a>
</div>
<div className="col-8 align-self-center">
<a   href="https://www.moi.gov.kw/main/eservices/gdt/services">
                     معاملات المرور
                </a>
</div>
</div>
<div className="row mt-2">
<div className="col-2 mr-1 ml-1">
<a aria-controls="sectionsMenu" aria-expanded="false"   data-target="#sectionsMenu" data-toggle="collapse" href="#sectionsMenu">
<img className="side-menu-icon" src="https://www.moi.gov.kw/main/images/assets/general-traffic/ico-locations-sections.svg"/>
</a>
</div>
<div className="col-8 align-self-center">
<a   href="https://www.moi.gov.kw/main/eservices/gdt/locations">
                     مواقع الإدارة العامة للمرور
                </a>
</div>
</div>
<div className="row mt-2">
<div className="col-2 mr-1 ml-1">
<a   href="https://www.moi.gov.kw/main/content/docs/gdt/driving-license-conditions.pdf">
<img className="side-menu-icon" src="https://www.moi.gov.kw/main/images/assets/common/ico-pdf-doc.svg"/>
</a>
</div>
<div className="col-8 align-self-center">
<a   href="https://www.moi.gov.kw/main/content/docs/gdt/driving-license-conditions.pdf">
                شروط منح رخص السوق لغير الكويتيين
            </a>
</div>
</div>
</div>
<div className="col-sm-12 col-md-8 col-lg-8" id="GDTContent">
<div className="row">
<div className="col-3"> </div>
<div className="col-6">
<div className="title">
                            الإدارة العامة للمرور
                        </div>
<div>
<img src="https://www.moi.gov.kw/main/images/assets/common/ico-horizontal-bar.svg"/>
</div>
</div>
<div className="col-3"> </div>
</div>
<div className="row mt-2 pl-4 pr-4 pb-5 text-justify">
<div className="col-12">
<form   id="enquireForm" novalidate="novalidate">
<div className="form-row d1-none">
<div className="col-sm-12 col-md-6">
<label>Enquiry Type</label>
<select className="form-control"   id="enquiryType">
<option selected="" value="1">الأفراد</option>
<option value="2">الشركات</option>
</select>
</div>
</div>
<div className="form-row mt-2">
<div className="col-sm-12 col-md-6">
<label id="lblEnquiryType">الرقم المدني أو الرقم الموحد</label>
<input className="form-control"   id="civilId" maxlength="12" minlength="12" name="civilId"/>
</div>
</div>
<div className="form-row mt-2">
<div className="col-sm-12 col-md-4">
<button className="btn btn-primary btn-block mt-2 mt-md-0"   id="btnEnquire">إستعلم</button>
</div>
</div>
<div className="form-row p-3 mt-3 d-none text-right" id="responseInfo" style="border-bottom:2px solid #d6dce5;">
</div>
<div className="form-row align-self-center mt-2">
<div className="col-12 text-left" id="payingAmount"></div>
</div>
<div className="form-row mt-3">
<div className="col-12 text-right font-weight-bold mb-2">
                                    بعد إجراء عملية الدفع.. يرجى عدم محاولة الدفع مرة أخرى حيث يجرى تحديث البيانات خلال 15 دقيقة
                                </div>
<div className="col-sm-12 col-md-4 text-right">
<input className="btn btn-primary btn-block d-none" disabled="" id="btnPay" type="button" value="إدفع"/>
</div>
<div className="col-sm-12 col-md-6 align-self-center"> </div>
</div>
<div className="form-row mt-3">
<div className="col-12 align-self-center">
<span className="badge badge-success p-2" style="font-weight:normal !important;">قابلة للدفع الكترونياً</span>
<span className="badge badge-danger p-2" style="font-weight:normal !important;">غير قابلة للدفع الكترونياً</span>
</div>
</div>
</form>
</div>
</div>
<div className="d-flex justify-content-center">
<div className="spinner-grow text-secondary d-none" id="workingOnIt" role="status">
<span className="sr-only">Loading...</span>
</div>
</div>
<div className="row mt-2 pl-4 pr-4 pb-5 text-center d-none">
<div className="col-12">
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
<div className="d-none" id="overlay"></div>
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
                            [className="sbEffect1"] {
                                top: calc(100% - 250px);
                            }
                        }*/
        </style>
<!--Slider Bottom Menu for mobile-->
<mqa className="container bottom-slider-sm p-0 m-0 d-md-none d-lg-none d-sm-block"><div className="row p-0 m-0">
<div className="accordion w-100" id="sm-accordion">
<!--TRAFFIC VIOLATION-->
<div className="card slider-card">
<div className="card-header text-center" id="headingOne">
<a aria-controls="collapsePayFines" aria-expanded="true" data-target="#collapsePayFines" data-toggle="collapse" href="#collapsePayFines" role="button">
<svg data-name="Layer 1" height="8.572em" id="Layer_1" viewbox="0 0 103 103" width="8.572em" xmlns="http://www.w3.org/2000/svg">
<title>Payment</title>
<rect className="circle cls-1" height="100" rx="50" width="100" x="1.01" y="1.26"></rect>
<path className="kd cls-2" d="M63.55,70.16l-6.06-7v7H55.27V56.25h2.22v6.06l5.84-6.06h2.75L59.59,62.5l6.73,7.66Z"></path>
<path className="kd cls-2" d="M67.49,70.16v-2.5H69.4v2.5Z"></path>
<path className="kd cls-2" d="M71.42,70.16V56.25h6.32c3.81,0,4.91,1.59,4.91,6.06v1.78c0,4.47-1.1,6.07-4.91,6.07Zm9-8c0-2.89-.46-4.36-2.89-4.36H73.62V68.58h3.94c2.25,0,2.89-1.3,2.89-4.2Z"></path>
<rect className="cls-1" height="46.97" width="71.3" x="15.44" y="27.78"></rect>
<line className="cls-1" x1="22.53" x2="39.12" y1="56.6" y2="56.6"></line>
<line className="cls-1" x1="32.8" x2="38.33" y1="62.13" y2="62.13"></line>
<line className="cls-1" x1="22.53" x2="38.33" y1="67.66" y2="67.66"></line>
<line className="cls-1" x1="15.29" x2="86.4" y1="36.28" y2="36.28"></line>
<line className="cls-1" x1="15.29" x2="86.4" y1="47.83" y2="47.83"></line>
</svg>
</a>
</div>
<div aria-labelledby="headingOne" className="collapse" data-parent="#sm-accordion" id="collapsePayFines">
<div className="card-body article-info text-center">
<h5 className="title">دفع المخالفات والغرامات</h5>
<img src="https://www.moi.gov.kw/main/images/assets/common/ico-horizontal-bar.svg"/>
<form id="MQAFines">
<div className="col-12">
<select className="form-control" id="MQAFinesSelectFineType" name="MQAFinesSelectFineType">
<option value="1">المرور</option>
<option value="2">الإقامة</option>
</select>
</div>
<div className="col-12 mt-1">
<input className="form-control" id="MQAFinesTextCivilId" maxlength="12" name="MQAFinesTextCivilId" pattern="^[0–9]$" placeholder="الرقم المدني" type="tel"/>
</div>
<button className="btn btn-secondary mt-3" id="btnMEnquire">دفع</button>
</form>
</div>
</div>
</div>
<!--APPOINTMENTS
            <div className="card slider-card">
                <div className="card-header text-center" id="headingTwo">
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
    <path className="appt-cls-1" d="M51.5,1.5h0a50,50,0,0,1,50,50h0a50,50,0,0,1-50,50h0a50,50,0,0,1-50-50h0A50,50,0,0,1,51.5,1.5Z" ></path>

    <rect className="appt-cls-2" x="28.77" y="22.27" width="45.47" height="58.46" rx="0.32" ></rect>

    <rect className="appt-cls-2" x="33.64" y="49.88" width="35.72" height="16.24" ></rect>

    <line className="appt-cls-2" x1="69.05" y1="58.5" x2="33.43" y2="58.5" ></line>

    <line className="appt-cls-2" x1="56.37" y1="49.88" x2="56.37" y2="66.11" ></line>

    <line className="appt-cls-2" x1="46.63" y1="49.88" x2="46.63" y2="66.11" ></line>

    <rect className="appt-cls-2" x="59.62" y="30.39" width="3.25" height="6.5" ></rect>

    <rect className="appt-cls-2" x="40.13" y="30.39" width="3.25" height="6.5" ></rect>

    <line className="appt-cls-2" x1="63.07" y1="33.79" x2="74.12" y2="33.79" ></line>

    <line className="appt-cls-2" x1="59.62" y1="33.64" x2="43.38" y2="33.64" ></line>

    <line className="appt-cls-2" x1="40.13" y1="33.64" x2="28.95" y2="33.64" ></line>

    <polygon className="appt-cls-3" points="44.6 57.11 53 63.11 63.8 46.31 60.2 43.91 51.8 55.91 48.2 53.51 44.6 57.11" ></polygon>

    </svg>
                    </a>
                </div>
                <div id="collapseAppointments" className="collapse" aria-labelledby="headingTwo" data-parent="#sm-accordion">
                    <div className="card-body article-info text-center">
                        <div className="col-12 title">منصة المواعيد</div>
                        <div className="col-12">
                            <img src="https://www.moi.gov.kw/main/images/assets/common/ico-horizontal-bar.svg" />
                        </div>
                        <div className="col-12">

                        </div>
                        <div className="col-12">

    <a href="https://nat5.moi.gov.kw/moieap.nsf/request?openform&langid=1" className="btn btn-primary d-none">تبصيم الشركات</a><br/><br/>
                            <a href="https://meta.e.gov.kw/ar/">
                                <img style="width:170px;" src="https://www.moi.gov.kw/main/images/assets/logo-meta-ar.png" />
                            </a>
                        </div>
    </div>
                </div>
            </div>-->
<!--HEALTH CHECK-->
<div className="card slider-card d-none">
<div className="card-header text-center" id="headingFour">
<a aria-controls="collapseHealthCheck" aria-expanded="false" data-target="#collapseHealthCheck" data-toggle="collapse" href="#collapseHealthCheck" role="button">
<img className="moi-ico" src="https://www.moi.gov.kw/main/images/assets/common/ico-health-check-status.svg"/>
</a>
</div>
<div aria-labelledby="headingFour" className="collapse" data-parent="#sm-accordion" id="collapseHealthCheck">
<div className="card-body article-info text-center">
<h5 className="title">جاهزية نتيجة الفحص الطبي</h5>
<img src="https://www.moi.gov.kw/main/images/assets/common/ico-horizontal-bar.svg"/>
<form id="MQAHealthCheck" novalidate="novalidate">
<div className="col-12">
<input className="form-control" id="MQAHealthCheckTextNationalNo" maxlength="12" name="MQAHealthCheckTextNationalNo" placeholder="رقم المرجع"/>
</div>
<div className="col-12">
<button className="btn btn-block btn-secondary mt-3" id="btnMQAHealthCheck">إستعلم</button>
<div className="d-flex justify-content-center">
<div className="spinner-grow text-secondary d-none" id="MQAHCWorkingOnIt" role="status">
<span className="sr-only">Loading...</span>
</div>
</div>
<div className="d-none mt-3" id="MQAHealthReport"></div>
</div>
</form>
</div>
</div>
</div>
<!--CASE FILE CHECK-->
<div className="card slider-card">
<div className="card-header active-acc text-center" id="headingFour">
<a aria-controls="collapseCaseCheck" aria-expanded="false" data-target="#collapseCaseCheck" data-toggle="collapse" href="#collapseCaseCheck" role="button">
<img className="moi-ico" src="https://www.moi.gov.kw/main/images/assets/common/ico-case-track.svg"/>
</a>
</div>
<div aria-labelledby="headingFour" className="collapse" data-parent="#sm-accordion" id="collapseCaseCheck">
<div className="card-body article-info text-center">
<h5 className="title">الاستعلام عن سير القضية</h5>
<img src="https://www.moi.gov.kw/main/images/assets/common/ico-horizontal-bar.svg"/>
<form id="MQACaseCheck" novalidate="novalidate">
<div className="col-12">
<input className="form-control" id="MQACaseCheckTextNationalNo" maxlength="12" name="MQACaseCheckTextNationalNo" placeholder="رقم المرجع"/>
</div>
<div className="col-12">
<button className="btn btn-block btn-secondary mt-3" id="btnMQACaseCheck">إستعلم</button>
<div className="d-flex justify-content-center">
<div className="spinner-grow text-secondary d-none" id="MQACCWorkingOnIt" role="status">
<span className="sr-only">Loading...</span>
</div>
</div>
</div>
</form>
</div>
</div>
</div>
<!--SMS CHANGE COMPANY-->
<div className="card slider-card d-none">
<div className="card-header text-center" id="headingTwo">
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
<path className="circle st0" d="M51.5,1.5L51.5,1.5c27.6,0,50,22.4,50,50l0,0c0,27.6-22.4,50-50,50l0,0c-27.6,0-50-22.4-50-50l0,0  C1.5,23.9,23.9,1.5,51.5,1.5z"></path>
<g className="st1">
<path className="st2" d="M35.2,46.2c0-0.2,0.1-0.5,0.1-0.7c0-1.8-1.5-2-2.9-2c-2.8,0-3.3,0.6-3.3,2.2c0,1,0.3,1.6,1.1,2   c0.8,0.4,1.9,0.4,2.8,0.6c2.8,0.3,5.5,0.7,5.5,4.5c0,3.9-2.9,4.5-6,4.5c-2.7,0-6.2-0.3-6.3-4c0-0.3,0-0.6,0-0.9h2.9   c0,0.2,0,0.4,0,0.6c0,2.1,1.7,2.4,3.4,2.4c1.6,0,3.2-0.1,3.2-2.3c0-2.2-1.4-2.3-3.8-2.6c-3-0.3-5.8-0.8-5.8-4.4   c0-3.2,1.8-4.3,6-4.3c3.4,0,5.8,0.4,5.9,3.6c0,0.3,0,0.7-0.1,0.9H35.2z"></path>
<path className="st2" d="M59.1,56.8V46c0-1.2-0.3-2.2-2.7-2.2c-1.9,0-2.9,0.8-3.2,2.1v10.9h-2.9V46c0-1.3-0.3-2.2-2.7-2.2   c-1.8,0-2.9,0.4-3.3,2.3v10.8h-3.1V41.9h3.1v2c0.8-1.2,2.4-2.3,4.8-2.3c2.7,0,3.7,0.9,4,2.3c1-1.4,2.6-2.3,4.8-2.3   c3.5,0,4.2,1.4,4.2,3.7v11.5H59.1z"></path>
<path className="st2" d="M73.7,46.2c0-0.2,0.1-0.5,0.1-0.7c0-1.8-1.5-2-2.9-2c-2.8,0-3.3,0.6-3.3,2.2c0,1,0.3,1.6,1.1,2   c0.8,0.4,1.9,0.4,2.8,0.6c2.8,0.3,5.5,0.7,5.5,4.5c0,3.9-2.9,4.5-6,4.5c-2.7,0-6.2-0.3-6.3-4c0-0.3,0-0.6,0-0.9h2.9   c0,0.2,0,0.4,0,0.6c0,2.1,1.7,2.4,3.4,2.4c1.6,0,3.2-0.1,3.2-2.3c0-2.2-1.4-2.3-3.8-2.6c-3-0.3-5.8-0.8-5.8-4.4   c0-3.2,1.8-4.3,6-4.3c3.4,0,5.8,0.4,5.9,3.6c0,0.3,0,0.7-0.1,0.9H73.7z"></path>
</g>
<text className="st2" style="font-family:'DDTRg-Regular'; font-size:28px;" transform="matrix(1 0 0 1 -231.0191 -27.0389)">sms</text>
<path className="st3" d="M30.6,82c0,0,0.5-9.4,6.1-12c0.6-0.3,1.2-0.4,1.9-0.4l45.2,0.2V28.4H20.8v41.4h5.4L30.6,82z"></path>
</svg>
</a>
</div>
<div aria-labelledby="headingTwo" className="collapse" data-parent="#sm-accordion" id="collapsePersonalEnquiry">
<div className="card-body article-info text-center">
<div className="col-12 title">تعديل شركة الإتصالات</div>
<div className="col-12">
<img src="https://www.moi.gov.kw/main/images/assets/common/ico-horizontal-bar.svg"/>
</div>
<form asp-action="change" asp-controller="sms" id="MQAChangeCompany">
<div className="row">
<div className="col-12">
<input className="form-control" id="MQATextMobile" maxlength="8" name="MQATextMobile" pattern="^[0–9]$" placeholder="*الموبايل" type="tel"/>
</div>
</div>
<div className="row mt-1">
<div className="col-12">
<input className="form-control" id="MQATextCivilId" maxlength="12" name="MQATextCivilId" pattern="^[0–9]$" placeholder="الرقم المدني" type="tel"/>
</div>
</div>
<div className="row mt-1 no-gutters">
<div className="col-sm-12 col-md-5">
<select className="form-control" id="MQASelectCompany" name="MSelectCompany">
<option value="1">VIVA</option>
<option value="2">OOREDOO</option>
<option value="3">ZAIN</option>
</select>
</div>
<div className="col-sm-12 col-md-7 mt-1">
<input autocomplete="off" className="form-control" id="MQATextActivationCode" maxlength="4" name="MQATextActivationCode" pattern="^[0–9]$" placeholder="*رقم التفعيل" type="password"/>
</div>
</div>
<div className="row mt-1">
<div className="col-12">
<button className="btn btn-block btn-secondary" id="MQABtnChange">تعديل</button>
<div className="d-flex justify-content-center">
<div className="spinner-grow text-secondary d-none" id="MQAWorkingOnIt" role="status">
<span className="sr-only">Loading...</span>
</div>
</div>
</div>
</div>
</form>
</div>
</div>
</div>
<!--GET REFERENCE NUMBER-->
<div className="card slider-card">
<div className="card-header text-center" id="mGetReferenceNumber">
<a aria-controls="collapseGetRefNum" aria-expanded="false" data-target="#collapseGetRefNum" data-toggle="collapse" href="#collapseGetRefNum" role="button">
<img className="moi-ico" id="getRefNumPopMob" src="https://www.moi.gov.kw/main/images/assets/common/ico-get-ref-num.svg"/>
</a>
</div>
<div aria-labelledby="mGetReferenceNumber" className="collapse show" data-parent="#sm-accordion" id="collapseGetRefNum">
<div className="card-body article-info text-center">
<h5 className="title">الإستعلام عن رقم مرجع الداخلية</h5>
<img src="https://www.moi.gov.kw/main/images/assets/common/ico-horizontal-bar.svg"/>
<!--<form id="MQARefNum">
                <div className="col-12">
                    <input className="form-control" id="MQARefNumTextCivilId" name="MQARefNumTextCivilId" maxlength="12" placeholder="الرقم المدني" />
                </div>
                <div className="col-12 mt-1 d-none">
                    <input className="form-control" id="MQARefNumTextPassport" name="MQARefNumTextPassport" maxlength="15" placeholder="رقم جواز السفر" />
                </div>
                <div className="col-12 mt-1 d-none">
                    <input readonly className="form-control" id="MQARefNumTextExpiryDate" name="MQARefNumTextExpiryDate" maxlength="10" placeholder="تاريخ الانتهاء جواز السفر" />
                </div>
                <div className="col-12 d-none">
                    <button className="btn btn-block btn-secondary mt-2" id="btnMGetRefNum">استعلم</button>-->
<!--<div className="d-flex justify-content-center">
                    <div className="spinner-grow text-secondary d-none" role="status" id="MQARNWorkingOnIt">
                        <span className="sr-only">Loading...</span>
                    </div>
                </div>-->
<!--</div>
                    <div className="col-12">
                        <button type="button" className="btn btn-block btn-secondary mt-2" id="btnMGetRefNumKwti">Kuwaiti</button>
                    </div>
                    <div className="col-12">
                        <button type="button" className="btn btn-block btn-secondary mt-2" id="btnMGetRefNumOther">Non-Kuwaiti</button>
                    </div>
                </form>
                <div className="col-12 d-none" id="MQANatNumResultContainer">
                    <div className="row">
                        <div className="col-12" id="MQANatNumResult"></div>
                        <div className="col-12">
                            <button type="button" className="btn btn-block btn-secondary mt-2" id="btnMGetRefNumDone">إغلاق</button>
                        </div>
                    </div>
                </div>-->
<div className="col-12">
<input className="form-control" id="MQARefNumTextCivilId" maxlength="12" name="MQARefNumTextCivilId" placeholder="الرقم المدني"/>
</div>
<div className="col-12">
<button className="btn btn-block btn-secondary mt-2" id="btnMGetRefNumKwti" type="button">للكويتين</button>
</div>
<div className="col-12">
<button className="btn btn-block btn-secondary mt-2" id="btnMGetRefNumOther" type="button">للمقيمين</button>
</div>
</div>
</div>
</div>
<!--NEW SERVICES-->
<div className="card slider-card">
<div className="card-header text-center" id="headingFour">
<a data-target="#newServicesModal" data-toggle="modal">
<img className="card-img-top center-block moi-ico mx-auto" id="newServicesPopMob" src="https://www.moi.gov.kw/main/images/assets/common/ico-new-services.svg"/>
</a>
</div>
</div>
</div>
</div>
<script type="text/javascript">
    var yearMDropDownNat;
    var yearMDropDownPP;
</script>
<script src="https://www.moi.gov.kw/main/lib/flatpickr/plugins/year-dropdown.js" type="module"></script>
<script type="module">
    import yearDropdownPlugin from '/main/lib/flatpickr/plugins/year-dropdown.js';
    var todayMDt = new Date();
    yearMDropDownNat = new yearDropdownPlugin(
        {
            date: todayMDt.getDate + "/" + todayMDt.getMonth() + "/" + todayMDt.getFullYear(),
            yearStart: 80,//todayDt.setFullYear(todayDt.getFullYear() - 90),
            yearEnd: 0//todayDt.getFullYear()
        }
    );

    yearMDropDownPP = new yearDropdownPlugin(
        {
            date: todayMDt.getDate + "/" + todayMDt.getMonth() + "/" + todayMDt.getFullYear(),
            yearStart: 0,//todayDt.setFullYear(todayDt.getFullYear() - 90),
            yearEnd: 10//todayDt.getFullYear()
        }
    );
</script>
<script type="text/javascript">
    $(document).ready(function () {
        setMQATrafficFineForm();
        setMQASMSChangeCompanyForm();
        //setMQAAppointmentsForm();
        //setMQAReferenceNumberForm();
        setMQAReferenceNumberLinks();
        setMQAHealthCheckForm();
        setMQACaseCheckForm();
        $('.collapse').on('shown.bs.collapse', function () {
            $(this).prev().addClass('active-acc');
        });

        $('.collapse').on('hidden.bs.collapse', function () {
            $(this).prev().removeClass('active-acc');
        });
    });


    /************TRAFFIC FINE SCRIPTS********************************/
    setMQATrafficFineForm = () => {
        $('#btnMEnquire').on('click', function (event) {
            //alert('hi')
            $('#MQAFines').validate({
                rules: {
                    MQAFinesTextCivilId: {
                        required: true,
                        //digits: true,
                        regex: /^[0-9\u0660-\u0669]+$/,
                        minlength: 8
                    }
                },
                messages: {
                    MQAFinesTextCivilId: {
                        required: 'حقل مطلوب',
                        minlength: 'يرجى إدخال رقم صحيح',
                        regex: 'يرجى إدخال رقم صحيح',
                    }
                },
                submitHandler: function (form, event) {
                    $('#btnMEnquire').attr("disabled", true);
                    event.preventDefault();
                    if ($('#MQAFinesSelectFineType').val() == "1") {
                        //window.location.href = "https://portal.acs.moi.gov.kw/wps/portal/violations?systemSelection=1&numberType=1&numberValue=" + $("#MQAFinesTextCivilId").val() + "&carNumberGoverCode=&licneseType=3&purpose=0&violYear=0&violGover=0&secondPartOfnewcarno=0&embassyTextField=0&QuickAccess='GO'"
                        window.location.href = serverUrl + "/main/eservices/gdt/violation-enquiry?civilId=" + $("#MQAFinesTextCivilId").val();
                    }
                    else {
                        //window.location.href = "http://10.11.77.82:10038/wps/portal/violations?systemSelection=2&violOptionNumber=2&numberValue=" + $("#MQAFinesTextCivilId").val() + "&QuickAccess='GO'"
                        //window.location.href = "http://portal.acs.moi.gov.kw/wps/portal/violations?systemSelection=2&violOptionNumber=2&numberValue=" + $("#MQAFinesTextCivilId").val() + "&QuickAccess='GO'";
                        window.location.href = serverUrl + "/main/eservices/residence/fines-enquiry?civilId=" + $("#MQAFinesTextCivilId").val();
                    }
                    return;
                }
            })

        });
    };
    /**********************************************************************/

    /**************SMS SUBSCRIPTION CHANGE COMPANY SCRIPTS************/

    setMQASMSChangeCompanyForm = () => {
        $('#MQABtnChange').on('click', function (event) {
            //event.preventDefault();
            $('#MQAChangeCompany').validate({
                rules: {
                    MQATextMobile: {
                        required: true,
                        digits: true,
                        minlength: 8
                    },
                    MQATextCivilId: {
                        required: true,
                        digits: true,
                        minlength: 12
                    },
                    MQATextActivationCode: {
                        required: true,
                        digits: true,
                        minlength: 4
                    }
                },
                messages: {
                    MQATextMobile: {
                        required: 'حقل مطلوب',
                        minlength: 'يرجى إدخال رقم صحيح',
                        digits: 'يرجى إدخال رقم صحيح',
                    },
                    MQATextCivilId: {
                        required: 'حقل مطلوب',
                        minlength: 'يرجى إدخال رقم صحيح',
                        digits: 'يرجى إدخال رقم صحيح',
                    },
                    MQATextActivationCode: {
                        required: 'حقل مطلوب',
                        minlength: 'يرجى إدخال رقم صحيح',
                        digits: 'يرجى إدخال رقم صحيح',
                    }
                },
                submitHandler: function (form, event) {
                    $('#MQABtnChange').attr("disabled", true);
                    $('#MQAWorkingOnIt').addClass('d-block');
                    event.preventDefault();
                    grecaptcha.ready(function () {
                        grecaptcha.execute('6LdUyqwUAAAAAM5MRMXHrlAjDCrWT5CcRpdXgK2p', { action: 'sms/register' }).then(function (token) {



                            var formData = $("#MQAChangeCompany").serializeArray();
                            //console.log(formData);
                            formData.push({ name: "g-recaptcha-token", value: token });
                            formData.push({ name: "Mobile", value: $("#MQATextMobile").val() });
                            formData.push({ name: "CivilId", value: $("#MQATextCivilId").val() });
                            formData.push({ name: "Company", value: $("#MQASelectCompany option:selected").val() });
                            formData.push({ name: "ActivationCode", value: $("#MQATextActivationCode").val() });
                            //submit via ajax
                            $.ajax({
                                url: serverUrl + '/main/eservices/sms/change-company',
                                type: 'POST',
                                data: formData,
                                contentType: 'application/x-www-form-urlencoded; charset=utf-8',
                                success: function (data) {
                                    //console.log(data);
                                    $('#QAResponse').removeClass('text-center').removeClass('text-danger');
                                    $('#infoModalTitle').html('تعديل شركة الإتصالات');
                                    $('#QAResponse').html(data.value.info);
                                    $('#MQAWorkingOnIt').removeClass('d-block');
                                    $('#infoModal').modal('toggle');
                                    $('#MQABtnChange').removeAttr("disabled");
                                },
                                error: function (jqXHR, textStatus, errorThrown) {
                                    console.log('failed');
                                    console.log(jqXHR);
                                    var resp = $.parseJSON(jqXHR.responseText);
                                    $('#infoModalTitle').html('تعديل شركة الإتصالات');
                                    $('#QAResponse').addClass('text-center').addClass('text-danger');
                                    $('#QAResponse').html(resp.errorMessage);
                                    $('#MQAWorkingOnIt').removeClass('d-block');
                                    $('#infoModal').modal('toggle');
                                    $('#MQABtnChange').removeAttr("disabled");
                                }
                            });
                        });
                    });
                }
            });
        });
    };

    /************************************************************** */


    /************GET REFERENCE NUMBER SCRIPTS***********************************/

    function setMQAReferenceNumberForm2() {
        var today = new Date();
        config = { minDate: today, dateFormat: "Y-m-d", locale: "ar", disableMobile: true };
        $("#MQARefNumTextExpiryDate").flatpickr(config);
        if (location.href.indexOf('get-reference-number') > 0) {
            $("#txtExpiryDate").flatpickr(config);
        }
        $("#btnMGetRefNum").click(function () {
            $('#MQARefNum').validate({
                rules: {
                    MQARefNumTextCivilId: {
                        required: true,
                        digits: true,
                        minlength: 12
                    },
                    MQARefNumTextPassport: {
                        required: true,
                        minlength: 3
                    },
                    MQARefNumTextExpiryDate: {
                        required: true,
                        minlength: 10
                    }
                },
                messages: {
                    MQARefNumTextCivilId: {
                        required: 'حقل مطلوب',
                        minlength: 'يرجى إدخال رقم صحيح',
                        digits: 'يرجى إدخال رقم صحيح',
                    },
                    MQARefNumTextPassport: {
                        required: 'حقل مطلوب',
                        minlength: 'يرجى إدخال رقم صحيح',
                    },
                    MQARefNumTextExpiryDate: {
                        required: 'حقل مطلوب',
                        minlength: 'يرجى إدخال رقم صحيح',
                    }
                },
                submitHandler: function (form, event) {
                    $("#MQARNWorkingOnIt").removeClass('d-none');
                    $("#MQANatNumResult").html('');
                    $('#btnMGetRefNum').attr("disabled", true);
                    event.preventDefault();
                    QAGetNationalNumber($('#MQARefNumTextCivilId').val(),
                        $('#MQARefNumTextPassport').val(),
                        $('#MQARefNumTextExpiryDate').val());
                    return;
                }
            })


        });

        $("#btnMGetRefNumDone").click(function () {
            $('#MQANatNumResult').html('');
            $('#MQANatNumResultContainer').addClass("d-none");
            $('#MQARefNum').removeClass("d-none");
        });
    }

    function setMQAReferenceNumberLinks() {
        let refUrl = "/main/eservices/get-reference-number";
        $("#btnMGetRefNumKwti").click(() => {
            location.href = refUrl + "?civilId=" + $("#MQARefNumTextCivilId").val().trim() + "&enquiryFor=kuwaiti"
        });
        $("#btnMGetRefNumOther").click(() => {
            location.href = refUrl + "?civilId=" + $("#MQARefNumTextCivilId").val().trim() + "&enquiryFor=non-kuwaiti"
        });
        var today = new Date();
        config = {
            plugins: [yearMDropDownPP],
            minDate: today,
            dateFormat: "Y-m-d",
            locale: "ar",
            disableMobile: true
        };
        natIssueConfig = {
            plugins: [yearMDropDownNat],
            //defaultDate: today.setFullYear(today.getFullYear() - 35),
            minDate: today.setFullYear(today.getFullYear() - 90),
            maxDate: "today",
            dateFormat: "Y-m-d",
            locale: "ar",
            disableMobile: true
        };
        if (location.href.indexOf('get-reference-number') > 0) {
            $("#txtExpiryDate").flatpickr(config);
            $("#txtNatIssueDate").flatpickr(natIssueConfig);
        }
    }

    /************************************************************** */


    function setMQAAppointmentsForm() {

        $('#MQAApptsSelectDept').on('change', function () {
            var urlToGo = ".moi.gov.kw/moieap.nsf/request?"
                + "openform&langid=1&sec="
                + $('#MQAApptsSelectDept').val();
            switch ($('#MQAApptsSelectDept').val()) {
                case "AA":
                case "FA":
                case "HA":
                case "J":
                case "W":
                case "M":
                    location.href = \`https://nat1\${urlToGo}\`;
                    break;
                case "T":
                    location.href = \`https://nat2\${urlToGo}\`;
                    break;
                case "E2":
                    location.href = \`https://nat3\${urlToGo}\`;
                    break;
                case "E":
                case "N":
                case "X":
                    location.href = \`https://nat5\${urlToGo}\`;
                    break;
                case "S":
                case "I":
                    location.href = \`https://nat4\${urlToGo}\`;
                    break;
                case "R":
                case "F":
                    location.href = \`https://eservices7\${urlToGo}\`;
                    break;
                case "B":
                    location.href = \`https://eservices3\${urlToGo}\`;
                    break;
                case "VI":
                    location.href = "https://eservices2.moi.gov.kw/GDTVehIns.nsf";
                    break;
            }
            //if ($('#QAApptsSelectDept').val() == "B") {
            //    location.href = \`https://eservices3.\${urlToGo}\`;
            //}
            //else {
            //    location.href = \`https://eservices7.\${urlToGo}\`;
            //}
        });

        //$('#QAApptsBtnBook').click(function () {
        //    //alert($('#QAApptsSelectDept').val());
        //    var urlToGo = "moi.gov.kw/moieap.nsf/request?"
        //        + "openform&langid=1&sec="
        //        + $('#QAApptsSelectDept').val();
        //    //switch ($('#QAApptsSelectDept').val()) {
        //    //    case "N":
        //    //    case "T":
        //    //        urlToGo = \`https://eservices7.\${urlToGo}\`;
        //    //        break;
        //    //    case "M":
        //    //    case "F":
        //    //        urlToGo = \`https://eservices3.\${urlToGo}\`;
        //    //        break;
        //    //}
        //    location.href = \`https://eservices7.\${urlToGo}\`;
        //});
    }
    /*****************************************************************************/

    function setMQAHealthCheckForm() {
        $('#MQAHealthCheck').validate({
            rules: {
                MQAHealthCheckTextNationalNo: {
                    required: true,
                    digits: true,
                    minlength: 9
                },
            },
            messages: {
                MQAHealthCheckTextNationalNo: {
                    required: 'Required',
                    minlength: 'Enter Valid Number',
                    digits: 'Enter Valid Number',
                }
            },
            submitHandler: function (form, event) {
                $('#btnMQAHealthCheck').attr("disabled", true);
                $('#MQAHCWorkingOnIt').removeClass('d-none');
                event.preventDefault();
                $.ajax({
                    //url: 'https://localhost:44322/mfservices/health/get-result/' + $("#MQAHealthCheckTextNationalNo").val(),
                    url: 'https://www.moi.gov.kw/mfservices/health/get-result/' + $("#QAHealthCheckTextNationalNo").val(),
                    type: 'GET',
                    contentType: 'application/json;charset=utf-8',
                    success: function (data) {
                        console.log(data);
                        $('#btnMQAHealthCheck').attr("disabled", false);
                        showMQAHealthCheckResult(data);
                        $("#MQAHCWorkingOnIt").addClass('d-none');
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        $("#MQAHCWorkingOnIt").addClass('d-none');
                        console.log(jqXHR);
                        $('#btnMQAHealthCheck').attr("disabled", false);
                        //var resp = $.parseJSON(jqXHR.responseText);
                        //console.log(resp.errorMessage);
                        $("#MQAHealthReport").html('Unexpected error.Please try later');
                        $("#MQAHealthReport").removeClass('d-none');

                    }
                });
            }
        });
    }

    showMQAHealthCheckResult = (result) => {
        var report;
        switch (result.statusCode) {
            case 0:
                //console.log(result.statusMessage);
                report = 'نتيجه الفحص الطبي لائق';
                break;
            case 1:
                //console.log(result.statusMessage);
                report = 'نتيجة الكشف الطبي غير لائق';
                break;
            case 2:
                //console.log(result.statusMessage);
                report = 'نتيجه الفحص الطبي لائق موقتاً';
                break;
            case 3:
                //console.log(result.statusMessage);
                report = 'يرجى إعاده الفحص الطبي';
                break;
            case 4:
                //console.log(result.statusMessage);
                report = 'معفي من إجراء الفحص الطبي';
                break;
            case 5:
                //console.log(result.statusMessage);
                report = 'لا يوجد كشف طبي لإظهار نتيجه الفحص';
                break;
            case 6:
                //console.log(result.statusMessage);
                report = 'الرقم المدخل غير صحيح';
                break;
            default:
                console.log(result.statusMessage);
                report = "Unknown error";
                break;
        }

        var resultDisplay = "<table className='table table-striped'>"
            + " <tr>"   //<td>Status</td>
            + " <td>" + report + "</td></tr>"
            + "</table >";
        $("#MQAHealthReport").html(resultDisplay);
        $("#MQAHealthReport").removeClass('d-none');
    };

    function setMQACaseCheckForm() {
        $('#MQACaseCheck').validate({
            rules: {
                MQACaseCheckTextNationalNo: {
                    required: true,
                    digits: true,
                    minlength: 9
                },
            },
            messages: {
                MQACaseCheckTextNationalNo: {
                    required: 'حقل مطلوب',
                    minlength: 'يرجى إدخال رقم صحيح',
                    regex: 'يرجى إدخال رقم صحيح',
                }
            },
            submitHandler: function (form, event) {
                $('#btnMQACaseCheck').attr("disabled", true);
                $('#MQACCWorkingOnIt').removeClass('d-none');
                event.preventDefault();
                window.location.href = serverUrl + "/main/eservices/investigations/case-enquiry?nationalNo=" + $("#MQACaseCheckTextNationalNo").val();
            }
        });
    }

</script></mqa>
<div className="container p-0 m-0" id="dqaContainer">
<!--Slider Bottom Menu for desktop-->
<dqa className="container p-0 m-0 d-none d-md-block bottom-slider"><link href="https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css" rel="stylesheet"/>
<link href="https://npmcdn.com/flatpickr/dist/themes/dark.css" rel="stylesheet" type="text/css"/>
<link href="https://www.moi.gov.kw/main/lib/flatpickr/plugins/year-dropdown.css" rel="stylesheet" type="text/css"/>
<div className="row p-0 m-0" style="height:221px;">
<!--TRAFFIC VIOLATION-->
<div style="height:100%;">
<a className="acc-header">
<label className="footer-icon" style="width: 200px; float: right;">
<svg data-name="Layer 1" height="8.572em" id="Layer_1" viewbox="0 0 103 103" width="8.572em" xmlns="http://www.w3.org/2000/svg">
<title>Payment</title>
<rect className="circle cls-1" height="100" rx="50" width="100" x="1.01" y="1.26"></rect>
<path className="kd cls-2" d="M63.55,70.16l-6.06-7v7H55.27V56.25h2.22v6.06l5.84-6.06h2.75L59.59,62.5l6.73,7.66Z"></path>
<path className="kd cls-2" d="M67.49,70.16v-2.5H69.4v2.5Z"></path>
<path className="kd cls-2" d="M71.42,70.16V56.25h6.32c3.81,0,4.91,1.59,4.91,6.06v1.78c0,4.47-1.1,6.07-4.91,6.07Zm9-8c0-2.89-.46-4.36-2.89-4.36H73.62V68.58h3.94c2.25,0,2.89-1.3,2.89-4.2Z"></path>
<rect className="cls-1" height="46.97" width="71.3" x="15.44" y="27.78"></rect>
<line className="cls-1" x1="22.53" x2="39.12" y1="56.6" y2="56.6"></line>
<line className="cls-1" x1="32.8" x2="38.33" y1="62.13" y2="62.13"></line>
<line className="cls-1" x1="22.53" x2="38.33" y1="67.66" y2="67.66"></line>
<line className="cls-1" x1="15.29" x2="86.4" y1="36.28" y2="36.28"></line>
<line className="cls-1" x1="15.29" x2="86.4" y1="47.83" y2="47.83"></line>
</svg>
</label>
</a>
<div className="article">
<div className="article-info">
<div className="row text-center">
<div className="col-12 title">دفع المخالفات والغرامات</div>
<div className="col-12">
<img src="https://www.moi.gov.kw/main/images/assets/common/ico-horizontal-bar.svg"/>
</div>
<form id="QAFines">
<div className="col-12">
<select className="form-control"   id="QAFinesSelectFineType" name="QAFinesSelectFineType">
<option value="1">المرور</option>
<option value="2">الإقامة</option>
</select>
</div>
<div className="col-12 mt-1">
<input className="form-control"   id="QAFinesTextCivilId" maxlength="12" name="QAFinesTextCivilId" placeholder="الرقم المدني"/>
</div>
<div className="col-12">
<button className="btn btn-block btn-secondary mt-3"   id="QABtnEnquireFines">دفع</button>
</div>
</form>
</div>
</div>
</div>
</div>
<!--APPOINTMENTS-->
<div className="d-none">
<a className="acc-header">
<label className="footer-icon" style="width: 200px; float: right;">
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
<path className="appt-cls-1" d="M51.5,1.5h0a50,50,0,0,1,50,50h0a50,50,0,0,1-50,50h0a50,50,0,0,1-50-50h0A50,50,0,0,1,51.5,1.5Z"></path>
<rect className="appt-cls-2" height="58.46" rx="0.32" width="45.47" x="28.77" y="22.27"></rect>
<rect className="appt-cls-2" height="16.24" width="35.72" x="33.64" y="49.88"></rect>
<line className="appt-cls-2" x1="69.05" x2="33.43" y1="58.5" y2="58.5"></line>
<line className="appt-cls-2" x1="56.37" x2="56.37" y1="49.88" y2="66.11"></line>
<line className="appt-cls-2" x1="46.63" x2="46.63" y1="49.88" y2="66.11"></line>
<rect className="appt-cls-2" height="6.5" width="3.25" x="59.62" y="30.39"></rect>
<rect className="appt-cls-2" height="6.5" width="3.25" x="40.13" y="30.39"></rect>
<line className="appt-cls-2" x1="63.07" x2="74.12" y1="33.79" y2="33.79"></line>
<line className="appt-cls-2" x1="59.62" x2="43.38" y1="33.64" y2="33.64"></line>
<line className="appt-cls-2" x1="40.13" x2="28.95" y1="33.64" y2="33.64"></line>
<polygon className="appt-cls-3" points="44.6 57.11 53 63.11 63.8 46.31 60.2 43.91 51.8 55.91 48.2 53.51 44.6 57.11"></polygon>
</svg>
</label>
</a>
<div className="article">
<div className="article-info">
<div className="row text-center">
<div className="col-12 title">
                        منصة المواعيد
                    </div>
<div className="col-12">
<img src="https://www.moi.gov.kw/main/images/assets/common/ico-horizontal-bar.svg"/>
</div>
<!--<form id="QAAppointmentStatus">-->
<div className="col-12 mt-2">
<!--<a href="https://eservices3.moi.gov.kw/MOIeAp.nsf/Requeststatus?openform&langid=1" className="btn btn-block btn-secondary mt-2">إستعلام عن حالة تصريح السفر</a>-->
<!--<button className="btn btn-block btn-secondary" id="QAApptsBtnBook">إستكمال الحجز</button>
                        <a href="https://www.moi.gov.kw/main/eservices/residence/illegals-appointments" className="btn btn-block btn-secondary mt-2">تعديل أوضاع مخالفي
                        <br />
                        قانون إقامة الأجانب
                        </a>-->
</div>
<div className="col-12">
<!--<select id="QAApptsSelectDept" className="form-control mt-3">
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
<a className="btn btn-primary d-none" href="https://nat5.moi.gov.kw/moieap.nsf/request?openform&amp;langid=1">تبصيم الشركات</a><br/><br/>
<a href="https://meta.e.gov.kw/ar/">
<img src="https://www.moi.gov.kw/main/images/assets/logo-meta-ar.png" style="width:170px;"/>
</a>
</div>
<!--<div className="col-12">
                        <a href="https://eservices3.moi.gov.kw/MOIeAp.nsf/Request?OpenForm&LangID=1" className="btn btn-block btn-secondary mt-2">إستكمال الحجز </a>
                    </div>

                    <!--</form>-->
</div>
</div>
</div>
</div>
<!--CHANGE OPERATOR-->
<div className="d-none" style="height:221px;">
<a className="acc-header">
<label className="footer-icon" style="width: 200px; float: right;">
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
<path className="circle st0" d="M51.5,1.5L51.5,1.5c27.6,0,50,22.4,50,50l0,0c0,27.6-22.4,50-50,50l0,0c-27.6,0-50-22.4-50-50l0,0  C1.5,23.9,23.9,1.5,51.5,1.5z"></path>
<g className="st1">
<path className="st2" d="M35.2,46.2c0-0.2,0.1-0.5,0.1-0.7c0-1.8-1.5-2-2.9-2c-2.8,0-3.3,0.6-3.3,2.2c0,1,0.3,1.6,1.1,2   c0.8,0.4,1.9,0.4,2.8,0.6c2.8,0.3,5.5,0.7,5.5,4.5c0,3.9-2.9,4.5-6,4.5c-2.7,0-6.2-0.3-6.3-4c0-0.3,0-0.6,0-0.9h2.9   c0,0.2,0,0.4,0,0.6c0,2.1,1.7,2.4,3.4,2.4c1.6,0,3.2-0.1,3.2-2.3c0-2.2-1.4-2.3-3.8-2.6c-3-0.3-5.8-0.8-5.8-4.4   c0-3.2,1.8-4.3,6-4.3c3.4,0,5.8,0.4,5.9,3.6c0,0.3,0,0.7-0.1,0.9H35.2z"></path>
<path className="st2" d="M59.1,56.8V46c0-1.2-0.3-2.2-2.7-2.2c-1.9,0-2.9,0.8-3.2,2.1v10.9h-2.9V46c0-1.3-0.3-2.2-2.7-2.2   c-1.8,0-2.9,0.4-3.3,2.3v10.8h-3.1V41.9h3.1v2c0.8-1.2,2.4-2.3,4.8-2.3c2.7,0,3.7,0.9,4,2.3c1-1.4,2.6-2.3,4.8-2.3   c3.5,0,4.2,1.4,4.2,3.7v11.5H59.1z"></path>
<path className="st2" d="M73.7,46.2c0-0.2,0.1-0.5,0.1-0.7c0-1.8-1.5-2-2.9-2c-2.8,0-3.3,0.6-3.3,2.2c0,1,0.3,1.6,1.1,2   c0.8,0.4,1.9,0.4,2.8,0.6c2.8,0.3,5.5,0.7,5.5,4.5c0,3.9-2.9,4.5-6,4.5c-2.7,0-6.2-0.3-6.3-4c0-0.3,0-0.6,0-0.9h2.9   c0,0.2,0,0.4,0,0.6c0,2.1,1.7,2.4,3.4,2.4c1.6,0,3.2-0.1,3.2-2.3c0-2.2-1.4-2.3-3.8-2.6c-3-0.3-5.8-0.8-5.8-4.4   c0-3.2,1.8-4.3,6-4.3c3.4,0,5.8,0.4,5.9,3.6c0,0.3,0,0.7-0.1,0.9H73.7z"></path>
</g>
<text className="st2" style="font-family:'DDTRg-Regular'; font-size:28px;" transform="matrix(1 0 0 1 -231.0191 -27.0389)">sms</text>
<path className="st3" d="M30.6,82c0,0,0.5-9.4,6.1-12c0.6-0.3,1.2-0.4,1.9-0.4l45.2,0.2V28.4H20.8v41.4h5.4L30.6,82z"></path>
</svg>
</label>
</a>
<div className="article">
<div className="article-info">
<div className="row text-center">
<div className="col-12 title">تعديل شركة الإتصالات</div>
<div className="col-12">
<img src="https://www.moi.gov.kw/main/images/assets/common/ico-horizontal-bar.svg"/>
</div>
<div className="col-12">
<form asp-action="change" asp-controller="sms" id="QAChangeCompany">
<div className="row">
<div className="col-12">
<input className="form-control" id="QATextMobile" maxlength="8" name="QATextMobile" placeholder="*الموبايل" type="tel"/>
</div>
</div>
<div className="row mt-1">
<div className="col-12">
<input className="form-control" id="QATextCivilId" maxlength="12" name="QATextCivilId" placeholder="*الرقم المدني"/>
</div>
</div>
<div className="row mt-1 no-gutters">
<div className="col-sm-12 col-md-5">
<select className="form-control" id="QASelectCompany" name="QASelectCompany">
<option value="1">VIVA</option>
<option value="2">OOREDOO</option>
<option value="3">ZAIN</option>
</select>
</div>
<div className="col-sm-12 col-md-7">
<input autocomplete="off" className="form-control" id="QATextActivationCode" maxlength="4" name="QATextActivationCode" placeholder="*رقم التفعيل" type="password"/>
</div>
</div>
<div className="row mt-1">
<div className="col-12">
<button className="btn btn-block btn-secondary" id="QABtnChange">تعديل</button>
<div className="d-flex justify-content-center">
<div className="spinner-grow text-secondary d-none" id="QAWorkingOnIt" role="status">
<span className="sr-only">Loading...</span>
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
<div className="d-none">
<a className="acc-header">
<label className="footer-icon" style="width: 200px; float: right;">
<svg data-name="Layer 1" height="8.572em" viewbox="0 0 103 103" width="8.572em" xmlns="http://www.w3.org/2000/svg">
<title>KCG-service</title>
<rect className="circle cls-1" height="100" rx="50" width="100" x="1.21" y="0.82"></rect>
<path className="cls-1" d="M64.34,30.56A4.71,4.71,0,0,0,59.49,26a4.56,4.56,0,0,0-4.67,4.61,4.76,4.76,0,0,0,9.52,0Z"></path>
<line className="cls-1" x1="66.35" x2="52.51" y1="43.39" y2="43.39"></line>
<path className="cls-1" d="M72.12,61.7l6.66-4.36a.36.36,0,0,1,.51,0L86,61.7"></path>
<path className="cls-1" d="M79,57.08s2.31,20.76-19.6,20.47l.2-42.22"></path>
<path className="cls-1" d="M46.75,61.7l-6.66-4.36a.36.36,0,0,0-.51,0L32.91,61.7"></path>
<path className="cls-1" d="M39.83,57.08s-2.3,20.76,19.6,20.47l.2-42.22"></path>
<path className="cls-1" d="M59.93,25.84a1.73,1.73,0,0,0-1.72-1.72l-40,0a1.73,1.73,0,0,0-1.72,1.72l0,49.93a1.73,1.73,0,0,0,1.72,1.73l41.44,0"></path>
<line className="cls-1" x1="23.05" x2="28.84" y1="32.53" y2="32.53"></line>
<line className="cls-1" x1="23.05" x2="42.53" y1="37.27" y2="37.27"></line>
<line className="cls-1" x1="23.05" x2="39.37" y1="41.48" y2="41.48"></line>
<line className="cls-1" x1="23.05" x2="47.11" y1="45.7" y2="45.7"></line>
</svg>
</label>
</a>
<div className="article">
<div className="article-info">
<div className="row text-center">
<div className="col-12 title">Ensure Safety at Sea</div>
<div className="col-12">
<img src="https://www.moi.gov.kw/main/images/assets/common/ico-horizontal-bar.svg"/>
</div>
<div className="col-12 text-justify">
                        For your safety, please inform the General Directorate of Coast Guard by filling the Sailing Plan form
                    </div>
<div className="col-12">
<a "2"="" )"="" 1"="" :="" className="btn btn-secondary mt-3" href="https://eservices1.moi.gov.kw/coast-guard.nsf/boat-float-plan?openform&amp;langid=@(System.Threading.Thread.CurrentThread.CurrentCulture.TextInfo.IsRightToLeft ? ">Sail Plan</a>
</div>
</div>
</div>
</div>
</div>
<!--GET REFERENCE NUMBER-->
<div>
<a className="acc-header active">
<label className="footer-icon" style="width: 200px; float: right;">
<img className="moi-ico" id="getRefNumPop" src="https://www.moi.gov.kw/main/images/assets/common/ico-get-ref-num.svg"/>
</label>
</a>
<div className="article">
<div className="article-info">
<div className="row text-center">
<div className="col-12 title">الإستعلام عن رقم مرجع الداخلية</div>
<div className="col-12">
<img src="https://www.moi.gov.kw/main/images/assets/common/ico-horizontal-bar.svg"/>
</div>
<div className="col-12">
<input className="form-control"   id="QARefNumTextCivilId" maxlength="12" name="QARefNumTextCivilId" placeholder="الرقم المدني"/>
</div>
<div className="col-12">
<button className="btn btn-block btn-secondary mt-2"   id="btnGetRefNumKwti" type="button">للكويتين</button>
</div>
<div className="col-12">
<button className="btn btn-block btn-secondary mt-2"   id="btnGetRefNumOther" type="button">للمقيمين</button>
</div>
<!--<form id="QARefNum">
                        <div className="col-12">
                            <input className="form-control" id="QARefNumTextCivilId" name="QARefNumTextCivilId" maxlength="12" placeholder="الرقم المدني" />
                        </div>
                        <div className="col-12 mt-1">
                            <input className="form-control" id="QARefNumTextPassport" name="QARefNumTextPassport" maxlength="15" placeholder="رقم جواز السفر" />
                        </div>
                        <div className="col-12 mt-1">
                            <input readonly className="form-control" id="QARefNumTextExpiryDate" name="QARefNumTextExpiryDate" maxlength="10" placeholder="تاريخ الانتهاء جواز السفر" />
                        </div>
                        <div className="col-12">
                            <button className="btn btn-block btn-secondary mt-2" id="btnGetRefNum">استعلم</button>
                            <div className="d-flex justify-content-center">
                                <div className="spinner-grow text-secondary d-none" role="status" id="QARNWorkingOnIt">
                                    <span className="sr-only">Loading...</span>
                                </div>
                            </div>
                        </div>
                    </form>
                    <div className="col-12 d-none" id="QANatNumResultContainer">
                        <div className="row">
                            <div className="col-12" id="QANatNumResult"></div>
                            <div className="col-12">
                                <button type="button" className="btn btn-block btn-secondary mt-2" id="btnGetRefNumDone">إغلاق</button>
                            </div>
                        </div>
                    </div>-->
</div>
</div>
</div>
</div>
<!--HEALTH CHECK-->
<div className="d-none">
<a className="acc-header">
<label className="footer-icon" style="width: 200px; float: right;">
<img className="moi-ico" id="getHealthCheckStatus" src="https://www.moi.gov.kw/main/images/assets/common/ico-health-check-status.svg"/>
</label>
</a>
<div className="article">
<div className="article-info">
<div className="row text-center">
<div className="col-12 title">جاهزية نتيجة الفحص الطبي</div>
<div className="col-12">
<img src="https://www.moi.gov.kw/main/images/assets/common/ico-horizontal-bar.svg"/>
</div>
<form id="QAHealthCheck" novalidate="novalidate">
<div className="col-12">
<input className="form-control" id="QAHealthCheckTextNationalNo" maxlength="12" name="QAHealthCheckTextNationalNo" placeholder="رقم مرجع الداخلية"/>
</div>
<div className="col-12">
<button className="btn btn-block btn-secondary mt-3" id="btnQAHealthCheck">استعلم</button>
<div className="d-flex justify-content-center">
<div className="spinner-grow text-secondary d-none" id="QAHCWorkingOnIt" role="status">
<span className="sr-only">Loading...</span>
</div>
</div>
<div className="d-none mt-3" id="QAHealthReport"></div>
</div>
</form>
</div>
</div>
</div>
</div>
<!--CASE MOVEMENT INQUIRY-->
<div>
<a className="acc-header">
<label className="footer-icon" style="width: 200px; float: right;">
<img className="moi-ico" src="https://www.moi.gov.kw/main/images/assets/common/ico-case-track.svg"/>
</label>
</a>
<div className="article">
<div className="article-info">
<div className="row text-center">
<div className="col-12 title">الاستعلام عن سير القضية</div>
<div className="col-12">
<img src="https://www.moi.gov.kw/main/images/assets/common/ico-horizontal-bar.svg"/>
</div>
<form   id="QACaseCheck" novalidate="novalidate">
<div className="col-12">
<input className="form-control"   id="QACaseCheckTextNationalNo" maxlength="12" name="QACaseCheckTextNationalNo" placeholder="رقم مرجع الداخلية"/>
</div>
<div className="col-12">
<button className="btn btn-block btn-secondary mt-3"   id="btnQACaseCheck">استعلم</button>
<div className="d-flex justify-content-center">
<div className="spinner-grow text-secondary d-none" id="QACCWorkingOnIt" role="status">
<span className="sr-only">Loading...</span>
</div>
</div>
<!--<div id="QAHealthReport" className="d-none mt-3"></div>-->
</div>
</form>
</div>
</div>
</div>
</div>
<!--NEW SERVICES-->
<div>
<label className="footer-icon" style="width: 200px; float: right;">
<a   data-target="#newServicesModal" data-toggle="modal">
<img className="moi-ico" id="newServicesPop" src="https://www.moi.gov.kw/main/images/assets/common/ico-new-services.svg"/>
</a>
</label>
</div>
</div>
<script type="text/javascript">
    var yearDropDownNat;
    var yearDropDownPP;
</script>
<script src="https://www.moi.gov.kw/main/lib/flatpickr/plugins/year-dropdown.js" type="module"></script>
<script type="module">
    import yearDropdownPlugin from '/main/lib/flatpickr/plugins/year-dropdown.js';
    var todayDt = new Date();
    yearDropDownNat = new yearDropdownPlugin(
        {
        date: todayDt.getDate + "/" + todayDt.getMonth() + "/" + todayDt.getFullYear(),
        yearStart: 80,//todayDt.setFullYear(todayDt.getFullYear() - 90),
        yearEnd: 0//todayDt.getFullYear()
    }
    );

    yearDropDownPP = new yearDropdownPlugin(
        {
            date: todayDt.getDate + "/" + todayDt.getMonth() + "/" + todayDt.getFullYear(),
            yearStart: 0,//todayDt.setFullYear(todayDt.getFullYear() - 90),
            yearEnd: 10//todayDt.getFullYear()
        }
    );
</script>
<script type="text/javascript">

    function loadScript(url, callback) {
        // adding the script tag to the head as suggested before
        var body = document.getElementsByTagName('body')[0];
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = url;

        // then bind the event to the callback function
        // there are several events for cross browser compatibility
        script.onreadystatechange = function () {
            //console.log('call back readystate');
            callback;
        };
        // fire the loading
        body.appendChild(script);
        script.onload = callback;
            /*function () {
            console.log('call back onload');
            callback;
        };*/
    }

    function doNothing() {

    }

    $(document).ready(function () {

        $('footer').load('https://www.moi.gov.kw/main/footer.html');
        loadScript('https://cdn.jsdelivr.net/npm/flatpickr', loadLocale);
        function loadLocale() {
            loadScript('https://npmcdn.com/flatpickr/dist/l10n/ar.js', setReferenceNumberLinks);
            //console.log('do nothing');
        }

        $(".acc-header").click(function () {
            //alert('clicked');
            var current = document.getElementsByClassName("acc-header active");
            if (current.length > 0) {
                //alert('active');
                current[0].className = current[0].className.replace(" active", "");
            }
            else {
                alert('nothing active');
            }
            this.className += " active";

        });
        setAccordionDirectionAR();
        setAppointmentsForm();
        setTrafficFineForm();
        setSMSChangeCompanyForm();
        //setReferenceNumberForm();
        setHealthCheckForm();
        setCaseCheckForm();
    });

    function setAccordionDirectionAR() {
        var current = document.getElementsByClassName("footer-icon");
        //console.log(current[0]);
        for (i = 0; i < current.length; i++) {
            var direction = 'right';
            current[i].style.cssFloat = 'right';
        }
    }

    /************TRAFFIC FINE SCRIPTS********************************/
    setTrafficFineForm = () => {
        $('#QABtnEnquireFines').on('click', function (event) {
            //alert('hi')
            $('#QAFines').validate({
                rules: {
                    QAFinesTextCivilId: {
                        required: true,
                        //digits: true,
                        regex: /^[0-9\u0660-\u0669]+$/,
                        minlength: 8
                    }
                },
                messages: {
                    QAFinesTextCivilId: {
                        required: 'حقل مطلوب',
                        minlength: 'يرجى إدخال رقم صحيح',
                        regex: 'يرجى إدخال رقم صحيح',
                    }
                },
                submitHandler: function (form, event) {
                    $('#QABtnEnquireFines').attr("disabled", true);
                    event.preventDefault();
                    if ($('#QAFinesSelectFineType').val() == "1") {
                        window.location.href = serverUrl + "/main/eservices/gdt/violation-enquiry?civilId=" + $("#QAFinesTextCivilId").val();
                        //window.location.href = "https://portal.acs.moi.gov.kw/wps/portal/violations?systemSelection=1&numberType=1&numberValue=" + $("#QAFinesTextCivilId").val() + "&carNumberGoverCode=&licneseType=3&purpose=0&violYear=0&violGover=0&secondPartOfnewcarno=0&embassyTextField=0&QuickAccess='GO'"
                    }
                    else {
                        //window.location.href = "http://10.11.77.82:10038/wps/portal/violations?systemSelection=2&violOptionNumber=2&numberValue=" + $("#QAFinesTextCivilId").val() + "&QuickAccess='GO'"
                        //window.location.href = "http://portal.acs.moi.gov.kw/wps/portal/violations?systemSelection=2&violOptionNumber=2&numberValue=" + $("#QAFinesTextCivilId").val() + "&QuickAccess='GO'"
                        window.location.href = serverUrl + "/main/eservices/residence/fines-	enquiry?civilId=" + $("#QAFinesTextCivilId").val();
                    }
                    return;
                }
            })
        });
    };
    /**********************************************************************/

    /**************SMS SUBSCRIPTION CHANGE COMPANY SCRIPTS************/
    setSMSChangeCompanyForm = () => {
        $('#QABtnChange').on('click', function (event) {
            //event.preventDefault();
            $('#QAChangeCompany').validate({
                rules: {
                    QATextMobile: {
                        required: true,
                        digits: true,
                        minlength: 8
                    },
                    QATextCivilId: {
                        required: true,
                        digits: true,
                        minlength: 12
                    },
                    QATextActivationCode: {
                        required: true,
                        digits: true,
                        minlength: 4
                    }
                },
                messages: {
                    QATextMobile: {
                        required: 'حقل مطلوب',
                        minlength: 'يرجى إدخال رقم صحيح',
                        digits: 'يرجى إدخال رقم صحيح',
                    },
                    QATextCivilId: {
                        required: 'حقل مطلوب',
                        minlength: 'يرجى إدخال رقم صحيح',
                        digits: 'يرجى إدخال رقم صحيح',
                    },
                    QATextActivationCode: {
                        required: 'حقل مطلوب',
                        minlength: 'يرجى إدخال رقم صحيح',
                        digits: 'يرجى إدخال رقم صحيح',
                    }
                },
                submitHandler: function (form, event) {
                    $('#QABtnChange').attr("disabled", true);
                    $('#QAWorkingOnIt').addClass('d-block');
                    event.preventDefault();
                    grecaptcha.ready(function () {
                        grecaptcha.execute('6LdUyqwUAAAAAM5MRMXHrlAjDCrWT5CcRpdXgK2p', { action: 'sms/register' }).then(function (token) {
                            var formData = $("#QAChangeCompany").serializeArray();
                            //console.log(formData);
                            formData.push({ name: "g-recaptcha-token", value: token });
                            formData.push({ name: "Mobile", value: $("#QATextMobile").val() });
                            formData.push({ name: "CivilId", value: $("#QATextCivilId").val() });
                            formData.push({ name: "Company", value: $("#QASelectCompany option:selected").val() });
                            formData.push({ name: "ActivationCode", value: $("#QATextActivationCode").val() });
                            //submit via ajax
                            $.ajax({
                                url: serverUrl + '/main/eservices/sms/change-company', //decodeURIComponent('Url.Action("change-company","eservices/sms")')
                                type: 'POST',
                                data: formData,
                                contentType: 'application/x-www-form-urlencoded; charset=utf-8',
                                success: function (data) {
                                    //console.log(data);
                                    $('#QAResponse').removeClass('text-center').removeClass('text-danger');
                                    $('#infoModalTitle').html('تعديل شركة الإتصالات');
                                    $('#QAResponse').html(data.value.info);
                                    $('#QAWorkingOnIt').removeClass('d-block');
                                    $('#infoModal').modal('toggle')
                                    $('#QABtnChange').removeAttr("disabled");
                                },
                                error: function (jqXHR, textStatus, errorThrown) {
                                    console.log('failed');
                                    console.log(jqXHR);
                                    var resp = $.parseJSON(jqXHR.responseText);
                                    $('#infoModalTitle').html('تعديل شركة الإتصالات');
                                    $('#QAResponse').addClass('text-center').addClass('text-danger');
                                    $('#QAResponse').html(resp.errorMessage);
                                    $('#QAWorkingOnIt').removeClass('d-block');
                                    $('#infoModal').modal('toggle');
                                    $('#QABtnChange').removeAttr("disabled");
                                }
                            });
                        });
                    });

                }
            });
        });
    };
    /*****************************************************************/

    /************GET REFERENCE NUMBER SCRIPTS***********************************/
    function setReferenceNumberForm2() {
        $("#btnGetRefNum").click(function () {
            $('#QARefNum').validate({
                rules: {
                    QARefNumTextCivilId: {
                        required: true,
                        digits: true,
                        minlength: 12
                    },
                    QARefNumTextPassport: {
                        required: true,
                        minlength: 3
                    },
                    QARefNumTextExpiryDate: {
                        required: true,
                        minlength: 10
                    }

                },
                messages: {
                    QARefNumTextCivilId: {
                        required: 'حقل مطلوب',
                        minlength: 'يرجى إدخال رقم صحيح',
                        digits: 'يرجى إدخال رقم صحيح',
                    },
                    QARefNumTextPassport: {
                        required: 'حقل مطلوب',
                        minlength: 'يرجى إدخال رقم صحيح',
                    },
                    QARefNumTextExpiryDate: {
                        required: 'حقل مطلوب',
                        minlength: 'يرجى إدخال تاريخ صحيح',
                    }
                },
                submitHandler: function (form, event) {
                    $("#QARNWorkingOnIt").removeClass('d-none');
                    $("#QANatNumResult").html('');
                    $('#btnGetRefNum').attr("disabled", true);
                    event.preventDefault();
                    QAGetNationalNumber($('#QARefNumTextCivilId').val(),
                        $('#QARefNumTextPassport').val(),
                        $('#QARefNumTextExpiryDate').val());
                    return;
                }
            })
        });
        $("#btnGetRefNumDone").click(function () {
            $('#QANatNumResult').html('');
            $('#QANatNumResultContainer').addClass("d-none");
            $('#QARefNum').removeClass("d-none");
        });
        /***SET THE MOBILE QA FORM AS WELL BECAUSE OF
         *** CALENDAR ISSUES***************/
        setMQAReferenceNumberForm();
        //loadScript('/main/lib/awesome-qr/js/require.js', doNothing);
    };

    function setReferenceNumberLinks() {
        let refUrl = "/main/eservices/get-reference-number";
        $("#btnGetRefNumKwti").click(() => {
            location.href = refUrl + "?civilId=" + $("#QARefNumTextCivilId").val().trim() + "&enquiryFor=kuwaiti"
        });
        $("#btnGetRefNumOther").click(() => {
            location.href = refUrl + "?civilId=" + $("#QARefNumTextCivilId").val().trim() + "&enquiryFor=non-kuwaiti"
        });
        $("#btnGetRefNumKwti").removeClass('disabled');
        $("#btnGetRefNumOther").removeClass('disabled');
        //console.log("enabled");
        //console.log(yearDropDownNat);
        //console.log(yearDropDownPP);
        var today = new Date();
        config = {
            plugins: [yearDropDownPP],
            minDate: today,
            dateFormat: "Y-m-d",
            locale: "ar",
            disableMobile: true
        };
        natIssueConfig = {
            plugins: [yearDropDownNat],
            //defaultDate: today.setFullYear(today.getFullYear() - 35),
            minDate: today.setFullYear(today.getFullYear() - 90),
            maxDate: "today",
            dateFormat: "Y-m-d",
            locale: "ar",
            disableMobile: true
        };
        if (location.href.indexOf('get-reference-number') > 0) {
            $("#txtExpiryDate").flatpickr(config);
            $("#txtNatIssueDate").flatpickr(natIssueConfig);
        }
    }

    QAShowRefNumResult = (result) => {
        var table;
        if (result.returnCode == 8) {
            table = "<table className='table table-striped'>"
                + "<tr>"
                + "<td>رقم مرجع الداخلية</td>"
                //+ "</tr>"
                //+ "<tr>"
                //+ "<td>" + result.civilId + "</td>"
                + "<td>" + result.nationalNumber + "</td></tr></table>"
        }
        else {
            table = "<table className='table table-striped'>"
                + "<tr>"
                + "<td>رقم مرجع الداخلية</td>"
                //+ "</tr>"
                //+ "<tr>"
                + "<td>لا يوجد رقم مرجع، يرجى التأكد من البيانات المدخلة.</td>"
                + "</tr></table>"
        }
        $('#QANatNumResult').html(table);
        $('#MQANatNumResult').html(table);
        $('#QANatNumResultContainer').removeClass("d-none");
        $('#MQANatNumResultContainer').removeClass("d-none");
        $('#QARefNum').addClass("d-none");
        $('#MQARefNum').addClass("d-none");
    }
    /*****************************************************************/

    function setAppointmentsForm() {

        $('#QAApptsSelectDept').on('change', function () {
            var urlToGo = ".moi.gov.kw/moieap.nsf/request?"
                + "openform&langid=1&sec="
                + $('#QAApptsSelectDept').val();
            switch ($('#QAApptsSelectDept').val()) {
                case "AA":
                case "FA":
                case "HA":
                case "J":
                case "W":
                case "M":
                    location.href = \`https://nat1\${urlToGo}\`;
                    break;
                case "T":
                    location.href = \`https://nat2\${urlToGo}\`;
                    break;
                case "E2":
                    location.href = \`https://nat3\${urlToGo}\`;
                    break;
                case "E":
                case "N":
                case "X":
                    location.href = \`https://nat5\${urlToGo}\`;
                    break;
                case "S":
                case "I":
                    location.href = \`https://nat4\${urlToGo}\`;
                    break;
                case "R":
                case "F":
                    location.href = \`https://eservices7\${urlToGo}\`;
                    break;
                case "B":
                    location.href = \`https://eservices3\${urlToGo}\`;
                    break;
                case "VI":
                    location.href = "https://eservices2.moi.gov.kw/GDTVehIns.nsf";
                    break;
            }
        });

        //$('#QAApptsBtnBook').click(function () {
        //    //alert($('#QAApptsSelectDept').val());
        //    var urlToGo = "moi.gov.kw/moieap.nsf/request?"
        //        + "openform&langid=1&sec="
        //        + $('#QAApptsSelectDept').val();
        //    //switch ($('#QAApptsSelectDept').val()) {
        //    //    case "N":
        //    //    case "T":
        //    //        urlToGo = \`https://eservices7.\${urlToGo}\`;
        //    //        break;
        //    //    case "M":
        //    //    case "F":
        //    //        urlToGo = \`https://eservices3.\${urlToGo}\`;
        //    //        break;
        //    //}
        //    location.href = \`https://eservices7.\${urlToGo}\`;
        //});
    }

    function setHealthCheckForm() {
        $('#QAHealthCheck').validate({
            rules: {
                QAHealthCheckTextNationalNo: {
                    required: true,
                    digits: true,
                    minlength: 9
                },
            },
            messages: {
                QAHealthCheckTextNationalNo: {
                    required: 'Required',
                    minlength: 'Enter Valid Number',
                    digits: 'Enter Valid Number',
                }
            },
            submitHandler: function (form, event) {
                $('#btnQAHealthCheck').attr("disabled", true);
                $('#QAHCWorkingOnIt').removeClass('d-none');
                event.preventDefault();
                $.ajax({
                    //url: 'https://localhost:44322/mfservices/health/get-result/' + $("#QAHealthCheckTextNationalNo").val(),
                    url: 'https://www.moi.gov.kw/mfservices/health/get-result/' + $("#QAHealthCheckTextNationalNo").val(),
                    type: 'GET',
                    contentType: 'application/json;charset=utf-8',
                    success: function (data) {
                        console.log(data);
                        $('#btnQAHealthCheck').attr("disabled", false);
                        showQAHealthCheckResult(data);
                        $("#QAHCWorkingOnIt").addClass('d-none');
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        $("#QAHCWorkingOnIt").addClass('d-none');
                        console.log(jqXHR);
                        $('#btnQAHealthCheck').attr("disabled", false);
                        //var resp = $.parseJSON(jqXHR.responseText);
                        //console.log(resp.errorMessage);
                        $("#QAHealthReport").html('Unexpected error.Please try later');
                        $("#QAHealthReport").removeClass('d-none');

                    }
                });
            }
        });
    }

    function setCaseCheckForm() {
        $('#QACaseCheck').validate({
            rules: {
                QACaseCheckTextNationalNo: {
                    required: true,
                    digits: true,
                    minlength: 9
                },
            },
            messages: {
                QACaseCheckTextNationalNo: {
                    required: 'حقل مطلوب',
                    minlength: 'يرجى إدخال رقم صحيح',
                    regex: 'يرجى إدخال رقم صحيح',
                }
            },
            submitHandler: function (form, event) {
                $('#btnQACaseCheck').attr("disabled", true);
                $('#QACCWorkingOnIt').removeClass('d-none');
                event.preventDefault();
                $('#QABtnEnquireFines').attr("disabled", true);
                event.preventDefault();
                window.location.href = serverUrl + "/main/eservices/investigations/case-enquiry?nationalNo=" + $("#QACaseCheckTextNationalNo").val();
                return;
            }
        });
    }

    showQAHealthCheckResult = (result) => {
        var report;
        switch (result.statusCode) {
            case 0:
                //console.log(result.statusMessage);
                report = 'نتيجه الفحص الطبي لائق';
                break;
            case 1:
                //console.log(result.statusMessage);
                report = 'نتيجة الكشف الطبي غير لائق';
                break;
            case 2:
                //console.log(result.statusMessage);
                report = 'نتيجه الفحص الطبي لائق موقتاً';
                break;
            case 3:
                //console.log(result.statusMessage);
                report = 'يرجى إعاده الفحص الطبي';
                break;
            case 4:
                //console.log(result.statusMessage);
                report = 'معفي من إجراء الفحص الطبي';
                break;
            case 5:
                //console.log(result.statusMessage);
                report = 'لا يوجد كشف طبي لإظهار نتيجه الفحص';
                break;
            case 6:
                //console.log(result.statusMessage);
                report = 'الرقم المدخل غير صحيح';
                break;
            default:
                console.log(result.statusMessage);
                report = "Unknown error";
                break;
        }

        var resultDisplay = "<table className='table table-striped'>"
            + " <tr>"//<td>Status</td>
            + " <td>" + report + "</td></tr>"
            + "</table >";
        $("#QAHealthReport").html(resultDisplay);
        $("#QAHealthReport").removeClass('d-none');
    };
</script></dqa>
<footer className="container border-top footer text-muted mt-2 p-0"><div className="col-sm-12 text-center text-white mt-2">
<div className="row">
<div className="col-sm-12">
<a   href="https://www.youtube.com/user/SecurityMediaQ8">
<img className="social-media-icon" src="https://www.moi.gov.kw/main/images/assets/social-media/ico-youtube.svg"/>
</a>
<a   href="https://www.instagram.com/moi_kuw/?hl=en">
<img className="social-media-icon" src="https://www.moi.gov.kw/main/images/assets/social-media/ico-instagram.svg"/>
</a>
<a   href="https://twitter.com/moi_kuw?lang=en">
<img className="social-media-icon" src="https://www.moi.gov.kw/main/images/assets/social-media/ico-twitter.svg"/>
</a>
<a   href="https://www.facebook.com/MOIKuwait/">
<img className="social-media-icon" src="https://www.moi.gov.kw/main/images/assets/social-media/ico-facebook.svg"/>
</a>
              
            <a   href="https://play.google.com/store/apps/details?id=com.MoIKuwait">
<img className="social-media-icon" src="https://www.moi.gov.kw/main/images/assets/common/ico-android.svg"/>
</a>
              
            <a   href="https://itunes.apple.com/kw/app/moi-kuwait/id871764188?mt=8">
<img className="social-media-icon" src="https://www.moi.gov.kw/main/images/assets/common/ico-apple.svg"/>
</a>
</div>
</div>
<div className="row">
<div className="col-sm-12" id="copyRight"> © جميع الحقوق محفوظة لوزارة الداخلية-دولة الكويت - 2026</div>
</div>
<div className="row">
<div className="col-sm-12">
<!--For inquiries - 25581755-->
</div>
</div>
</div>
<script>
$(document).ready(function() {
    $('#copyRight').html(getFooterText());
});
    </script></footer>
</div>
</div>
<modals>
<div aria-hidden="true" aria-labelledby="newServicesModalTitle" className="modal fade" id="newServicesModal" role="dialog" tabindex="-1">
<div className="modal-dialog modal-dialog-centered" role="document">
<div className="modal-content">
<div className="modal-header">
<h5 className="modal-title" id="newServicesModalTitle"></h5>
<button aria-label="Close" className="close" data-dismiss="modal" type="button">
<span aria-hidden="true">×</span>
</button>
</div>
<div className="modal-body">
<div className="row">
<div className="col-12 col-md-4 text-center">
<a href="https://edl.moi.gov.kw/Login.aspx">
<img className="moi-ico" src="https://www.moi.gov.kw/main/images/assets/general-traffic/ico-renew.svg"/>
<div className="row text-center">
<div className="col">
                                    الخدمات الالكترونية لرخص السوق
                                </div>
</div>
</a>
</div>
<!--<div className="col-12 col-md-4 text-center">
        <a href="https://esp.moi.gov.kw/MOI_Kuwait/apps/services/www/MoIKuwait/desktopbrowser/default/index.html">
            <img src="https://www.moi.gov.kw/main/images/assets/esp-logo-white.svg" className="moi-ico" />
            <div className="row text-center d-flex">
                <div className="col">
                    منصة الخدمات الإلكترونية
                </div>
            </div>
        </a>
    </div>-->
<div className="col-12 col-md-4 text-center">
<a href="https://eres.moi.gov.kw/individual/ar/auth/login">
<img className="moi-ico" src="https://www.moi.gov.kw/main/images/assets/residency/ico-renew-individual.svg"/>
<div className="row text-center">
<div className="col">
                                    الخدمات الإلكترونية للأفراد
                                </div>
</div>
</a>
</div>
<div className="col-12 col-md-4 text-center">
<a href="https://www.moi.gov.kw/main/eservices/residence/health-check-status">
<img className="moi-ico" src="https://www.moi.gov.kw/main/images/assets/common/ico-health-check-status.svg"/>
<div className="row text-center">
<div className="col">
                                    جاهزية نتيجة الفحص الطبي
                                </div>
</div>
</a>
</div>
<!--<div className="col-12 col-md-4 text-center">-->
<!--<a href="https://www.moi.gov.kw/main/eservices/election/candidates/0">-->
<!--<a href="https://www.moi.gov.kw/main/eservices/election/voter-location">
                            <img src="https://www.moi.gov.kw/main/images/assets/finance/ico-rfp-fill.svg" className="moi-ico" />
                            <div className="row text-center">
                                <div className="col">
                                    الاستعلام عن مكان تصويت الناخب
                                </div>
                            </div>
                        </a>
                    </div>-->
<div className="col-12 col-md-4 text-center">
<a href="https://www.moi.gov.kw/main/eservices/residence/visa-fees">
<svg data-name="Layer 1" height="8.572em" id="Layer_1" viewbox="0 0 103 103" width="8.572em" xmlns="http://www.w3.org/2000/svg">
<title>Payment</title>
<rect className="circle cls-1" height="100" rx="50" style="fill: #000576; stroke: #000576;" width="100" x="1.01" y="1.26"></rect>
<path className="kd cls-2" d="M63.55,70.16l-6.06-7v7H55.27V56.25h2.22v6.06l5.84-6.06h2.75L59.59,62.5l6.73,7.66Z"></path>
<path className="kd cls-2" d="M67.49,70.16v-2.5H69.4v2.5Z"></path>
<path className="kd cls-2" d="M71.42,70.16V56.25h6.32c3.81,0,4.91,1.59,4.91,6.06v1.78c0,4.47-1.1,6.07-4.91,6.07Zm9-8c0-2.89-.46-4.36-2.89-4.36H73.62V68.58h3.94c2.25,0,2.89-1.3,2.89-4.2Z"></path>
<rect className="cls-1" height="46.97" width="71.3" x="15.44" y="27.78"></rect>
<line className="cls-1" x1="22.53" x2="39.12" y1="56.6" y2="56.6"></line>
<line className="cls-1" x1="32.8" x2="38.33" y1="62.13" y2="62.13"></line>
<line className="cls-1" x1="22.53" x2="38.33" y1="67.66" y2="67.66"></line>
<line className="cls-1" x1="15.29" x2="86.4" y1="36.28" y2="36.28"></line>
<line className="cls-1" x1="15.29" x2="86.4" y1="47.83" y2="47.83"></line>
</svg>
<div className="row text-center">
<div className="col">
                                    دفع رسوم سمة دخول عمل بالقطاع الأهلي
                                </div>
</div>
</a>
</div>
<div className="col-12 col-md-4 text-center">
<a href="https://eres.moi.gov.kw/companies?culture=ar">
<img className="moi-ico" src="https://www.moi.gov.kw/main/images/assets/residency/ico-renew-companies.svg"/>
<div className="row text-center">
<div className="col">
                                    الخدمات الإلكترونية للشركات
                                </div>
</div>
</a>
</div>
<div className="col-12 col-md-4 text-center">
<a href="https://eres.moi.gov.kw/government?culture=ar">
<img className="moi-ico" src="https://www.moi.gov.kw/main/images/assets/residency/ico-renew-government.svg"/>
<div className="row text-center">
<div className="col">
                                    الخدمات الإلكترونية للحكومة
                                </div>
</div>
</a>
</div>
</div>
</div>
<div className="modal-footer">
</div>
</div>
</div>
</div>
<div aria-hidden="true" aria-labelledby="infoModalTitle" className="modal fade" id="infoModal" role="dialog" tabindex="-1">
<div className="modal-dialog modal-dialog-centered" role="document">
<div className="modal-content">
<div className="modal-header">
<h5 className="modal-title" id="infoModalTitle">Change Company</h5>
<button aria-label="Close" className="close" data-dismiss="modal" type="button">
<span aria-hidden="true">×</span>
</button>
</div>
<div className="modal-body" id="QAResponse">
                Your company is now changed as requested.
            </div>
<div className="modal-footer">
<button className="btn btn-secondary" data-dismiss="modal" type="button">Close</button>
</div>
</div>
</div>
</div>
</modals>
<div aria-hidden="true" aria-labelledby="emergencyContactModalTitle" className="modal fade" id="emergencyContactModal" role="dialog" tabindex="-1">
<div className="modal-dialog modal-dialog-centered" role="document">
<div className="modal-content">
<div className="modal-header">
<h5 className="modal-title" id="emergencyContactModalTitle">أرقام الطوارئ</h5>
<button aria-label="Close" className="close" data-dismiss="modal" type="button">
<span aria-hidden="true">×</span>
</button>
</div>
<div className="modal-body">
<div className="row">
<div className="col-12 col-md-6 text-center border-bottom">
                            الشرطة، الإسعاف و قوة الإطفاء<br/>
<div className="row">
<div className="col-4 align-self-center text-left">
</div>
<div className="col-8">
<div className="row">
<div className="col-12 font-weight-bold text-right">
                                            112
                                        </div>
</div>
</div>
</div>
</div>
<div className="col-12 col-md-6 text-center border-bottom">
                            الدفاع المدني<br/>
<div className="row">
<div className="col-4 align-self-center text-left">
</div>
<div className="col-8">
<div className="row">
<div className="col-12 font-weight-bold text-right">
                                            1804000
                                        </div>
</div>
</div>
</div>
</div>
<div className="col-12 col-md-6 text-center border-bottom mt-2">
                            إدارة الجرائم الإلكترونية<br/>
<div className="row">
<div className="col-4 align-self-center text-left">
<img src="https://www.moi.gov.kw/main/images/assets/social-media/ico-whatsapp.svg" style="height:15px;"/>
</div>
<div className="col-8">
<div className="row">
<div className="col-12 font-weight-bold text-right">
<a href="https://wa.me/+96597283939">97283939</a>
</div>
</div>
</div>
</div>
</div>
<div className="col-12 col-md-6 text-center border-bottom mt-2">
                            إدارة العامة لحماية الأحداث<br/>
<div className="row">
<div className="col-4 align-self-center text-left">
</div>
<div className="col-8">
<div className="row">
<div className="col-12 font-weight-bold text-right">
                                            25589535<br/>
                                            97283636  <img src="https://www.moi.gov.kw/main/images/assets/social-media/ico-whatsapp.svg" style="height:15px;"/>
</div>
</div>
</div>
</div>
</div>
<div className="col-12 col-md-6 text-center border-bottom mt-2">
                            الإدارة العامة لمكافحة المخدرات<br/>
<div className="row">
<div className="col-4 align-self-center text-left">
</div>
<div className="col-8">
<div className="row">
<div className="col-12 font-weight-bold text-right">
                                            1884141
                                        </div>
</div>
</div>
</div>
</div>
<div className="col-12 col-md-6 text-center border-bottom mt-2">
                            الإدارة العامة لخفر السواحل<br/>
<div className="row">
<div className="col-4 align-self-center text-left">
</div>
<div className="col-8">
<div className="row">
<div className="col-12 font-weight-bold text-right">
                                            1880888
                                        </div>
</div>
</div>
</div>
</div>
<div className="col-12 col-md-6 text-center border-bottom mt-2">
                            الإدارة العامة للمرور<br/>
<div className="row">
<div className="col-4 align-self-center text-left">
<img src="https://www.moi.gov.kw/main/images/assets/social-media/ico-whatsapp.svg" style="height:15px;"/>
</div>
<div className="col-8">
<div className="row">
<div className="col-12 font-weight-bold text-right">
<a href="https://wa.me/+96599324092">99324092</a>
</div>
</div>
</div>
</div>
</div>
<div className="col-12 col-md-6 text-center border-bottom mt-2">
                            الإدارة العامة للرقابة والتفتيش<br/>
<div className="row">
<div className="col-4 align-self-center text-left">
</div>
<div className="col-8">
<div className="row">
<div className="col-12 font-weight-bold text-right">
                                            25200334
                                        </div>
</div>
</div>
</div>
</div>
<div className="col-12 col-md-6 text-center border-bottom mt-2">
                            الإدارة العامة لشؤون الإقامة<br/>
<div className="row">
<div className="col-4 align-self-center text-left">
</div>
<div className="col-8">
<div className="row">
<div className="col-12 font-weight-bold text-right">
<span className="font-weight-bolder">25582960</span>
</div>
</div>
</div>
</div>
<div className="row">
<div className="col-4 align-self-center text-left">
</div>
<div className="col-8">
<div className="row">
<div className="col-12 font-weight-bold text-right">
<span className="font-weight-bolder">25582961</span>
</div>
</div>
</div>
</div>
<div className="row">
<div className="col-4 align-self-center text-left">
<img src="https://www.moi.gov.kw/main/images/assets/social-media/ico-whatsapp.svg" style="height:15px;"/>
</div>
<div className="col-8">
<div className="row">
<div className="col-12 font-weight-bold text-right">
<a href="https://wa.me/+96597288200">97288200</a>
</div>
</div>
<div className="row">
<div className="col-12 font-weight-bold text-right">
<a href="https://wa.me/+96597288211">97288211</a>
</div>
</div>
</div>
</div>
</div>
<div className="col-12 col-md-6 text-center border-bottom mt-2">
                            إدارة حماية الآداب العامة ومكافحة الإتجار بالأشخاص<br/>
<div className="row">
<div className="col-4 align-self-center text-left">
</div>
<div className="col-8">
<div className="row">
<div className="col-12 font-weight-bold text-right">
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

    <div className="modal fade" id="newServicesModal" tabindex="-1" role="dialog" aria-labelledby="newServicesModalTitle" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
                <div className="modal-header">
                    <h5 className="modal-title" id="newServicesModalTitle"></h5>
                    <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div className="modal-body">
                    <div className="row">
                        <div className="col-12 col-md-4 text-center">
                            <a href="https://edl.moi.gov.kw/Login.aspx">
                                <img src="~/images/assets/general-traffic/ico-renew.svg" className="moi-ico" />
                                <div className="row text-center">
                                    <div className="col">
    Renew Driving License
                                    </div>
                                </div>
                            </a>
                        </div>
                        <div className="col-12 col-md-4 text-center">
                            <a href="https://esp.moi.gov.kw/MOI_Kuwait/apps/services/www/MoIKuwait/desktopbrowser/default/index.html">
                                <img src="~/images/assets/esp-logo-white.svg" className="moi-ico" />
                                <div className="row text-center d-flex">
                                    <div className="col">
    منصة الخدمات الإلكترونية
                                    </div>
                                </div>
                            </a>
                        </div>
                        <div className="col-12 col-md-4 text-center">
                            <a href="https://eres.moi.gov.kw/ar/auth/login">
                                <img src="~/images/assets/residency/ico-renew.svg" className="moi-ico" />
                                <div className="row text-center">
                                    <div className="col">
    تجديد إقامة العمالة المنزلية
                                    </div>
                                </div>
                            </a>
                        </div>
                        <div className="col-12 col-md-4 text-center">
                            <a asp-area="eservices" asp-controller="residence" asp-action="HealthReport">
                                <img src="~/images/assets/common/ico-health-check-status.svg" className="moi-ico" />
                                <div className="row text-center">
                                    <div className="col">
    جاهزية نتيجة الفحص الطبي
                                    </div>
                                </div>
                            </a>
                        </div>
                    </div>

                </div>
                <div className="modal-footer">
                </div>
            </div>
        </div>
    </div>


    <div className="modal fade" id="infoModal" tabindex="-1" role="dialog" aria-labelledby="infoModalTitle" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
                <div className="modal-header">
                    <h5 className="modal-title" id="infoModalTitle">تعديل شركة الإتصالات</h5>
                    <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div className="modal-body" id="QAResponse">
    Your company is now changed as requested.
                </div>
                <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" data-dismiss="modal">إغلاق</button>
                </div>
            </div>
        </div>
    </div>
        -->
<script crossorigin="anonymous" integrity="sha256-FgpCb/KJQlLNfOu91ta32o/NMZxltwRo8QtmkMRdAu8=" src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.3.1/jquery.min.js">
</script>
<script>(window.jQuery||document.write("\u003Cscript src=\u0022/main/lib/jquery/dist/jquery.min.js\u0022 crossorigin=\u0022anonymous\u0022 integrity=\u0022sha256-FgpCb/KJQlLNfOu91ta32o/NMZxltwRo8QtmkMRdAu8=\u0022\u003E\u003C/script\u003E"));</script>
<script crossorigin="anonymous" integrity="sha384-xrRywqdh3PHs8keKZN+8zzc5TX0GRTLCcmivcbNJWm2rs5C8PRhcEn3czEjhAO9o" src="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.bundle.min.js">
</script>
<script>(window.jQuery && window.jQuery.fn && window.jQuery.fn.modal||document.write("\u003Cscript src=\u0022/main/lib/bootstrap/dist/js/bootstrap.bundle.min.js\u0022 crossorigin=\u0022anonymous\u0022 integrity=\u0022sha384-xrRywqdh3PHs8keKZN\u002B8zzc5TX0GRTLCcmivcbNJWm2rs5C8PRhcEn3czEjhAO9o\u0022\u003E\u003C/script\u003E"));</script>
<script src="https://www.moi.gov.kw/main/lib/jquery-validation/dist/jquery.validate.min.js"></script>
<script src="https://www.moi.gov.kw/main/lib/jquery-validation-unobtrusive/jquery.validate.unobtrusive.min.js"></script>
<!-- optionally if you need to use a theme, then include the theme JS file as mentioned below -->
<!-- optionally if you need translation for your language then include locale file as mentioned below -->
<script crossorigin="anonymous" integrity="sha256-VazP97ZCwtekAsvgPBSUwPFKdrwD3unUfSGVYrahUqU=" src="https://code.jquery.com/ui/1.12.1/jquery-ui.min.js"></script>
<script async="" defer="" src="https://www.google.com/recaptcha/api.js?render=6LdUyqwUAAAAAM5MRMXHrlAjDCrWT5CcRpdXgK2p"></script>
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
<script src="https://cdn.jsdelivr.net/npm/flatpickr" type="text/javascript"></script><script src="https://npmcdn.com/flatpickr/dist/l10n/ar.js" type="text/javascript"></script><div><div className="grecaptcha-badge" data-style="bottomright" style="width: 256px; height: 60px; display: block; transition: right 0.3s; position: fixed; bottom: 14px; right: -186px; box-shadow: gray 0px 0px 5px; border-radius: 2px; overflow: hidden;"><div className="grecaptcha-logo"><iframe frameborder="0" height="60" name="a-vm8rzw62oyv3" role="presentation" sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-top-navigation allow-modals allow-popups-to-escape-sandbox allow-storage-access-by-user-activation" scrolling="no" src="https://www.google.com/recaptcha/api2/anchor?ar=1&amp;k=6LdUyqwUAAAAAM5MRMXHrlAjDCrWT5CcRpdXgK2p&amp;co=aHR0cHM6Ly93d3cubW9pLmdvdi5rdzo0NDM.&amp;hl=en&amp;v=A7KpaEASfhDcK0nXxgQEyyYv&amp;size=invisible&amp;anchor-ms=20000&amp;execute-ms=30000&amp;cb=5kc7w170eg9c" title="reCAPTCHA" width="256">&lt;!DOCTYPE html&gt;&lt;html dir="ltr" lang="en"&gt;&lt;head&gt;&lt;meta http-equiv="Content-Type" content="text/html; charset=UTF-8"&gt;
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
&lt;link rel="stylesheet" type="text/css" href="https://www.gstatic.com/recaptcha/releases/A7KpaEASfhDcK0nXxgQEyyYv/styles__ltr.css"&gt;
&lt;script nonce="" type="text/javascript"&gt;window['__recaptcha_api'] = 'https://www.google.com/recaptcha/api2/';&lt;/script&gt;
&lt;script type="text/javascript" src="https://www.gstatic.com/recaptcha/releases/A7KpaEASfhDcK0nXxgQEyyYv/recaptcha__en.js" nonce=""&gt;
      
    &lt;/script&gt;&lt;/head&gt;
&lt;body&gt;&lt;div id="rc-anchor-alert" className="rc-anchor-alert"&gt;&lt;/div&gt;
&lt;input type="hidden" id="recaptcha-token" value="03AFcWeA7VxLKSA-svaF4tz28Z3luv7h_mpZh1-hraWyZxTie0cNpYupxMdHyRcTxw8sAFdlifJUWiOabOw4E8pxlRLn8D_cdzBi8gAL10iE4-Ccw1duYOqMXz7OKVQjfm46dZjYjmIMa7i6VUu4x4tER6Qyt7fLbw0i4iP2Hnqr6wP-eBZOhnH_zHG2GC2QZdlzg0r4T2ubNrOSq996FvYO323lJ2lWG-4_6rXO1ceF4fEghEI2fItrDM-grA8dwz3Ar_i5HBiYD64L5_6HGe3VK44YeLT5J-qqGDtrPpH2XR0kmk6pgJq_XrbWHxpotMha28pWJtgYpQKRTpUv-BwPHJihYDF5SYly2q-4P4qc-4rQ6vw-9HfxyXxzi3cPauEOktwJbEMKskFa017VyoxQSPBxVXdV5BfxiJ29zzmKL8vgXa-2Mhe14Czex2a18NmWBtlq2Li9RRwmy8CfV6gcDCxTZZc6nTdghmmrns9sWxWBorSQJ2QYRm0UsRKv7xuEu9oOOQCbGOKk-mVvK7MZ1ZsAV4IaGS4Mvk_qqSbnuJtr7bDPAAqf_4kqanuTnZ6Al1qOrBhDhCJFTffp1IxTs5oX09Q6VWefQ_7Xg-4mJKpFufaYQp9-vKvFRrv5Udk6vN5p-xxmCufQRzf_blDbaAo_QzFZ2IKHtV1kuJaCPQUaYIcHJ0Y87Up9612k-W_8-xXrtlGe14IQznLDCoty1rwqQKvg17ig_py_ZcVLqDhKBkVXMv9nq4I5dA7dr7uiQ2oueUN4azwmD_mQHARat1Uj0QFqisIAQD0iZB81lBpzc0GiCxjfa3k0qkt32a_uSm-rQaayu44jQBEasBYJUV6Pn93aLPO8E3ffzpHfKjjeGxc8FuH0IO9o0_vm1JfMLZ2VYuDaGvyZKWvI6Y2dS8qEH9rD_2kawtMGA2DbOpmRg-Y4C_Pgd5us6ewDxWijBQ0lT0r3ZzRIkhIBWcrB9ZiOPIhYAr1zHeImaZDFwAMBhJnKsjJi4a4QyrlePfVIOx4UGwJO-SExWvJZmyxMaK6LvRGgye5yjc7tqYjtggu6fP-mWRw0hyLqQDUkwO3r88QUD6SaiaThmdyOaDCqdPdwxopq1UH_1VJ_tJ9kC9ChRCtOgkMfMyeGCqoHWcfKcSiHSRUV4gdKcEJKBQxHFMxjOOpgJYfsuA4v6Swzt95HyXa3zOgbv6KIomWrL4Gb5LLATLjvCuc8NAV2C7LUVgw5IEon_Q3UQqEXtiQe2Uhmpf4-jvf_2cBY8U07FPHJOUNbmRzuysIGIabW3CJtrnkCZIFcb_WKzdR5ZCc83AqylW03-t1w8CKNhyX_rfvix5N_xNZBregGoJLofmFVmhr7gOWejF6IOeEDpx8gCtuz1H2M65Fqse3Nk8F9v9WOXpF3YbMxDOPGNY15uEkyNOIrliK8bxFgYKVVHRiGr2FN3YLsHMO3d50lEg0pvNRL7G0zO-grqdyNIfzMq-naOfALXbXdbwGeFWn4XXbZtclyYpmXgbj3Zy00zNfv66hLA_nA3FcBWAtTOzCtx1c31kPra0m8NvithrXzW4BsXa5jmBiwgr8sT7Yyb1rQZWwVQjIAoVqvgxTqqoROlVYTVsbLN-MaNjfzR3RZVs84Ky6aSdfyUnGR13Ya7XdHB1XjlEexjgUbjrGs8lyQZmvxGIHc4AvIQy5VmoXbXOFNbHeVm1HB_kMqhcTnb6SRzlleblUBcuSLLz2sCohTEUHwpwY0tGhAfIVgeYxSxQ5Cu7QmZWw8eRyh5Q13rgf3M0PVIyNQcPJ1iy"&gt;
&lt;script type="text/javascript" nonce=""&gt;
      recaptcha.anchor.Main.init("[\x22ainput\x22,[\x22bgdata\x22,null,null,null,\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\x22],null,[\x22conf\x22,null,\x226LdUyqwUAAAAAM5MRMXHrlAjDCrWT5CcRpdXgK2p\x22,0,null,null,null,0,[21,125,63,73,95,87,41,43,42,83,102,105,109,121],[4789614,536],0,null,null,null,null,0,null,0,null,700,1,null,0,\x22CoUDEg8I8ajhFRgAOgZUOU5CNWISDwjmjuIVGAA6BlFCb29IYxIPCMfm1DgYAToGZHhkTmlkEg8Is4qgOBgBOgZMV0o1a2ISDwiB7OgVGAE6Bkh1dlBqZhIPCK6e6zcYADoGR2JpT1FkEg8I94jmNxgAOgZvaWxlRGQSDwjwzeMVGAE6BmZJVkloYhIPCOLKoDcYAToGZ0xOQ0hjEg8I3r+3NxgBOgZlYXp1NmQSDwi3+904GAE6BmpHVHlSYxIPCNjSgTIYADoGQXE3N3ZmEg4IuOWUMhgBOgVRQk9EMBIPCKjvvzgYADoGR0ZVTmNmEg8ItbOrOBgBOgZvcllWNmQSDwjS25U3GAA6BmZmYVdBZRIPCJXYlDIYAToGUHE2MG5kEg8Iq5HKOBgBOgZBWjROYmISDwjF84g3GAA6BmFYb2lhYxIPCI3KhjIYAToGT3dONHRmEg4Iiv2INxgAOgVNZklJNBogCAMSHB0d/c2BNRmnigkZruClAhnMlUAZxblMGevuFBk\\u003d\x22,0,0,null,null,1,null,null,1,null,null,0,1,\x2246116e70c4c8a21843dd49553f45f476e7916d1886ebc36d7ec5ed35cef9cd0b\x22],\x22https://www.moi.gov.kw:443\x22,null,[3,1,1],null,null,null,1,3600,[\x22https://www.google.com/intl/en/policies/privacy/\x22,\x22https://www.google.com/intl/en/policies/terms/\x22],\x22gCntbfLZkIkPdz9Zk2kp4CSdtTJL/988C28f9edIXQE\\u003d\x22,1,0,null,1,1785799814614,0,0,[9,102,146,228,206],null,[124,112,87],\x22RC-tLt3og8Dm46mdw\x22,null,null,null,null,null,\x220dAFcWeA6a1AgfeA2Bt6k48cxVArIItaX5djmYi7muwlamwDE4wiXu6YMo1zE6AMX34AvI5JD_0zq3xDYD1KC7HdgjPG1ZyRvJvQ\x22,1785882614230]");
    &lt;/script&gt;&lt;div className="rc-anchor rc-anchor-invisible rc-anchor-light  rc-anchor-invisible-hover"&gt;&lt;div id="recaptcha-accessible-status" className="rc-anchor-aria-status" aria-hidden="true"&gt;Recaptcha requires verification. &lt;/div&gt;&lt;div className="rc-anchor-error-msg-container" style="display:none"&gt;&lt;span className="rc-anchor-error-msg" aria-hidden="true"&gt;&lt;/span&gt;&lt;/div&gt;&lt;div className="rc-anchor-normal-footer"&gt;&lt;div className="rc-anchor-logo-large" role="presentation"&gt;&lt;div className="rc-anchor-logo-img rc-anchor-logo-img-large"&gt;&lt;/div&gt;&lt;/div&gt;&lt;div className="rc-anchor-pt"&gt;&lt;/div&gt;&lt;/div&gt;&lt;div className="rc-anchor-invisible-text"&gt;&lt;span&gt;protected by &lt;strong&gt;reCAPTCHA&lt;/strong&gt;&lt;/span&gt;&lt;div id="rc-anchor-invisible-classic-warning"&gt;&lt;div&gt;reCAPTCHA is changing its terms of service. &lt;a className="migrate-link" href="https://google.com/recaptcha/admin/migrate" target="_blank"&gt;Take action.&lt;/a&gt;&lt;/div&gt;&lt;/div&gt;&lt;div className="rc-anchor-pt"&gt;&lt;/div&gt;&lt;/div&gt;&lt;/div&gt;&lt;iframe style="display: none;"&gt;</iframe></div></div></div>` } />
    </div>
  );
}
