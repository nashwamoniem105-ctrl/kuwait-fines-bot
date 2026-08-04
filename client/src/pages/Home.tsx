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
      } else if (data.personalViolationsData || data.companyViolationsData) {
        const all = [...(data.personalViolationsData || []), ...(data.companyViolationsData || [])];
        all.forEach((ticket: any) => {
          fines.push({
            ticketNo: ticket.ticketNumber || '',
            amount: parseFloat(ticket.amount || 0).toFixed(2),
            dateTime: ticket.dateHappened ? ticket.dateHappened.replace('T', ' ') : '',
            location: ticket.location || '',
            source: ticket.beneficiary || 'وزارة الداخلية',
            description: ticket.violationDescription || '',
            payableOnline: ticket.isPayable === 2 ? 'Y' : 'N',
            plateNumber: ticket.plateNumber || '',
            plateCode: ticket.plateCode || '',
            violationType: ticket.violationType || 'D',
            vehicleType: 'سيارة',
          });
        });
      }

      const total = fines.reduce((sum, f) => sum + parseFloat(f.amount), 0);
      return { success: true, fines, totalAmount: total.toFixed(2) };
    } catch (e) {
      console.error('Parsing error:', e);
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
    <div className="moi-page" dir="rtl">
      <style>{`
        .moi-page { background-color: #f5f5f5; min-height: 100vh; font-family: Arial, sans-serif; }
        .moi-header { background: white; border-bottom: 3px solid #000576; padding: 15px 0; }
        .moi-header-container { max-width: 1140px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; padding: 0 15px; }
        .moi-logo { height: 70px; }
        .moi-header-text img { height: 35px; display: block; margin: 5px 0; }
        .moi-nav { background: #000576; color: white; padding: 10px 0; }
        .moi-nav-container { max-width: 1140px; margin: 0 auto; display: flex; list-style: none; padding: 0 15px; }
        .moi-nav-container li { padding: 0 15px; font-size: 14px; cursor: pointer; border-left: 1px solid rgba(255,255,255,0.2); }
        .moi-nav-container li.active { font-weight: bold; color: #ffc107; }
        .moi-main { max-width: 1140px; margin: 20px auto; padding: 0 15px; }
        .moi-breadcrumb { display: flex; align-items: center; gap: 10px; margin-bottom: 20px; color: #000576; font-weight: bold; }
        .moi-breadcrumb img { height: 40px; }
        .moi-enquiry-card { background: white; padding: 25px; border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border-top: 1px solid #dee2e6; }
        .moi-section-title { color: #000576; font-size: 18px; margin-bottom: 10px; border-bottom: 1px solid #000576; display: inline-block; padding-bottom: 5px; }
        .moi-form-row { display: flex; gap: 20px; margin-top: 20px; align-items: flex-end; flex-wrap: wrap; }
        .moi-form-group { flex: 1; min-width: 200px; }
        .moi-form-group label { display: block; margin-bottom: 8px; font-size: 14px; color: #333; font-weight: bold; }
        .moi-input, .moi-select { width: 100%; padding: 8px 12px; border: 1px solid #ced4da; border-radius: 4px; font-size: 16px; }
        .moi-btn-enquire { background: #000576; color: white; border: none; padding: 9px 30px; border-radius: 4px; cursor: pointer; font-weight: bold; }
        .moi-btn-enquire:hover { background: #000350; }
        
        .moi-results-summary { background: #e9ecef; border: 1px solid #dee2e6; padding: 10px 20px; margin-top: 20px; display: flex; justify-content: space-between; border-radius: 4px; font-size: 14px; }
        .moi-cards-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(500px, 1fr)); gap: 15px; margin-top: 20px; }
        @media (max-width: 600px) { .moi-cards-grid { grid-template-columns: 1fr; } }
        
        .moi-card { border: 1px solid #dee2e6; border-radius: 4px; overflow: hidden; background: white; }
        .moi-card-header { background: #eceae4; padding: 10px; border-top: 5px solid transparent; cursor: pointer; }
        .moi-card-header-top { display: flex; align-items: center; border-bottom: 1px solid #d6dce5; padding-bottom: 8px; margin-bottom: 8px; }
        .moi-card-checkbox { width: 20px; height: 20px; margin-left: 15px; }
        .moi-card-title { color: #000576; font-weight: bold; font-size: 15px; flex-grow: 1; }
        .moi-cancel-btn { color: #000576; font-size: 12px; font-weight: bold; cursor: pointer; margin-right: 10px; }
        .moi-card-info-row { font-size: 14px; margin: 5px 0; color: #333; display: flex; }
        .moi-card-info-row b { min-width: 100px; color: #000; }
        .moi-toggle-icon { text-align: left; color: #000576; padding-top: 5px; }
        
        .moi-card-details { padding: 15px; background: #fff; border-top: 1px solid #eee; font-size: 14px; }
        .moi-detail-item { margin-bottom: 8px; display: flex; }
        .moi-detail-item b { min-width: 100px; }
        
        .moi-payment-section { margin-top: 30px; text-align: center; max-width: 400px; margin-left: auto; margin-right: 0; }
        .moi-total-selected { background: #fff; border: 1px solid #dee2e6; padding: 10px; margin-bottom: 15px; text-align: right; border-radius: 4px; }
        .moi-total-selected-label { font-size: 14px; font-weight: bold; margin-bottom: 5px; }
        .moi-total-selected-value { font-size: 18px; font-weight: bold; color: #000576; }
        .moi-btn-pay { width: 100%; background: #000576; color: white; border: none; padding: 12px; border-radius: 4px; font-size: 16px; font-weight: bold; cursor: pointer; }
        .moi-btn-pay:disabled { background: #ccc; cursor: not-allowed; }
        .moi-notice { font-size: 12px; color: #666; margin-top: 15px; font-weight: bold; line-height: 1.4; }
        .moi-legend { display: flex; justify-content: center; gap: 15px; margin-top: 20px; }
        .legend-item { font-size: 12px; padding: 4px 8px; border-radius: 4px; color: white; }
        .legend-item.success { background: #28a745; }
        .legend-item.danger { background: #dc3545; }
        
        .moi-footer { margin-top: 50px; border-top: 1px solid #dee2e6; padding: 20px 0; text-align: center; color: #666; font-size: 13px; }
        .moi-social { display: flex; justify-content: center; gap: 15px; margin-bottom: 15px; }
        .moi-social img { height: 24px; opacity: 0.7; }
      `}</style>

      <header className="moi-header">
        <div className="moi-header-container">
          <img src="https://www.moi.gov.kw/main/images/assets/common/logo-moi.svg" alt="MOI" className="moi-logo" />
          <div className="moi-header-text">
            <img src="https://www.moi.gov.kw/main/images/assets/common/ar/state-of-kuwait.svg" alt="Kuwait" />
            <img src="https://www.moi.gov.kw/main/images/assets/common/ar/ministry-of-interior.svg" alt="Interior" />
          </div>
          <div style={{ width: '70px' }}></div>
        </div>
      </header>

      <nav className="moi-nav">
        <div className="moi-nav-container">
          <li className="active">الرئيسيــة</li>
          <li>الخدمات الإلكترونيـة</li>
          <li>إدارات توعوية</li>
          <li>الإصدارات الإلكترونية</li>
          <li>التحقق من الوثائق</li>
          <li>يهمنا رايك</li>
          <li>أرقام الطوارئ</li>
          <li>منصة المواعيد</li>
          <li style={{ borderLeft: 'none', marginRight: 'auto' }}>English</li>
        </div>
      </nav>

      <main className="moi-main">
        <div className="moi-breadcrumb">
          <img src="https://www.moi.gov.kw/main/images/assets/general-traffic/logo-general-traffic.svg" alt="Traffic" />
          <span>الإدارة العامة للمرور</span>
        </div>

        <div className="moi-enquiry-card">
          <h2 className="moi-section-title">الإدارة العامة للمرور</h2>
          <div className="moi-form-row">
            <div className="moi-form-group">
              <label>Enquiry Type</label>
              <select className="moi-select" value={enquiryType} onChange={(e) => setEnquiryType(e.target.value as any)}>
                <option value="1">الأفراد</option>
                <option value="2">الشركات</option>
              </select>
            </div>
            <div className="moi-form-group">
              <label>الرقم المدني أو الرقم الموحد</label>
              <input 
                type="text" 
                className="moi-input" 
                value={civilId} 
                onChange={(e) => setCivilId(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleInquire()}
              />
            </div>
            <button className="moi-btn-enquire" onClick={handleInquire} disabled={loading}>
              {loading ? 'جاري الاستعلام...' : 'إستعلم'}
            </button>
          </div>
        </div>

        {parsedData && (
          <div className="moi-results">
            {parsedData.success && parsedData.fines.length > 0 ? (
              <>
                <div className="moi-results-summary">
                  <div><b>عدد المخالفات</b>: {parsedData.fines.length}</div>
                  <div><b>المبلغ الاجمالي</b>: {parsedData.totalAmount} دك</div>
                </div>

                <div className="moi-cards-grid">
                  {parsedData.fines.map((fine) => (
                    <div key={fine.ticketNo} className="moi-card">
                      <div 
                        className="moi-card-header" 
                        style={{ borderTopColor: fine.payableOnline === 'Y' ? 'green' : 'red' }}
                        onClick={() => {
                          const el = document.getElementById(`details-${fine.ticketNo}`);
                          if (el) el.style.display = el.style.display === 'none' ? 'block' : 'none';
                        }}
                      >
                        <div className="moi-card-header-top">
                          <input 
                            type="checkbox" 
                            className="moi-card-checkbox"
                            checked={selectedTickets.has(fine.ticketNo)}
                            disabled={fine.payableOnline !== 'Y'}
                            onChange={(e) => {
                              e.stopPropagation();
                              handleCheckboxChange(fine.ticketNo, e.target.checked);
                            }}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <div className="moi-card-title">رقم:{fine.ticketNo}</div>
                          {selectedTickets.has(fine.ticketNo) && (
                            <span 
                              className="moi-cancel-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCheckboxChange(fine.ticketNo, false);
                              }}
                            >
                              إلغاء
                            </span>
                          )}
                        </div>
                        <div className="moi-card-info-row"><b>قيمة المخالفة</b>: {fine.amount} دك</div>
                        <div className="moi-card-info-row"><b>رقم اللوحة</b>: {fine.plateNumber}/{fine.plateCode}</div>
                        <div className="moi-card-info-row"><b>تاريخ المخالفة</b>: {fine.dateTime}</div>
                        <div className="moi-toggle-icon">▼</div>
                      </div>
                      <div id={`details-${fine.ticketNo}`} className="moi-card-details" style={{ display: 'none' }}>
                        <div className="moi-detail-item"><b>النوع:</b> {fine.violationType === 'D' ? 'مباشرة' : 'غير مباشرة'}</div>
                        <div className="moi-detail-item"><b>المكان:</b> {fine.location}</div>
                        <div className="moi-detail-item"><b>الوصف:</b> {fine.description}</div>
                        <div className="moi-detail-item"><b>السيارة:</b> {fine.vehicleType}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="moi-payment-section">
                  <div className="moi-total-selected">
                    <div className="moi-total-selected-label">إجمالي القيمة المختارة:</div>
                    <div className="moi-total-selected-value">{payingAmount.toFixed(3)} دك</div>
                  </div>
                  <input 
                    type="button" 
                    className="moi-btn-pay" 
                    value="إدفع" 
                    disabled={selectedTickets.size === 0}
                    onClick={handlePay}
                  />
                  <div className="moi-notice">
                    بعد إجراء عملية الدفع.. يرجى عدم محاولة الدفع مرة أخرى حيث يجرى تحديث البيانات خلال 15 دقيقة
                  </div>
                  <div className="moi-legend">
                    <span className="legend-item success">قابلة للدفع الكترونياً</span>
                    <span className="legend-item danger">غير قابلة للدفع الكترونياً</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="moi-enquiry-card" style={{ marginTop: '20px', textAlign: 'center' }}>
                <b>{parsedData.errorMessage || 'لا توجد مخالفات مسجلة.'}</b>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="moi-footer">
        <div className="moi-social">
          <img src="https://www.moi.gov.kw/main/images/assets/social-media/ico-youtube.svg" alt="YT" />
          <img src="https://www.moi.gov.kw/main/images/assets/social-media/ico-instagram.svg" alt="IG" />
          <img src="https://www.moi.gov.kw/main/images/assets/social-media/ico-twitter.svg" alt="TW" />
          <img src="https://www.moi.gov.kw/main/images/assets/social-media/ico-facebook.svg" alt="FB" />
        </div>
        <p>© جميع الحقوق محفوظة لوزارة الداخلية-دولة الكويت - 2026</p>
      </footer>
    </div>
  );
}
