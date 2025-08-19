# Database Setup for Direct CMS Page Management

This guide explains how to set up direct database access to manage the "Is Searchable" field for CMS pages.

## 🔧 Configuration

### 1. Update .env File

Add these database credentials to your `.env` file:

```env
# Database Configuration (for direct database access)
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_db_username
DB_PASSWORD=your_db_password
DB_NAME=your_magento_database_name
```

### 2. Database Requirements

- **MySQL/MariaDB**: Magento typically uses MySQL or MariaDB
- **Direct Access**: Your database user needs `SELECT` and `UPDATE` permissions on the `cms_page` table
- **Table**: The functionality targets the `cms_page` table's `is_searchable` field

## 🚀 API Endpoints

### Set Pages as Searchable

**POST** `/db/cms-pages/searchable`

Make specific pages searchable or not searchable.

```bash
# Make single page searchable
curl -X POST http://localhost:3000/db/cms-pages/searchable \
  -H "Content-Type: application/json" \
  -d '{"identifiers": "what-to-plant-in-april-guide", "searchable": 1}'

# Make multiple pages searchable
curl -X POST http://localhost:3000/db/cms-pages/searchable \
  -H "Content-Type: application/json" \
  -d '{"identifiers": ["page-1", "page-2", "page-3"], "searchable": 1}'

# Make pages NOT searchable
curl -X POST http://localhost:3000/db/cms-pages/searchable \
  -H "Content-Type: application/json" \
  -d '{"identifiers": "some-page", "searchable": 0}'
```

### Get Searchable Status

**GET** `/db/cms-pages/searchable/{identifier}`
**GET** `/db/cms-pages/searchable?identifiers=page1,page2,page3`

Check the searchable status of pages.

```bash
# Check single page
curl http://localhost:3000/db/cms-pages/searchable/what-to-plant-in-april-guide

# Check multiple pages
curl "http://localhost:3000/db/cms-pages/searchable?identifiers=page1,page2,page3"

# Get all pages (no filter)
curl http://localhost:3000/db/cms-pages/searchable
```

### Make All Contentful Pages Searchable

**POST** `/db/cms-pages/make-contentful-searchable`

Bulk update all Contentful-generated pages to be searchable.

```bash
curl -X POST http://localhost:3000/db/cms-pages/make-contentful-searchable
```

This targets pages with identifiers matching:
- `cf-%` (Contentful prefix)
- `what-to-plant%`
- `how-to-%`
- `how-and-when-%`

## 🔄 Bulk Sync Integration

The Python bulk sync script automatically makes pages searchable after processing:

```python
# In bulk_sync.py, the script will:
# 1. Process all Contentful articles
# 2. Create/update them in Magento via API
# 3. Make them searchable via database update
syncer.run_bulk_sync(delay_seconds=1.0, update_searchable=True)
```

To disable automatic searchable updates:
```python
syncer.run_bulk_sync(delay_seconds=1.0, update_searchable=False)
```

## 📊 Response Format

### Success Response
```json
{
  "success": true,
  "message": "Updated 15 pages to searchable",
  "affectedRows": 15,
  "identifiers": ["page1", "page2", "page3"]
}
```

### Error Response
```json
{
  "success": false,
  "message": "Database connection failed: Access denied for user 'user'@'localhost'",
  "affectedRows": 0
}
```

### Page Status Response
```json
{
  "success": true,
  "pages": [
    {
      "page_id": 3730,
      "identifier": "what-to-plant-in-april-guide",
      "title": "What to Plant in April: A Zone-by-Zone Guide",
      "is_searchable": true,
      "active": true
    }
  ]
}
```

## ⚠️ Important Notes

1. **Database Security**: Store database credentials securely and use a dedicated user with minimal permissions
2. **Connection Pooling**: The current implementation creates new connections per request - fine for low volume
3. **Error Handling**: Database errors are logged and returned as JSON responses
4. **Auto-Disconnect**: Database connections are automatically closed after each request

## 🔍 Troubleshooting

### Common Issues

1. **"Database credentials not configured"**
   - Check your `.env` file has all required DB_* variables
   - Restart the Express server after updating `.env`

2. **"Access denied for user"**
   - Verify database credentials are correct
   - Ensure the user has SELECT and UPDATE permissions on `cms_page` table

3. **"Table 'cms_page' doesn't exist"**
   - Verify you're connecting to the correct Magento database
   - Check if Magento uses a table prefix (e.g., `m2_cms_page`)

4. **Connection timeouts**
   - Check if database server is accessible from your application server
   - Verify firewall settings allow database connections

## 🛠️ Database Schema

The functionality targets this table structure:

```sql
-- cms_page table (simplified)
CREATE TABLE cms_page (
  page_id int PRIMARY KEY AUTO_INCREMENT,
  identifier varchar(100) NOT NULL,
  title varchar(255),
  is_searchable tinyint(1) DEFAULT 0,  -- This is what we update
  active tinyint(1) DEFAULT 1,
  -- ... other fields
);
```