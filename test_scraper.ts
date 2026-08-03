import { scrapeKuwaitFines } from "./server/scraper";

async function test() {
  const civilId = "294042803756";
  const enquiryType = "1";
  
  console.log(`Testing scraper with Civil ID: ${civilId}`);
  const result = await scrapeKuwaitFines(civilId, enquiryType);
  
  console.log("Result:", JSON.stringify(result, null, 2));
}

test().catch(console.error);
