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
  const [selectedTickets, setSelectedTickets] = useState<Set<string>>(new Set());
  const [enquiryType, setEnquiryType] = useState<'1' | '2'>('1');
  const [civilId, setCivilId] = useState('');
  const [expandedTickets, setExpandedTickets] = useState<Set<string>>(new Set());

  const queryMutation = trpc.fines.query.useMutation();

  // Load FontAwesome
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css';
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

  const handleCheckboxChange = (ticketNo: string, isChecked: boolean) => {
    setSelectedTickets((prev) => {
      const newSet = new Set(prev);
      if (isChecked) newSet.add(ticketNo);
      else newSet.delete(ticketNo);
      return newSet;
    });
  };

  const toggleExpand = (ticketNo: string) => {
    setExpandedTickets(prev => {
      const newSet = new Set(prev);
      if (newSet.has(ticketNo)) newSet.delete(ticketNo);
      else newSet.add(ticketNo);
      return newSet;
    });
  };

  const handlePay = () => {
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
  };

  const hasSelected = selectedTickets.size > 0;

  return (
    <div className="bg-[#f2f2f2] min-h-screen text-right font-sans" dir="rtl" style={{ fontFamily: 'Arial, sans-serif' }}>
      {/* Header */}
      <div className="bg-white border-b p-3 flex justify-between items-center shadow-sm">
        <img src="https://www.moi.gov.kw/main/images/assets/common/logo-moi.svg" alt="MOI" className="h-10 md:h-12" />
        <img src="https://www.moi.gov.kw/main/images/assets/general-traffic/logo-general-traffic.svg" alt="Traffic" className="h-8 md:h-10" />
      </div>

      <div className="container max-w-xl mx-auto p-4">
        {/* Inquiry Card */}
        <div className="bg-white rounded-lg shadow-sm p-5 mb-6 border-t-4 border-[#003366]">
          <h2 className="text-[#003366] text-lg font-bold text-center mb-5">الاستعلام عن المخالفات</h2>
          <div className="space-y-4">
            <div className="flex justify-center gap-6 text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" checked={enquiryType === '1'} onChange={() => setEnquiryType('1')} className="w-4 h-4" /> الأفراد
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" checked={enquiryType === '2'} onChange={() => setEnquiryType('2')} className="w-4 h-4" /> الشركات
              </label>
            </div>
            <input
              type="text"
              value={civilId}
              onChange={(e) => setCivilId(e.target.value)}
              placeholder="الرقم المدني"
              className="w-full p-3 border rounded text-center text-lg outline-none focus:border-[#003366] bg-gray-50"
            />
            <button
              onClick={handleInquire}
              disabled={loading}
              className="w-full bg-[#003366] text-white py-3 rounded font-bold text-lg hover:bg-[#002244] transition-all"
            >
              {loading ? 'جاري الاستعلام...' : 'إستعلم'}
            </button>
          </div>
        </div>

        {/* Results */}
        {parsedData && parsedData.success && (
          <div className="space-y-4">
            {parsedData.fines.length === 0 ? (
              <div className="bg-white p-6 rounded-lg text-center text-green-600 font-bold border border-green-100">
                لا توجد مخالفات مسجلة على هذا الرقم.
              </div>
            ) : (
              <>
                {parsedData.fines.map((fine) => (
                  <div key={fine.ticketNo} className="bg-white rounded-lg shadow-sm overflow-hidden border-t-4 border-[#28a745]">
                    <div className="p-4">
                      {/* Top Section: Checkbox + Ticket No */}
                      <div className="flex items-center gap-3 mb-4">
                        <input
                          type="checkbox"
                          checked={selectedTickets.has(fine.ticketNo)}
                          onChange={(e) => handleCheckboxChange(fine.ticketNo, e.target.checked)}
                          disabled={fine.payableOnline === 'N'}
                          className="w-6 h-6 cursor-pointer accent-[#003366]"
                        />
                        <div className="flex flex-col">
                          <span className="text-gray-400 text-[10px] mb-[-4px]">رقم المخالفة</span>
                          <span className="font-bold text-lg text-[#003366]">{fine.ticketNo}</span>
                        </div>
                      </div>

                      {/* Middle Section: Amount + Plate */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-gray-50 p-2 rounded">
                          <div className="text-gray-400 text-[10px] mb-1">القيمة</div>
                          <div className="font-bold text-green-600 text-lg">{fine.amount} د.ك</div>
                        </div>
                        <div className="bg-gray-50 p-2 rounded">
                          <div className="text-gray-400 text-[10px] mb-1">رقم اللوحة</div>
                          <div className="font-bold text-gray-700">{fine.plateNumber} {fine.plateCode}</div>
                        </div>
                      </div>

                      {/* Bottom Section: Date/Time + Expand */}
                      <div className="flex justify-between items-center border-t pt-3">
                        <div className="text-xs text-gray-500">
                          <i className="far fa-clock ml-1"></i>
                          <span>{fine.dateTime}</span>
                        </div>
                        <button onClick={() => toggleExpand(fine.ticketNo)} className="text-[#003366] p-1">
                          <i className={`fas fa-chevron-${expandedTickets.has(fine.ticketNo) ? 'up' : 'down'}`}></i>
                        </button>
                      </div>

                      {/* Expanded Details */}
                      {expandedTickets.has(fine.ticketNo) && (
                        <div className="mt-3 p-3 bg-blue-50 rounded text-xs space-y-2 border-r-2 border-[#003366]">
                          <div><span className="text-gray-500 font-bold ml-1">الموقع:</span> {fine.location}</div>
                          <div><span className="text-gray-500 font-bold ml-1">الوصف:</span> {fine.description}</div>
                          <div><span className="text-gray-500 font-bold ml-1">الحالة:</span> {fine.payableOnline === 'Y' ? 'قابلة للدفع إلكترونياً' : 'غير قابلة للدفع'}</div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Pay Button - Positioned Under Violations */}
                <div className="mt-10 mb-20">
                  <button
                    onClick={handlePay}
                    disabled={!hasSelected}
                    className="w-full py-4 rounded-xl font-bold text-xl shadow-lg transition-all border-2"
                    style={{
                      backgroundColor: hasSelected ? '#f2f2f2' : '#007bff',
                      color: hasSelected ? '#003366' : 'white',
                      borderColor: hasSelected ? '#ddd' : '#007bff',
                    }}
                  >
                    ادفع
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {parsedData && !parsedData.success && (
          <div className="bg-white p-6 rounded-lg text-center text-red-600 font-bold border border-red-100">
            {parsedData.errorMessage}
          </div>
        )}
      </div>
      
      {/* Footer */}
      <div className="p-8 text-center text-gray-400 text-xs">
        © جميع الحقوق محفوظة لوزارة الداخلية - الإدارة العامة للمرور
      </div>
    </div>
  );
}
