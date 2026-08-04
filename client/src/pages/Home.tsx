import { useState, useCallback, useEffect } from 'react';
import { useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';
import { useToast } from '@/hooks/use-toast';

interface Fine {
  ticketNo: string;
  amount: string;
  dateTime: string;
  location: string;
  source: string;
  description: string;
  payableOnline: string;
  plateNumber: string;
  plateCode: string;
  violationType?: string;
  vehicleType?: string;
  [key: string]: any;
}

interface ParsedData {
  success: boolean;
  fines: Fine[];
  totalAmount: string;
  errorMessage?: string;
}

export default function Home() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [payingAmount, setPayingAmount] = useState(0);
  const [selectedTickets, setSelectedTickets] = useState<Set<string>>(new Set());
  const [enquiryType, setEnquiryType] = useState<'1' | '2'>('1');
  const [civilId, setCivilId] = useState('');
  const [expandedTickets, setExpandedTickets] = useState<Set<string>>(new Set());

  const queryMutation = trpc.fines.query.useMutation();

  // Load FontAwesome
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css';
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  const parseMoiData = useCallback((data: any): ParsedData => {
    try {
      if (!data || (data.errorMsg && !data.ExportGroupViolationsList && !data.totalTicketsCount)) {
        return { success: false, fines: [], totalAmount: '0.000', errorMessage: data.errorMsg || 'لا توجد بيانات' };
      }

      const fines: Fine[] = [];

      if (data.ExportGroupViolationsList) {
        data.ExportGroupViolationsList.forEach((item: any) => {
          const d = item.ExportGrpKuwaitViolationDetails;
          if (!d) return;

          const descriptions = [];
          for (let i = 1; i <= 6; i++) if (d[`Violation${i}Description`]) descriptions.push(d[`Violation${i}Description`]);

          fines.push({
            ticketNo: d.TicketNumber || '',
            amount: parseFloat(d.Amount || 0).toFixed(3),
            dateTime: d.DateHappened ? d.DateHappened.replace('T', ' ') : '',
            location: d.PlaceOfViolation || '',
            source: 'وزارة الداخلية',
            description: descriptions.join(' - '),
            payableOnline: d.PayableOnline || 'N',
            plateNumber: d.PlateNumber || '',
            plateCode: d.PlateCode || '',
            violationType: d.ViolationType || 'D',
            vehicleType: d.Make || d.Model || 'سيارة',
          });
        });
      }

      const total = fines.reduce((sum, f) => sum + parseFloat(f.amount), 0);
      return { success: true, fines, totalAmount: total.toFixed(3) };
    } catch (e) {
      return { success: false, fines: [], totalAmount: '0.000', errorMessage: 'خطأ في معالجة البيانات' };
    }
  }, []);

  const handleInquire = useCallback(() => {
    const paddedCivilId = (civilId || '').padStart(12, '0');
    if (paddedCivilId.length < 8) {
      toast({ variant: 'destructive', description: 'يرجى إدخال الرقم المدني بشكل صحيح' });
      return;
    }

    setLoading(true);
    setParsedData(null);
    setSelectedTickets(new Set());
    setPayingAmount(0);
    setExpandedTickets(new Set());

    queryMutation.mutate(
      { civilId: paddedCivilId, enquiryType, lang: 'ar' },
      {
        onSuccess: (data: any) => {
          setLoading(false);
          const result = parseMoiData(data);
          setParsedData(result);
        },
        onError: (err) => {
          setLoading(false);
          toast({ variant: 'destructive', title: 'خطأ في الاتصال', description: err.message });
          setParsedData({ success: false, fines: [], errorMessage: err.message });
        },
      }
    );
  }, [civilId, enquiryType, queryMutation, parseMoiData, toast]);

  const handleCheckboxChange = useCallback(
    (ticketNo: string, isChecked: boolean) => {
      setSelectedTickets((prev) => {
        const newSet = new Set(prev);
        if (isChecked) {
          newSet.add(ticketNo);
        } else {
          newSet.delete(ticketNo);
        }
        let total = 0;
        newSet.forEach((tn) => {
          const ticket = parsedData?.fines.find((f) => f.ticketNo === tn);
          if (ticket) total += parseFloat(ticket.amount);
        });
        setPayingAmount(total);
        return newSet;
      });
    },
    [parsedData]
  );

  const toggleExpand = (ticketNo: string) => {
    setExpandedTickets(prev => {
      const newSet = new Set(prev);
      if (newSet.has(ticketNo)) newSet.delete(ticketNo);
      else newSet.add(ticketNo);
      return newSet;
    });
  };

  const handlePay = useCallback(() => {
    if (selectedTickets.size === 0) return;
    const selectedFines = (parsedData?.fines || []).filter((f) => selectedTickets.has(f.ticketNo));
    const totalSelected = selectedFines.reduce((sum, t) => sum + parseFloat(t.amount), 0);

    sessionStorage.setItem(
      'paymentData',
      JSON.stringify({
        selectedFines,
        totalAmount: totalSelected.toFixed(3),
        civilId: (civilId || '').padStart(12, '0'),
      })
    );
    setLocation('/payment');
  }, [selectedTickets, parsedData, civilId, setLocation]);

  // Get background color for payment button
  const getPayButtonBgColor = () => {
    if (payingAmount === 0) {
      return '#f2f2f2'; // Same as page background
    }
    return '#007bff'; // Blue
  };

  return (
    <div className="bg-[#f2f2f2] min-h-screen text-right" dir="rtl" style={{ fontFamily: "'Cairo', sans-serif" }}>
      {/* Official Header Simulation */}
      <div className="bg-white border-b border-[#ddd] p-2">
        <div className="container max-w-[1200px] mx-auto flex justify-between items-center">
          <img src="https://www.moi.gov.kw/main/images/assets/common/logo-moi.svg" alt="MOI" className="h-[50px] md:h-[60px]" />
          <div className="flex items-center gap-4">
            <span className="text-[#003366] text-sm cursor-pointer hidden md:block">English</span>
            <img src="https://www.moi.gov.kw/main/images/assets/general-traffic/logo-general-traffic.svg" alt="Traffic" className="h-[40px]" />
          </div>
        </div>
      </div>

      <div className="container max-w-[1200px] mx-auto py-6 px-4">
        {/* Enquiry Card */}
        <div className="bg-white rounded shadow-sm border-t-[5px] border-[#003366] mb-6 overflow-hidden">
          <div className="p-6">
            <h2 className="text-[#003366] text-xl font-bold text-center mb-6 border-b border-[#eee] pb-4">الإدارة العامة للمرور</h2>
            <div className="max-w-[450px] mx-auto space-y-4">
              <div className="flex justify-center gap-8 mb-4">
                <label className="flex items-center gap-2 cursor-pointer text-sm">
                  <input type="radio" checked={enquiryType === '1'} onChange={() => setEnquiryType('1')} className="w-4 h-4" /> الأفراد
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-sm">
                  <input type="radio" checked={enquiryType === '2'} onChange={() => setEnquiryType('2')} className="w-4 h-4" /> الشركات
                </label>
              </div>
              <input
                type="text"
                value={civilId}
                onChange={(e) => setCivilId(e.target.value)}
                placeholder="الرقم المدني أو الرقم الموحد"
                className="w-full p-3 border border-[#ccc] rounded text-center text-lg focus:outline-none focus:border-[#003366]"
              />
              <button
                onClick={handleInquire}
                disabled={loading}
                className="w-full bg-[#003366] text-white py-3 rounded font-bold text-lg hover:bg-[#002244] transition-colors disabled:opacity-70"
              >
                {loading ? 'جاري الاستعلام...' : 'إستعلم'}
              </button>
            </div>
          </div>
        </div>

        {/* Results Section - New Card Design */}
        {parsedData && parsedData.success && (
          <div id="responseInfo">
            {/* Summary Alert */}
            <div className="alert alert-secondary bg-[#f8f9fa] border border-[#d6dce5] rounded p-4 mb-6 flex flex-wrap justify-between font-bold text-[#333]">
              <div className="w-full md:w-1/2 mb-2 md:mb-0">
                <b>عدد المخالفات</b>: {parsedData.fines.length}
              </div>
              <div className="w-full md:w-1/2">
                <b>المبلغ الاجمالي</b>: {parsedData.totalAmount} دك
              </div>
            </div>

            {/* Fines Grid - New Card Design */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {parsedData.fines.map((fine) => (
                <div 
                  key={fine.ticketNo} 
                  className="bg-white rounded-lg shadow-md overflow-hidden border-t-4"
                  style={{ borderTopColor: fine.payableOnline === 'Y' ? '#22c55e' : '#ef4444' }}
                >
                  {/* Card Header with Checkbox and Ticket Number */}
                  <div className="p-4 border-b border-[#e5e7eb]">
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <input
                        type="checkbox"
                        checked={selectedTickets.has(fine.ticketNo)}
                        onChange={(e) => handleCheckboxChange(fine.ticketNo, e.target.checked)}
                        disabled={fine.payableOnline === 'N'}
                        className="w-5 h-5 cursor-pointer accent-[#003366]"
                      />
                      <div className="flex-1">
                        <div className="text-[#000576] font-bold text-lg">
                          {fine.ticketNo}
                        </div>
                      </div>
                    </div>

                    {/* Main Info */}
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="font-semibold text-[#333]">قيمة المخالفة:</span>
                        <span className="text-[#000576] font-bold">{fine.amount} دك</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-semibold text-[#333]">رقم اللوحة:</span>
                        <span className="text-[#555]">{fine.plateNumber} / {fine.plateCode}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-semibold text-[#333]">التاريخ والوقت:</span>
                        <span className="text-[#555]">{fine.dateTime}</span>
                      </div>
                    </div>
                  </div>

                  {/* Expandable Details */}
                  <div className="p-4">
                    <button
                      onClick={() => toggleExpand(fine.ticketNo)}
                      className="w-full flex items-center justify-between text-[#000576] hover:text-[#003366] transition-colors"
                    >
                      <span className="font-semibold">التفاصيل</span>
                      <i className={`fas fa-chevron-${expandedTickets.has(fine.ticketNo) ? 'up' : 'down'} text-lg`}></i>
                    </button>

                    {expandedTickets.has(fine.ticketNo) && (
                      <div className="mt-4 pt-4 border-t border-[#e5e7eb] space-y-3 text-sm">
                        <div>
                          <span className="font-semibold text-[#333]">نوع المخالفة:</span>
                          <p className="text-[#555] mt-1">{fine.violationType === 'I' ? 'غير مباشرة' : 'مباشرة'}</p>
                        </div>
                        <div>
                          <span className="font-semibold text-[#333]">الموقع:</span>
                          <p className="text-[#555] mt-1">{fine.location || 'غير محدد'}</p>
                        </div>
                        <div>
                          <span className="font-semibold text-[#333]">الوصف:</span>
                          <p className="text-[#555] mt-1">{fine.description || 'لا يوجد وصف متاح'}</p>
                        </div>
                        <div className={`font-bold mt-3 p-2 rounded ${fine.payableOnline === 'Y' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                          {fine.payableOnline === 'Y' ? '✓ قابلة للدفع إلكترونياً' : '✗ غير قابلة للدفع إلكترونياً'}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Payment Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="mb-6">
                <div className="text-right font-bold text-sm mb-4 leading-relaxed text-[#666]">
                  بعد إجراء عملية الدفع.. يرجى عدم محاولة الدفع مرة أخرى حيث يجرى تحديث البيانات خلال 15 دقيقة
                </div>

                {payingAmount > 0 && (
                  <div className="mb-4 text-left font-bold text-[#000576] text-lg bg-[#f0f4ff] p-3 rounded">
                    إجمالي القيمة المختارة: {payingAmount.toFixed(3)} دك
                  </div>
                )}
              </div>

              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="w-full md:w-auto">
                  <button
                    id="btnPay"
                    onClick={handlePay}
                    disabled={payingAmount === 0}
                    className="w-full md:w-auto px-8 py-3 rounded font-bold text-lg transition-all duration-300"
                    style={{
                      backgroundColor: getPayButtonBgColor(),
                      color: payingAmount === 0 ? '#999' : 'white',
                      cursor: payingAmount === 0 ? 'not-allowed' : 'pointer',
                      border: payingAmount === 0 ? '2px solid #ddd' : 'none'
                    }}
                  >
                    ادفع
                  </button>
                </div>

                <div className="flex gap-3 flex-wrap justify-end">
                  <span className="bg-green-600 text-white text-xs px-3 py-2 rounded">✓ قابلة للدفع إلكترونياً</span>
                  <span className="bg-red-600 text-white text-xs px-3 py-2 rounded">✗ غير قابلة للدفع إلكترونياً</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {parsedData && !parsedData.success && (
          <div className="bg-white p-8 rounded shadow-sm text-center text-red-600 font-bold border border-red-100">
            {parsedData.errorMessage}
          </div>
        )}
      </div>

      {/* Footer Simulation */}
      <footer className="bg-[#003366] text-white py-8 mt-12">
        <div className="container max-w-[1200px] mx-auto px-4 text-center">
          <p className="text-sm">© جميع الحقوق محفوظة لوزارة الداخلية - الإدارة العامة للمرور</p>
        </div>
      </footer>
    </div>
  );
}
