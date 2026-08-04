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
  descriptionAr: string;
  payableOnline: string;
  plateNumber: string;
  plateCode: string;
  violationType?: string;
  vehicleType?: string;
  fineType?: string;
  isPaid?: boolean;
  blackPoints?: number;
  speed?: string;
  speedLimit?: string;
  make?: string;
  model?: string;
  yearOfManufacture?: string;
  majorColor?: string;
  platePurposeType?: string;
  [key: string]: any;
}

interface ParsedData {
  success: boolean;
  fines: Fine[];
  totalAmount: string;
  totalFines?: number;
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
        return { success: false, fines: [], totalAmount: '0.00', errorMessage: data?.errorMsg || 'لا توجد بيانات' };
      }

      const fines: Fine[] = [];

      if (data.ExportGroupViolationsList) {
        data.ExportGroupViolationsList.forEach((item: any) => {
          const d = item.ExportGrpKuwaitViolationDetails;
          if (!d) return;

          const descriptions = [];
          const codes = [];
          for (let i = 1; i <= 6; i++) {
            const desc = d[`Violation${i}Description`];
            const code = d[`Violation${i}Code`];
            if (desc) {
              descriptions.push(desc);
              if (code) codes.push(code);
            }
          }

          const amount = d.Amount || d.amount || "0";
          const numericAmount = parseFloat(String(amount).replace(/[^0-9.]/g, "")) || 0;

          fines.push({
            ticketNo: String(d.TicketNumber || d.ticketNumber || ''),
            amount: numericAmount.toFixed(2),
            dateTime: d.DateHappened ? `${d.DateHappened.split('T')[0]} ${d.TimeHappened || ''}`.trim() : '',
            location: d.PlaceOfViolation || d.placeOfViolation || '',
            locationAr: d.PlaceOfViolation || '',
            source: 'وزارة الداخلية الكويتية',
            sourceAr: 'وزارة الداخلية',
            description: descriptions.join('\n'),
            descriptionAr: descriptions.join('\n'),
            payableOnline: d.PayableOnline || d.payableOnline || 'N',
            plateNumber: d.PlateNumber || d.plateNumber || '',
            plateCode: d.PlateCode || d.plateCode || '',
            violationType: d.Type || d.type || 'D',
            vehicleType: d.Make || d.Model || 'سيارة',
            fineType: d.PayableOnline === 'Y' ? 'payable' : 'unpayable',
            isPaid: false,
            blackPoints: 0,
            violationCode: codes.join(', '),
            platePurposeType: d.PlatePurposeType || '',
            make: d.Make || '',
            model: d.Model || '',
            yearOfManufacture: d.YearOfManufacture || '',
            majorColor: d.MajorColor || '',
            speed: d.Speed || '',
            speedLimit: d.SpeedLimit || '',
          });
        });
      } else if (data.personalViolationsData || data.companyViolationsData) {
        const personalFines = Array.isArray(data.personalViolationsData) ? data.personalViolationsData : [];
        const companyFines = Array.isArray(data.companyViolationsData) ? data.companyViolationsData : [];
        const allTickets = [...personalFines, ...companyFines];

        for (const ticket of allTickets) {
          const amount = ticket.amount || ticket.Amount || "0";
          const numericAmount = parseFloat(String(amount).replace(/[^0-9.]/g, "")) || 0;

          fines.push({
            ticketNo: String(ticket.ticketNumber || ticket.TicketNumber || ''),
            amount: numericAmount.toFixed(2),
            dateTime: ticket.dateHappened ? `${ticket.dateHappened.split('T')[0]} ${ticket.timeHappened || ''}`.trim() : '',
            location: ticket.location || ticket.placeOfViolation || '',
            locationAr: ticket.location || '',
            source: ticket.trafficDepartment || 'وزارة الداخلية الكويتية',
            sourceAr: ticket.beneficiary || 'وزارة الداخلية',
            description: ticket.violationDescription || ticket.description || '',
            descriptionAr: ticket.violationDescriptionAr || ticket.violationDescription || '',
            payableOnline: ticket.payableOnline || 'N',
            plateNumber: ticket.plateNumber || '',
            plateCode: ticket.plateCode || '',
            violationType: ticket.type || '',
            fineType: ticket.isPayable === 2 ? 'payable' : ticket.licenseShouldbePresented ? 'blackpoints' : 'unpayable',
            isPaid: ticket.isPaid || false,
            blackPoints: ticket.blackPoints || 0,
          });
        }
      }

      const total = fines.reduce((sum, f) => sum + parseFloat(f.amount || "0"), 0);
      return {
        success: true,
        fines,
        totalAmount: total.toFixed(2),
        totalFines: fines.length,
      };
    } catch (e) {
      return { success: false, fines: [], totalAmount: '0.00', errorMessage: 'خطأ في معالجة البيانات' };
    }
  }, []);

  const handleInquire = useCallback(() => {
    const paddedCivilId = (civilId || '').replace(/\s+/g, '').padStart(12, '0');
    if (paddedCivilId.length < 8 || !/^\d+$/.test(paddedCivilId)) {
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
          // Handle the response from the backend which returns mapped fines
          if (data?.fines && Array.isArray(data.fines)) {
            // Backend returns already-mapped fines
            const backendFines: Fine[] = data.fines.map((f: any) => ({
              ...f,
              amount: f.amount || '0',
              locationAr: f.location || '',
              descriptionAr: f.description || '',
              sourceAr: f.source || '',
            }));
            const total = backendFines.reduce((sum: number, f: Fine) => sum + parseFloat(f.amount || "0"), 0);
            setParsedData({
              success: true,
              fines: backendFines,
              totalAmount: total.toFixed(2),
              totalFines: backendFines.length,
            });
          } else {
            const result = parseMoiData(data);
            setParsedData(result);
          }
        },
        onError: (err) => {
          setLoading(false);
          toast({ variant: 'destructive', title: 'خطأ في الاتصال', description: err.message });
          setParsedData({ success: false, fines: [], totalAmount: '0.00', errorMessage: err.message });
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
    const totalSelected = selectedFines.reduce((sum, t) => sum + parseFloat(t.amount || "0"), 0);

    sessionStorage.setItem(
      'paymentData',
      JSON.stringify({
        selectedFines,
        totalAmount: totalSelected.toFixed(2),
        civilId: (civilId || '').replace(/\s+/g, '').padStart(12, '0'),
        enquiryType: enquiryType,
      })
    );
    setLocation('/payment');
  };

  const hasSelected = selectedTickets.size > 0;
  const selectableFines = parsedData?.fines.filter(f => f.payableOnline === 'Y' || f.fineType === 'payable') || [];
  const allSelectableChecked = selectableFines.length > 0 && selectableFines.every(f => selectedTickets.has(f.ticketNo));

  const selectAll = () => {
    if (allSelectableChecked) {
      setSelectedTickets(new Set());
    } else {
      setSelectedTickets(new Set(selectableFines.map(f => f.ticketNo)));
    }
  };

  return (
    <div className="bg-[#f2f2f2] min-h-screen text-right font-sans" dir="rtl" style={{ fontFamily: 'Arial, sans-serif' }}>
      {/* Header - matches MOI website */}
      <div className="bg-white border-b p-2 md:p-3 flex justify-between items-center shadow-sm">
        <img src="https://www.moi.gov.kw/main/images/assets/common/logo-moi.svg" alt="MOI" className="h-8 md:h-12" />
        <img src="https://www.moi.gov.kw/main/images/assets/general-traffic/logo-general-traffic.svg" alt="Traffic" className="h-6 md:h-10" />
      </div>

      <div className="max-w-3xl mx-auto px-3 md:px-4 py-4">
        {/* Page Title */}
        <div className="text-center mb-4">
          <h1 className="text-[#003366] text-base md:text-lg font-bold" style={{ textDecoration: 'underline', textUnderlineOffset: '4px' }}>
            الإدارة العامة للمرور
          </h1>
        </div>

        {/* Inquiry Form - matches MOI style */}
        <div className="bg-white rounded shadow-sm p-4 md:p-6 mb-4 border-t-4 border-[#003366]">
          <div className="space-y-4">
            {/* Enquiry Type */}
            <div className="flex items-center gap-3">
              <label className="text-sm font-semibold text-gray-700 whitespace-nowrap">نوع الاستعلام</label>
              <select
                value={enquiryType}
                onChange={(e) => setEnquiryType(e.target.value as '1' | '2')}
                className="flex-1 p-2 border border-gray-300 rounded text-sm outline-none focus:border-[#003366] bg-white"
              >
                <option value="1">أفراد</option>
                <option value="2">شركات</option>
              </select>
            </div>

            {/* Civil ID */}
            <div>
              <label className="text-sm text-gray-600 mb-1 block">الرقم المدني أو الرقم الموحد</label>
              <input
                type="text"
                value={civilId}
                onChange={(e) => setCivilId(e.target.value.replace(/[^\d]/g, '').slice(0, 12))}
                placeholder="الرقم المدني أو الرقم الموحد"
                className="w-full p-2.5 border border-gray-300 rounded text-sm outline-none focus:border-[#003366] bg-white"
                dir="ltr"
              />
            </div>

            {/* Submit Button */}
            <button
              onClick={handleInquire}
              disabled={loading}
              className="w-full md:w-auto md:px-12 bg-white text-[#003366] py-2 rounded font-bold text-sm hover:bg-[#f0f0f0] transition-all border border-[#003366]"
            >
              {loading ? 'جاري الاستعلام...' : 'إستعلم'}
            </button>
          </div>
        </div>

        {/* Results */}
        {parsedData && parsedData.success && (
          <div>
            {parsedData.fines.length === 0 ? (
              <div className="bg-white p-6 rounded-lg text-center text-green-600 font-bold border border-green-200">
                لا توجد مخالفات مسجلة على هذا الرقم.
              </div>
            ) : (
              <>
                {/* Summary Row - matches MOI: Total tickets & Total Amount */}
                <div className="bg-gray-100 rounded p-3 mb-4 flex justify-between items-center text-sm font-bold text-gray-700">
                  <span>Total tickets: {parsedData.totalFines || parsedData.fines.length}</span>
                  <span>Total Amount: {parsedData.totalAmount} KD</span>
                </div>

                {/* Violation Cards */}
                {parsedData.fines.map((fine, index) => {
                  const isPayable = fine.payableOnline === 'Y' || fine.fineType === 'payable';
                  const isPaid = fine.isPaid === true || fine.status === 'paid';
                  const isBlackpoints = fine.fineType === 'blackpoints' || fine.status === 'blackpoints';
                  const isUnpayable = !isPayable && !isBlackpoints && fine.status !== 'paid';

                  return (
                    <div
                      key={`${fine.ticketNo}-${index}`}
                      className="bg-white rounded shadow-sm overflow-hidden mb-3"
                      style={{ borderTop: `4px solid ${isPayable ? '#28a745' : '#dc3545'}` }}
                    >
                      <div className="p-3 md:p-4">
                        {/* Ticket Number Row */}
                        <div className="flex items-center gap-2 mb-2">
                          {isPayable && !isPaid && (
                            <input
                              type="checkbox"
                              checked={selectedTickets.has(fine.ticketNo)}
                              onChange={(e) => handleCheckboxChange(fine.ticketNo, e.target.checked)}
                              className="w-4 h-4 cursor-pointer accent-[#003366] flex-shrink-0"
                            />
                          )}
                          <span className="text-gray-500 text-xs">Ticket:</span>
                          <span className="font-bold text-[#003366] text-base md:text-lg">{fine.ticketNo}</span>
                        </div>

                        {/* Divider */}
                        <div className="border-t border-gray-200 my-2"></div>

                        {/* Amount */}
                        <div className="flex items-baseline gap-1 mb-1">
                          <span className="font-bold text-[#003366] text-sm">Amount:</span>
                          <span className="font-bold text-[#003366] text-sm">{fine.amount} KD</span>
                        </div>

                        {/* Plate */}
                        <div className="flex items-baseline gap-1 mb-1">
                          <span className="font-bold text-[#003366] text-sm">Plate:</span>
                          <span className="text-gray-700 text-sm">{fine.plateNumber}{fine.plateCode ? '/' + fine.plateCode : ''}</span>
                        </div>

                        {/* Date */}
                        <div className="flex items-baseline gap-1 mb-1">
                          <span className="font-bold text-[#003366] text-sm">Date:</span>
                          <span className="text-gray-700 text-sm">{fine.dateTime || fine.fineDate || ''}</span>
                        </div>

                        {/* Expand Button */}
                        <button
                          onClick={() => toggleExpand(fine.ticketNo)}
                          className="text-[#003366] text-sm mt-1 flex items-center gap-1 hover:underline"
                        >
                          <i className={`fas fa-chevron-${expandedTickets.has(fine.ticketNo) ? 'up' : 'down'}`}></i>
                        </button>

                        {/* Expanded Details */}
                        {expandedTickets.has(fine.ticketNo) && (
                          <div className="mt-3 p-3 bg-gray-50 rounded text-sm space-y-1 border-r-2 border-[#003366]">
                            {fine.location && (
                              <div>
                                <span className="font-bold text-gray-600">Place:</span>{' '}
                                <span>{fine.location}</span>
                              </div>
                            )}
                            {fine.description && (
                              <div>
                                <span className="font-bold text-gray-600">Description:</span>{' '}
                                <span>{fine.description}</span>
                              </div>
                            )}
                            {fine.fineType && fine.fineType !== 'payable' && (
                              <div>
                                <span className="font-bold text-gray-600">Type:</span>{' '}
                                <span>{fine.fineType === 'blackpoints' ? 'Black Points' : fine.fineType === 'unpayable' ? 'Non-Payable' : fine.fineType}</span>
                              </div>
                            )}
                            {fine.blackPoints ? (
                              <div>
                                <span className="font-bold text-gray-600">Black Points:</span>{' '}
                                <span>{fine.blackPoints}</span>
                              </div>
                            ) : null}
                            {fine.speed && (
                              <div>
                                <span className="font-bold text-gray-600">Speed:</span>{' '}
                                <span>{fine.speed} {fine.speedLimit ? `(Limit: ${fine.speedLimit})` : ''}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Pay Button Section - directly under violations */}
                <div className="mt-4 mb-2">
                  {/* Payment Warning */}
                  <p className="text-gray-600 text-sm text-center mb-3" dir="ltr">
                    After making the payment please do not try to pay again as it may take upto 15 minutes to update the data
                  </p>

                  {/* Pay Button */}
                  <button
                    onClick={handlePay}
                    disabled={!hasSelected}
                    className="w-full py-3 rounded font-bold text-base transition-all"
                    style={{
                      backgroundColor: hasSelected ? '#003366' : '#cccccc',
                      color: 'white',
                      cursor: hasSelected ? 'pointer' : 'not-allowed',
                    }}
                  >
                    Pay
                  </button>

                  {/* Legend */}
                  <div className="flex items-center justify-center gap-3 mt-4">
                    <span className="bg-[#28a745] text-white text-xs px-3 py-1 rounded">Payable</span>
                    <span className="bg-[#dc3545] text-white text-xs px-3 py-1 rounded">Non Payable</span>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {parsedData && !parsedData.success && (
          <div className="bg-white p-6 rounded-lg text-center text-red-600 font-bold border border-red-200">
            {parsedData.errorMessage}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 md:p-8 text-center text-gray-400 text-xs mt-8">
        © جميع الحقوق محفوظة لوزارة الداخلية - دولة الكويت - 2026
      </div>
    </div>
  );
}
