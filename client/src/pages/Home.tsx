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
          for (let i = 1; i <= 6; i++) {
            const desc = d[`Violation${i}Description`];
            if (desc) descriptions.push(desc);
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
          if (data?.fines && Array.isArray(data.fines)) {
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
    <div
      dir="rtl"
      style={{
        backgroundColor: '#f2f2f2',
        minHeight: '100vh',
        fontFamily: 'Arial, sans-serif',
        direction: 'rtl',
      }}
    >
      {/* Header */}
      <div
        style={{
          backgroundColor: '#fff',
          borderBottom: '1px solid #ddd',
          padding: '10px 15px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <img src="https://www.moi.gov.kw/main/images/assets/common/logo-moi.svg" alt="MOI" style={{ height: '45px' }} />
        <img src="https://www.moi.gov.kw/main/images/assets/general-traffic/logo-general-traffic.svg" alt="Traffic" style={{ height: '35px' }} />
      </div>

      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '15px' }}>
        {/* Page Title */}
        <div style={{ textAlign: 'center', marginBottom: '15px' }}>
          <h1 style={{ color: '#003366', fontSize: '18px', fontWeight: 'bold', textDecoration: 'underline', textUnderlineOffset: '4px' }}>
            الإدارة العامة للمرور
          </h1>
        </div>

        {/* Inquiry Form */}
        <div style={{ backgroundColor: '#fff', borderRadius: '6px', padding: '15px', marginBottom: '15px', borderTop: '4px solid #003366' }}>
          {/* Enquiry Type */}
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', color: '#333', marginBottom: '5px' }}>نوع الاستعلام</label>
            <select
              value={enquiryType}
              onChange={(e) => setEnquiryType(e.target.value as '1' | '2')}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '14px',
                backgroundColor: '#fff',
              }}
            >
              <option value="1">أفراد</option>
              <option value="2">شركات</option>
            </select>
          </div>

          {/* Civil ID */}
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: '13px', color: '#666', marginBottom: '5px' }}>الرقم المدني أو الرقم الموحد</label>
            <input
              type="text"
              value={civilId}
              onChange={(e) => setCivilId(e.target.value.replace(/[^\d]/g, '').slice(0, 12))}
              placeholder="الرقم المدني أو الرقم الموحد"
              dir="ltr"
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '14px',
                textAlign: 'center',
                backgroundColor: '#fff',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Submit Button */}
          <button
            onClick={handleInquire}
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#fff',
              color: '#003366',
              border: '2px solid #003366',
              borderRadius: '4px',
              fontWeight: 'bold',
              fontSize: '16px',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'جاري الاستعلام...' : 'إستعلم'}
          </button>
        </div>

        {/* Results */}
        {parsedData && parsedData.success && (
          <div>
            {parsedData.fines.length === 0 ? (
              <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '6px', textAlign: 'center', color: '#28a745', fontWeight: 'bold', border: '1px solid #28a745' }}>
                لا توجد مخالفات مسجلة على هذا الرقم.
              </div>
            ) : (
              <>
                {/* Summary Row - SIMPLE TABLE-LIKE LAYOUT */}
                <div
                  style={{
                    backgroundColor: '#e9ecef',
                    borderRadius: '4px',
                    padding: '12px 15px',
                    marginBottom: '15px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'nowrap',
                  }}
                >
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#495057' }}>
                      عدد المخالفات: {parsedData.totalFines || parsedData.fines.length}
                    </span>
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#495057' }}>
                      المبلغ الإجمالي: {parsedData.totalAmount} KD
                    </span>
                  </div>
                </div>

                {/* Violation Cards */}
                {parsedData.fines.map((fine, index) => {
                  const isPayable = fine.payableOnline === 'Y' || fine.fineType === 'payable';
                  const isPaid = fine.isPaid === true || fine.status === 'paid';

                  return (
                    <div
                      key={`${fine.ticketNo}-${index}`}
                      style={{
                        backgroundColor: '#fff',
                        borderRadius: '6px',
                        marginBottom: '12px',
                        overflow: 'hidden',
                        borderTop: `4px solid ${isPayable ? '#28a745' : '#dc3545'}`,
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                      }}
                    >
                      <div style={{ padding: '12px' }}>
                        {/* Row 1: Checkbox + Ticket Number */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                          {isPayable && !isPaid && (
                            <input
                              type="checkbox"
                              checked={selectedTickets.has(fine.ticketNo)}
                              onChange={(e) => handleCheckboxChange(fine.ticketNo, e.target.checked)}
                              style={{ width: '18px', height: '18px', accentColor: '#003366', cursor: 'pointer', flexShrink: 0 }}
                            />
                          )}
                          <span style={{ fontSize: '11px', color: '#888' }}>رقم المخالفة:</span>
                          <span style={{ fontWeight: 'bold', color: '#003366', fontSize: '16px' }}>{fine.ticketNo}</span>
                        </div>

                        {/* Divider */}
                        <div style={{ borderTop: '1px solid #eee', margin: '8px 0' }}></div>

                        {/* Row 2: Amount + Plate - STACKED for mobile clarity */}
                        <div style={{ marginBottom: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '4px' }}>
                            <span style={{ fontWeight: 'bold', color: '#003366', fontSize: '13px', minWidth: '60px' }}>المبلغ:</span>
                            <span style={{ fontWeight: 'bold', color: '#003366', fontSize: '14px' }}>{fine.amount} KD</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '4px' }}>
                            <span style={{ fontWeight: 'bold', color: '#003366', fontSize: '13px', minWidth: '60px' }}>اللوحة:</span>
                            <span style={{ color: '#333', fontSize: '13px' }}>{fine.plateNumber}{fine.plateCode ? '/' + fine.plateCode : ''}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                            <span style={{ fontWeight: 'bold', color: '#003366', fontSize: '13px', minWidth: '60px' }}>التاريخ:</span>
                            <span style={{ color: '#333', fontSize: '13px' }}>{fine.dateTime || fine.fineDate || ''}</span>
                          </div>
                        </div>

                        {/* Expand Button */}
                        <div style={{ textAlign: 'left', marginTop: '5px' }}>
                          <button
                            onClick={() => toggleExpand(fine.ticketNo)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#003366',
                              fontSize: '14px',
                              cursor: 'pointer',
                              padding: '4px 8px',
                            }}
                          >
                            <i className={`fas fa-chevron-${expandedTickets.has(fine.ticketNo) ? 'up' : 'down'}`}></i>
                          </button>
                        </div>

                        {/* Expanded Details */}
                        {expandedTickets.has(fine.ticketNo) && (
                          <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '4px', fontSize: '13px', borderRight: '3px solid #003366' }}>
                            {fine.location && (
                              <div style={{ marginBottom: '5px' }}>
                                <span style={{ fontWeight: 'bold', color: '#666' }}>الموقع: </span>
                                <span>{fine.location}</span>
                              </div>
                            )}
                            {fine.description && (
                              <div style={{ marginBottom: '5px' }}>
                                <span style={{ fontWeight: 'bold', color: '#666' }}>الوصف: </span>
                                <span>{fine.description}</span>
                              </div>
                            )}
                            {fine.fineType && fine.fineType !== 'payable' && (
                              <div style={{ marginBottom: '5px' }}>
                                <span style={{ fontWeight: 'bold', color: '#666' }}>النوع: </span>
                                <span>
                                  {fine.fineType === 'blackpoints'
                                    ? 'نقاط سوداء'
                                    : fine.fineType === 'unpayable'
                                    ? 'غير قابلة للدفع'
                                    : fine.fineType}
                                </span>
                              </div>
                            )}
                            {fine.blackPoints ? (
                              <div style={{ marginBottom: '5px' }}>
                                <span style={{ fontWeight: 'bold', color: '#666' }}>النقاط السوداء: </span>
                                <span>{fine.blackPoints}</span>
                              </div>
                            ) : null}
                            {fine.speed && (
                              <div>
                                <span style={{ fontWeight: 'bold', color: '#666' }}>السرعة: </span>
                                <span>{fine.speed} {fine.speedLimit ? `(الحد: ${fine.speedLimit})` : ''}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Pay Button Section */}
                <div style={{ marginTop: '15px', marginBottom: '10px' }}>
                  <p style={{ color: '#666', fontSize: '12px', textAlign: 'center', marginBottom: '12px', direction: 'ltr' }}>
                    After making the payment please do not try to pay again as it may take upto 15 minutes to update the data
                  </p>

                  <button
                    onClick={handlePay}
                    disabled={!hasSelected}
                    style={{
                      width: '100%',
                      padding: '14px',
                      backgroundColor: hasSelected ? '#003366' : '#ccc',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      fontWeight: 'bold',
                      fontSize: '16px',
                      cursor: hasSelected ? 'pointer' : 'not-allowed',
                    }}
                  >
                    ادفع
                  </button>

                  {/* Legend */}
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '15px' }}>
                    <span style={{ backgroundColor: '#28a745', color: '#fff', fontSize: '12px', padding: '5px 12px', borderRadius: '4px' }}>قابلة للدفع</span>
                    <span style={{ backgroundColor: '#dc3545', color: '#fff', fontSize: '12px', padding: '5px 12px', borderRadius: '4px' }}>غير قابلة للدفع</span>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {parsedData && !parsedData.success && (
          <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '6px', textAlign: 'center', color: '#dc3545', fontWeight: 'bold', border: '1px solid #dc3545' }}>
            {parsedData.errorMessage}
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ padding: '20px', textAlign: 'center', color: '#999', fontSize: '11px', marginTop: '20px' }}>
        © جميع الحقوق محفوظة لوزارة الداخلية - دولة الكويت - 2026
      </div>
    </div>
  );
}
