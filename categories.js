import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

// Load API Key and Site ID from .env file
const WIX_API_KEY = process.env.WIX_API_KEY;
const WIX_SITE_ID = process.env.WIX_SITE_ID;

if (!WIX_API_KEY || !WIX_SITE_ID) {
  console.error("❌ Error: Missing WIX_API_KEY or WIX_SITE_ID in .env file");
  process.exit(1);
}

// Wix API endpoint for querying collections
const QUERY_COLLECTIONS_URL = "https://www.wixapis.com/stores/v1/collections/query";

// Function to fetch up to 100 collections from Wix
const fetchCollections = async () => {
  try {
    console.log("📡 Fetching up to 100 collections...");

    const requestBody = {
      query: {}, // No filters applied to fetch all collections
      includeNumberOfProducts: true,
      includeDescription: true
    };

    const response = await axios.post(QUERY_COLLECTIONS_URL, requestBody, {
      headers: {
        Authorization: `Bearer ${WIX_API_KEY}`,
        "wix-site-id": WIX_SITE_ID,
        "Content-Type": "application/json",
      },
    });

    const collections = response.data.collections || [];
    console.log(`✅ Retrieved ${collections.length} collections.`);

    console.log("📋 All Collections:", JSON.stringify(collections, null, 2));
    return collections;
  } catch (error) {
    console.error("❌ Error fetching collections:", error.response?.data || error.message);
  }
};

// Run the collection retrieval process
(async () => {
  await fetchCollections();
})();
