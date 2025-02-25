import axios from 'axios';
import { promises as fs } from 'fs';
import path from 'path';
import { createObjectCsvWriter } from 'csv-writer';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';
import FormData from 'form-data';

// ES Module fixes
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

// Configuration
const config = {
    APP_ID: process.env.WIX_APP_ID || 'YOUR_WIX_APP_ID',
    APP_SECRET: process.env.WIX_APP_SECRET || 'YOUR_WIX_APP_SECRET',
    SITE_ID: process.env.WIX_SITE_ID || 'YOUR_WIX_SITE_ID',
    // Local paths
    IMAGE_DIRECTORY: './images',
    OUTPUT_FILE: 'image_urls.csv',
};

// CSV writer setup
const csvWriter = createObjectCsvWriter({
    path: config.OUTPUT_FILE,
    header: [
        { id: 'filename', title: 'Original Filename' },
        { id: 'url', title: 'Wix URL' },
        { id: 'mediaId', title: 'Media ID' }
    ]
});

async function uploadImageToWix(imageBuffer, filename, mimeType) {
    try {
        console.log(`Uploading ${filename}...`);

        // Step 1: Generate upload URL
        console.log('Getting upload URL...');
        const generateUrlResponse = await axios({
            method: 'post',
            url: 'https://www.wixapis.com/_api/media-manager-server-webapp/v2/file/upload-url',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': config.APP_SECRET,
                'wix-site-id': config.SITE_ID
            },
            data: {
                mediaType: 'IMAGE',
                fileSize: imageBuffer.length,
                originalFileName: filename
            }
        });

        if (!generateUrlResponse.data || !generateUrlResponse.data.data?.uploadUrl) {
            throw new Error('Failed to get upload URL');
        }

        // Step 2: Upload to the pre-signed URL
        console.log('Got upload URL, proceeding with upload...');
        
        const uploadResponse = await axios({
            method: 'put',
            url: generateUrlResponse.data.data.uploadUrl,
            headers: {
                'Content-Type': mimeType
            },
            data: imageBuffer
        });

        // Step 3: Get the media info
        const mediaId = generateUrlResponse.data.data.mediaId;
        
        return {
            mediaId: mediaId,
            url: `https://static.wixstatic.com/media/${mediaId}`
        };

    } catch (error) {
        console.error('Upload error details:', {
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            message: error.message
        });

        throw new Error(`Upload failed: ${error.response?.data?.message || error.message}`);
    }
}

function getMimeType(filename) {
    const ext = path.extname(filename).toLowerCase();
    const mimeTypes = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp'
    };
    return mimeTypes[ext] || 'image/jpeg';
}

async function processImages() {
    try {
        // Create images directory if it doesn't exist
        await fs.mkdir(config.IMAGE_DIRECTORY, { recursive: true });

        // Read all files from the image directory
        const files = await fs.readdir(config.IMAGE_DIRECTORY);
        const imageFiles = files.filter(file => 
            ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(path.extname(file).toLowerCase())
        );

        if (imageFiles.length === 0) {
            console.log(`No images found in ${config.IMAGE_DIRECTORY}`);
            return;
        }

        console.log(`Found ${imageFiles.length} images to process`);
        const results = [];

        for (const file of imageFiles) {
            try {
                console.log(`\nProcessing ${file}...`);
                
                // Read the image file
                const filePath = path.join(config.IMAGE_DIRECTORY, file);
                const imageBuffer = await fs.readFile(filePath);
                const mimeType = getMimeType(file);

                // Upload the image
                const uploadResult = await uploadImageToWix(imageBuffer, file, mimeType);
                
                // Store the result
                results.push({
                    filename: file,
                    url: uploadResult.url,
                    mediaId: uploadResult.mediaId
                });

                console.log(`Successfully processed ${file}`);
                console.log(`URL: ${uploadResult.url}`);
                console.log(`Media ID: ${uploadResult.mediaId}`);

            } catch (error) {
                console.error(`Error processing ${file}:`, error.message);
            }
        }

        // Write results to CSV
        if (results.length > 0) {
            await csvWriter.writeRecords(results);
            console.log(`\nResults saved to ${config.OUTPUT_FILE}`);
        } else {
            console.log('\nNo images were successfully processed');
        }

    } catch (error) {
        console.error('Error:', error.message);
    }
}

// Error handling wrapper
async function main() {
    try {
        await processImages();
    } catch (error) {
        console.error('Fatal error:', error);
        process.exit(1);
    }
}

main();