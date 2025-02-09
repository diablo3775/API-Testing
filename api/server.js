const express = require('express');
const axios = require('axios');
const app = express();

// Use the environment variable for the port, or default to 3001 locally if not in Vercel
const API_URL = 'https://customizable-caching-api-hazel.vercel.app/cache'; // Update to the actual URL

// Middleware
app.use(express.json());

// Function to add multiple items
async function addEntries(numItems, cacheSize) {
    // Check if the number of items exceeds the cache size
    if (numItems > cacheSize) {
        throw new Error(`Cannot add more than ${cacheSize} items to the cache.`);
    }

    const addedItems = []; // Array to track added items

    for (let i = 1; i <= numItems; i++) {
        let key = `key${i}`;
        let value = `value${i}`;
        try {
            await axios.post(API_URL, { key, value });
            addedItems.push({ key, value }); // Track successfully added items
            console.log(`✅ Added: ${key}`);
        } catch (error) {
            console.log(`❌ Failed to add ${key}:`, error.response?.data || error.message);
        }
    }

    return addedItems; // Return added items for UI display
}

// Function to check if key1 was removed
async function checkLRURemoval() {
    try {
        await axios.get(`${API_URL}/key1`);
        console.log("❌ key1 still exists! LRU policy failed.");
    } catch (error) {
        console.log("✅ key1 was removed as expected:", error.response?.data || error.message);
    }
}

// Function to get the current cache size limit from the first server
async function getCacheSize() {
    try {
        const response = await axios.get('https://customizable-caching-api-hazel.vercel.app'); // Update to the actual URL
        const cacheSize = response.data.cacheSize || 10; // Default to 10 if no size is set
        return cacheSize;
    } catch (error) {
        throw new Error("Failed to fetch cache size.");
    }
}

// Dynamic test endpoint
app.get('/test', async (req, res) => {
    const numItems = parseInt(req.query.numItems) || 10; // Default to 10 if not provided
    try {
        const cacheSize = await getCacheSize(); // Get the current cache size from the main server
        console.log(`Running test with ${numItems} items. Cache size limit: ${cacheSize}`);

        // Check if the requested number of items exceeds cache size
        if (numItems > cacheSize) {
            return res.status(400).json({ error: `Cannot add more than ${cacheSize} items to the cache.` });
        }

        const addedItems = await addEntries(numItems, cacheSize); // Get the added items
        await checkLRURemoval();

        // Send the test results with the added items
        res.json({
            message: `Test completed with ${numItems} items.`,
            addedItems: addedItems
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Export the app for Vercel serverless deployment
module.exports = app;
