import { useState, useCallback, useEffect } from 'react';
import { useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Loader2, ChevronDown, ChevronUp, AlertCircle, CheckCircle2 } from 'lucide-react';

interface Fine {
  ticketNo: string;
  amount: string;
  dateTime: string;
  location?: string;
  locationAr?: string;
  source?: string;
  sourceAr?: string;
  description?: string;
  descriptionAr?: string;
  status?: string;
  isPaid?: boolean;
  violationType?: string;
  payableOnline?: string;
  fineType?: string;
}

interface ParsedData {
  success: boolean;
  fines: Fine[];
  totalAmount: string;
  totalFines: number;
  errorMessage?: string;
}

export default function HomeEn() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [civilId, setCivilId] = useState('');
  const [enquiryType, setEnquiryType] = useState<'1' | '2'>('1');
  const [loading, setLoading] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [selectedTickets, setSelectedTickets] = useState<Set<string>>(new Set());
  const [expandedTickets, setExpandedTickets] = useState<Set<string>>(new Set());

  const queryMutation = trpc.fines.query.useMutation();

  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css';
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  const parseMoiData = useCallback((data: any): ParsedData => {
    if (!data || !data.success) {
      return { success: false, fines: [], totalAmount: '0.00', totalFines: 0, errorMessage: data?.errorMessage || 'No data found' };
    }

    const fines: Fine[] = [];
    if (data.fines && Array.isArray(data.fines)) {
      data.fines.forEach((d: any) => {
        const descriptions: string[] = [];
        for (let i = 1; i <= 6; i++) {
          const desc = d[`Violation${i}Description`];
          if (desc) descriptions.push(desc);
        }

        fines.push({
          ticketNo: String(d.TicketNumber || d.ticketNumber || ''),
          amount: parseFloat(d.Amount || d.amount || '0').toFixed(2),
          dateTime: d.DateHappened ? `${d.DateHappened.split('T')[0]} ${d.TimeHappened || ''}`.trim() : '',
          location: d.PlaceOfViolation || d.placeOfViolation || '',
          locationAr: d.PlaceOfViolation || '',
          source: 'Kuwait Ministry of Interior',
          sourceAr: 'وزارة الداخلية',
          description: descriptions.join('\n'),
          descriptionAr: descriptions.join('\n'),
          payableOnline: d.PayableOnline || d.payableOnline || 'N',
          violationType: d.Type || d.type || 'D',
          fineType: d.PayableOnline === 'Y' ? 'payable' : 'unpayable',
          isPaid: false,
        });
      });
    }

    const total = fines.reduce((sum, f) => sum + parseFloat(f.amount || '0'), 0);
    return {
      success: true,
      fines,
      totalAmount: total.toFixed(2),
      totalFines: fines.length,
    };
  }, []);

  const handleInquire = useCallback(() => {
    const paddedCivilId = (civilId || '').replace(/\s+/g, '').padStart(12, '0');
    if (paddedCivilId.length < 8 || !/^\d+$/.test(paddedCivilId)) {
      toast({ variant: 'destructive', description: 'Please enter a valid Civil ID' });
      return;
    }

    setLoading(true);
    setParsedData(null);
    setSelectedTickets(new Set());
    setExpandedTickets(new Set());

    queryMutation.mutate(
      { civilId: paddedCivilId, enquiryType, lang: 'en' },
      {
        onSuccess: (data: any) => {
          setLoading(false);
          if (data?.fines && Array.isArray(data.fines)) {
            setParsedData({
              success: true,
              fines: data.fines,
              totalAmount: data.totalAmount || '0.00',
              totalFines: data.fines.length,
            });
          } else {
            setParsedData(parseMoiData(data));
          }
        },
        onError: (err) => {
          setLoading(false);
          toast({ variant: 'destructive', title: 'Connection Error', description: err.message });
        },
      }
    );
  }, [civilId, enquiryType, queryMutation, parseMoiData, toast]);

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
    setLocation('/payment/en');
  };

  return (
    <div style={{ backgroundColor: '#f2f2f2', minHeight: '100vh', fontFamily: 'Arial, sans-serif', direction: 'ltr' }}>
      <div style={{ backgroundColor: '#fff', borderBottom: '1px solid #ddd', padding: '10px 15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <i className="fas fa-bars" style={{ color: '#003366', fontSize: '20px', cursor: 'pointer' }} onClick={() => setLocation('/ar')} />
          <img src="https://www.moi.gov.kw/main/images/assets/common/logo-moi.svg" alt="MOI" style={{ height: '45px' }} />
        </div>
        <img src="https://www.moi.gov.kw/main/images/assets/general-traffic/logo-general-traffic.svg" alt="Traffic" style={{ height: '35px' }} />
      </div>

      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '15px' }}>
        <div style={{ textAlign: 'center', marginBottom: '15px' }}>
          <h1 style={{ color: '#003366', fontSize: '18px', fontWeight: 'bold', textDecoration: 'underline' }}>General Department of Traffic</h1>
        </div>

        <div style={{ backgroundColor: '#fff', borderRadius: '6px', padding: '15px', marginBottom: '15px', borderTop: '4px solid #003366' }}>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', color: '#333', marginBottom: '5px' }}>Enquiry Type</label>
            <select value={enquiryType} onChange={(e) => setEnquiryType(e.target.value as '1' | '2')} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}>
              <option value="1">Individuals</option>
              <option value="2">Companies</option>
            </select>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: '13px', color: '#666', marginBottom: '5px' }}>Civil ID or Unified Number</label>
            <input type="text" value={civilId} onChange={(e) => setCivilId(e.target.value)} placeholder="Enter Number" style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} />
          </div>

          <Button onClick={handleInquire} disabled={loading} style={{ width: '100%', backgroundColor: '#003366', color: '#fff', fontWeight: 'bold', height: '45px' }}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Enquire'}
          </Button>
        </div>

        {parsedData && parsedData.success && (
          <div style={{ marginTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', padding: '0 5px' }}>
              <span style={{ fontSize: '15px', fontWeight: 'bold', color: '#333' }}>Violations Found: {parsedData.totalFines}</span>
              <span style={{ fontSize: '15px', fontWeight: 'bold', color: '#d32f2f' }}>Total: {parsedData.totalAmount} KWD</span>
            </div>

            {parsedData.fines.map((fine) => (
              <div key={fine.ticketNo} style={{ backgroundColor: '#fff', borderRadius: '6px', marginBottom: '10px', border: '1px solid #ddd', overflow: 'hidden' }}>
                <div style={{ padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {fine.payableOnline === 'Y' && (
                      <Checkbox checked={selectedTickets.has(fine.ticketNo)} onCheckedChange={(checked) => {
                        const newSet = new Set(selectedTickets);
                        if (checked) newSet.add(fine.ticketNo); else newSet.delete(fine.ticketNo);
                        setSelectedTickets(newSet);
                      }} />
                    )}
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#003366' }}>No: {fine.ticketNo}</div>
                      <div style={{ fontSize: '12px', color: '#666' }}>{fine.dateTime}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontWeight: 'bold', color: '#d32f2f' }}>{fine.amount} KWD</span>
                    <button onClick={() => {
                      const newSet = new Set(expandedTickets);
                      if (newSet.has(fine.ticketNo)) newSet.delete(fine.ticketNo); else newSet.add(fine.ticketNo);
                      setExpandedTickets(newSet);
                    }} style={{ background: 'none', border: 'none', color: '#666' }}>
                      {expandedTickets.has(fine.ticketNo) ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                  </div>
                </div>

                {expandedTickets.has(fine.ticketNo) && (
                  <div style={{ padding: '12px', backgroundColor: '#fafafa', borderTop: '1px solid #eee' }}>
                    <div style={{ marginBottom: '8px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 'bold' }}>Location: </span>
                      <span style={{ fontSize: '13px' }}>{fine.location || fine.locationAr}</span>
                    </div>
                    <div style={{ marginBottom: '8px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 'bold' }}>Description: </span>
                      <span style={{ fontSize: '13px' }}>{fine.description || fine.descriptionAr}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {selectedTickets.size > 0 && (
              <Button onClick={handlePay} style={{ width: '100%', backgroundColor: '#2e7d32', color: '#fff', fontWeight: 'bold', height: '50px', marginTop: '10px' }}>
                Pay Selected ({selectedTickets.size})
              </Button>
            )}
          </div>
        )}

        {parsedData && !parsedData.success && (
          <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '6px', textAlign: 'center', marginTop: '20px', border: '1px solid #ddd' }}>
            <AlertCircle style={{ color: '#d32f2f', margin: '0 auto 10px', size: 30 }} />
            <p style={{ color: '#333' }}>{parsedData.errorMessage || 'No violations found for this number'}</p>
          </div>
        )}
      </div>
    </div>
  );
}
