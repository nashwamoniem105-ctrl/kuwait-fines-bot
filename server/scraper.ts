import axios from "axios";
import http from "node:http";
import https from "node:https";
import { ProxyAgent } from "proxy-agent";

// Kuwait MOI API base URL
const KUWAIT_MOI_API = "https://www.moi.gov.kw/mfservices";
const PROXY_URL = process.env.PROXY_URL; // Optional proxy for Railway bypass

// قائمة وكلاء مجانية للتجربة في حال عدم وجود PROXY_URL
const FREE_PROXIES = [
  'http://51.158.154.173:3128',
  'http://185.162.229.154:10002',
  'http://159.203.87.130:3128'
];

// HTTP agents
const DEFAULT_HTTP_AGENT = new http.Agent({
  keepAlive: true,
  maxSockets: 200,
  maxFreeSockets: 50,
});

const DEFAULT_HTTPS_AGENT = new https.Agent({
  keepAlive: true,
  maxSockets: 200,
  maxFreeSockets: 50,
});

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0',
  'Mozilla/5.0 (AppleWebKit/537.36, like Gecko; compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
];

function getHeaders() {
  const ua = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
  return {
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'ar,en;q=0.9',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Host': 'www.moi.gov.kw',
    'Pragma': 'no-cache',
    'Referer': 'https://www.moi.gov.kw/main/eservices/gdt/violation-enquiry',
    'Sec-Ch-Ua': '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
    'Sec-Ch-Ua-Mobile': '?0',
    'Sec-Ch-Ua-Platform': '"Windows"',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'same-origin',
    'User-Agent': ua,
    'X-Requested-With': 'XMLHttpRequest'
  };
}

// ===== TYPES =====

export interface FineResult {
  fineNumber?: string;
  fineDate?: string;
  dateTime?: string;
  description?: string;
  descriptionAr?: string;
  amount?: string;
  blackPoints?: number;
  isPaid?: "paid" | "unpaid" | "partial";
  fineType?: "payable" | "blackpoints" | "unpayable" | "impound";
  location?: string;
  locationAr?: string;
  ticketNo?: string;
  trafficDepartment?: string;
  trafficDepartmentAr?: string;
  violationCode?: string;
  source?: string;
  sourceAr?: string;
  speed?: string;
  // Kuwait-specific fields
  plateNumber?: string;
  plateCode?: string;
  violationType?: string;
  payableOnline?: string;
}

export interface ScraperResult {
  success: boolean;
  fines: FineResult[];
  totalAmount?: string;
  errorMessage?: string;
  ownerInfo?: {
    maskedMobileNumber?: string;
  };
}

// Kuwait enquiry types
export const ENQUIRY_TYPES = [
  { value: "1", label: "أفراد", labelEn: "Individuals" },
  { value: "2", label: "شركات", labelEn: "Companies" },
];

function normalizeDigits(value: string) {
  return value
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)))
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)));
}

function padCivilId(civilId: string): string {
  const normalized = normalizeDigits(civilId).replace(/\s+/g, "");
  if (!/^\d+$/.test(normalized)) return "";
  return normalized.padStart(12, "0");
}

// ===== MAIN SCRAPER FUNCTION =====

