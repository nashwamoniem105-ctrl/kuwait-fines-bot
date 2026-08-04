
import express from 'express';
import { scrapeKuwaitFines } from './server/scraper.js';

const app = express();
app.use(express.json());

app.post('/api/fines/query', async (req, res) => {
    const { civilId, enquiryType } = req.body;
    console.log(`[TestServer] Received query for: ${civilId}`);
    try {
        const result = await scrapeKuwaitFines(civilId, enquiryType || "1");
        console.log(`[TestServer] Scrape result success: ${result.success}`);
        res.json(result);
    } catch (error) {
        console.error("[TestServer] Error:", error);
        res.status(500).json({ success: false, errorMessage: error.message });
    }
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Local test server running on http://localhost:${PORT}`);
});
