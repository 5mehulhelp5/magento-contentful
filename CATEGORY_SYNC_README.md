# Category Page Bulk Sync Tool

This tool automatically creates and submits category pages with the new sidebar navigation to Magento from Contentful categories.

## Quick Start

1. **Make sure your Express server is running:**
   ```bash
   npm run dev  # or npm start
   ```

2. **Run a dry run to see what would be processed:**
   ```bash
   ./run_category_sync.sh --dry-run
   ```

3. **Run the actual sync:**
   ```bash
   ./run_category_sync.sh
   ```

## Requirements

### Environment Variables
Make sure your `.env` file contains:
```bash
CONTENTFUL_SPACE_ID=your_space_id
CONTENTFUL_ACCESS_TOKEN=your_access_token
PORT=3000  # optional, defaults to 3000
```

### Python Dependencies
```bash
pip3 install requests tqdm python-dotenv
```

### Express Server
The Express server must be running on the configured port (default: 3000) before running the sync.

## Usage Options

### Shell Script (Recommended)
```bash
# Dry run to preview what will be processed
./run_category_sync.sh --dry-run

# Run with custom delay between requests
./run_category_sync.sh --delay 3.0

# Run with verbose logging
./run_category_sync.sh --verbose

# Show help
./run_category_sync.sh --help
```

### Python Script (Direct)
```bash
# Dry run
python3 bulk_category_sync.py --dry-run

# Custom delay and verbose logging
python3 bulk_category_sync.py --delay 1.5 --verbose

# Show help
python3 bulk_category_sync.py --help
```

## Important Notes

### Category Selection
- **Only categories with `renderPage=true` will be processed**
- Use Contentful's interface to mark categories for page rendering
- The script will show you which categories are being skipped

### What Gets Created
Each processed category will generate:
- ✅ A complete category page with article grid and infinite scroll
- ✅ The new collapsible category sidebar navigation
- ✅ Proper JavaScript inlining for Magento compatibility
- ✅ Responsive design that works on all devices

### Performance & Safety
- **Default delay:** 2 seconds between requests (configurable)
- **Timeout:** 60 seconds per category page (longer than articles due to complexity)
- **Logging:** Detailed logs saved to timestamped files
- **Error handling:** Failed submissions are logged but don't stop the process

## Example Output

```bash
🚀 Starting Category Page bulk submission to Magento...
🔍 Fetching categories from Contentful...
   Fetched 67 categories (total: 67)
✅ Found 67 total categories in Contentful
📄 Found 5 categories marked for page rendering

📤 Processing 5 category pages...

🔄 Submitting top-level category: Getting Started
✅ Successfully submitted: Getting Started
   └─ Magento Page ID: 12345

🔄 Submitting subcategory category: Getting Started / Gardening 101
   └─ Parent category ID: xyz123
✅ Successfully submitted: Getting Started / Gardening 101
   └─ Magento Page ID: 12346

🎉 Bulk category sync completed!
📊 Results Summary:
   ✅ Successful: 5
   ❌ Failed: 0
   🆕 Created: 3
   🔄 Updated: 2
```

## Troubleshooting

### "No categories marked for page rendering"
This means none of your categories have `renderPage=true` in Contentful. To fix:
1. Go to Contentful CMS
2. Edit the categories you want pages for
3. Set `renderPage` field to `true`
4. Publish the entries
5. Run the script again

### "Express server is not running"
Make sure your Express server is started:
```bash
npm run dev  # Development mode with auto-reload
# OR
npm start    # Production mode
```

### Network errors or timeouts
- Increase the delay: `--delay 5.0`
- Check your internet connection
- Verify Contentful credentials in `.env`
- Check Express server logs for errors

### Failed submissions
- Check the detailed log file created in your directory
- Verify the category exists and is published in Contentful
- Check if Magento API credentials are correctly configured
- Review Express server logs for detailed error messages

## Log Files

Each run creates a timestamped log file:
- Format: `category_sync_YYYYMMDD_HHMMSS.log`
- Contains detailed information about each category processed
- Includes error details for troubleshooting failed submissions

## Integration with Existing Workflows

This script works alongside your existing content management:
- **Article sync:** Use `bulk_sync.py` for individual articles
- **Category sync:** Use `bulk_category_sync.py` for category landing pages
- **Manual testing:** Use `/preview/category/[id]` routes for individual testing
- **Manual submission:** Use `POST /render-and-submit-category/[id]` for single categories