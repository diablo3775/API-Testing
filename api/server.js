const express = require('express');
const axios = require('axios');
const app = express();

// Use environment variables for configuration
const API_URL = process.env.API_URL || 'http://localhost:3000/cache'; // Default for local
const MAIN_SERVER_URL = process.env.MAIN_SERVER_URL || 'http://localhost:3000'; // Default for local

// Function to add multiple items (unchanged)
async function addEntries(numItems, cacheSize) {
    // ... (same as before)
}

// Function to check if key1 was removed (unchanged)
async function checkLRURemoval() {
    // ... (same as before)
}

// Function to get the current cache size limit from the first server (updated)
async function getCacheSize() {
    try {
        const response = await axios.get(MAIN_SERVER_URL); // Use MAIN_SERVER_URL
        const cacheSize = response.data.cacheSize || 10;
        return cacheSize;
    } catch (error) {
        throw new Error(`Failed to fetch cache size from ${MAIN_SERVER_URL}. Make sure the server is running and accessible.`);
    }
}

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

