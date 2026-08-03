import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { Loader2, RotateCcw, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const { lang } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [civilId, setCivilId] = useState("");
  const [enquiryType, setEnquiryType] = useState("1");
  const [results, setResults] = useState<any>(null);
  const [selectedFines, setSelectedFines] = useState<string[]>([]);

  const queryMutation = trpc.fines.query.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        setResults(data);
        // Default select all payable fines
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
        description: "يرجى إدخال رقم مدني صحيح",
      });
      return;
    }
    queryMutation.mutate({ civilId, enquiryType, lang: lang as "ar" | "en" });
  };

  const handleReset = () => {
    setCivilId("");
    setResults(null);
    setSelectedFines([]);
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
    
    navigate("/payment");
  };

  return (
    <div className="min-h-screen bg-[#f4f4f4] font-cairo text-[#333]" dir="rtl">
      {/* Top Header with Logos */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-2 flex justify-between items-center">
          <div className="flex items-center gap-4">
             <img src="/logo-moi.svg" alt="MOI Logo" className="h-16" />
          </div>
          <div className="flex gap-4 items-center">
            <img src="/state-of-kuwait.svg" alt="Kuwait State" className="h-10" />
            <img src="/ministry-of-interior.svg" alt="Ministry of Interior" className="h-12" />
          </div>
        </div>
        <nav className="bg-[#003366] text-white py-2">
          <div className="container mx-auto px-4 flex justify-between items-center text-sm font-bold">
            <div className="flex gap-6">
              <span className="hover:text-gray-300 cursor-pointer">الرئيسيــة</span>
              <span className="hover:text-gray-300 cursor-pointer border-b-2 border-white pb-1">الخدمات الإلكترونيـة</span>
              <span className="hover:text-gray-300 cursor-pointer">إدارات توعوية</span>
              <span className="hover:text-gray-300 cursor-pointer">أرقام الطوارئ</span>
            </div>
            <div className="flex gap-4">
              <span className="cursor-pointer">English</span>
            </div>
          </div>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="bg-white rounded shadow-sm border border-gray-200 overflow-hidden">
          {/* Section Title */}
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h1 className="text-xl font-bold text-[#003366] flex items-center gap-3">
              <img src="/logo-general-traffic.svg" alt="Traffic" className="h-10" />
              الإدارة العامة للمرور
            </h1>
          </div>

          <CardContent className="p-6">
            {!results ? (
              <div className="max-w-xl mx-auto py-10">
                <form onSubmit={handleInquire} className="space-y-8 text-right">
                  <div className="space-y-4">
                    <label className="block font-bold text-gray-700 text-lg">Enquiry Type</label>
                    <div className="flex gap-8 justify-end items-center bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <label className="flex items-center gap-3 cursor-pointer text-lg">
                        <span>الأفراد</span>
                        <input 
                          type="radio" 
                          name="type" 
                          value="1" 
                          checked={enquiryType === "1"} 
                          onChange={(e) => setEnquiryType(e.target.value)}
                          className="w-5 h-5 accent-[#003366]"
                        />
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer text-lg">
                        <span>الشركات</span>
                        <input 
                          type="radio" 
                          name="type" 
                          value="2" 
                          checked={enquiryType === "2"} 
                          onChange={(e) => setEnquiryType(e.target.value)}
                          className="w-5 h-5 accent-[#003366]"
                        />
                      </label>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="block font-bold text-gray-700 text-lg">الرقم المدني أو الرقم الموحد</label>
                    <Input
                      value={civilId}
                      onChange={(e) => setCivilId(e.target.value)}
                      placeholder="أدخل الرقم المدني"
                      className="text-center text-2xl py-8 border-2 border-gray-300 focus:border-[#003366] rounded-md"
                      maxLength={12}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    disabled={queryMutation.isPending}
                    className="w-full py-8 bg-[#003366] hover:bg-[#002244] text-white font-bold text-xl rounded shadow-md transition-all"
                  >
                    {queryMutation.isPending ? <Loader2 className="animate-spin h-8 w-8" /> : "إستعلم"}
                  </Button>
                </form>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Summary Info */}
                <div className="bg-[#f8f9fa] p-5 rounded border border-gray-300 flex flex-row-reverse justify-around items-center">
                  <div className="text-right">
                    <div className="text-gray-600 text-sm mb-1">عدد المخالفات</div>
                    <div className="text-[#003366] font-bold text-2xl">{results.totalFines}</div>
                  </div>
                  <div className="h-10 w-px bg-gray-300"></div>
                  <div className="text-right">
                    <div className="text-gray-600 text-sm mb-1">المبلغ الاجمالي</div>
                    <div className="text-[#003366] font-bold text-2xl">{results.totalAmount} دك</div>
                  </div>
                </div>

                {/* Violations Grid - Matching Kuwait MOI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                  {results.fines.map((fine: any, idx: number) => (
                    <div 
                      key={idx} 
                      className={`relative bg-white border border-gray-300 rounded-md shadow-sm text-right overflow-hidden ${
                        fine.status === 'payable' ? 'border-t-4 border-t-green-600' : 'border-t-4 border-t-red-600'
                      }`}
                    >
                      <div className="p-5 space-y-3">
                        <div className="flex justify-between items-center border-b border-gray-100 pb-3 mb-2">
                          {fine.status === 'payable' && (
                            <input 
                              type="checkbox" 
                              checked={selectedFines.includes(fine.ticketNo)}
                              onChange={() => toggleFine(fine.ticketNo)}
                              className="w-6 h-6 accent-green-600 cursor-pointer"
                            />
                          )}
                          <div className="text-[#003366] font-bold text-lg">
                            رقم: <span className="text-gray-800">{fine.ticketNo}</span>
                          </div>
                        </div>
                        
                        <div className="space-y-2 text-base">
                          <div className="flex justify-between flex-row-reverse">
                            <span className="text-gray-600">قيمة المخالفة:</span>
                            <span className="font-bold text-[#003366]">{fine.amount} دك</span>
                          </div>
                          <div className="flex justify-between flex-row-reverse">
                            <span className="text-gray-600">رقم اللوحة:</span>
                            <span className="font-bold">{fine.plateNumber || "---"}</span>
                          </div>
                          <div className="flex justify-between flex-row-reverse">
                            <span className="text-gray-600">تاريخ المخالفة:</span>
                            <span className="font-bold">{fine.dateTime}</span>
                          </div>
                        </div>

                        {fine.description && (
                          <div className="mt-4 p-3 bg-gray-50 rounded text-sm text-gray-700 border border-gray-100 leading-relaxed">
                            {fine.description}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {results.fines.length === 0 && (
                  <div className="text-center py-16 bg-green-50 rounded-lg border-2 border-dashed border-green-200">
                    <CheckCircle2 className="mx-auto h-16 w-16 text-green-600 mb-4" />
                    <p className="text-2xl font-bold text-green-800">لا توجد مخالفات مسجلة على هذا الرقم</p>
                  </div>
                )}

                {/* Footer Actions */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12 pt-6 border-t border-gray-200">
                  {selectedFines.length > 0 && (
                    <Button 
                      onClick={handlePay}
                      className="bg-green-600 hover:bg-green-700 text-white font-bold py-7 px-16 text-xl rounded shadow-lg transition-all"
                    >
                      دفع المختارة ({selectedFines.length})
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    onClick={handleReset}
                    className="border-2 border-[#003366] text-[#003366] hover:bg-gray-50 py-7 px-16 text-xl rounded font-bold transition-all"
                  >
                    <RotateCcw className="ml-3 h-6 w-6" />
                    استعلام جديد
                  </Button>
                </div>

                <div className="mt-10 p-5 bg-blue-50 border-r-4 border-blue-600 rounded shadow-sm text-right">
                  <p className="text-blue-900 font-bold text-lg mb-2">ملاحظة هامة:</p>
                  <p className="text-blue-800 text-base">بعد إجراء عملية الدفع.. يرجى عدم محاولة الدفع مرة أخرى حيث يجرى تحديث البيانات خلال 15 دقيقة.</p>
                </div>
              </div>
            )}
          </CardContent>
        </div>
      </main>

      <footer className="bg-[#003366] text-white py-10 mt-20 border-t-4 border-yellow-500">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center gap-8 mb-6">
            <span className="text-3xl hover:text-yellow-500 cursor-pointer transition-colors">𝕏</span>
            <span className="text-3xl hover:text-yellow-500 cursor-pointer transition-colors">f</span>
            <span className="text-3xl hover:text-yellow-500 cursor-pointer transition-colors">📷</span>
            <span className="text-3xl hover:text-yellow-500 cursor-pointer transition-colors">▶️</span>
          </div>
          <p className="text-base opacity-80">البوابة الإلكترونية لوزارة الداخلية - دولة الكويت</p>
          <p className="text-sm mt-2 opacity-60">© جميع الحقوق محفوظة لوزارة الداخلية - 2026</p>
        </div>
      </footer>
    </div>
  );
}
