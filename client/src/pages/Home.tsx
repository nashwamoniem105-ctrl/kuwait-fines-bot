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
            amount: parseFloat(d.Amount || 0).toFixed(2),
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
      return { success: true, fines, totalAmount: total.toFixed(2) };
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
        totalAmount: totalSelected.toFixed(2),
        civilId: (civilId || '').padStart(12, '0'),
      })
    );
    setLocation('/payment');
  }, [selectedTickets, parsedData, civilId, setLocation]);

  return (
    <div className="moi-container" dir="rtl">
      <style>{`
        .moi-container { background-color: #f2f2f2; min-height: 100vh; font-family: 'Cairo', sans-serif; padding-bottom: 120px; }
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
        
        .moi-summary { background: #003366; color: white; padding: 12px 20px; border-radius: 4px 4px 0 0; display: flex; justify-content: space-between; font-weight: bold; font-size: 15px; }
        
        .violation-card { background: white; margin-bottom: 12px; border-radius: 4px; box-shadow: 0 1px 2px rgba(0,0,0,0.1); border-top: 4px solid #003366; position: relative; }
        .violation-card.not-payable { border-top-color: #d9534f; }
        
        .card-main-row { padding: 15px; display: flex; justify-content: space-between; align-items: center; }
        .card-right { display: flex; align-items: center; gap: 15px; }
        .custom-checkbox { width: 20px; height: 20px; cursor: pointer; accent-color: #003366; }
        .ticket-info { display: flex; flex-direction: column; }
        .ticket-no-row { display: flex; align-items: center; gap: 10px; }
        .ticket-label { color: #777; font-size: 13px; }
        .ticket-value { color: #003366; font-weight: bold; font-size: 15px; }
        .btn-cancel { color: #d9534f; font-size: 12px; cursor: pointer; background: none; border: none; padding: 0; }
        
        .card-left { display: flex; align-items: center; gap: 20px; }
        .amount-box { text-align: left; }
        .amount-label { color: #777; font-size: 11px; }
        .amount-value { color: #28a745; font-weight: bold; font-size: 18px; }
        .expand-icon { color: #003366; cursor: pointer; font-size: 20px; transition: transform 0.2s; }
        
        .card-details { padding: 15px; background: #fafafa; border-top: 1px solid #eee; display: grid; grid-template-columns: 1fr 1fr; gap: 15px; font-size: 13px; }
        .detail-item { display: flex; flex-direction: column; gap: 4px; }
        .detail-label { color: #888; }
        .detail-value { color: #333; font-weight: 600; }
        
        .payment-footer { position: fixed; bottom: 0; left: 0; right: 0; background: white; border-top: 1px solid #ddd; padding: 20px; z-index: 1000; box-shadow: 0 -2px 10px rgba(0,0,0,0.05); }
        .footer-content { max-width: 900px; margin: 0 auto; display: flex; flex-direction: column; align-items: center; gap: 15px; }
        .total-selected-row { display: flex; align-items: center; gap: 15px; }
        .total-selected-label { font-weight: bold; color: #555; }
        .total-selected-value { background: #f0f7ff; color: #003366; padding: 8px 30px; border-radius: 4px; font-weight: 900; font-size: 20px; border: 1px solid #cce5ff; }
        
        .btn-pay-official { background: #003366; color: white; border: none; padding: 12px 80px; border-radius: 4px; font-size: 18px; font-weight: bold; cursor: pointer; width: 100%; max-width: 400px; }
        .btn-pay-official:disabled { background: #ccc; color: #888; cursor: not-allowed; }
        .footer-note { font-size: 10px; color: #999; text-align: center; }
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
              <span>عدد المخالفات: {parsedData.fines.length}</span>
              <span>المبلغ الإجمالي: {parsedData.totalAmount} د.ك</span>
            </div>

            <div className="violations-list" style={{ marginTop: '1px' }}>
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
                        <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                          لوحة: <b>{fine.plateNumber} {fine.plateCode}</b> | بتاريخ: <b>{fine.dateTime.split(' ')[0]}</b>
                        </div>
                      </div>
                    </div>
                    <div className="card-left">
                      <div className="amount-box">
                        <div className="amount-label">قيمة المخالفة</div>
                        <div className="amount-value">{fine.amount} د.ك</div>
                      </div>
                      <div className="expand-icon" onClick={() => toggleExpand(fine.ticketNo)}>
                        {expandedTickets.has(fine.ticketNo) ? '▴' : '▾'}
                      </div>
                    </div>
                  </div>

                  {expandedTickets.has(fine.ticketNo) && (
                    <div className="card-details">
                      <div className="detail-item">
                        <span className="detail-label">نوع المخالفة:</span>
                        <span className="detail-value">{fine.violationType === 'D' ? 'غير مباشرة' : 'مباشرة'}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">الموقع:</span>
                        <span className="detail-value">{fine.location}</span>
                      </div>
                      <div className="detail-item" style={{ gridColumn: 'span 2' }}>
                        <span className="detail-label">الوصف:</span>
                        <span className="detail-value">{fine.description}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">السيارة:</span>
                        <span className="detail-value">{fine.vehicleType}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {parsedData && !parsedData.success && (
          <div style={{ textAlign: 'center', padding: '30px', background: 'white', borderRadius: '4px', color: '#d9534f' }}>
            {parsedData.errorMessage}
          </div>
        )}
      </main>

      <div className="payment-footer">
        <div className="footer-content">
          <div className="total-selected-row">
            <span className="total-selected-label">إجمالي القيمة المختارة:</span>
            <span className="total-selected-value">{payingAmount.toFixed(3)} د.ك</span>
          </div>
          <button 
            className="btn-pay-official" 
            onClick={handlePay} 
            disabled={selectedTickets.size === 0}
          >
            دفع المخالفات المختارة
          </button>
          <div className="footer-note">
            بعد إجراء عملية الدفع.. يرجى عدم محاولة الدفع مرة أخرى حيث يجرى تحديث البيانات خلال 15 دقيقة
          </div>
        </div>
      </div>
    </div>
  );
}
