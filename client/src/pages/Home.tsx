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
    <div className="moi-container" dir="rtl">
      <style>{`
        .moi-container { background-color: #f2f2f2; min-height: 100vh; font-family: 'Cairo', sans-serif; padding-bottom: 150px; }
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
        .moi-summary { background: #f8f9fa; color: #333; padding: 15px 20px; border-radius: 8px; display: flex; justify-content: space-between; font-weight: bold; font-size: 16px; border: 1px solid #d6dce5; margin-bottom: 20px; }
        .summary-label { color: #666; font-weight: normal; }
        .summary-value { color: #003366; }

        /* Violation Card - Official Style */
        .violation-card { background: #eceae4; margin-bottom: 15px; border-radius: 0; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border-top: 5px solid green; overflow: hidden; position: relative; }
        .violation-card.not-payable { border-top-color: red; }
        
        .card-main-row { padding: 15px 20px; display: flex; justify-content: space-between; align-items: center; background: #eceae4; border-bottom: 2px solid #d6dce5; }
        .card-right { display: flex; align-items: center; gap: 20px; }
        .custom-checkbox { width: 22px; height: 22px; cursor: pointer; accent-color: #003366; }
        
        .ticket-info { display: flex; flex-direction: column; gap: 4px; }
        .ticket-no-row { display: flex; align-items: center; gap: 12px; }
        .ticket-label { color: #666; font-size: 13px; }
        .ticket-value { color: #000576; font-weight: bold; font-size: 16px; }
        .btn-cancel { color: #dc3545; font-size: 13px; cursor: pointer; background: none; border: none; padding: 0; text-decoration: underline; }
        
        .plate-info { font-size: 14px; color: #555; display: flex; gap: 10px; }
        .plate-badge { background: #e9ecef; padding: 2px 8px; border-radius: 4px; color: #333; font-weight: 600; }

        .card-left { display: flex; align-items: center; gap: 25px; }
        .amount-box { text-align: left; }
        .amount-label { color: #888; font-size: 12px; margin-bottom: 2px; }
        .amount-value { color: #000576; font-weight: bold; font-size: 20px; }
        
        .expand-btn { background: transparent; color: #000576; width: 36px; height: 36px; border-radius: 0; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; border: none; font-size: 24px; }
        .expand-btn:hover { background: transparent; color: #000576; }
        .expand-icon { font-size: 20px; font-weight: bold; }
        
        /* Accordion Details */
        .card-details { padding: 20px; background: white; border-top: 1px solid #d6dce5; display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; font-size: 14px; }
        .detail-item { display: flex; flex-direction: column; gap: 6px; }
        .detail-label { color: #718096; font-size: 13px; }
        .detail-value { color: #2d3748; font-weight: 700; }
        
        /* Payment Footer - Official Style */
        .payment-footer { position: fixed; bottom: 0; left: 0; right: 0; background: white; border-top: 1px solid #e2e8f0; padding: 25px; z-index: 1000; box-shadow: 0 -4px 20px rgba(0,0,0,0.08); }
        .footer-content { max-width: 900px; margin: 0 auto; display: flex; flex-direction: column; align-items: center; gap: 20px; }
        
        .total-selected-box { background: #f8fafc; border: 1px solid #cbd5e0; padding: 12px 40px; border-radius: 12px; display: flex; align-items: center; gap: 20px; }
        .total-selected-label { font-weight: 700; color: #4a5568; font-size: 16px; }
        .total-selected-value { color: #000576; font-weight: 900; font-size: 26px; }
        
        .btn-pay-official { background: #0056b3; color: white; border: none; padding: 12px 0; border-radius: 4px; font-size: 16px; font-weight: bold; cursor: pointer; width: 100%; max-width: 300px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); transition: transform 0.2s, background 0.2s; display: flex; align-items: center; justify-content: center; gap: 12px; }
        .btn-pay-official:hover:not(:disabled) { transform: translateY(-1px); background: #003d82; }
        .btn-pay-official:disabled { background: #cbd5e0; color: #718096; cursor: not-allowed; box-shadow: none; }
        
        .footer-note { font-size: 12px; color: #718096; text-align: center; max-width: 500px; line-height: 1.5; }
      `}</style>

      <header className="moi-header">
        <div className="header-content">
          <img src="https://www.moi.gov.kw/main/images/assets/common/logo-moi.svg" alt="MOI Logo" className="moi-logo" />
          <div className="flex gap-4 items-center">
            <span style={{ color: '#003366', cursor: 'pointer', fontSize: '14px' }}>English</span>
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
              <div>
                <span className="summary-label">عدد المخالفات: </span>
                <span className="summary-value">{parsedData.fines.length}</span>
              </div>
              <div>
                <span className="summary-label">المبلغ الإجمالي: </span>
                <span className="summary-value">{parsedData.totalAmount} د.ك</span>
              </div>
            </div>

            <div className="violations-list">
              {parsedData.fines.map((fine) => (
                <div key={fine.ticketNo} className={`violation-card ${fine.payableOnline === 'N' ? 'not-payable' : ''}`}>
                  <div className="card-main-row">
                    <div className="card-right">
                      <input 
                        type="checkbox" 
                        className="custom-checkbox"
                        checked={selectedTickets.has(fine.ticketNo)}
                        onChange={(e) => handleCheckboxChange(fine.ticketNo, e.target.checked)}
                        disabled={fine.payableOnline === 'N'}
                      />
                      <div className="ticket-info">
                        <div className="ticket-no-row">
                          <span className="ticket-label">رقم المخالفة:</span>
                          <span className="ticket-value">{fine.ticketNo}</span>
                          {selectedTickets.has(fine.ticketNo) && (
                            <button className="btn-cancel" onClick={() => handleCheckboxChange(fine.ticketNo, false)}>إلغاء</button>
                          )}
                        </div>
                        <div className="plate-info">
                          <span>لوحة: <span className="plate-badge">{fine.plateNumber} {fine.plateCode}</span></span>
                          <span>|</span>
                          <span>بتاريخ: <b>{fine.dateTime.split(' ')[0]}</b></span>
                        </div>
                      </div>
                    </div>
                    <div className="card-left">
                      <div className="amount-box">
                        <div className="amount-label">قيمة المخالفة</div>
                        <div className="amount-value">{fine.amount} د.ك</div>
                      </div>
                      <div className="expand-btn" onClick={() => toggleExpand(fine.ticketNo)}>
                        <span className="expand-icon">{expandedTickets.has(fine.ticketNo) ? '−' : '+'}</span>
                      </div>
                    </div>
                  </div>

                  {expandedTickets.has(fine.ticketNo) && (
                    <div className="card-details">
                      <div className="detail-item">
                        <span className="detail-label">نوع المخالفة:</span>
                        <span className="detail-value">{fine.violationType === 'I' ? 'غير مباشرة' : 'مباشرة'}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">الموقع:</span>
                        <span className="detail-value">{fine.location || 'غير محدد'}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">الوقت:</span>
                        <span className="detail-value">{fine.dateTime.split(' ')[1] || '--:--'}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">حالة الدفع:</span>
                        <span className={`detail-value ${fine.payableOnline === 'Y' ? 'text-success' : 'text-danger'}`}>
                          {fine.payableOnline === 'Y' ? 'قابلة للدفع إلكترونياً' : 'غير قابلة للدفع إلكترونياً'}
                        </span>
                      </div>
                      <div className="detail-item" style={{ gridColumn: 'span 2' }}>
                        <span className="detail-label">وصف المخالفة:</span>
                        <span className="detail-value">{fine.description || 'لا يوجد وصف'}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {parsedData && !parsedData.success && (
          <div style={{ background: '#fff', padding: '20px', borderRadius: '4px', textAlign: 'center', color: '#d9534f', border: '1px solid #ddd' }}>
            {parsedData.errorMessage}
          </div>
        )}
      </main>

      {payingAmount > 0 && (
        <div className="payment-footer">
          <div className="footer-content">
            <div className="total-selected-box">
              <span className="total-selected-label">إجمالي القيمة المختارة:</span>
              <span className="total-selected-value">{payingAmount.toFixed(3)} د.ك</span>
            </div>
            
            <button className="btn-pay-official" onClick={handlePay}>
              <span>إدفع</span>
            </button>
            
            <div className="footer-note">
              بعد إجراء عملية الدفع.. يرجى عدم محاولة الدفع مرة أخرى حيث يجرى تحديث البيانات خلال 15 دقيقة
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
