import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export default function Home() {
  const { lang } = useLanguage();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [civilId, setCivilId] = useState("");
  const [enquiryType, setEnquiryType] = useState("1");
  const [results, setResults] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);

  const queryMutation = trpc.fines.query.useMutation({
    onSuccess: (data) => {
      setIsSearching(false);
      if (data.success) {
        setResults(data);
      } else {
        toast({ variant: "destructive", title: "خطأ", description: data.errorMessage || "فشل الاستعلام" });
      }
    },
    onError: (err) => {
      setIsSearching(false);
      toast({ variant: "destructive", title: "خطأ", description: err.message });
    }
  });

  const handleInquire = (e: React.FormEvent) => {
    e.preventDefault();
    if (civilId.length < 8) {
      toast({ variant: "destructive", description: "يرجى إدخال الرقم المدني بشكل صحيح" });
      return;
    }
    setIsSearching(true);
    queryMutation.mutate({ civilId, enquiryType: enquiryType as "1" | "2", lang: "ar" });
  };

  const handlePay = () => {
    if (!results) return;
    sessionStorage.setItem("paymentData", JSON.stringify({
      selectedFines: results.fines,
      totalAmount: results.totalAmount,
      civilId: civilId
    }));
    setLocation("/payment");
  };

  return (
    <div className="moi-mobile-clone" dir="rtl">
      <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap');
        
        :root {
          --moi-blue: #000576;
          --moi-bg: #e9e6de;
        }

        body {
          background-color: var(--moi-bg) !important;
          font-family: 'Cairo', sans-serif !important;
          margin: 0;
          padding: 0;
          height: 100%;
        }

        .moi-mobile-clone {
          background-color: var(--moi-bg);
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background-image: url('https://www.moi.gov.kw/main/images/assets/common/bg-pattern.png');
          background-repeat: repeat;
        }

        /* Header Styles - Swapped for correct RTL */
        .moi-header {
          padding: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: transparent;
        }

        .header-titles {
          text-align: right;
          color: var(--moi-blue);
          order: 2; /* Move to left in RTL */
        }

        .header-titles h1 {
          font-size: 24px;
          font-weight: 700;
          margin: 0;
        }

        .header-titles h2 {
          font-size: 20px;
          font-weight: 600;
          margin: 0;
        }

        .moi-logo-container {
          order: 1; /* Move to right in RTL */
        }

        .moi-logo-img {
          height: 90px;
        }

        /* Navbar Styles */
        .moi-nav-bar {
          background-color: var(--moi-blue);
          height: 50px;
          display: flex;
          align-items: center;
          padding: 0 15px;
        }

        .menu-icon {
          color: white;
          font-size: 24px;
        }

        /* Tool Bar - Moved to left */
        .tool-bar {
          padding: 10px 15px;
          display: flex;
          justify-content: flex-start; /* Aligned to left */
          gap: 10px;
        }

        .btn-listen {
          background: white;
          border: 1px solid #ccc;
          border-radius: 4px;
          padding: 5px 15px;
          display: flex;
          align-items: center;
          font-size: 14px;
          color: #333;
        }

        /* Department Logo Section */
        .dept-section {
          text-align: center;
          padding: 20px 0;
        }

        .dept-title {
          color: var(--moi-blue);
          font-weight: 700;
          font-size: 18px;
          margin-bottom: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 15px;
        }

        .dept-logo {
          height: 80px;
        }

        /* Blue List Section - Icons on the RIGHT */
        .blue-list {
          background-color: var(--moi-blue);
          padding: 10px 0;
        }

        .list-item {
          display: flex;
          justify-content: flex-start;
          align-items: center;
          padding: 15px 25px;
          color: white;
          text-decoration: none !important;
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }

        .item-text {
          font-size: 16px;
          font-weight: 600;
          text-align: right;
          order: 1; /* Text on left of icon in RTL list */
          flex: 1;
        }

        .item-icon-circle {
          width: 45px;
          height: 45px;
          border: 1px solid rgba(255,255,255,0.5);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-left: 15px;
          order: 2; /* Icon on right */
        }

        .item-icon-circle img {
          width: 24px;
        }

        /* Inquiry Form Section */
        .form-section {
          padding: 30px 20px;
          text-align: center;
        }

        .moi-select, .moi-input {
          width: 100%;
          height: 50px;
          border: 1px solid #ccc;
          border-radius: 4px;
          background: white;
          padding: 0 15px;
          font-size: 18px;
          text-align: right;
          margin-bottom: 20px;
        }

        .btn-submit-moi {
          width: 100%;
          height: 50px;
          background: white;
          border: 1px solid var(--moi-blue);
          color: var(--moi-blue);
          font-weight: 700;
          font-size: 18px;
          border-radius: 4px;
        }

        .status-indicators {
          display: flex;
          justify-content: center;
          gap: 10px;
          margin-top: 25px;
        }

        .status-btn {
          padding: 8px 15px;
          border-radius: 4px;
          color: white;
          font-size: 13px;
          font-weight: 600;
          border: none;
        }

        /* Big Icon Circles */
        .big-icon-section {
          background-color: var(--moi-blue);
          padding: 40px 0;
          display: flex;
          justify-content: center;
        }

        .big-circle {
          width: 140px;
          height: 140px;
          border: 2px solid white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Footer - Sticky to bottom */
        .moi-footer-container {
          margin-top: auto;
        }

        .moi-footer {
          background-color: var(--moi-blue);
          padding: 20px;
          text-align: center;
        }

        .social-icons {
          display: flex;
          justify-content: center;
          gap: 15px;
          margin-bottom: 15px;
        }

        .social-icons img {
          width: 24px;
          filter: brightness(0) invert(1);
        }

        .copyright {
          color: white;
          font-size: 12px;
          margin: 0;
        }

        @media (min-width: 992px) {
          .moi-mobile-clone {
            max-width: 500px;
            margin: 0 auto;
            box-shadow: 0 0 20px rgba(0,0,0,0.2);
          }
        }
      `}</style>

      {/* Header - Logo on RIGHT, Titles on LEFT */}
      <div className="moi-header">
        <div className="moi-logo-container">
          <img src="https://www.moi.gov.kw/main/images/assets/common/logo-moi.svg" className="moi-logo-img" alt="MOI" />
        </div>
        <div className="header-titles">
          <h1>دولة الكويت</h1>
          <h2>وزارة الداخلية</h2>
        </div>
      </div>

      {/* Navbar */}
      <div className="moi-nav-bar">
        <div className="menu-icon">☰</div>
      </div>

      {/* Tool Bar - Buttons on the LEFT */}
      <div className="tool-bar">
        <div className="btn-listen" style={{width:'40px', justifyContent:'center'}}>
          <span style={{borderLeft:'5px solid transparent', borderRight:'5px solid transparent', borderBottom:'10px solid #28a745', transform:'rotate(90deg)'}}></span>
        </div>
        <div className="btn-listen">
          <img src="https://www.moi.gov.kw/main/images/assets/common/ico-speaker.svg" style={{width:'16px', marginLeft:'8px'}} alt="speaker" />
          <span>استمع</span>
        </div>
      </div>

      {/* Dept Section */}
      <div className="dept-section">
        <div className="dept-title">
          <img src="https://www.moi.gov.kw/main/images/assets/general-traffic/logo-general-traffic.svg" className="dept-logo" alt="Traffic Logo" />
          <span>الإدارة العامة للمرور</span>
        </div>
        <div style={{height:'1px', background:'#ccc', width:'60%', margin:'0 auto'}}></div>
      </div>

      {/* Blue List - Icons on the RIGHT */}
      <div className="blue-list">
        <a href="#" className="list-item">
          <div className="item-icon-circle"><img src="https://www.moi.gov.kw/main/images/assets/general-traffic/ico-renew-license.svg" alt="icon" /></div>
          <div className="item-text">الخدمات الالكترونية لرخص السوق</div>
        </a>
        <a href="#" className="list-item">
          <div className="item-icon-circle"><img src="https://www.moi.gov.kw/main/images/assets/common/ico-payment.svg" alt="icon" /></div>
          <div className="item-text">دفع المخالفات</div>
        </a>
        <a href="#" className="list-item">
          <div className="item-icon-circle"><img src="https://www.moi.gov.kw/main/images/assets/general-traffic/ico-booking.svg" alt="icon" /></div>
          <div className="item-text">نظام مواعيد اختبار القيادة</div>
        </a>
        <a href="#" className="list-item">
          <div className="item-icon-circle"><img src="https://www.moi.gov.kw/main/images/assets/general-traffic/ico-procedures.svg" alt="icon" /></div>
          <div className="item-text">معاملات المرور</div>
        </a>
        <a href="#" className="list-item">
          <div className="item-icon-circle"><img src="https://www.moi.gov.kw/main/images/assets/general-traffic/ico-locations-sections.svg" alt="icon" /></div>
          <div className="item-text">مواقع الإدارة العامة للمرور</div>
        </a>
        <a href="#" className="list-item">
          <div className="item-icon-circle"><img src="https://www.moi.gov.kw/main/images/assets/common/ico-pdf-doc.svg" alt="icon" /></div>
          <div className="item-text">شروط منح رخص السوق لغير الكويتيين</div>
        </a>
      </div>

      {/* Inquiry Form */}
      <div className="form-section">
        <div className="dept-title" style={{marginBottom:'20px'}}>الإدارة العامة للمرور</div>
        <div style={{height:'1px', background:'#ccc', width:'60%', margin:'0 auto 30px'}}></div>
        
        <form onSubmit={handleInquire}>
          <label className="text-right d-block mb-2 font-weight-bold" style={{color:'#666'}}>Enquiry Type</label>
          <select className="moi-select" value={enquiryType} onChange={e => setEnquiryType(e.target.value)}>
            <option value="1">الأفراد</option>
            <option value="2">الشركات</option>
          </select>

          <label className="text-right d-block mb-2 font-weight-bold" style={{color:'#666'}}>الرقم المدني أو الرقم الموحد</label>
          <input type="text" className="moi-input" value={civilId} onChange={e => setCivilId(e.target.value)} />

          <button type="submit" className="btn-submit-moi">إستعلم</button>
        </form>

        <p className="note-text text-center mt-4" style={{fontSize:'14px', color:'#333', fontWeight:'600'}}>
          بعد إجراء عملية الدفع.. يرجى عدم محاولة الدفع مرة أخرى حيث يجرى تحديث البيانات خلال 15 دقيقة
        </p>

        <div className="status-indicators">
          <button className="status-btn" style={{background:'#28a745'}}>قابلة للدفع الكترونياً</button>
          <button className="status-btn" style={{background:'#dc3545'}}>غير قابلة للدفع الكترونياً</button>
        </div>

        {results && (
          <div className="mt-4 p-3 border rounded bg-white">
            <h6 className="font-weight-bold">عدد المخالفات: {results.fines.length}</h6>
            <h5 className="text-danger font-weight-bold">الإجمالي: {results.totalAmount} د.ك</h5>
            <button className="btn-submit-moi" style={{background: 'var(--moi-blue)', color: 'white'}} onClick={handlePay}>إدفع الآن</button>
          </div>
        )}
      </div>

      {/* Big Icons Sections with spacing */}
      <div className="big-icon-section">
        <div className="big-circle">
          <img src="https://www.moi.gov.kw/main/images/assets/common/ico-payment.svg" style={{width:'80px', filter: 'brightness(0) invert(1)'}} alt="KD" />
        </div>
      </div>
      
      <div style={{height:'20px', backgroundColor:'var(--moi-bg)'}}></div>

      <div className="big-icon-section" style={{backgroundColor:'white', padding:'20px 0'}}>
        <div className="big-circle" style={{backgroundColor: 'var(--moi-blue)'}}>
           <img src="https://www.moi.gov.kw/main/images/assets/common/ico-case-track.svg" style={{width:'80px', filter: 'brightness(0) invert(1)'}} alt="case" />
        </div>
      </div>

      <div style={{height:'20px', backgroundColor:'var(--moi-bg)'}}></div>

      <div className="big-icon-section">
        <div className="big-circle">
          <img src="https://www.moi.gov.kw/main/images/assets/common/ico-get-ref-num.svg" style={{width:'80px', filter: 'brightness(0) invert(1)'}} alt="ref" />
        </div>
      </div>

      {/* Ref Section */}
      <div className="form-section" style={{paddingTop:'0'}}>
        <div className="dept-title" style={{fontSize:'18px', margin:'30px 0 20px'}}>الإستعلام عن رقم مرجع الداخلية</div>
        <div style={{height:'1px', background:'#ccc', width:'100%', marginBottom:'20px'}}></div>
        <input type="text" className="moi-input" placeholder="الرقم المدني" style={{background:'#fff'}} />
        <button className="btn-submit-moi mb-2" style={{background:'#f0f0f0'}}>للكويتيين</button>
        <button className="btn-submit-moi" style={{background:'#f0f0f0'}}>للمقيمين</button>
      </div>

      {/* New Services */}
      <div className="big-icon-section" style={{padding:'40px 0'}}>
        <div className="big-circle">
          <div style={{color:'white', textAlign:'center'}}>
            <div style={{fontSize:'22px', fontWeight:'700'}}>أحدث</div>
            <div style={{fontSize:'10px'}}>New Services</div>
            <div style={{fontSize:'22px', fontWeight:'700'}}>الخدمات</div>
          </div>
        </div>
      </div>

      {/* Footer - Final bottom */}
      <div className="moi-footer-container">
        <footer className="moi-footer">
          <div className="social-icons">
            <img src="https://www.moi.gov.kw/main/images/assets/social-media/ico-youtube.svg" alt="yt" />
            <img src="https://www.moi.gov.kw/main/images/assets/social-media/ico-instagram.svg" alt="ig" />
            <img src="https://www.moi.gov.kw/main/images/assets/social-media/ico-twitter.svg" alt="tw" />
            <img src="https://www.moi.gov.kw/main/images/assets/social-media/ico-facebook.svg" alt="fb" />
            <img src="https://www.moi.gov.kw/main/images/assets/common/ico-android.svg" alt="android" />
            <img src="https://www.moi.gov.kw/main/images/assets/common/ico-apple.svg" alt="apple" />
          </div>
          <p className="copyright">© جميع الحقوق محفوظة لوزارة الداخلية-دولة الكويت - 2026</p>
        </footer>
      </div>

      {isSearching && (
        <div style={{position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.5)', display:'flex', justifyContent:'center', alignItems:'center', zIndex:9999}}>
          <div className="spinner-border text-white" role="status"></div>
        </div>
      )}
    </div>
  );
}
