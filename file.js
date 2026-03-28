import axios from "axios";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import os from "os";


dotenv.config();

// Load API Key and Site ID from .env file
const WIX_API_KEY = process.env.WIX_API_KEY;
const WIX_SITE_ID = process.env.WIX_SITE_ID;

if (!WIX_API_KEY || !WIX_SITE_ID) {
  console.error("❌ Error: Missing WIX_API_KEY or WIX_SITE_ID in .env file");
  process.exit(1);
}

// ✅ Wix API endpoint for generating an upload URL (NOT resumable)
const GENERATE_UPLOAD_URL = "https://www.wixapis.com/site-media/v1/files/generate-upload-url";

// ✅ Function to Generate Standard Upload URL
const generateUploadUrl = async (fileName, mimeType, fileSize) => {
    try {
        console.log("🔍 Generating Upload URL...");

        const requestBody = {
            mimeType, // "image/jpeg"
            fileName, // "1.jpeg"
            sizeInBytes: fileSize.toString(), // Ensure it's a string
            parentFolderId: "media-root", // Change this if you have a specific folder
            private: false,
            labels: ["example_label"] // Optional
        };

        console.log("📜 Request Body Sent to Wix:", JSON.stringify(requestBody, null, 2));

        const response = await axios.post(
            "https://www.wixapis.com/site-media/v1/files/generate-upload-url",
            requestBody,
            {
                headers: {
                    Authorization: `Bearer ${WIX_API_KEY}`,
                    "wix-site-id": WIX_SITE_ID,
                    "Content-Type": "application/json",
                },
            }
        );

        if (!response.data.uploadUrl) {
            throw new Error("❌ API did not return a valid upload URL.");
        }

        console.log("✅ Upload URL Generated Successfully!");
        return response.data.uploadUrl;
    } catch (error) {
        console.error("❌ Error generating upload URL:", JSON.stringify(error.response?.data, null, 2));
        return null;
    }
};
  

// ✅ Function to Upload File using PUT request
// Function to log the uploaded file info
const saveUploadReference = (fileName, uploadedUrl) => {
    const logFilePath =  "upload_log.json";

    let existingLogs = [];
    if (fs.existsSync(logFilePath)) {
        try {
            const rawData = fs.readFileSync(logFilePath);
            existingLogs = JSON.parse(rawData);
        } catch (error) {
            console.error("❌ Error reading log file:", error.message);
        }
    }

    existingLogs.push({ fileName, uploadedUrl });

    try {
        fs.writeFileSync(logFilePath, JSON.stringify(existingLogs, null, 2));
        console.log(`📂 Saved upload reference: ${fileName} -> ${uploadedUrl}`);
    } catch (error) {
        console.error("❌ Error writing log file:", error.message);
    }
};

const uploadFile = async (uploadUrl, filePath, fileName, mimeType) => {
    try {
        console.log("📤 Uploading file to Wix...");

        const fileStream = fs.createReadStream(filePath);
        const fileSize = fs.statSync(filePath).size;

        // ✅ Append filename in the upload URL
        const uploadUrlWithFilename = `${uploadUrl}?filename=${encodeURIComponent(fileName)}`;

        // ✅ Correct Headers
        const headers = {
            "Content-Type": mimeType,
            "Content-Length": fileSize,
            "Authorization": `Bearer ${WIX_API_KEY}`,
            "wix-site-id": WIX_SITE_ID
        };

        console.log("🎯 Uploading to URL:", uploadUrlWithFilename);
        console.log("🔍 Upload Headers:", headers);

        // ✅ Send PUT request to upload file
        const response = await axios.put(uploadUrlWithFilename, fileStream, { headers });

        // ✅ Properly Check Response
        if (response && response.data && response.data.file) {
            const uploadedFile = response.data.file;

            // ✅ Remove unnecessary labels
            const relevantLabels = uploadedFile.labels ? uploadedFile.labels.filter(label =>
                ["important", "approved"].includes(label.toLowerCase()) // Example condition
            ) : [];

            // ✅ Save only required fields
            const fileData = {
                id: uploadedFile.id,
                fileName: uploadedFile.displayName,
                uploadedUrl: uploadedFile.url,
                sizeInBytes: uploadedFile.sizeInBytes,
                uploadTime: uploadedFile.updatedDate,
                mediaType: uploadedFile.mediaType,
                labels: relevantLabels // Only keep necessary labels
            };

            saveUploadReference(fileData.fileName, fileData.uploadedUrl);

            console.log("✅ File uploaded successfully!", fileData);
            return fileData;
        } else {
            console.error("❌ Unexpected response format from Wix:", response.data);
        }
    } catch (error) {
        console.error("❌ Upload Error:", error.response?.data || error.message);
        return null;
    }
};

  


  

// ✅ Run the full process
(async () => {
    try {
      const filePath = "images/1.jpeg";
      const fileName = path.basename(filePath);
      const mimeType = "image/jpeg";
      const fileSize = fs.statSync(filePath).size.toString(); // Convert to string
  
      // Step 1: Generate Upload URL
      const uploadUrl = await generateUploadUrl(fileName, mimeType, fileSize);
  
      if (!uploadUrl) {
        console.error("❌ Upload URL generation failed. Exiting...");
        process.exit(1);
      }
  
      console.log("🎯 Upload URL:", uploadUrl);
  
      // Step 2: Upload File
      const uploadResult = await uploadFile(uploadUrl, filePath, fileName, mimeType);
  
      if (!uploadResult) {
        console.error("❌ File upload failed.");
      } else {
        console.log("🎉 File uploaded successfully!");
      }
    } catch (error) {
      console.error("❌ Unexpected Error:", error.message);
    }
  })();
  
  

