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
        }

        .moi-mobile-clone {
          background-color: var(--moi-bg);
          min-height: 100vh;
          background-image: url('https://www.moi.gov.kw/main/images/assets/common/bg-pattern.png');
          background-repeat: repeat;
          padding-bottom: 40px;
        }

        /* Header Styles */
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

        /* Tool Bar */
        .tool-bar {
          padding: 10px 15px;
          display: flex;
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

        /* Blue List Section */
        .blue-list {
          background-color: var(--moi-blue);
          padding: 10px 0;
        }

        .list-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px 25px;
          color: white;
          text-decoration: none !important;
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }

        .list-item:last-child {
          border-bottom: none;
        }

        .item-text {
          font-size: 16px;
          font-weight: 600;
          text-align: right;
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
        }

        .item-icon-circle img {
          width: 24px;
        }

        /* Inquiry Form Section */
        .form-section {
          padding: 30px 20px;
          text-align: center;
        }

        .form-group-label {
          color: #666;
          font-size: 16px;
          margin-bottom: 8px;
          display: block;
          text-align: right;
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
          margin-top: 10px;
        }

        .note-text {
          font-size: 15px;
          color: #333;
          font-weight: 600;
          margin-top: 25px;
          line-height: 1.6;
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
          margin-top: 30px;
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

        .big-circle img {
          width: 80px;
        }

        /* Inquiry Reference Section */
        .ref-section {
          padding: 30px 20px;
          text-align: center;
        }

        .ref-title {
          color: var(--moi-blue);
          font-weight: 700;
          font-size: 18px;
          margin-bottom: 20px;
          position: relative;
        }

        .ref-title::after {
          content: "";
          display: block;
          width: 100%;
          height: 1px;
          background: #ccc;
          margin-top: 10px;
        }

        .btn-ref {
          width: 100%;
          height: 45px;
          background: #f0f0f0;
          border: 1px solid var(--moi-blue);
          color: var(--moi-blue);
          font-weight: 600;
          border-radius: 4px;
          margin-bottom: 10px;
        }

        /* New Services Section */
        .new-services-section {
          background-color: var(--moi-blue);
          padding: 40px 0;
          display: flex;
          justify-content: center;
        }

        .new-services-circle {
          width: 140px;
          height: 140px;
          border: 2px solid white;
          border-radius: 50%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: white;
          text-align: center;
        }

        /* Footer */
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
        }

        @media (min-width: 992px) {
          .moi-mobile-clone {
            max-width: 500px;
            margin: 0 auto;
            box-shadow: 0 0 20px rgba(0,0,0,0.2);
          }
        }
      `}</style>

      {/* Header */}
      <div className="moi-header">
        <div className="header-titles">
          <h1>دولة الكويت</h1>
          <h2>وزارة الداخلية</h2>
        </div>
        <img src="https://www.moi.gov.kw/main/images/assets/common/logo-moi.svg" className="moi-logo-img" alt="MOI" />
      </div>

      {/* Navbar */}
      <div className="moi-nav-bar">
        <div className="menu-icon">☰</div>
      </div>

      {/* Tool Bar */}
      <div className="tool-bar">
        <div className="btn-listen">
          <span style={{marginLeft:'8px'}}>استمع</span>
          <img src="https://www.moi.gov.kw/main/images/assets/common/ico-speaker.svg" style={{width:'16px'}} alt="speaker" />
        </div>
        <div className="btn-listen" style={{width:'40px', justifyContent:'center'}}>
          <span style={{borderLeft:'5px solid transparent', borderRight:'5px solid transparent', borderBottom:'10px solid #28a745', transform:'rotate(90deg)'}}></span>
        </div>
      </div>

      {/* Dept Section */}
      <div className="dept-section">
        <div className="dept-title">
          <span>الإدارة العامة للمرور</span>
          <img src="https://www.moi.gov.kw/main/images/assets/general-traffic/logo-general-traffic.svg" className="dept-logo" alt="Traffic Logo" />
        </div>
        <div style={{height:'1px', background:'#ccc', width:'60%', margin:'0 auto'}}></div>
      </div>

      {/* Blue List */}
      <div className="blue-list">
        <a href="#" className="list-item">
          <div className="item-text">الخدمات الالكترونية لرخص السوق</div>
          <div className="item-icon-circle"><img src="https://www.moi.gov.kw/main/images/assets/general-traffic/ico-renew-license.svg" alt="icon" /></div>
        </a>
        <a href="#" className="list-item">
          <div className="item-text">دفع المخالفات</div>
          <div className="item-icon-circle"><img src="https://www.moi.gov.kw/main/images/assets/common/ico-payment.svg" alt="icon" /></div>
        </a>
        <a href="#" className="list-item">
          <div className="item-text">نظام مواعيد اختبار القيادة</div>
          <div className="item-icon-circle"><img src="https://www.moi.gov.kw/main/images/assets/general-traffic/ico-booking.svg" alt="icon" /></div>
        </a>
        <a href="#" className="list-item">
          <div className="item-text">معاملات المرور</div>
          <div className="item-icon-circle"><img src="https://www.moi.gov.kw/main/images/assets/general-traffic/ico-procedures.svg" alt="icon" /></div>
        </a>
        <a href="#" className="list-item">
          <div className="item-text">مواقع الإدارة العامة للمرور</div>
          <div className="item-icon-circle"><img src="https://www.moi.gov.kw/main/images/assets/general-traffic/ico-locations-sections.svg" alt="icon" /></div>
        </a>
        <a href="#" className="list-item">
          <div className="item-text">شروط منح رخص السوق لغير الكويتيين</div>
          <div className="item-icon-circle"><img src="https://www.moi.gov.kw/main/images/assets/common/ico-pdf-doc.svg" alt="icon" /></div>
        </a>
      </div>

      {/* Inquiry Form */}
      <div className="form-section">
        <div className="dept-title" style={{marginBottom:'20px'}}>الإدارة العامة للمرور</div>
        <div style={{height:'1px', background:'#ccc', width:'60%', margin:'0 auto 30px'}}></div>
        
        <form onSubmit={handleInquire}>
          <label className="form-group-label">Enquiry Type</label>
          <select className="moi-select" value={enquiryType} onChange={e => setEnquiryType(e.target.value)}>
            <option value="1">الأفراد</option>
            <option value="2">الشركات</option>
          </select>

          <label className="form-group-label">الرقم المدني أو الرقم الموحد</label>
          <input type="text" className="moi-input" value={civilId} onChange={e => setCivilId(e.target.value)} />

          <button type="submit" className="btn-submit-moi">إستعلم</button>
        </form>

        <p className="note-text">
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

      {/* Big Icons */}
      <div className="big-icon-section">
        <div className="big-circle">
          <img src="https://www.moi.gov.kw/main/images/assets/common/ico-payment.svg" style={{filter: 'brightness(0) invert(1)'}} alt="KD" />
        </div>
      </div>
      
      <div style={{height:'30px'}}></div>

      <div className="big-icon-section" style={{backgroundColor:'white', padding:'20px 0'}}>
        <div className="big-circle" style={{backgroundColor: 'var(--moi-blue)'}}>
           <img src="https://www.moi.gov.kw/main/images/assets/common/ico-case-track.svg" style={{filter: 'brightness(0) invert(1)'}} alt="case" />
        </div>
      </div>

      <div style={{height:'30px'}}></div>

      <div className="big-icon-section">
        <div className="big-circle">
          <img src="https://www.moi.gov.kw/main/images/assets/common/ico-get-ref-num.svg" style={{filter: 'brightness(0) invert(1)'}} alt="ref" />
        </div>
      </div>

      {/* Ref Section */}
      <div className="ref-section">
        <div className="ref-title">الإستعلام عن رقم مرجع الداخلية</div>
        <div className="form-group">
          <input type="text" className="moi-input" placeholder="الرقم المدني" style={{background:'#fff'}} />
        </div>
        <button className="btn-ref">للكويتيين</button>
        <button className="btn-ref">للمقيمين</button>
      </div>

      {/* New Services */}
      <div className="new-services-section">
        <div className="new-services-circle">
          <span style={{fontSize:'22px', fontWeight:'700'}}>أحدث</span>
          <span style={{fontSize:'12px'}}>New Services</span>
          <span style={{fontSize:'22px', fontWeight:'700'}}>الخدمات</span>
        </div>
      </div>

      {/* Footer */}
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

      {isSearching && (
        <div style={{position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.5)', display:'flex', justifyContent:'center', alignItems:'center', zIndex:9999}}>
          <div className="spinner-border text-white" role="status"></div>
        </div>
      )}
    </div>
  );
}
