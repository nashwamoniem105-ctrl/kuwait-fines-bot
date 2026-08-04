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

  // Load FontAwesome for icons
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
    // Use the absolute URL if needed, but local path is better for routing
    setLocation('/payment');
  };

  const hasSelected = selectedTickets.size > 0;

  return (
    <div className="bg-[#f2f2f2] min-h-screen text-right font-sans" dir="rtl">
      {/* Header */}
      <div className="bg-white border-b p-4 flex justify-between items-center">
        <img src="https://www.moi.gov.kw/main/images/assets/common/logo-moi.svg" alt="MOI" className="h-12" />
        <img src="https://www.moi.gov.kw/main/images/assets/general-traffic/logo-general-traffic.svg" alt="Traffic" className="h-10" />
      </div>

      <div className="container max-w-2xl mx-auto p-4">
        {/* Inquiry Form */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-[#003366] text-xl font-bold text-center mb-6">الاستعلام عن المخالفات</h2>
          <div className="space-y-4">
            <div className="flex justify-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" checked={enquiryType === '1'} onChange={() => setEnquiryType('1')} /> الأفراد
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" checked={enquiryType === '2'} onChange={() => setEnquiryType('2')} /> الشركات
              </label>
            </div>
            <input
              type="text"
              value={civilId}
              onChange={(e) => setCivilId(e.target.value)}
              placeholder="الرقم المدني"
              className="w-full p-3 border rounded text-center text-lg outline-none focus:border-[#003366]"
            />
            <button
              onClick={handleInquire}
              disabled={loading}
              className="w-full bg-[#003366] text-white py-3 rounded font-bold text-lg hover:bg-[#002244]"
            >
              {loading ? 'جاري الاستعلام...' : 'إستعلم'}
            </button>
          </div>
        </div>

        {/* Results */}
        {parsedData && parsedData.success && (
          <div className="space-y-4 pb-24">
            {parsedData.fines.length === 0 ? (
              <div className="bg-white p-6 rounded-lg text-center text-green-600 font-bold">
                لا توجد مخالفات مسجلة.
              </div>
            ) : (
              <>
                {parsedData.fines.map((fine) => (
                  <div key={fine.ticketNo} className="bg-white rounded-lg shadow-md overflow-hidden border-t-4 border-[#28a745]">
                    <div className="p-4">
                      {/* Row 1: Checkbox + Ticket Number */}
                      <div className="flex items-center gap-3 mb-3">
                        <input
                          type="checkbox"
                          checked={selectedTickets.has(fine.ticketNo)}
                          onChange={(e) => handleCheckboxChange(fine.ticketNo, e.target.checked)}
                          disabled={fine.payableOnline === 'N'}
                          className="w-6 h-6 cursor-pointer"
                        />
                        <div className="flex-1">
                          <span className="text-gray-500 text-sm ml-2">رقم المخالفة:</span>
                          <span className="font-bold text-lg text-[#003366]">{fine.ticketNo}</span>
                        </div>
                      </div>

                      {/* Row 2: Amount + Plate Number */}
                      <div className="grid grid-cols-2 gap-2 mb-2 text-sm border-t pt-2">
                        <div>
                          <span className="text-gray-500 ml-1">القيمة:</span>
                          <span className="font-bold text-green-600">{fine.amount} د.ك</span>
                        </div>
                        <div>
                          <span className="text-gray-500 ml-1">اللوحة:</span>
                          <span className="font-bold">{fine.plateNumber} {fine.plateCode}</span>
                        </div>
                      </div>

                      {/* Row 3: Date + Time */}
                      <div className="text-sm text-gray-600 mb-3">
                        <i className="far fa-calendar-alt ml-1"></i>
                        <span>{fine.dateTime}</span>
                      </div>

                      {/* Row 4: Expand Arrow */}
                      <div className="flex justify-center border-t pt-2">
                        <button onClick={() => toggleExpand(fine.ticketNo)} className="text-[#003366] w-full py-1">
                          <i className={`fas fa-chevron-${expandedTickets.has(fine.ticketNo) ? 'up' : 'down'}`}></i>
                        </button>
                      </div>

                      {/* Expanded Details */}
                      {expandedTickets.has(fine.ticketNo) && (
                        <div className="mt-3 p-3 bg-gray-50 rounded text-xs space-y-2">
                          <div><span className="text-gray-500">الموقع:</span> {fine.location}</div>
                          <div><span className="text-gray-500">الوصف:</span> {fine.description}</div>
                          <div><span className="text-gray-500">الحالة:</span> {fine.payableOnline === 'Y' ? 'قابلة للدفع' : 'غير قابلة للدفع'}</div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Pay Button - Positioned under the violations */}
                <div className="mt-8 flex justify-center">
                  <button
                    onClick={handlePay}
                    className="w-full py-4 rounded-lg font-bold text-xl shadow-lg transition-colors"
                    style={{
                      backgroundColor: hasSelected ? '#f2f2f2' : '#007bff',
                      color: hasSelected ? '#333' : '#white',
                      border: hasSelected ? '1px solid #ccc' : 'none'
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
          <div className="bg-white p-6 rounded-lg text-center text-red-600 font-bold">
            {parsedData.errorMessage}
          </div>
        )}
      </div>
    </div>
  );
}
