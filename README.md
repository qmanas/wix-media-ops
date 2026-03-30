# 📦 Wix Media Ops: V2 API Utility

A utility for bulk-uploading media assets to Wix sites via the Wix Media Manager V2 API. Designed for managing large-scale migrations or automated content pipelines on the Wix platform.

- ⚙️ **V2 API Integration**: Logic for authenticated, multipart media uploads to the Wix CDN.
- 📦 **Concurrency Support**: Multi-threaded upload logic for high-volume asset migrations.
- 🧪 **Folder Management**: Automatic organization of uploaded files into the Wix Media Manager structure.

### Usage
Configure credentials in a \`.env\` file and run the upload script. Includes logic for file-type verification and error recovery.

**Technical Context:**
Developed for large-scale e-commerce migrations where manual uploads were not feasible.
