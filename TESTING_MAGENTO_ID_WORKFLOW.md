# Testing Magento ID Workflow

This document contains curl commands to test the new Magento ID workflow that tracks articles between Contentful and Magento.

## Prerequisites

1. Ensure your Express server is running: `npm run dev` or `node server.js`
2. Server should be accessible at `http://localhost:3000`
3. Environment variables should be configured (especially `CONTENTFUL_MANAGEMENT_TOKEN`)

## Test Scenarios

### 1. Test with Article That Has No Magento ID (First Time)

This will create a new Magento page and save the ID back to Contentful:

```bash
curl -X POST http://localhost:3000/render-and-submit/2TQ27DaJeAL3bCnKwiJcVN \
  -H "Content-Type: application/json" \
  -w "\n\nResponse Time: %{time_total}s\n" \
  -v
```

curl -X POST http://localhost:3000/render-and-submit/3S2IvOZHCEKdMpo0wMDAOs -H "Content-Type: application/json"

**Expected Result:**

- Creates new Magento CMS page
- Returns `"action": "created"` or `"action": "updated"` (if page exists with same identifier)
- Saves Magento ID back to Contentful entry
- Makes page searchable in Magento database

### 2. Test with Same Article Again (Should Use Existing ID)

Run the same command again - this time it should use the stored Magento ID:

```bash
curl -X POST http://localhost:3000/render-and-submit/2TQ27DaJeAL3bCnKwiJcVN \
  -H "Content-Type: application/json" \
  -w "\n\nResponse Time: %{time_total}s\n" \
  -v
```

**Expected Result:**

- Uses existing Magento ID from Contentful
- Updates the existing Magento page directly by ID
- Returns `"action": "updated"`
- No duplicate pages created

### 3. Test with Different Article

Try with another article entry ID:

```bash
# Replace ENTRY_ID with another article entry ID from your Contentful space
curl -X POST http://localhost:3000/render-and-submit/ENTRY_ID \
  -H "Content-Type: application/json" \
  -w "\n\nResponse Time: %{time_total}s\n" \
  -v
```

### 4. Get List of Available Articles

To find article entry IDs to test with:

```bash
curl http://localhost:3000/api/entries \
  -H "Accept: application/json" | jq '.'
```

### 5. Preview Article Before Submitting

Preview how an article will render:

```bash
curl http://localhost:3000/preview/article/2TQ27DaJeAL3bCnKwiJcVN
```

## Verification Commands

### Check Contentful Entry for Magento ID

You can verify that the Magento ID was saved using the MCP tool or by checking the Contentful web interface.

### Check Server Logs

Watch the server logs to see the detailed workflow:

- Whether it finds an existing Magento ID
- Whether it creates or updates a Magento page
- Whether it successfully saves the ID back to Contentful

## Expected Response Format

A successful response should look like this:

```json
{
  "success": true,
  "message": "Article rendered and updated in Magento",
  "entryId": "2TQ27DaJeAL3bCnKwiJcVN",
  "title": "Article Title",
  "magento": {
    "action": "updated", // or "created" for new pages
    "identifier": "article-slug-identifier",
    "status": 200
  }
}
```

## Common Test Cases

### Test Case 1: New Article (No Magento ID)

1. Find an article that doesn't have a `magentoId` field
2. Submit it using the render-and-submit endpoint
3. Verify the Magento ID gets saved back to Contentful
4. Check that a new page was created in Magento

### Test Case 2: Existing Article (Has Magento ID)

1. Use an article that already has a `magentoId` field
2. Submit it using the render-and-submit endpoint
3. Verify it updates the existing page rather than creating a new one
4. Check that no duplicate pages were created

### Test Case 3: Simulate Slug Change

1. Take an article with a Magento ID
2. The system should use the ID rather than the slug
3. Even if the slug changes in Contentful, it should update the same Magento page

## Troubleshooting

### Error: "CONTENTFUL_MANAGEMENT_TOKEN not found"

- Add the management token to your `.env` file
- Restart the server

### Error: "Page not found"

- The Magento page might have been deleted
- The system should handle this by creating a new page

### Error: "Unauthorized"

- Check your Magento OAuth credentials
- Verify the Magento base URL is correct

### Performance Testing

- Test with multiple articles in sequence
- Monitor response times
- Check for any memory leaks or performance issues

## Bulk Testing

You can also test the bulk sync script which will use this new workflow:

```bash
python bulk_sync.py
```

This will process all articles in your Contentful space using the new Magento ID workflow.

---

## Notes

- The workflow is backward compatible - existing articles without Magento IDs will still work
- The system automatically makes pages searchable in the Magento database
- All operations are logged to the console for debugging
- Failed Contentful updates won't fail the entire operation (graceful degradation)
