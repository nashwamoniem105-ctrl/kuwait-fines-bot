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
        .moi-container { background-color: #f8f9fa; min-height: 100vh; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding-bottom: 50px; }
        .moi-header { background: #fff; border-bottom: 4px solid #000576; padding: 20px 0; text-align: center; }
        .moi-logo { height: 80px; }
        
        .moi-main { max-width: 1000px; margin: 30px auto; padding: 0 20px; }
        .moi-search-card { background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 15px rgba(0,0,0,0.05); margin-bottom: 30px; }
        .moi-title { color: #000576; font-size: 22px; font-weight: bold; margin-bottom: 25px; border-right: 5px solid #000576; padding-right: 15px; }
        
        .form-row { display: flex; gap: 20px; align-items: flex-end; flex-wrap: wrap; }
        .form-group { flex: 1; min-width: 250px; }
        .form-group label { display: block; margin-bottom: 10px; font-weight: 600; color: #444; }
        .moi-input, .moi-select { width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 5px; font-size: 16px; outline: none; transition: border 0.3s; }
        .moi-input:focus { border-color: #000576; }
        
        .btn-enquire { background: #000576; color: white; border: none; padding: 12px 40px; border-radius: 5px; font-weight: bold; cursor: pointer; transition: background 0.3s; }
        .btn-enquire:hover { background: #000350; }
        
        .moi-summary { background: #eee; padding: 15px 25px; border-radius: 5px; margin-bottom: 20px; display: flex; justify-content: space-between; font-weight: bold; color: #333; }
        
        .violations-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        @media (max-width: 768px) { .violations-grid { grid-template-columns: 1fr; } }
        
        .violation-card { background: #eceae4; border-radius: 6px; border-top: 6px solid #000576; box-shadow: 0 2px 8px rgba(0,0,0,0.1); overflow: hidden; display: flex; flex-direction: column; }
        .card-header { padding: 15px; border-bottom: 1px solid #d6dce5; display: flex; align-items: center; }
        .card-checkbox { width: 22px; height: 22px; margin-left: 15px; cursor: pointer; }
        .card-ticket-no { color: #000576; font-weight: bold; font-size: 16px; }
        
        .card-body { padding: 15px; }
        .info-item { margin-bottom: 8px; font-size: 15px; display: flex; }
        .info-label { color: #666; min-width: 110px; font-weight: 600; }
        .info-value { color: #000576; font-weight: bold; }
        
        .payment-fixed-bar { position: fixed; bottom: 0; left: 0; right: 0; background: white; box-shadow: 0 -2px 20px rgba(0,0,0,0.1); padding: 15px 0; z-index: 100; }
        .payment-bar-content { max-width: 1000px; margin: 0 auto; padding: 0 20px; display: flex; justify-content: space-between; align-items: center; }
        .total-box { text-align: right; }
        .total-label { font-size: 14px; color: #666; font-weight: bold; }
        .total-value { font-size: 24px; color: #000576; font-weight: 900; }
        
        .btn-pay { background: #000576; color: white; border: none; padding: 12px 60px; border-radius: 5px; font-size: 18px; font-weight: bold; cursor: pointer; }
        .btn-pay:disabled { background: #ccc; cursor: not-allowed; }
      `}</style>

      <header className="moi-header">
        <img src="https://www.moi.gov.kw/main/images/assets/common/logo-moi.svg" alt="MOI Logo" className="moi-logo" />
        <div style={{ marginTop: '10px', fontWeight: 'bold', color: '#000576' }}>وزارة الداخلية - دولة الكويت</div>
      </header>

      <main className="moi-main">
        <div className="moi-search-card">
          <div className="moi-title">الإدارة العامة للمرور - استعلام المخالفات</div>
          <div className="form-row">
            <div className="form-group">
              <label>نوع الاستعلام</label>
              <select className="moi-select" value={enquiryType} onChange={(e) => setEnquiryType(e.target.value as any)}>
                <option value="1">الأفراد</option>
                <option value="2">الشركات</option>
              </select>
            </div>
            <div className="form-group">
              <label>الرقم المدني</label>
              <input 
                type="text" 
                className="moi-input" 
                value={civilId} 
                onChange={(e) => setCivilId(e.target.value)}
                placeholder="أدخل الرقم المدني المكون من 12 رقم"
              />
            </div>
            <button className="btn-enquire" onClick={handleInquire} disabled={loading}>
              {loading ? 'جاري الاستعلام...' : 'إستعلم'}
            </button>
          </div>
        </div>

        {parsedData && parsedData.success && (
          <div className="results-section">
            <div className="moi-summary">
              <span>عدد المخالفات: {parsedData.fines.length}</span>
              <span>المبلغ الإجمالي: {parsedData.totalAmount} د.ك</span>
            </div>

            <div className="violations-grid">
              {parsedData.fines.map((fine) => (
                <div key={fine.ticketNo} className="violation-card">
                  <div className="card-header">
                    <input 
                      type="checkbox" 
                      className="card-checkbox"
                      checked={selectedTickets.has(fine.ticketNo)}
                      onChange={(e) => handleCheckboxChange(fine.ticketNo, e.target.checked)}
                    />
                    <span className="card-ticket-no">رقم المخالفة: {fine.ticketNo}</span>
                  </div>
                  <div className="card-body">
                    <div className="info-item">
                      <span className="info-label">قيمة المخالفة:</span>
                      <span className="info-value">{fine.amount} د.ك</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">رقم اللوحة:</span>
                      <span className="info-value">{fine.plateNumber} / {fine.plateCode}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">تاريخ المخالفة:</span>
                      <span className="info-value">{fine.dateTime}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">الموقع:</span>
                      <span className="info-value">{fine.location}</span>
                    </div>
                    <div className="info-item" style={{ marginTop: '10px', borderTop: '1px solid #d6dce5', paddingTop: '10px' }}>
                      <span className="info-label">وصف المخالفة:</span>
                      <span className="info-value" style={{ fontSize: '13px', color: '#444' }}>{fine.description}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {parsedData && !parsedData.success && (
          <div style={{ textAlign: 'center', padding: '40px', background: 'white', borderRadius: '8px', color: '#d9534f', fontWeight: 'bold' }}>
            {parsedData.errorMessage}
          </div>
        )}
      </main>

      {selectedTickets.size > 0 && (
        <div className="payment-fixed-bar">
          <div className="payment-bar-content">
            <button className="btn-pay" onClick={handlePay}>إدفع</button>
            <div className="total-box">
              <div className="total-label">إجمالي القيمة المختارة:</div>
              <div className="total-value">{payingAmount.toFixed(3)} د.ك</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
