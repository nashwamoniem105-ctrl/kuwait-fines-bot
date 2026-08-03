import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export default function Home() {
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
    <div className="moi-perfect-clone" dir="rtl">
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

        .moi-perfect-clone {
          background-color: var(--moi-bg);
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background-image: url('https://www.moi.gov.kw/main/images/assets/common/bg-pattern.png');
          background-repeat: repeat;
        }

        /* Header - Matching Image 5099 */
        .moi-header {
          padding: 15px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: transparent;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .moi-logo-img {
          height: 80px;
        }

        .header-titles {
          text-align: right;
          color: var(--moi-blue);
        }

        .header-titles h1 {
          font-size: 22px;
          font-weight: 700;
          margin: 0;
          line-height: 1.2;
        }

        .header-titles h2 {
          font-size: 20px;
          font-weight: 600;
          margin: 0;
          line-height: 1.2;
        }

        /* Navbar - Blue Strip */
        .moi-nav-bar {
          background-color: var(--moi-blue);
          height: 45px;
          display: flex;
          align-items: center;
          padding: 0 20px;
        }

        .menu-icon {
          color: white;
          font-size: 24px;
        }

        /* Listen Toolbar - Matching Image 5099 (Moved to Left) */
        .tool-bar {
          padding: 10px 20px;
          display: flex;
          justify-content: flex-start;
          gap: 8px;
        }

        .btn-listen {
          background: white;
          border: 1px solid #ccc;
          border-radius: 4px;
          padding: 4px 12px;
          display: flex;
          align-items: center;
          font-size: 14px;
          color: #333;
          font-weight: 600;
        }

        .btn-triangle {
          background: white;
          border: 1px solid #ccc;
          border-radius: 4px;
          width: 35px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .triangle-icon {
          width: 0;
          height: 0;
          border-top: 6px solid transparent;
          border-bottom: 6px solid transparent;
          border-left: 10px solid #28a745;
        }

        /* Department Section */
        .dept-section {
          text-align: center;
          padding: 15px 0;
        }

        .dept-title-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          color: var(--moi-blue);
          font-weight: 700;
          font-size: 18px;
        }

        .dept-logo {
          height: 85px;
          margin-bottom: 10px;
        }

        .separator-line {
          height: 1px;
          background: #ccc;
          width: 80%;
          margin: 15px auto;
        }

        /* Blue List Section - Icons on the RIGHT (Matching Image 5099) */
        .blue-list {
          background-color: var(--moi-blue);
          padding: 0;
        }

        .list-item {
          display: flex;
          justify-content: flex-end; /* Align icons to right */
          align-items: center;
          padding: 15px 20px;
          color: white;
          text-decoration: none !important;
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }

        .item-text {
          font-size: 16px;
          font-weight: 600;
          text-align: right;
          flex: 1;
          margin-right: 15px;
        }

        .item-icon-circle {
          width: 45px;
          height: 45px;
          border: 1px solid rgba(255,255,255,0.5);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .item-icon-circle img {
          width: 24px;
        }

        /* Inquiry Form - Matching Image 5101 */
        .form-section {
          padding: 30px 25px;
          text-align: center;
        }

        .form-label-moi {
          display: block;
          text-align: right;
          font-weight: 600;
          color: #555;
          margin-bottom: 8px;
          font-size: 15px;
        }

        .moi-input-field {
          width: 100%;
          height: 48px;
          border: 1px solid #ccc;
          border-radius: 5px;
          background: white;
          padding: 0 15px;
          font-size: 18px;
          text-align: right;
          margin-bottom: 20px;
          outline: none;
        }

        .btn-submit-moi {
          width: 100%;
          height: 48px;
          background: white;
          border: 1px solid var(--moi-blue);
          color: var(--moi-blue);
          font-weight: 700;
          font-size: 18px;
          border-radius: 5px;
        }

        .status-indicators {
          display: flex;
          justify-content: center;
          gap: 10px;
          margin-top: 25px;
        }

        .status-btn {
          padding: 8px 12px;
          border-radius: 5px;
          color: white;
          font-size: 13px;
          font-weight: 600;
          border: none;
          flex: 1;
        }

        /* Big Icon Circles - Matching Image 5103/5105 */
        .big-icon-container {
          background-color: var(--moi-blue);
          padding: 45px 0;
          display: flex;
          justify-content: center;
        }

        .big-circle-white {
          width: 150px;
          height: 150px;
          border: 2px solid white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .big-circle-blue {
          width: 150px;
          height: 150px;
          background-color: var(--moi-blue);
          border: 2px solid white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Footer - Matching Image 5105 (Absolute Bottom) */
        .moi-footer-sticky {
          margin-top: auto;
          background-color: var(--moi-blue);
          padding: 20px;
          text-align: center;
        }

        .social-icons-row {
          display: flex;
          justify-content: center;
          gap: 15px;
          margin-bottom: 15px;
        }

        .social-icons-row img {
          width: 24px;
          filter: brightness(0) invert(1);
        }

        .copyright-text {
          color: white;
          font-size: 12px;
          margin: 0;
          font-weight: 400;
        }

        @media (min-width: 992px) {
          .moi-perfect-clone {
            max-width: 480px;
            margin: 0 auto;
            box-shadow: 0 0 30px rgba(0,0,0,0.15);
          }
        }
      `}</style>

      {/* 1. Header - Logo & Titles on RIGHT, Tools on LEFT (Image 5099) */}
      <div className="moi-header">
        <div className="tool-bar">
          <div className="btn-triangle"><div className="triangle-icon"></div></div>
          <div className="btn-listen">
            <img src="https://www.moi.gov.kw/main/images/assets/common/ico-speaker.svg" style={{width:'16px', marginLeft:'8px'}} alt="spk" />
            <span>استمع</span>
          </div>
        </div>
        <div className="header-right">
          <div className="header-titles">
            <h1>دولة الكويت</h1>
            <h2>وزارة الداخلية</h2>
          </div>
          <img src="https://www.moi.gov.kw/main/images/assets/common/logo-moi.svg" className="moi-logo-img" alt="MOI" />
        </div>
      </div>

      {/* 2. Navbar */}
      <div className="moi-nav-bar">
        <div className="menu-icon">☰</div>
      </div>

      {/* 3. Dept Logo Section */}
      <div className="dept-section">
        <div className="dept-title-container">
          <img src="https://www.moi.gov.kw/main/images/assets/general-traffic/logo-general-traffic.svg" className="dept-logo" alt="Traffic" />
          <span>الإدارة العامة للمرور</span>
        </div>
        <div className="separator-line"></div>
      </div>

      {/* 4. Blue List - Icons on RIGHT (Image 5099) */}
      <div className="blue-list">
        {[
          { text: "الخدمات الالكترونية لرخص السوق", icon: "renew-license" },
          { text: "دفع المخالفات", icon: "payment", isCommon: true },
          { text: "نظام مواعيد اختبار القيادة", icon: "booking" },
          { text: "معاملات المرور", icon: "procedures" },
          { text: "مواقع الإدارة العامة للمرور", icon: "locations-sections" },
          { text: "شروط منح رخص السوق لغير الكويتيين", icon: "pdf-doc", isCommon: true }
        ].map((item, idx) => (
          <a key={idx} href="#" className="list-item">
            <div className="item-text">{item.text}</div>
            <div className="item-icon-circle">
              <img src={`https://www.moi.gov.kw/main/images/assets/${item.isCommon ? 'common' : 'general-traffic'}/ico-${item.icon}.svg`} alt="icon" />
            </div>
          </a>
        ))}
      </div>

      {/* 5. Inquiry Form (Image 5101) */}
      <div className="form-section">
        <div className="dept-title-container" style={{fontSize:'18px', marginBottom:'5px'}}>الإدارة العامة للمرور</div>
        <div className="separator-line" style={{width:'60%', margin:'10px auto 30px'}}></div>
        
        <form onSubmit={handleInquire}>
          <label className="form-label-moi">Enquiry Type</label>
          <select className="moi-input-field" value={enquiryType} onChange={e => setEnquiryType(e.target.value)}>
            <option value="1">الأفراد</option>
            <option value="2">الشركات</option>
          </select>

          <label className="form-label-moi">الرقم المدني أو الرقم الموحد</label>
          <input type="text" className="moi-input-field" value={civilId} onChange={e => setCivilId(e.target.value)} />

          <button type="submit" className="btn-submit-moi">إستعلم</button>
        </form>

        <p className="mt-4" style={{fontSize:'14px', color:'#333', fontWeight:'600', lineHeight:'1.5'}}>
          بعد إجراء عملية الدفع.. يرجى عدم محاولة الدفع مرة أخرى حيث يجرى تحديث البيانات خلال 15 دقيقة
        </p>

        <div className="status-indicators">
          <button className="status-btn" style={{background:'#28a745'}}>قابلة للدفع الكترونياً</button>
          <button className="status-btn" style={{background:'#dc3545'}}>غير قابلة للدفع الكترونياً</button>
        </div>

        {results && (
          <div className="mt-4 p-3 border rounded bg-white shadow-sm">
            <h6 className="font-weight-bold">عدد المخالفات: {results.fines.length}</h6>
            <h5 className="text-danger font-weight-bold">الإجمالي: {results.totalAmount} د.ك</h5>
            <button className="btn-submit-moi mt-2" style={{background: 'var(--moi-blue)', color: 'white'}} onClick={handlePay}>إدفع الآن</button>
          </div>
        )}
      </div>

      {/* 6. Big Icon Sections (Images 5103/5105) */}
      <div className="big-icon-container">
        <div className="big-circle-white">
          <img src="https://www.moi.gov.kw/main/images/assets/common/ico-payment.svg" style={{width:'90px'}} alt="KD" />
        </div>
      </div>
      
      <div style={{height:'20px'}}></div>

      <div className="big-icon-container" style={{backgroundColor:'white'}}>
        <div className="big-circle-blue">
           <img src="https://www.moi.gov.kw/main/images/assets/common/ico-case-track.svg" style={{width:'90px', filter: 'brightness(0) invert(1)'}} alt="case" />
        </div>
      </div>

      <div style={{height:'20px'}}></div>

      <div className="big-icon-container">
        <div className="big-circle-white">
          <img src="https://www.moi.gov.kw/main/images/assets/common/ico-get-ref-num.svg" style={{width:'90px'}} alt="ref" />
        </div>
      </div>

      {/* 7. Reference Inquiry Section (Image 5105) */}
      <div className="form-section" style={{paddingTop:'10px'}}>
        <div className="dept-title-container" style={{fontSize:'18px', margin:'20px 0'}}>الإستعلام عن رقم مرجع الداخلية</div>
        <div className="separator-line" style={{width:'100%', margin:'0 0 25px'}}></div>
        <input type="text" className="moi-input-field" placeholder="الرقم المدني" style={{background:'#fff'}} />
        <button className="btn-submit-moi mb-2" style={{background:'#f2f2f2', border:'1px solid #ddd'}}>للكويتيين</button>
        <button className="btn-submit-moi" style={{background:'#f2f2f2', border:'1px solid #ddd'}}>للمقيمين</button>
      </div>

      {/* 8. New Services Circle */}
      <div className="big-icon-container" style={{padding:'50px 0'}}>
        <div className="big-circle-white" style={{background:'transparent', border:'3px solid white'}}>
          <div style={{color:'white', textAlign:'center'}}>
            <div style={{fontSize:'24px', fontWeight:'700'}}>أحدث</div>
            <div style={{fontSize:'11px', margin:'2px 0'}}>New Services</div>
            <div style={{fontSize:'24px', fontWeight:'700'}}>الخدمات</div>
          </div>
        </div>
      </div>

      {/* 9. Footer (Image 5105) */}
      <footer className="moi-footer-sticky">
        <div className="social-icons-row">
          <img src="https://www.moi.gov.kw/main/images/assets/social-media/ico-youtube.svg" alt="yt" />
          <img src="https://www.moi.gov.kw/main/images/assets/social-media/ico-instagram.svg" alt="ig" />
          <img src="https://www.moi.gov.kw/main/images/assets/social-media/ico-twitter.svg" alt="tw" />
          <img src="https://www.moi.gov.kw/main/images/assets/social-media/ico-facebook.svg" alt="fb" />
          <img src="https://www.moi.gov.kw/main/images/assets/common/ico-android.svg" alt="android" />
          <img src="https://www.moi.gov.kw/main/images/assets/common/ico-apple.svg" alt="apple" />
        </div>
        <p className="copyright-text">© جميع الحقوق محفوظة لوزارة الداخلية-دولة الكويت - 2026</p>
      </footer>

      {isSearching && (
        <div style={{position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.5)', display:'flex', justifyContent:'center', alignItems:'center', zIndex:9999}}>
          <div className="spinner-border text-white" role="status"></div>
        </div>
      )}
    </div>
  );
}
