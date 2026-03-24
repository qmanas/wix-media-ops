# ☁️ Wix Media Ops: High-Performance Asset Sync

A professional-grade backend utility for bulk-uploading media assets to any Wix-powered site via the **Wix Media Manager V2 API**. Designed for high-concurrency environments like e-commerce migrations and automated content pipelines.

---

## 🔥 The Problem Solved
Managing thousands of product images in Wix manually is tedious. The standard dashboard is slow for bulk operations, and there's no native way to get back a clean CSV mapping of `original_filename` → `wix_static_url` for use in imports (e.g., WordPress or custom storefronts).

---

## 🛡️ The "Ghost-Proof" Win: 2-Step Pre-Signed Uploads
This project implements the high-performance **Wix V2 Media Flow**:
1.  **Ticket Acquisition**: Requests a pre-signed upload URL for each specific file, ensuring secure and authorized transfers.
2.  **Streaming Upload**: Directly pushes binary data to Wix's processing nodes, bypassing the main webserver for maximum throughput.
3.  **Self-Generating Ledger**: Automatically produces an `image_urls.csv` mapping, allowing you correlate your local database with Wix's media storage instantly.

---

## 🛠️ Usage
1.  Add your images to the `./images` directory.
2.  Create a `.env` file:
    ```env
    WIX_APP_ID=your_app_id
    WIX_APP_SECRET=your_app_secret
    WIX_SITE_ID=your_site_id
    ```
3.  Run the sync:
    ```bash
    npm install
    node script.js
    ```

---

## 💸 Technical Debt Liquidated
- **Rate-Limit Handling**: Includes logic to gracefully handle large batches without tripping API throttles.
- **ES Modules Integration**: Modern code structure using `import/export` and `promises/fs` for better maintainability.

---

## 🤝 Contributing
Contributions for handling other media types (Video/Audio) or generating gallery-specific JSON structures are welcome.

---

**Built for the bulk-data hero. 🚀**
