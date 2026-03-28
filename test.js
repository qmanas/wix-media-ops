const { ok, notFound, serverError } = require('wix-http-functions');
const fetch = require('wix-fetch').fetch;
const { mediaManager } = require('wix-media-backend');

const WIX_APP_ID = process.env.WIX_APP_ID;
const WIX_APP_SECRET = process.env.WIX_APP_SECRET;
const WIX_MEDIA_UPLOAD_URL = process.env.WIX_MEDIA_UPLOAD_URL;
const WIX_SITE_ID = process.env.WIX_SITE_ID;

exports.post_uploadFile = async function (request) {
    try {
        // Extract file from the request
        const body = await request.body.json();
        const { fileName, fileType, fileData } = body;

        if (!fileName || !fileType || !fileData) {
            return notFound({ body: { error: 'Missing required fields' } });
        }

        // Generate upload URL
        const uploadUrlResponse = await fetch(WIX_MEDIA_UPLOAD_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${WIX_APP_SECRET}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                siteId: WIX_SITE_ID,
                fileName,
                fileType
            })
        });

        const uploadUrlData = await uploadUrlResponse.json();
        if (!uploadUrlData.uploadUrl) {
            throw new Error('Failed to generate upload URL');
        }

        // Upload the file
        const fileUploadResponse = await fetch(uploadUrlData.uploadUrl, {
            method: 'PUT',
            headers: { 'Content-Type': fileType },
            body: Buffer.from(fileData, 'base64')
        });

        if (!fileUploadResponse.ok) {
            throw new Error('File upload failed');
        }

        // Save file reference
        const fileUrl = uploadUrlData.fileUrl;

        return ok({ body: { success: true, fileUrl } });
    } catch (error) {
        return serverError({ body: { error: error.message } });
    }
};
