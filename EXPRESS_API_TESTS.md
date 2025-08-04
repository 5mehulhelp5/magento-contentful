# Express Server API Test Commands

These `curl` commands can be used to test the various API endpoints of your Express server.

**Important:**
*   Ensure your Express server is running on `http://localhost:3000`.
*   Replace `YOUR_CONTENTFUL_ENTRY_ID` with an actual Contentful Entry ID that exists in your Contentful space. The example uses `5uxlBycb32V0ZNtcI9QHRZ`.

---

## 1. Get All Contentful Entries

This command fetches a list of Contentful entries from your server.

```bash
curl http://localhost:3000/api/entries
```

---

## 2. Preview an Article

This command retrieves and displays the rendered HTML of a specific Contentful article.

```bash
curl http://localhost:3000/preview/article/5uxlBycb32V0ZNtcI9QHRZ
```

---

## 3. Render and Save an Article to Output Folder

This command triggers the server to render a Contentful article and save its HTML output to the `./output` directory.

```bash
curl http://localhost:3000/render/article/5uxlBycb32V0ZNtcI9QHRZ
```

---

## 4. Render and Send an Article to Magento

This command renders a Contentful article and attempts to push it to your configured Magento instance. This will either create a new CMS page or update an existing one based on the `entryId`.

```bash
curl -X POST http://localhost:3000/render/article/5uxlBycb32V0ZNtcI9QHRZ/magento
```

---

## 5. Test Server Setup

This command hits a simple test endpoint to confirm the server is running and basic rendering works.

```bash
curl http://localhost:3000/test
```
