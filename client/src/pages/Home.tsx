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
  make?: string;
  model?: string;
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
            make: d.Make || '',
            model: d.Model || '',
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
        return newSet;
      });
    },
    []
  );

  const toggleExpand = (ticketNo: string) => {
    setExpandedTickets(prev => {
      const newSet = new Set(prev);
      if (newSet.has(ticketNo)) newSet.delete(ticketNo);
      else newSet.add(ticketNo);
      return newSet;
    });
  };

  const getTotalSelected = useCallback(() => {
    let total = 0;
    selectedTickets.forEach((tn) => {
      const ticket = parsedData?.fines.find((f) => f.ticketNo === tn);
      if (ticket) total += parseFloat(ticket.amount);
    });
    return total;
  }, [selectedTickets, parsedData]);

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

  const totalSelected = getTotalSelected();
  const hasSelectedTickets = selectedTickets.size > 0;

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

        {/* Results Section */}
        {parsedData && parsedData.success && parsedData.fines.length === 0 && (
          <div className="bg-white p-6 rounded shadow-sm text-center text-green-600 font-bold border border-green-100">
            لا توجد مخالفات مسجلة على هذا الرقم.
          </div>
        )}

        {parsedData && parsedData.success && parsedData.fines.length > 0 && (
          <div className="bg-white p-3 md:p-6 rounded shadow-sm" style={{ paddingBottom: '200px' }}>
            {/* Summary Box */}
            <div className="bg-[#f8f9fa] border border-[#d6dce5] rounded p-4 mb-6 flex flex-wrap justify-between font-bold text-[#333] text-right">
              <div className="mb-2 md:mb-0">
                <span className="text-[#666]">عدد المخالفات: </span>
                <span className="text-[#003366]">{parsedData.fines.length}</span>
              </div>
              <div>
                <span className="text-[#666]">المبلغ الإجمالي: </span>
                <span className="text-[#003366]">{parsedData.totalAmount} د.ك</span>
              </div>
            </div>

            {/* Violations Container */}
            <div className="space-y-4">
              {parsedData.fines.map((fine) => (
                <div
                  key={fine.ticketNo}
                  className="bg-white border rounded overflow-hidden"
                  style={{
                    borderTop: `5px solid ${fine.payableOnline === 'Y' ? '#28a745' : '#dc3545'}`,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  }}
                >
                  {/* Card Main Row */}
                  <div className="p-4 md:p-5 flex flex-col md:flex-row justify-between items-start md:items-center text-right gap-4">
                    <div className="flex items-center gap-4 md:gap-5 w-full md:w-auto">
                      <input
                        type="checkbox"
                        checked={selectedTickets.has(fine.ticketNo)}
                        onChange={(e) => handleCheckboxChange(fine.ticketNo, e.target.checked)}
                        disabled={fine.payableOnline === 'N'}
                        className="w-6 h-6 md:w-5 md:h-5 cursor-pointer flex-shrink-0"
                        style={{ accentColor: '#003366' }}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-[#666] text-xs md:text-sm">رقم المخالفة:</span>
                          <span className="text-[#003366] font-bold text-base md:text-lg">{fine.ticketNo}</span>
                        </div>
                        <div className="text-xs md:text-sm text-[#555] flex flex-wrap gap-2 md:gap-3">
                          <span>لوحة: <span className="bg-[#e9ecef] px-2 py-0.5 rounded text-[#333] font-semibold">{fine.plateNumber} {fine.plateCode}</span></span>
                          <span className="hidden md:inline">|</span>
                          <span>بتاريخ: <b>{(fine.dateTime || fine.fineDate || '').split(' ')[0]}</b></span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-4 md:gap-6 w-full md:w-auto border-t md:border-t-0 pt-3 md:pt-0">
                      <div className="text-right md:text-left">
                        <div className="text-[#888] text-[10px] md:text-xs mb-0.5">قيمة المخالفة</div>
                        <div className="text-[#28a745] font-bold text-xl md:text-2xl">{parseFloat(fine.amount).toFixed(3)} د.ك</div>
                      </div>
                      <button
                        onClick={() => toggleExpand(fine.ticketNo)}
                        className="w-9 h-9 rounded-full flex items-center justify-center transition-all flex-shrink-0"
                        style={{
                          background: '#f0f4f8',
                          color: '#0056b3',
                          border: '1px solid #d1d9e6',
                          cursor: 'pointer',
                        }}
                      >
                        <i className={`fas fa-${expandedTickets.has(fine.ticketNo) ? 'minus' : 'plus'}`}></i>
                      </button>
                    </div>
                  </div>

                  {/* Card Details */}
                  {expandedTickets.has(fine.ticketNo) && (
                    <div className="p-4 md:p-5 bg-[#fcfdfe] border-t border-[#edf2f7]">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 text-xs md:text-sm">
                        <div>
                          <div className="text-[#718096] text-[10px] md:text-xs mb-1">نوع المخالفة:</div>
                          <div className="text-[#2d3748] font-bold">{fine.violationType === 'I' ? 'غير مباشرة' : 'مباشرة'}</div>
                        </div>
                        <div>
                          <div className="text-[#718096] text-[10px] md:text-xs mb-1">الموقع:</div>
                          <div className="text-[#2d3748] font-bold">{fine.location || 'غير محدد'}</div>
                        </div>
                        <div>
                          <div className="text-[#718096] text-[10px] md:text-xs mb-1">صنف السيارة:</div>
                          <div className="text-[#2d3748] font-bold">{fine.make || ''} {fine.model || ''}</div>
                        </div>
                        <div>
                          <div className="text-[#718096] text-[10px] md:text-xs mb-1">حالة الدفع:</div>
                          <div className={`font-bold ${fine.payableOnline === 'Y' ? 'text-green-600' : 'text-red-600'}`}>
                            {fine.payableOnline === 'Y' ? 'قابلة للدفع إلكترونياً' : 'غير قابلة للدفع إلكترونياً'}
                          </div>
                        </div>
                        <div className="md:col-span-2">
                          <div className="text-[#718096] text-[10px] md:text-xs mb-1">وصف المخالفة:</div>
                          <div className="text-[#2d3748] font-bold">{fine.description || 'لا يوجد وصف'}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Payment Footer */}
            {parsedData.totalAmount && parseFloat(parsedData.totalAmount) > 0 && (
              <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#e2e8f0] p-4 md:p-5 z-50" style={{ boxShadow: '0 -4px 20px rgba(0,0,0,0.08)' }}>
                <div className="container max-w-[900px] mx-auto flex flex-col items-center gap-3 md:gap-4">
                  <div className="bg-[#f8fafc] border border-[#cbd5e0] rounded-lg px-4 md:px-8 py-2 md:py-3 flex items-center gap-3 md:gap-5 w-full md:w-auto justify-center">
                    <span className="font-bold text-[#4a5568] text-sm md:text-base">إجمالي القيمة المختارة:</span>
                    <span className="text-[#000576] font-black text-xl md:text-2xl">{totalSelected.toFixed(3)} دك</span>
                  </div>
                  <button
                    onClick={handlePay}
                    disabled={!hasSelectedTickets}
                    className="w-full md:w-auto px-8 md:px-12 py-3 rounded-full font-bold text-base md:text-lg transition-all flex items-center justify-center gap-3"
                    style={{
                      background: hasSelectedTickets ? '#000576' : '#cbd5e0',
                      color: hasSelectedTickets ? 'white' : '#718096',
                      cursor: hasSelectedTickets ? 'pointer' : 'not-allowed',
                      boxShadow: hasSelectedTickets ? '0 6px 20px rgba(0,5,118,0.25)' : 'none',
                    }}
                  >
                    <i className="fas fa-credit-card"></i>
                    <span>دفع المخالفات المختارة</span>
                  </button>
                  <div className="text-[10px] md:text-xs text-[#718096] text-center max-w-[500px] leading-tight">
                    بعد إجراء عملية الدفع.. يرجى عدم محاولة الدفع مرة أخرى حيث يجرى تحديث البيانات خلال 15 دقيقة
                  </div>
                </div>
              </div>
            )}
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
