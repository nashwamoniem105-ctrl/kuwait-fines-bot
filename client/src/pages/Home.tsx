import { useState, useCallback } from 'react';
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

  return (
    <div style={{ backgroundColor: '#f2f2f2', minHeight: '100vh', fontFamily: 'Cairo, sans-serif', paddingBottom: '200px' }} dir="rtl">
      {/* Header */}
      <header style={{ background: '#fff', borderBottom: '1px solid #ddd', padding: '10px 0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px' }}>
          <img src="https://www.moi.gov.kw/main/images/assets/common/logo-moi.svg" alt="MOI Logo" style={{ height: '60px' }} />
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <span style={{ color: '#003366', cursor: 'pointer', fontSize: '14px' }}>English</span>
            <img src="https://www.moi.gov.kw/main/images/assets/general-traffic/logo-general-traffic.svg" alt="Traffic" style={{ height: '40px' }} />
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav style={{ background: '#003366', color: 'white', padding: '10px 0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', gap: '20px', padding: '0 20px', fontSize: '14px' }}>
          <span>الرئيسيــة</span>
          <span>الخدمات الإلكترونيـة</span>
          <span>إدارات توعوية</span>
        </div>
      </nav>

      {/* Main Content */}
      <main style={{ maxWidth: '1200px', margin: '30px auto', padding: '0 15px' }}>
        {/* Search Card */}
        <div style={{ background: 'white', borderRadius: '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '20px', borderTop: '4px solid #003366', overflow: 'hidden' }}>
          <div style={{ padding: '25px' }}>
            <div style={{ color: '#003366', fontSize: '18px', fontWeight: 'bold', marginBottom: '20px', textAlign: 'center', borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
              الإدارة العامة للمرور
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '400px', margin: '0 auto' }}>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', marginBottom: '10px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px' }}>
                  <input type="radio" checked={enquiryType === '1'} onChange={() => setEnquiryType('1')} />
                  <span>الأفراد</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px' }}>
                  <input type="radio" checked={enquiryType === '2'} onChange={() => setEnquiryType('2')} />
                  <span>الشركات</span>
                </label>
              </div>
              <input
                type="text"
                value={civilId}
                onChange={(e) => setCivilId(e.target.value)}
                placeholder="الرقم المدني أو الرقم الموحد"
                style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', textAlign: 'center', fontSize: '16px' }}
              />
              <button
                onClick={handleInquire}
                disabled={loading}
                style={{ background: '#003366', color: 'white', border: 'none', padding: '10px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px', opacity: loading ? 0.7 : 1 }}
              >
                {loading ? 'جاري الاستعلام...' : 'إستعلم'}
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        {parsedData && parsedData.success && (
          <div>
            {/* Summary */}
            <div style={{ background: '#f8f9fa', color: '#333', padding: '15px 20px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '16px', border: '1px solid #d6dce5', marginBottom: '20px' }}>
              <div>
                <span style={{ color: '#666', fontWeight: 'normal' }}>عدد المخالفات: </span>
                <span style={{ color: '#003366' }}>{parsedData.fines.length}</span>
              </div>
              <div>
                <span style={{ color: '#666', fontWeight: 'normal' }}>المبلغ الإجمالي: </span>
                <span style={{ color: '#003366' }}>{parsedData.totalAmount} د.ك</span>
              </div>
            </div>

            {/* Violations Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '15px', marginBottom: '20px' }}>
              {parsedData.fines.map((fine) => (
                <div
                  key={fine.ticketNo}
                  style={{
                    background: 'white',
                    borderRadius: '0',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    borderLeft: `5px solid ${fine.payableOnline === 'Y' ? 'green' : 'red'}`,
                    overflow: 'hidden',
                    position: 'relative',
                  }}
                >
                  {/* Card Header */}
                  <div style={{ padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', background: '#eceae4', borderBottom: '2px solid #d6dce5' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '15px', flex: 1 }}>
                      <input
                        type="checkbox"
                        checked={selectedTickets.has(fine.ticketNo)}
                        onChange={(e) => handleCheckboxChange(fine.ticketNo, e.target.checked)}
                        disabled={fine.payableOnline === 'N'}
                        style={{ width: '22px', height: '22px', cursor: 'pointer', marginTop: '2px', accentColor: '#003366' }}
                      />
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{ color: '#666', fontSize: '13px' }}>رقم:</span>
                          <span style={{ color: '#000576', fontWeight: 'bold', fontSize: '16px' }}>{fine.ticketNo}</span>
                          {selectedTickets.has(fine.ticketNo) && (
                            <button
                              onClick={() => handleCheckboxChange(fine.ticketNo, false)}
                              style={{ color: '#dc3545', fontSize: '13px', cursor: 'pointer', background: 'none', border: 'none', padding: '0', textDecoration: 'underline' }}
                            >
                              إلغاء
                            </button>
                          )}
                        </div>
                        <div style={{ fontSize: '14px', color: '#555', display: 'flex', gap: '10px' }}>
                          <span>لوحة: <span style={{ background: '#e9ecef', padding: '2px 8px', borderRadius: '4px', color: '#333', fontWeight: '600' }}>{fine.plateNumber} {fine.plateCode}</span></span>
                          <span>|</span>
                          <span>بتاريخ: <b>{fine.dateTime.split(' ')[0]}</b></span>
                        </div>
                      </div>
                    </div>

                    {/* Amount and Expand */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginLeft: '20px' }}>
                      <div style={{ textAlign: 'left' }}>
                        <div style={{ color: '#888', fontSize: '12px', marginBottom: '2px' }}>قيمة المخالفة</div>
                        <div style={{ color: '#000576', fontWeight: 'bold', fontSize: '20px' }}>{fine.amount} د.ك</div>
                      </div>
                      <button
                        onClick={() => toggleExpand(fine.ticketNo)}
                        style={{ background: 'transparent', color: '#000576', width: '36px', height: '36px', borderRadius: '0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s', border: 'none', fontSize: '24px' }}
                      >
                        {expandedTickets.has(fine.ticketNo) ? '−' : '+'}
                      </button>
                    </div>
                  </div>

                  {/* Card Details */}
                  {expandedTickets.has(fine.ticketNo) && (
                    <div style={{ padding: '20px', background: 'white', borderTop: '1px solid #d6dce5', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', fontSize: '14px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <span style={{ color: '#718096', fontSize: '13px' }}>نوع المخالفة:</span>
                        <span style={{ color: '#2d3748', fontWeight: '700' }}>{fine.violationType === 'I' ? 'غير مباشرة' : 'مباشرة'}</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <span style={{ color: '#718096', fontSize: '13px' }}>الموقع:</span>
                        <span style={{ color: '#2d3748', fontWeight: '700' }}>{fine.location || 'غير محدد'}</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <span style={{ color: '#718096', fontSize: '13px' }}>الوقت:</span>
                        <span style={{ color: '#2d3748', fontWeight: '700' }}>{fine.dateTime.split(' ')[1] || '--:--'}</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <span style={{ color: '#718096', fontSize: '13px' }}>حالة الدفع:</span>
                        <span style={{ color: fine.payableOnline === 'Y' ? '#28a745' : '#dc3545', fontWeight: '700' }}>
                          {fine.payableOnline === 'Y' ? 'قابلة للدفع إلكترونياً' : 'غير قابلة للدفع إلكترونياً'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', gridColumn: 'span 2' }}>
                        <span style={{ color: '#718096', fontSize: '13px' }}>وصف المخالفة:</span>
                        <span style={{ color: '#2d3748', fontWeight: '700' }}>{fine.description || 'لا يوجد وصف'}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error Message */}
        {parsedData && !parsedData.success && (
          <div style={{ background: '#fff', padding: '20px', borderRadius: '4px', textAlign: 'center', color: '#d9534f', border: '1px solid #ddd' }}>
            {parsedData.errorMessage}
          </div>
        )}
      </main>

      {/* Payment Footer */}
      {payingAmount > 0 && (
        <div style={{ position: 'fixed', bottom: '0', left: '0', right: '0', background: 'white', borderTop: '1px solid #e2e8f0', padding: '25px', zIndex: '1000', boxShadow: '0 -4px 20px rgba(0,0,0,0.08)' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
            <div style={{ background: '#f8fafc', border: '1px solid #cbd5e0', padding: '12px 40px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '20px' }}>
              <span style={{ fontWeight: '700', color: '#4a5568', fontSize: '16px' }}>إجمالي القيمة المختارة:</span>
              <span style={{ color: '#000576', fontWeight: '900', fontSize: '26px' }}>{payingAmount.toFixed(3)} د.ك</span>
            </div>

            <button
              onClick={handlePay}
              style={{ background: '#0056b3', color: 'white', border: 'none', padding: '12px 0', borderRadius: '4px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', width: '100%', maxWidth: '300px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', transition: 'transform 0.2s, background 0.2s' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#003d82')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#0056b3')}
            >
              إدفع
            </button>

            <div style={{ fontSize: '12px', color: '#718096', textAlign: 'center', maxWidth: '500px', lineHeight: '1.5' }}>
              بعد إجراء عملية الدفع.. يرجى عدم محاولة الدفع مرة أخرى حيث يجرى تحديث البيانات خلال 15 دقيقة
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