export async function scrapeKuwaitFines(
  civilId: string,
  enquiryType: string
): Promise<ScraperResult> {
  const paddedId = padCivilId(civilId);

  if (!paddedId) {
    return {
      success: false,
      fines: [],
      errorMessage: "الرقم المدني غير صالح",
    };
  }

  if (enquiryType !== "1" && enquiryType !== "2") {
    return {
      success: false,
      fines: [],
      errorMessage: "نوع الاستعلام غير صالح",
    };
  }

  const endpoint = enquiryType === "2"
    ? `${KUWAIT_MOI_API}/traffic-violation-comp/${paddedId}`
    : `${KUWAIT_MOI_API}/traffic-violation/${paddedId}/${enquiryType}`;

  console.log(`[Scraper] Kuwait inquiry: civilId=${paddedId} enquiryType=${enquiryType} endpoint=${endpoint}`);

  let response: any;
  let lastError: any;
  const maxRetries = 3;

  // 1. الحصول على الكوكيز أولاً (Security Cookies)
  let cookies = "";
  try {
    const mainPage = await axios.get("https://www.moi.gov.kw/main/eservices/gdt/violation-enquiry", {
      headers: getHeaders(),
      timeout: 15000
    });
    if (mainPage.headers['set-cookie']) {
      cookies = mainPage.headers['set-cookie'].map(c => c.split(';')[0]).join('; ');
      console.log("[Scraper] Cookies obtained successfully");
    }
  } catch (e) {
    console.warn("[Scraper] Failed to get initial cookies, continuing anyway...");
  }

  for (let i = 0; i < maxRetries; i++) {
    try {
      console.log(`[Scraper] Attempt ${i + 1} for ${paddedId} ${PROXY_URL ? 'using proxy' : ''}`);
      
      const headers = getHeaders();
      if (cookies) headers['Cookie'] = cookies;

      const axiosConfig: any = {
        headers: headers,
        timeout: 25000,
        validateStatus: () => true,
      };

      const currentProxy = PROXY_URL || (i > 0 ? FREE_PROXIES[i % FREE_PROXIES.length] : null);
      
      if (currentProxy) {
        console.log(`[Scraper] Using proxy: ${currentProxy}`);
        const agent = new ProxyAgent(currentProxy);
        axiosConfig.httpAgent = agent;
        axiosConfig.httpsAgent = agent;
      } else {
        axiosConfig.httpAgent = false;
        axiosConfig.httpsAgent = false;
      }

      response = await axios.get(endpoint, axiosConfig);
      
      if (response.status === 200) break;
      console.warn(`[Scraper] Attempt ${i + 1} failed with status ${response.status}`);
      await new Promise(r => setTimeout(r, 1000 * (i + 1))); // Backoff
    } catch (err: any) {
      lastError = err;
      console.error(`[Scraper] Attempt ${i + 1} error:`, err.message);
      await new Promise(r => setTimeout(r, 1000 * (i + 1)));
    }
  }

  try {
    if (!response || response.status >= 400) {
      console.warn(`[Scraper] Kuwait API failed after retries. Status: ${response?.status}`);
      let errorMsg = `خطأ في الاتصال (Status: ${response?.status || 'Timeout'})`;
      if (lastError) {
        console.error("[Scraper] Last Error Details:", lastError.message);
        if (lastError.code === 'ECONNABORTED') errorMsg += " - انتهى وقت الانتظار";
        else if (lastError.code === 'ENOTFOUND') errorMsg += " - تعذر العثور على المضيف";
        else errorMsg += ` - ${lastError.message}`;
      }
      return {
        success: false,
        fines: [],
        errorMessage: errorMsg + ". يرجى المحاولة لاحقاً.",
      };
    }

    let data: any;
    data = response.data;
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch (e) {
        console.error("[Scraper] JSON Parse Error:", e);
      }
    }

    // Handle no fines case
    const isNoFinesMessage = data?.errorMsg && typeof data.errorMsg === "string" && 
      (data.errorMsg.toLowerCase().includes("no") || data.errorMsg.includes("لا توجد"));
    
    if (
      (data?.errorCode === "DP_Ex_Code_000") ||
      isNoFinesMessage ||
      (!data?.ExportGroupViolationsList && !data?.totalTicketsCount)
    ) {
      // If it's a "no violations" message, it's a success with 0 fines
      if (isNoFinesMessage && data.errorMsg.toLowerCase().includes("violations")) {
        return {
          success: true,
          fines: [],
          totalAmount: "0.00",
        };
      }

      // Check if it's truly "no fines" or an error
      if (data?.ExportGroupViolationsList === undefined && data?.totalTicketsCount === undefined && data?.errorMsg) {
        return {
          success: false,
          fines: [],
          errorMessage: data.errorMsg,
        };
      }
      return {
        success: true,
        fines: [],
        totalAmount: "0.00",
      };
    }

    // Parse V2 response (ExportGroupViolationsList)
    if (data?.ExportGroupViolationsList && Array.isArray(data.ExportGroupViolationsList)) {
      return mapKuwaitV2Response(data);
    }

    // Parse V1 response (totalTicketsCount)
    if (data?.totalTicketsCount !== undefined) {
      return mapKuwaitV1Response(data);
    }

    // Unknown response format
    return {
      success: false,
      fines: [],
      errorMessage: "لم يتم العثور على بيانات. تأكد من صحة الرقم المدني المدخل.",
    };
  } catch (err: any) {
    console.error("[Scraper] Kuwait API error:", err?.message || err);
    return {
      success: false,
      fines: [],
      errorMessage: "حدث خطأ أثناء الاتصال بخدمة وزارة الداخلية. يرجى المحاولة مرة أخرى.",
    };
  }
}

