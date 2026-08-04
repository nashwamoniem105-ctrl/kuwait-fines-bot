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
        return { success: false, fines: [], errorMessage: data.errorMsg || 'لا توجد بيانات' };
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
      return { success: false, fines: [], errorMessage: 'خطأ في معالجة البيانات' };
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
    <div className="moi-container" dir="rtl">
      <style>{`
        .moi-container { background-color: #f2f2f2; min-height: 100vh; font-family: 'Cairo', sans-serif; padding-bottom: 200px; }
        .moi-header { background: #fff; border-bottom: 1px solid #ddd; padding: 10px 0; }
        .header-content { max-width: 1200px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; padding: 0 20px; }
        .moi-logo { height: 60px; }
        .moi-nav { background: #003366; color: white; padding: 10px 0; }
        .nav-content { max-width: 1200px; margin: 0 auto; display: flex; gap: 20px; padding: 0 20px; font-size: 14px; }
        
        .moi-main { max-width: 900px; margin: 30px auto; padding: 0 15px; }
        .moi-search-card { background: white; border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 20px; overflow: hidden; border-top: 4px solid #003366; }
        .card-padding { padding: 25px; }
        .moi-title { color: #003366; font-size: 18px; font-weight: bold; margin-bottom: 20px; text-align: center; border-bottom: 1px solid #eee; padding-bottom: 15px; }
        
        .form-row { display: flex; flex-direction: column; gap: 15px; max-width: 400px; margin: 0 auto; }
        .radio-group { display: flex; justify-content: center; gap: 30px; margin-bottom: 10px; }
        .radio-item { display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 14px; }
        .moi-input { width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px; text-align: center; font-size: 16px; }
        .btn-enquire { background: #003366; color: white; border: none; padding: 10px; border-radius: 4px; font-weight: bold; cursor: pointer; font-size: 16px; }
        
        /* Summary Box - Gray Style */
        .moi-summary { background: #e9ecef; color: #495057; padding: 12px 20px; border-radius: 4px; display: flex; justify-content: space-between; font-weight: bold; font-size: 15px; margin-bottom: 20px; border: 1px solid #dee2e6; }

        /* Violations Grid */
        .violations-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 20px; }
        @media (max-width: 600px) { .violations-grid { grid-template-columns: 1fr; } }

        /* Violation Card - Official Style */
        .violation-card { background: white; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.05); border-top: 6px solid #28a745; overflow: hidden; position: relative; border: 1px solid #eee; border-top-width: 6px; }
        .violation-card.not-payable { border-top-color: #dc3545; }
        
        .card-content { padding: 15px; }
        .card-header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
        .ticket-number { color: #003366; font-weight: 800; font-size: 16px; display: flex; align-items: center; gap: 10px; }
        .custom-checkbox { width: 18px; height: 18px; cursor: pointer; accent-color: #003366; }
        .btn-cancel-text { color: #dc3545; font-size: 12px; cursor: pointer; font-weight: bold; }
        
        .info-row { display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 14px; color: #444; }
        .info-label { font-weight: 700; color: #666; }
        
        /* Accordion Details */
        .details-box { background: #fff; border-top: 1px solid #f0f0f0; padding: 15px; font-size: 13px; color: #555; }
        .chevron-btn { width: 100%; display: flex; justify-content: center; padding: 5px; cursor: pointer; color: #003366; transition: 0.3s; }
        .chevron-btn svg { width: 20px; transition: 0.3s; }
        .chevron-btn.open svg { transform: rotate(180deg); }
        
        /* Payment Section - Official Style */
        .payment-section { margin-top: 40px; display: flex; flex-direction: column; align-items: center; gap: 15px; }
        .selected-total-row { width: 100%; max-width: 450px; text-align: right; font-weight: 800; color: #003366; font-size: 18px; padding-right: 10px; }
        .btn-pay-moi { background: #003366; color: white; border: none; padding: 14px 0; border-radius: 8px; font-size: 18px; font-weight: 800; cursor: pointer; width: 100%; max-width: 450px; transition: 0.3s; box-shadow: 0 4px 12px rgba(0,51,102,0.2); }
        .btn-pay-moi:hover:not(:disabled) { background: #002244; }
        .btn-pay-moi:disabled { background: #ced4da; color: #6c757d; cursor: not-allowed; box-shadow: none; }
        
        .moi-warning { color: #dc3545; font-size: 12px; font-weight: bold; text-align: center; max-width: 500px; margin-top: 10px; line-height: 1.6; }
        .legend { display: flex; gap: 20px; margin-top: 15px; font-size: 11px; }
        .legend-item { display: flex; align-items: center; gap: 5px; }
        .dot { width: 10px; height: 10px; border-radius: 50%; }
      `}</style>

      <header className="moi-header">
        <div className="header-content">
          <img src="https://www.moi.gov.kw/main/images/assets/common/logo-moi.svg" alt="MOI Logo" className="moi-logo" />
          <div className="flex gap-4 items-center">
            <span style={{ color: '#003366', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' }}>English</span>
            <img src="https://www.moi.gov.kw/main/images/assets/general-traffic/logo-general-traffic.svg" alt="Traffic" className="h-10" />
          </div>
        </div>
      </header>
      
      <div className="moi-nav">
        <div className="nav-content">
          <span>الرئيسيــة</span>
          <span>الخدمات الإلكترونيـة</span>
          <span>إدارات توعوية</span>
        </div>
      </div>

      <main className="moi-main">
        <div className="moi-search-card">
          <div className="card-padding">
            <div className="moi-title">الإدارة العامة للمرور</div>
            <div className="form-row">
              <div className="radio-group">
                <label className="radio-item">
                  <input type="radio" checked={enquiryType === '1'} onChange={() => setEnquiryType('1')} />
                  <span>الأفراد</span>
                </label>
                <label className="radio-item">
                  <input type="radio" checked={enquiryType === '2'} onChange={() => setEnquiryType('2')} />
                  <span>الشركات</span>
                </label>
              </div>
              <input 
                type="text" 
                className="moi-input" 
                value={civilId} 
                onChange={(e) => setCivilId(e.target.value)}
                placeholder="الرقم المدني أو الرقم الموحد"
              />
              <button className="btn-enquire" onClick={handleInquire} disabled={loading}>
                {loading ? 'جاري الاستعلام...' : 'إستعلم'}
              </button>
            </div>
          </div>
        </div>

        {parsedData && parsedData.success && (
          <div className="results-container">
            <div className="moi-summary">
              <span>عدد المخالفات: {parsedData.fines.length}</span>
              <span>المبلغ الإجمالي: {parsedData.totalAmount} د.ك</span>
            </div>

            <div className="violations-grid">
              {parsedData.fines.map((fine) => (
                <div key={fine.ticketNo} className={`violation-card ${fine.payableOnline === 'N' ? 'not-payable' : ''}`}>
                  <div className="card-content">
                    <div className="card-header-row">
                      <div className="ticket-number">
                        <input 
                          type="checkbox" 
                          className="custom-checkbox"
                          checked={selectedTickets.has(fine.ticketNo)}
                          onChange={(e) => handleCheckboxChange(fine.ticketNo, e.target.checked)}
                          disabled={fine.payableOnline === 'N'}
                        />
                        <span>رقم: {fine.ticketNo}</span>
                      </div>
                      {selectedTickets.has(fine.ticketNo) && (
                        <span className="btn-cancel-text" onClick={() => handleCheckboxChange(fine.ticketNo, false)}>إلغاء</span>
                      )}
                    </div>

                    <div className="info-row">
                      <span className="info-label">قيمة المخالفة:</span>
                      <span>{fine.amount} دك</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">رقم اللوحة:</span>
                      <span>{fine.plateNumber}/{fine.plateCode}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">تاريخ المخالفة:</span>
                      <span>{fine.dateTime}</span>
                    </div>

                    {expandedTickets.has(fine.ticketNo) && (
                      <div className="details-box">
                        <div className="info-row">
                          <span className="info-label">نوع المخالفة:</span>
                          <span>{fine.violationType === 'D' ? 'غير مباشرة' : 'مباشرة'}</span>
                        </div>
                        <div className="info-row">
                          <span className="info-label">موقع المخالفة:</span>
                          <span>{fine.location}</span>
                        </div>
                        <div className="mt-2 text-gray-500 italic">
                          - {fine.description}
                        </div>
                      </div>
                    )}

                    <div 
                      className={`chevron-btn ${expandedTickets.has(fine.ticketNo) ? 'open' : ''}`}
                      onClick={() => toggleExpand(fine.ticketNo)}
                    >
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="payment-section">
              {selectedTickets.size > 0 && (
                <div className="selected-total-row">
                  إجمالي القيمة المختارة : {payingAmount.toFixed(3)}
                </div>
              )}
              
              <button 
                className="btn-pay-moi"
                disabled={selectedTickets.size === 0}
                onClick={handlePay}
              >
                إدفع
              </button>

              <div className="moi-warning">
                بعد إجراء عملية الدفع.. يرجى عدم محاولة الدفع مرة أخرى حيث يجرى تحديث البيانات خلال 15 دقيقة
              </div>

              <div className="legend">
                <div className="legend-item"><span className="dot bg-green-600"></span> قابلة للدفع الكترونياً</div>
                <div className="legend-item"><span className="dot bg-red-600"></span> غير قابلة للدفع الكترونياً</div>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="mt-10 py-6 text-center text-xs text-gray-500 border-t border-gray-200">
        © جميع الحقوق محفوظة لوزارة الداخلية-دولة الكويت - 2026
      </footer>
    </div>
  );
}
