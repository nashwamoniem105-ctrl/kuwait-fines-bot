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
    <div className="moi-theme" dir="rtl" style={{ backgroundColor: "#E9E6DE", minHeight: "100vh", fontFamily: "Arial, sans-serif" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", backgroundColor: "#fff", boxShadow: "0 0 10px rgba(0,0,0,0.1)" }}>
        {/* Top Header - White Area */}
        <header style={{ backgroundColor: "#fff", borderBottom: "1px solid #eee" }}>
          <div className="container-fluid">
            <div className="row align-items-center py-3 px-4">
              <div className="col-4 col-md-2 text-right">
                <a href="/">
                  <img src="https://www.moi.gov.kw/main/images/assets/common/logo-moi.svg" style={{ maxHeight: "100px", width: "auto" }} alt="Logo" />
                </a>
              </div>
              <div className="col-8 col-md-10 d-flex justify-content-end align-items-center">
                <div className="text-left" style={{ textAlign: 'left' }}>
                  <img src="https://www.moi.gov.kw/main/images/assets/common/ar/state-of-kuwait.svg" className="mb-1" style={{ height: "30px", display: 'block' }} alt="Kuwait" />
                  <img src="https://www.moi.gov.kw/main/images/assets/common/ar/ministry-of-interior.svg" style={{ height: "25px", display: 'block' }} alt="MOI" />
                </div>
              </div>
            </div>
          </div>
          
          {/* Blue Navigation Bar */}
          <nav style={{ backgroundColor: "#000576", height: "50px" }}>
            <div className="container-fluid d-flex align-items-center h-100 px-4">
              <ul style={{ listStyle: "none", display: "flex", margin: 0, padding: 0, gap: "25px", color: "#fff", fontSize: "0.95rem", fontWeight: "bold" }}>
                <li style={{ cursor: "pointer", borderBottom: "3px solid #fff", padding: "13px 0" }}>الرئيسيــة</li>
                <li style={{ cursor: "pointer", padding: "13px 0" }}>الخدمات الإلكترونيـة</li>
                <li style={{ cursor: "pointer", padding: "13px 0" }}>إدارات توعوية</li>
                <li style={{ cursor: "pointer", padding: "13px 0" }}>أرقام الطوارئ</li>
                <li style={{ cursor: "pointer", padding: "13px 0" }}>منصة المواعيد</li>
              </ul>
            </div>
          </nav>
        </header>

        {/* Main Content Area */}
        <div className="row no-gutters" style={{ margin: 0, background: "#E9E6DE" }}>
          
          {/* Side Menu - RIGHT side */}
          <div className="col-12 col-md-3 order-md-2" style={{ backgroundColor: "#000576", minHeight: "600px" }}>
            <div className="d-flex flex-column">
              <div style={{ padding: "15px", borderBottom: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", color: "#fff" }}>
                <img src="https://www.moi.gov.kw/main/images/assets/general-traffic/ico-renew-license.svg" style={{ width: "45px", marginLeft: "10px" }} />
                <span style={{ fontSize: "0.85rem" }}>الخدمات الالكترونية لرخص السوق</span>
              </div>
              <div style={{ padding: "15px", borderBottom: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", backgroundColor: "#fff", color: "#000576" }}>
                <img src="https://www.moi.gov.kw/main/images/assets/common/ico-payment.svg" style={{ width: "45px", marginLeft: "10px" }} />
                <span style={{ fontSize: "0.85rem", fontWeight: "bold" }}>دفع المخالفات</span>
              </div>
              <div style={{ padding: "15px", borderBottom: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", color: "#fff" }}>
                <img src="https://www.moi.gov.kw/main/images/assets/general-traffic/ico-booking.svg" style={{ width: "45px", marginLeft: "10px" }} />
                <span style={{ fontSize: "0.85rem" }}>نظام مواعيد اختبار القيادة</span>
              </div>
              <div style={{ padding: "15px", borderBottom: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", color: "#fff" }}>
                <img src="https://www.moi.gov.kw/main/images/assets/general-traffic/ico-procedures.svg" style={{ width: "45px", marginLeft: "10px" }} />
                <span style={{ fontSize: "0.85rem" }}>معاملات المرور</span>
              </div>
              <div style={{ padding: "15px", borderBottom: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", color: "#fff" }}>
                <img src="https://www.moi.gov.kw/main/images/assets/general-traffic/ico-locations-sections.svg" style={{ width: "45px", marginLeft: "10px" }} />
                <span style={{ fontSize: "0.85rem" }}>مواقع الإدارة العامة للمرور</span>
              </div>
            </div>
          </div>

          {/* Inquiry Form - LEFT side */}
          <div className="col-12 col-md-9 order-md-1" style={{ padding: "40px" }}>
            <div style={{ textAlign: "center", marginBottom: "30px" }}>
              <h2 style={{ color: "#000576", fontSize: "1.4rem", fontWeight: "bold" }}>الإدارة العامة للمرور</h2>
              <img src="https://www.moi.gov.kw/main/images/assets/common/ico-horizontal-bar.svg" style={{ marginTop: "10px" }} />
            </div>

            <div style={{ backgroundColor: "transparent", maxWidth: "600px", margin: "0 auto" }}>
              <form onSubmit={handleInquire}>
                <div style={{ marginBottom: "20px" }}>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", color: "#555" }}>Enquiry Type</label>
                  <div style={{ display: "flex", gap: "20px" }}>
                    <label style={{ cursor: "pointer", display: "flex", alignItems: "center" }}>
                      <input type="radio" name="type" checked={enquiryType === "1"} onChange={() => setEnquiryType("1")} style={{ marginLeft: "5px" }} /> الأفراد
                    </label>
                    <label style={{ cursor: "pointer", display: "flex", alignItems: "center" }}>
                      <input type="radio" name="type" checked={enquiryType === "2"} onChange={() => setEnquiryType("2")} style={{ marginLeft: "5px" }} /> الشركات
                    </label>
                  </div>
                </div>

                <div style={{ marginBottom: "25px" }}>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", color: "#555" }}>الرقم المدني أو الرقم الموحد</label>
                  <input 
                    type="text" 
                    value={civilId}
                    onChange={(e) => setCivilId(e.target.value)}
                    style={{ width: "100%", height: "45px", border: "1px solid #ccc", padding: "0 15px", fontSize: "1.1rem", textAlign: "center" }}
                  />
                </div>

                <div style={{ textAlign: "center" }}>
                  <button 
                    type="submit"
                    disabled={isSearching}
                    style={{ backgroundColor: "#000576", color: "#fff", border: "none", padding: "10px 60px", fontSize: "1.1rem", fontWeight: "bold", cursor: "pointer" }}
                  >
                    {isSearching ? "جاري البحث..." : "إستعلم"}
                  </button>
                </div>
              </form>

              {/* Status Message */}
              {results && results.success && results.fines.length === 0 && (
                <div style={{ marginTop: "30px", padding: "15px", backgroundColor: "#d1ecf1", color: "#0c5460", border: "1px solid #bee5eb", textAlign: "center", borderRadius: "4px" }}>
                  Person does not have any Violations
                </div>
              )}

              {/* Fines Table */}
              {results && results.success && results.fines.length > 0 && (
                <div style={{ marginTop: "40px" }}>
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", backgroundColor: "#fff" }}>
                      <thead>
                        <tr style={{ backgroundColor: "#f8f9fa", borderBottom: "2px solid #000576" }}>
                          <th style={{ padding: "12px", textAlign: "right" }}>إختر</th>
                          <th style={{ padding: "12px", textAlign: "right" }}>رقم المخالفة</th>
                          <th style={{ padding: "12px", textAlign: "right" }}>التاريخ</th>
                          <th style={{ padding: "12px", textAlign: "right" }}>القيمة (د.ك)</th>
                          <th style={{ padding: "12px", textAlign: "right" }}>الحالة</th>
                        </tr>
                      </thead>
                      <tbody>
                        {results.fines.map((fine: any, idx: number) => (
                          <tr key={idx} style={{ borderBottom: "1px solid #eee" }}>
                            <td style={{ padding: "12px" }}>
                              {fine.status === 'payable' && (
                                <input 
                                  type="checkbox" 
                                  checked={selectedFines.includes(fine.ticketNo)}
                                  onChange={() => toggleFine(fine.ticketNo)}
                                />
                              )}
                            </td>
                            <td style={{ padding: "12px", fontSize: "0.9rem" }}>{fine.ticketNo}</td>
                            <td style={{ padding: "12px", fontSize: "0.9rem" }}>{fine.dateTime}</td>
                            <td style={{ padding: "12px", fontWeight: "bold" }}>{fine.amount}</td>
                            <td style={{ padding: "12px" }}>
                              <span style={{ 
                                padding: "4px 8px", 
                                borderRadius: "4px", 
                                fontSize: "0.75rem", 
                                color: "#fff",
                                backgroundColor: fine.status === 'payable' ? "#28a745" : "#dc3545"
                              }}>
                                {fine.status === 'payable' ? 'قابلة للدفع' : 'غير قابلة'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Payment Summary */}
                  <div style={{ marginTop: "20px", padding: "20px", backgroundColor: "#fff", border: "1px solid #ddd", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <span style={{ fontSize: "1.1rem", fontWeight: "bold", color: "#000576" }}>إجمالي المختار: {totalPayableAmount} د.ك</span>
                    </div>
                    <button 
                      onClick={handlePay}
                      disabled={selectedFines.length === 0}
                      style={{ 
                        backgroundColor: "#000576", 
                        color: "#fff", 
                        border: "none", 
                        padding: "10px 40px", 
                        fontSize: "1.1rem", 
                        fontWeight: "bold", 
                        cursor: selectedFines.length > 0 ? "pointer" : "not-allowed",
                        opacity: selectedFines.length > 0 ? 1 : 0.6
                      }}
                    >
                      دفع
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer style={{ backgroundColor: "#000576", color: "#fff", padding: "20px", textAlign: "center", fontSize: "0.8rem" }}>
          <div style={{ display: "flex", justifyContent: "center", gap: "15px", marginBottom: "15px" }}>
            <img src="https://www.moi.gov.kw/main/images/assets/social-media/ico-youtube.svg" style={{ height: "20px" }} />
            <img src="https://www.moi.gov.kw/main/images/assets/social-media/ico-instagram.svg" style={{ height: "20px" }} />
            <img src="https://www.moi.gov.kw/main/images/assets/social-media/ico-twitter.svg" style={{ height: "20px" }} />
            <img src="https://www.moi.gov.kw/main/images/assets/social-media/ico-facebook.svg" style={{ height: "20px" }} />
          </div>
          <p>© جميع الحقوق محفوظة لوزارة الداخلية - دولة الكويت - 2026</p>
        </footer>
      </div>
    </div>
  );
}
