
const axios = require('axios');

async function debug() {
    const civilId = "284022601154";
    const endpoint = `https://www.moi.gov.kw/mfservices/traffic-violation/${civilId}/1`;
    
    const headers = {
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'ar,en;q=0.9,en-US;q=0.8',
        'Connection': 'keep-alive',
        'Host': 'www.moi.gov.kw',
        'Referer': 'https://www.moi.gov.kw/main/eservices/gdt/violation-enquiry',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'X-Requested-With': 'XMLHttpRequest'
    };

    console.log(`Checking endpoint: ${endpoint}`);
    
    try {
        console.log("Step 1: Getting cookies...");
        const mainPage = await axios.get("https://www.moi.gov.kw/main/eservices/gdt/violation-enquiry", { headers });
        const cookies = mainPage.headers['set-cookie'];
        const cookieStr = cookies ? cookies.map(c => c.split(';')[0]).join('; ') : '';
        console.log("Cookies:", cookieStr ? "Received" : "None");

        console.log("Step 2: Calling API...");
        const response = await axios.get(endpoint, {
            headers: {
                ...headers,
                'Cookie': cookieStr
            }
        });

        console.log("Status:", response.status);
        if (response.data && response.data.ExportGroupViolationsList) {
            console.log("SUCCESS: Found " + response.data.ExportGroupViolationsList.length + " violations.");
        } else {
            console.log("FAILED: Data structure unexpected.", JSON.stringify(response.data).substring(0, 100));
        }
    } catch (error) {
        console.error("ERROR:", error.message);
        if (error.response) console.error("Status:", error.response.status);
    }
}

debug();
