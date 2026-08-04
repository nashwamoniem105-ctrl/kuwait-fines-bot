
import { scrapeKuwaitFines } from './server/scraper';

async function verify() {
    console.log("--- FINAL VERIFICATION START ---");
    const civilId = "284022601154";
    console.log(`Testing with Civil ID: ${civilId}`);
    
    const result = await scrapeKuwaitFines(civilId, "1");
    
    if (result.success) {
        console.log("STATUS: SUCCESS");
        console.log(`TOTAL FINES FOUND: ${result.fines.length}`);
        console.log(`TOTAL AMOUNT: ${result.totalAmount} KWD`);
        
        if (result.fines.length > 0) {
            const first = result.fines[0];
            console.log("SAMPLE DATA CHECK:");
            console.log(`- Ticket: ${first.ticketNo}`);
            console.log(`- Plate: ${first.plateNumber} / ${first.plateCode}`);
            console.log(`- Vehicle: ${first.make} ${first.model}`);
        }
    } else {
        console.log("STATUS: FAILED");
        console.log(`ERROR: ${result.errorMessage}`);
    }
    console.log("--- FINAL VERIFICATION END ---");
}

verify().catch(console.error);
