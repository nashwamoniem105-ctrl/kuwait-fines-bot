import { useState } from "react";
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
  const [selectedFines, setSelectedFines] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const queryMutation = trpc.fines.query.useMutation({
    onSuccess: (data) => {
      setIsSearching(false);
      if (data.success) {
        setResults(data);
        setSelectedFines(data.fines.filter((f: any) => f.status === "payable").map((f: any) => f.ticketNo));
      } else {
        toast({
          variant: "destructive",
          title: "خطأ",
          description: data.errorMessage || "فشل الاستعلام",
        });
      }
    },
    onError: (error) => {
      setIsSearching(false);
      toast({
        variant: "destructive",
        title: "خطأ في الاتصال",
        description: error.message,
      });
    },
  });

  const handleInquire = (e: React.FormEvent) => {
    e.preventDefault();
    if (civilId.length < 8) {
      toast({
        variant: "destructive",
        description: "البيانات المدخلة غير صحيحة",
      });
      return;
    }
    setIsSearching(true);
    setResults(null);
    queryMutation.mutate({ civilId, enquiryType: enquiryType as "1" | "2", lang: lang as "ar" | "en" });
  };

  const toggleFine = (ticketNo: string) => {
    setSelectedFines(prev => 
      prev.includes(ticketNo) 
        ? prev.filter(id => id !== ticketNo) 
        : [...prev, ticketNo]
    );
  };

  const handlePay = () => {
    if (selectedFines.length === 0) return;
    
    const selectedFinesData = results.fines.filter((f: any) => selectedFines.includes(f.ticketNo));
    const totalAmount = selectedFinesData.reduce((sum: number, f: any) => sum + parseFloat(f.amount.replace(/[^0-9.]/g, "")), 0).toFixed(2);
    
    sessionStorage.setItem("paymentData", JSON.stringify({
      selectedFines: selectedFinesData,
      totalAmount,
      civilId,
      enquiryType,
      queryId: results.queryId
    }));
    
    setLocation("/payment");
  };

  const totalPayableAmount = results?.fines
    .filter((f: any) => selectedFines.includes(f.ticketNo))
    .reduce((sum: number, f: any) => sum + parseFloat(f.amount), 0)
    .toFixed(3);

  return (
    <div className="moi-theme" dir="rtl">
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Header Section - Matching MOI website */}
        <header>
          <div className="container-fluid" style={{ backgroundColor: "#fff" }}>
            <div className="row align-items-center py-2">
              <div className="col-4 col-md-2 text-center">
                <a href="/">
                  <img src="/main/images/assets/common/logo-moi.svg" className="img-fluid" style={{ maxHeight: "120px" }} alt="Logo" />
                </a>
              </div>
              <div className="col-8 col-md-4">
                <div className="d-flex flex-column align-items-start pr-3">
                  <img src="/main/images/assets/common/ar/state-of-kuwait.svg" className="mb-2" style={{ height: "40px", maxWidth: "100%" }} alt="Kuwait" />
                  <img src="/main/images/assets/common/ar/ministry-of-interior.svg" style={{ height: "35px", maxWidth: "100%" }} alt="MOI" />
                </div>
              </div>
            </div>
          </div>
          
          <nav className="navbar navbar-expand-lg navbar-dark p-0">
            <div className="container-fluid" style={{ maxWidth: "1200px" }}>
              <button className="navbar-toggler my-2 mr-auto" type="button" data-toggle="collapse" data-target="#moiNavbar">
                <span className="navbar-toggler-icon"></span>
              </button>
              <div className="collapse navbar-collapse" id="moiNavbar">
                <ul className="navbar-nav w-100 pr-0">
                  <li className="nav-item active text-center">
                    <a className="nav-link px-4" href="/" style={{ color: "#fff", lineHeight: "40px" }}>الرئيسيــة</a>
                  </li>
                  <li className="nav-item text-center">
                    <a className="nav-link px-4" href="#" style={{ color: "#fff", lineHeight: "40px" }}>الخدمات الإلكترونيـة</a>
                  </li>
                  <li className="nav-item text-center">
                    <a className="nav-link px-4" href="#" style={{ color: "#fff", lineHeight: "40px" }}>إدارات توعوية</a>
                  </li>
                  <li className="nav-item text-center">
                    <a className="nav-link px-4" href="#" style={{ color: "#fff", lineHeight: "40px" }}>أرقام الطوارئ</a>
                  </li>
                  <li className="nav-item text-center">
                    <a className="nav-link px-4" href="#" style={{ color: "#fff", lineHeight: "40px" }}>منصة المواعيد</a>
                  </li>
                </ul>
              </div>
            </div>
          </nav>
        </header>

        {/* Main Content Area - Side menu on RIGHT (first in RTL DOM), content on LEFT */}
        <div className="row no-gutters" style={{ margin: 0, background: "#E9E6DE", minHeight: "500px" }}>
          
          {/* Side Menu - RIGHT side (first in RTL flow) */}
          <div className="col-12 col-md-4 order-md-2" style={{ 
            backgroundColor: "#000576",
            color: "#fff",
            padding: 0,
            boxSizing: "border-box",
          }}>
            <a href="#" style={{ color: "#fff", textDecoration: "none", display: "block" }}>
              <div style={{ padding: "15px 15px", borderBottom: "1px solid rgba(255,255,255,0.15)", display: "flex", alignItems: "center" }}>
                <img src="/main/images/assets/general-traffic/ico-renew-license.svg" style={{ width: "3.4em" }} />
                <span style={{ fontSize: "0.85rem", fontWeight: "bold", marginRight: "10px" }}>الخدمات الالكترونية لرخص السوق</span>
              </div>
            </a>
            <a href="#" style={{ color: "#fff", textDecoration: "none", display: "block" }}>
              <div style={{ padding: "15px 15px", borderBottom: "1px solid rgba(255,255,255,0.15)", display: "flex", alignItems: "center", backgroundColor: "#fff", color: "#000576" }}>
                <img src="/main/images/assets/common/ico-payment.svg" style={{ width: "3.4em" }} />
                <span style={{ fontSize: "0.85rem", fontWeight: "bold", marginRight: "10px", color: "#000576" }}>دفع المخالفات</span>
              </div>
            </a>
            <a href="#" style={{ color: "#fff", textDecoration: "none", display: "block" }}>
              <div style={{ padding: "15px 15px", borderBottom: "1px solid rgba(255,255,255,0.15)", display: "flex", alignItems: "center" }}>
                <img src="/main/images/assets/general-traffic/ico-booking.svg" style={{ width: "3.4em" }} />
                <span style={{ fontSize: "0.85rem", fontWeight: "bold", marginRight: "10px" }}>نظام مواعيد اختبار القيادة</span>
              </div>
            </a>
            <a href="#" style={{ color: "#fff", textDecoration: "none", display: "block" }}>
              <div style={{ padding: "15px 15px", borderBottom: "1px solid rgba(255,255,255,0.15)", display: "flex", alignItems: "center" }}>
                <img src="/main/images/assets/general-traffic/ico-procedures.svg" style={{ width: "3.4em" }} />
                <span style={{ fontSize: "0.85rem", fontWeight: "bold", marginRight: "10px" }}>معاملات المرور</span>
              </div>
            </a>
            <a href="#" style={{ color: "#fff", textDecoration: "none", display: "block" }}>
              <div style={{ padding: "15px 15px", borderBottom: "1px solid rgba(255,255,255,0.15)", display: "flex", alignItems: "center" }}>
                <img src="/main/images/assets/general-traffic/ico-locations-sections.svg" style={{ width: "3.4em" }} />
                <span style={{ fontSize: "0.85rem", fontWeight: "bold", marginRight: "10px" }}>مواقع الإدارة العامة للمرور</span>
              </div>
            </a>
            <a href="/main/content/docs/gdt/driving-license-conditions.pdf" style={{ color: "#fff", textDecoration: "none", display: "block" }}>
              <div style={{ padding: "15px 15px", display: "flex", alignItems: "center" }}>
                <img src="/main/images/assets/common/ico-pdf-doc.svg" style={{ width: "3.4em" }} />
                <span style={{ fontSize: "0.85rem", fontWeight: "bold", marginRight: "10px" }}>شروط منح رخص السوق لغير الكويتيين</span>
              </div>
            </a>
          </div>

          {/* Main Content - LEFT side */}
          <div className="col-12 col-md-8 order-md-1" style={{ 
            padding: "30px 25px",
            backgroundColor: "#E9E6DE",
            boxSizing: "border-box",
          }}>
            <div style={{ textAlign: "center", paddingTop: "15px" }}>
              <h4 style={{ color: "#000576", fontWeight: "bold", fontSize: "1.1rem" }}>الإدارة العامة للمرور</h4>
              <div style={{ marginTop: "8px", marginBottom: "20px" }}>
                <img src="/main/images/assets/common/ico-horizontal-bar.svg" alt="bar" style={{ maxWidth: "100%" }} />
              </div>
            </div>

            <form onSubmit={handleInquire} style={{ maxWidth: "600px", margin: "0 auto" }}>
              <div style={{ marginBottom: "25px" }}>
                <label style={{ fontWeight: "bold", marginBottom: "8px", display: "block", color: "#333" }}>نوع الاستعلام</label>
                <select 
                  id="enquiryType"
                  style={{ 
                    width: "100%", 
                    padding: "8px 12px", 
                    fontSize: "1rem",
                    borderRadius: "0",
                    border: "1px solid #ccc",
                    backgroundColor: "#fff",
                    color: "#000576",
                    height: "42px",
                    boxSizing: "border-box"
                  }}
                  value={enquiryType} 
                  onChange={(e) => setEnquiryType(e.target.value)}
                >
                  <option value="1">الأفراد</option>
                  <option value="2">الشركات</option>
                </select>
              </div>

              <div style={{ marginBottom: "25px" }}>
                <label style={{ fontWeight: "bold", marginBottom: "8px", display: "block", color: "#333" }}>
                  {enquiryType === "1" ? "الرقم المدني أو الرقم الموحد" : "الرقم الموحد للشركة"}
                </label>
                <input 
                  id="civilId"
                  type="text"
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    fontSize: "1.2rem",
                    fontWeight: "bold",
                    borderRadius: "0",
                    border: "1px solid #ccc",
                    backgroundColor: "#fff",
                    color: "#000576",
                    textAlign: "center",
                    height: "42px",
                    boxSizing: "border-box"
                  }}
                  value={civilId}
                  onChange={(e) => setCivilId(e.target.value)}
                  maxLength={12}
                  placeholder="أدخل الرقم هنا"
                />
              </div>

              <div style={{ display: "flex", justifyContent: "center" }}>
                <button 
                  id="btnEnquire"
                  type="submit" 
                  style={{
                    backgroundColor: "#000576",
                    color: "#fff",
                    border: "none",
                    padding: "10px 50px",
                    fontSize: "1rem",
                    fontWeight: "bold",
                    cursor: "pointer",
                    height: "42px",
                    minWidth: "180px",
                    borderRadius: "0",
                  }}
                  disabled={isSearching}
                >
                  {isSearching ? "جاري البحث..." : "إستعلم"}
                </button>
              </div>
            </form>

            {/* Results Display */}
            {results && results.success && results.fines.length === 0 && (
              <div style={{ 
                marginTop: "30px", 
                padding: "15px", 
                backgroundColor: "#d1ecf1", 
                color: "#0c5460", 
                border: "1px solid #bee5eb",
                textAlign: "center",
                fontWeight: "bold"
              }}>
                Person does not have any Violations
              </div>
            )}

            {results && results.success && results.fines.length > 0 && (
              <div style={{ marginTop: "40px", maxWidth: "700px", margin: "40px auto 0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "2px solid #000576", paddingBottom: "10px", marginBottom: "20px", fontWeight: "bold" }}>
                  <span>عدد المخالفات: {results.totalFines}</span>
                  <span style={{ color: "#cc0000" }}>الإجمالي: {results.totalAmount} دك</span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {results.fines.map((fine: any, index: number) => (
                    <div key={index} style={{ 
                      border: "1px solid #ddd", 
                      borderRight: `5px solid ${fine.status === 'payable' ? '#28a745' : '#dc3545'}`,
                      borderRadius: "0",
                      backgroundColor: "#fff"
                    }}>
                      <div style={{ 
                        display: "flex", 
                        justifyContent: "space-between", 
                        alignItems: "center", 
                        padding: "10px 15px", 
                        backgroundColor: "#f8f9fa",
                        borderBottom: "1px solid #ddd"
                      }}>
                        <div style={{ display: "flex", alignItems: "center" }}>
                          {fine.status === 'payable' && (
                            <input 
                              type="checkbox" 
                              checked={selectedFines.includes(fine.ticketNo)}
                              onChange={() => toggleFine(fine.ticketNo)}
                              style={{ marginLeft: "10px", width: "18px", height: "18px" }}
                            />
                          )}
                          <span style={{ fontWeight: "bold", fontSize: "0.85rem" }}>رقم المخالفة: {fine.ticketNo}</span>
                        </div>
                        <span style={{ 
                          padding: "3px 10px", 
                          fontSize: "0.7rem", 
                          color: "#fff",
                          borderRadius: "3px",
                          backgroundColor: fine.status === 'payable' ? '#28a745' : '#dc3545'
                        }}>
                          {fine.status === 'payable' ? 'قابلة للدفع' : 'غير قابلة للدفع'}
                        </span>
                      </div>
                      <div style={{ padding: "12px 15px", fontSize: "0.85rem" }}>
                        <div style={{ display: "flex", gap: "20px", marginBottom: "8px", flexWrap: "wrap" }}>
                          <span><b>القيمة:</b> {fine.amount} دك</span>
                          <span><b>التاريخ:</b> {fine.dateTime}</span>
                        </div>
                        <div style={{ borderTop: "1px solid #eee", paddingTop: "8px" }}>
                          <b>الوصف:</b> {fine.description}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {results.fines.length > 0 && (
                  <div style={{ marginTop: "25px", padding: "15px 20px", backgroundColor: "#fff", border: "1px solid #ddd", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <h5 style={{ margin: 0, fontWeight: "bold", color: "#28a745" }}>
                        إجمالي المختار: {totalPayableAmount} دك
                      </h5>
                      <button 
                        style={{
                          backgroundColor: "#000576",
                          color: "#fff",
                          border: "none",
                          padding: "10px 40px",
                          fontSize: "1rem",
                          fontWeight: "bold",
                          cursor: selectedFines.length > 0 ? "pointer" : "not-allowed",
                          borderRadius: "0",
                          opacity: selectedFines.length === 0 ? 0.6 : 1
                        }}
                        onClick={handlePay}
                        disabled={selectedFines.length === 0}
                      >
                        إدفع
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer - Matching original MOI */}
        <footer style={{ 
          backgroundColor: "#000576", 
          color: "#fff", 
          padding: "20px 0", 
          textAlign: "center",
          marginTop: 0
        }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 15px" }}>
            <p style={{ margin: 0, fontSize: "12px" }}>جميع الحقوق محفوظة © وزارة الداخلية - دولة الكويت 2026</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
