const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());

// Dynamic test endpoint (updated for Vercel)
app.get('/test', async (req, res) => {
    const numItems = parseInt(req.query.numItems) || 10;
    try {
        const cacheSize = await getCacheSize();
        console.log(`Running test with ${numItems} items. Cache size limit: ${cacheSize}`);

        if (numItems > cacheSize) {
            return res.status(400).json({ error: `Cannot add more than ${cacheSize} items to the cache.` });
        }

        const addedItems = await addEntries(numItems, cacheSize);
        await checkLRURemoval();

        res.json({
            message: `Test completed with ${numItems} items.`,
            addedItems: addedItems
        });
    } catch (error) {
        console.error("Error in /test:", error); // Log the full error
        res.status(500).json({ error: error.message }); // 500 status for server errors
    }
});


// Important: Export the app for Vercel
module.exports = app;

