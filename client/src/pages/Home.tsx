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
      {/* Header & Nav - Simplified to match MOI */}
      <div style={{ background: 'white', borderBottom: '1px solid #ddd' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '10px 15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <img src="https://www.moi.gov.kw/main/images/assets/common/logo-moi.svg" alt="MOI" style={{ height: '45px' }} />
          <img src="https://www.moi.gov.kw/main/images/assets/general-traffic/logo-general-traffic.svg" alt="Traffic" style={{ height: '35px' }} />
        </div>
      </div>

      <main style={{ maxWidth: '600px', margin: '20px auto', padding: '0 15px' }}>
        {/* Enquiry Form */}
        <div style={{ background: 'white', borderRadius: '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '20px', borderTop: '4px solid #003366' }}>
          <div style={{ padding: '20px' }}>
            <h2 style={{ color: '#003366', fontSize: '18px', textAlign: 'center', marginBottom: '20px', fontWeight: 'bold' }}>الإدارة العامة للمرور</h2>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', marginBottom: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input type="radio" checked={enquiryType === '1'} onChange={() => setEnquiryType('1')} /> الأفراد
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input type="radio" checked={enquiryType === '2'} onChange={() => setEnquiryType('2')} /> الشركات
              </label>
            </div>
            <input
              type="text"
              value={civilId}
              onChange={(e) => setCivilId(e.target.value)}
              placeholder="الرقم المدني أو الرقم الموحد"
              style={{ width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '4px', textAlign: 'center', marginBottom: '15px', fontSize: '16px' }}
            />
            <button
              onClick={handleInquire}
              disabled={loading}
              style={{ width: '100%', background: '#003366', color: 'white', border: 'none', padding: '12px', borderRadius: '4px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer' }}
            >
              {loading ? 'جاري الاستعلام...' : 'إستعلم'}
            </button>
          </div>
        </div>

        {/* Results */}
        {parsedData && parsedData.success && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Summary Row */}
            <div style={{ background: '#f8f9fa', padding: '12px 15px', borderRadius: '4px', border: '1px solid #d6dce5', display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 'bold' }}>
              <span>عدد المخالفات: <span style={{ color: '#003366' }}>{parsedData.fines.length}</span></span>
              <span>المبلغ الاجمالي: <span style={{ color: '#003366' }}>{parsedData.totalAmount} دك</span></span>
            </div>

            {/* Fines List - Vertical Only */}
            {parsedData.fines.map((fine) => (
              <div
                key={fine.ticketNo}
                style={{
                  background: 'white',
                  borderLeft: `5px solid ${fine.payableOnline === 'Y' ? '#28a745' : '#dc3545'}`,
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                  overflow: 'hidden'
                }}
              >
                {/* Card Header */}
                <div style={{ padding: '12px 15px', background: '#eceae4', borderBottom: '1px solid #d6dce5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <input
                      type="checkbox"
                      checked={selectedTickets.has(fine.ticketNo)}
                      onChange={(e) => handleCheckboxChange(fine.ticketNo, e.target.checked)}
                      disabled={fine.payableOnline === 'N'}
                      style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: '14px', color: '#666' }}>رقم: <b style={{ color: '#000576', fontSize: '16px' }}>{fine.ticketNo}</b></span>
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ color: '#000576', fontWeight: 'bold', fontSize: '18px' }}>{fine.amount} دك</div>
                  </div>
                </div>

                {/* Card Main Info */}
                <div style={{ padding: '12px 15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '14px', color: '#333' }}>
                    <div style={{ marginBottom: '4px' }}>رقم اللوحة: <b>{fine.plateNumber} / {fine.plateCode}</b></div>
                    <div style={{ color: '#666' }}>تاريخ المخالفة: <b>{fine.dateTime.split(' ')[0]}</b></div>
                  </div>
                  <button
                    onClick={() => toggleExpand(fine.ticketNo)}
                    style={{ background: 'none', border: '1px solid #ddd', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', borderRadius: '4px' }}
                  >
                    {expandedTickets.has(fine.ticketNo) ? '▲' : '▼'}
                  </button>
                </div>

                {/* Card Expanded Details */}
                {expandedTickets.has(fine.ticketNo) && (
                  <div style={{ padding: '15px', borderTop: '1px solid #eee', background: '#fafafa', fontSize: '13px', color: '#555', lineHeight: '1.8' }}>
                    <div><b>نوع المخالفة:</b> {fine.violationType === 'I' ? 'غير مباشرة' : 'مباشرة'}</div>
                    <div><b>الموقع:</b> {fine.location || 'غير محدد'}</div>
                    <div><b>الوصف:</b> {fine.description || 'لا يوجد وصف متاح'}</div>
                    <div style={{ color: fine.payableOnline === 'Y' ? 'green' : 'red', fontWeight: 'bold', marginTop: '5px' }}>
                      {fine.payableOnline === 'Y' ? '● قابلة للدفع إلكترونياً' : '● غير قابلة للدفع إلكترونياً'}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {parsedData && !parsedData.success && (
          <div style={{ padding: '20px', textAlign: 'center', color: '#dc3545', background: 'white', borderRadius: '4px' }}>
            {parsedData.errorMessage}
          </div>
        )}
      </main>

      {/* Payment Bar - Sticky at Bottom */}
      {payingAmount > 0 && (
        <div style={{ position: 'fixed', bottom: '0', left: '0', right: '0', background: 'white', borderTop: '2px solid #003366', padding: '15px', boxShadow: '0 -2px 10px rgba(0,0,0,0.1)', zIndex: 1000 }}>
          <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
            <div style={{ marginBottom: '10px', fontSize: '15px' }}>
              إجمالي القيمة المختارة: <b style={{ color: '#000576', fontSize: '20px' }}>{payingAmount.toFixed(3)} دك</b>
            </div>
            <button
              onClick={handlePay}
              style={{ width: '100%', background: '#003366', color: 'white', border: 'none', padding: '12px', borderRadius: '4px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer' }}
            >
              إدفع
            </button>
            <div style={{ fontSize: '11px', color: '#999', marginTop: '8px' }}>
              بعد إجراء عملية الدفع.. يرجى عدم محاولة الدفع مرة أخرى حيث يجرى تحديث البيانات خلال 15 دقيقة
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