// Map V2 API response (ExportGroupViolationsList)
function mapKuwaitV2Response(data: any): ScraperResult {
  const violationsList = data.ExportGroupViolationsList || [];
  const fines: FineResult[] = [];

  for (const item of violationsList) {
    const details = item?.ExportGrpKuwaitViolationDetails;
    if (!details) continue;

    // Extract violation descriptions and codes
    const descriptions: string[] = [];
    const codes: string[] = [];
    for (let i = 1; i <= 6; i++) {
      const desc = details[`Violation${i}Description`];
      const code = details[`Violation${i}Code`];
      if (desc) {
        descriptions.push(desc);
        if (code) codes.push(code);
      }
    }

    const amount = details.Amount || details.amount || "0";
    const numericAmount = parseFloat(String(amount).replace(/[^0-9.]/g, "")) || 0;

    fines.push({
      fineNumber: String(details.TicketNumber || details.ticketNumber || ""),
      fineDate: details.DateHappened
        ? details.DateHappened.split('T')[0]
        : "",
      dateTime: details.DateHappened
        ? `${details.DateHappened.split('T')[0]} ${details.TimeHappened || ""}`.trim()
        : "",
      description: descriptions.join("\n"),
      descriptionAr: descriptions.join("\n"),
      amount: numericAmount.toFixed(2),
      blackPoints: 0,
      isPaid: "unpaid",
      fineType: details.PayableOnline === "Y" ? "payable" : "unpayable",
      location: details.PlaceOfViolation || details.placeOfViolation || "",
      locationAr: details.PlaceOfViolation || "",
      ticketNo: String(details.TicketNumber || details.ticketNumber || ""),
      trafficDepartment: "وزارة الداخلية الكويتية",
      trafficDepartmentAr: "وزارة الداخلية",
      source: "وزارة الداخلية الكويتية",
      sourceAr: "وزارة الداخلية",
      plateNumber: details.PlateNumber || details.plateNumber || "",
      plateCode: details.PlateCode || details.plateCode || "",
      violationType: details.Type || details.type || "",
      payableOnline: details.PayableOnline || details.payableOnline || "",
      violationCode: codes.join(", "),
    });
  }

  const totalAmount = fines.reduce((sum, f) => {
    return sum + parseFloat(f.amount?.replace(/[^0-9.]/g, "") || "0");
  }, 0);

  return {
    success: true,
    fines,
    totalAmount: totalAmount.toFixed(2),
  };
}

// Map V1 API response
function mapKuwaitV1Response(data: any): ScraperResult {
  const personalFines = Array.isArray(data?.personalViolationsData) ? data.personalViolationsData : [];
  const companyFines = Array.isArray(data?.companyViolationsData) ? data.companyViolationsData : [];
  const allTickets = [...personalFines, ...companyFines];
  const fines: FineResult[] = [];

  for (const ticket of allTickets) {
    const amount = ticket.amount || ticket.Amount || "0";
    const numericAmount = parseFloat(String(amount).replace(/[^0-9.]/g, "")) || 0;

    fines.push({
      fineNumber: String(ticket.ticketNumber || ticket.TicketNumber || ""),
      fineDate: ticket.dateHappened
        ? ticket.dateHappened.split('T')[0]
        : "",
      dateTime: ticket.dateHappened
        ? `${ticket.dateHappened.split('T')[0]} ${ticket.timeHappened || ""}`.trim()
        : "",
      description: ticket.violationDescription || ticket.description || "",
      descriptionAr: ticket.violationDescriptionAr || ticket.violationDescription || "",
      amount: numericAmount.toFixed(2),
      blackPoints: ticket.blackPoints || 0,
      isPaid: ticket.isPaid ? "paid" : "unpaid",
      fineType: ticket.isPayable === 2 ? "payable" : ticket.licenseShouldbePresented ? "blackpoints" : "unpayable",
      location: ticket.location || ticket.placeOfViolation || "",
      locationAr: ticket.location || "",
      ticketNo: String(ticket.ticketNumber || ticket.TicketNumber || ""),
      trafficDepartment: ticket.beneficiary || ticket.trafficDepartment || "وزارة الداخلية الكويتية",
      trafficDepartmentAr: ticket.beneficiary || "وزارة الداخلية",
      source: ticket.trafficDepartment || "وزارة الداخلية الكويتية",
      sourceAr: ticket.beneficiary || "وزارة الداخلية",
      plateNumber: ticket.plateNumber || "",
      plateCode: ticket.plateCode || "",
      violationType: ticket.type || "",
      payableOnline: ticket.payableOnline || "N",
      speed: ticket.speed || undefined,
    });
  }

  const totalAmount = fines.reduce((sum, f) => {
    return sum + parseFloat(f.amount?.replace(/[^0-9.]/g, "") || "0");
  }, 0);

  return {
    success: true,
    fines,
    totalAmount: totalAmount.toFixed(2),
  };
}
