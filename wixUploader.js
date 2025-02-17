require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const { createObjectCsvWriter } = require('csv-writer');

// Environment variables
const { WIX_APP_ID, WIX_APP_SECRET, WIX_SITE_ID, WIX_MEDIA_UPLOAD_URL } = process.env;

const IMAGE_DIR = './images';
const CSV_OUTPUT = './output/uploaded_images.csv';

// Step 1: Get Wix Access Token
// Step 1: Get Wix Access Token
async function getAccessToken() {
    const url = 'https://www.wix.com/oauth/access';
    const payload = {
        grant_type: 'client_credentials',
        client_id: process.env.WIX_APP_ID,
        client_secret: process.env.WIX_APP_SECRET
    };

    try {
        const response = await axios.post(url, payload, {
            headers: { 'Content-Type': 'application/json' }
        });

        console.log('✅ Access Token:', response.data.access_token);
        return response.data.access_token;

    } catch (error) {
        console.error('🚨 Failed to get access token:', error.response?.data || error.message);
        throw error;
    }
}


// Step 2: Upload Image to Wix Media
async function uploadImage(filePath, token) {
    const fileName = path.basename(filePath);
    const fileStream = fs.createReadStream(filePath);

    const form = new FormData();
    form.append('file', fileStream, fileName);
    form.append('siteId', WIX_SITE_ID);
    form.append('path', `images/${fileName}`);

    try {
        const response = await axios.post(WIX_MEDIA_UPLOAD_URL, form, {
            headers: {
                ...form.getHeaders(),
                Authorization: `Bearer ${token}`
            }
        });

        const uploadedUrl = response.data.fileUrl;
        console.log(`✅ Uploaded: ${fileName} → ${uploadedUrl}`);
        return uploadedUrl;

    } catch (error) {
        console.error(`❌ Failed to upload ${fileName}:`, error.response?.data || error.message);
        throw error;
    }
}

// Step 3: Bulk Upload Images
async function bulkUploadImages() {
    try {
        const token = await getAccessToken();
        const imageFiles = fs.readdirSync(IMAGE_DIR).filter(file => /\.(jpg|jpeg|png)$/i.test(file));

        if (imageFiles.length === 0) {
            console.warn('⚠️ No images found in the directory.');
            return;
        }

        const uploadedUrls = [];

        for (const file of imageFiles) {
            const filePath = path.join(IMAGE_DIR, file);
            const url = await uploadImage(filePath, token);
            uploadedUrls.push({ fileName: file, wixUrl: url });
        }

        // Step 4: Write to CSV
        await saveToCSV(uploadedUrls);
        console.log('🎉 All images uploaded and CSV file generated!');

    } catch (error) {
        console.error('🚨 Bulk upload failed:', error.message);
    }
}

// Step 4: Generate CSV File
async function saveToCSV(data) {
    const csvWriter = createObjectCsvWriter({
        path: CSV_OUTPUT,
        header: [
            { id: 'fileName', title: 'File Name' },
            { id: 'wixUrl', title: 'Wix URL' }
        ]
    });

    await csvWriter.writeRecords(data);
    console.log(`📂 CSV file created: ${CSV_OUTPUT}`);
}

// Start the process
bulkUploadImages();
