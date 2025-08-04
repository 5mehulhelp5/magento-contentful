# Contentful Webhook Test Commands

These `curl` commands can be used to test the Contentful webhook endpoint (`/webhook/contentful`) on your local server.

**Important:**
*   Ensure your Express server is running.
*   If testing locally, you will need to expose your `localhost` to the internet using a tunneling service like `ngrok`. Replace `http://localhost:3000` with your `ngrok` public URL (e.g., `https://your-ngrok-url.ngrok-free.app`).
*   Replace `YOUR_CONTENTFUL_ENTRY_ID` with an actual Contentful Entry ID that exists in your Contentful space.

---

## 1. Simulate a Contentful Entry Publish Event

This command simulates a `ContentManagement.Entry.publish` event. This should trigger the Magento push logic for the specified `entryId`.

```bash
curl -X POST \
  http://localhost:3000/webhook/contentful \
  -H "Content-Type: application/json" \
  -H "X-Contentful-Topic: ContentManagement.Entry.publish" \
  -d '{
        "sys": {
          "id": "YOUR_CONTENTFUL_ENTRY_ID",
          "type": "Entry",
          "revision": 1,
          "contentType": {
            "sys": {
              "id": "article",
              "type": "Link",
              "linkType": "ContentType"
            }
          },
          "environment": {
            "sys": {
              "id": "master",
              "type": "Link",
              "linkType": "Environment"
            }
          },
          "space": {
            "sys": {
              "id": "YOUR_CONTENTFUL_SPACE_ID",
              "type": "Link",
              "linkType": "Space"
            }
          },
          "publishedVersion": 1,
          "publishedAt": "2025-07-15T12:00:00.000Z",
          "firstPublishedAt": "2025-07-15T12:00:00.000Z",
          "updatedAt": "2025-07-15T12:00:00.000Z",
          "createdAt": "2025-07-15T12:00:00.000Z"
        },
        "fields": {
          "title": {
            "en-US": "Test Article from Webhook"
          },
          "slug": {
            "en-US": "test-article-from-webhook"
          },
          "body": {
            "en-US": {
              "nodeType": "document",
              "data": {},
              "content": [
                {
                  "nodeType": "paragraph",
                  "data": {},
                  "content": [
                    {
                      "nodeType": "text",
                      "value": "This is a test article published via webhook.",
                      "marks": [],
                      "data": {}
                    }
                  ]
                }
              ]
            }
          }
        }
      }'
```

---

## 2. Simulate a Contentful Entry Unpublish Event (Ignored)

This command simulates a `ContentManagement.Entry.unpublish` event. Your server is configured to ignore this topic, so it should return a `200 OK` status with a message indicating it was ignored.

```bash
curl -X POST \
  http://localhost:3000/webhook/contentful \
  -H "Content-Type: application/json" \
  -H "X-Contentful-Topic: ContentManagement.Entry.unpublish" \
  -d '{
        "sys": {
          "id": "YOUR_CONTENTFUL_ENTRY_ID",
          "type": "Entry",
          "revision": 1,
          "contentType": {
            "sys": {
              "id": "article",
              "type": "Link",
              "linkType": "ContentType"
            }
          },
          "environment": {
            "sys": {
              "id": "master",
              "type": "Link",
              "linkType": "Environment"
            }
          },
          "space": {
            "sys": {
              "id": "YOUR_CONTENTFUL_SPACE_ID",
              "type": "Link",
              "linkType": "Space"
            }
          },
          "publishedVersion": 1,
          "publishedAt": "2025-07-15T12:00:00.000Z",
          "firstPublishedAt": "2025-07-15T12:00:00.000Z",
          "updatedAt": "2025-07-15T12:00:00.000Z",
          "createdAt": "2025-07-15T12:00:00.000Z"
        },
        "fields": {
          "title": {
            "en-US": "Test Article from Webhook"
          },
          "slug": {
            "en-US": "test-article-from-webhook"
          },
          "body": {
            "en-US": {
              "nodeType": "document",
              "data": {},
              "content": [
                {
                  "nodeType": "paragraph",
                  "data": {},
                  "content": [
                    {
                      "nodeType": "text",
                      "value": "This is a test article unpublished via webhook.",
                      "marks": [],
                      "data": {}
                    }
                  ]
                }
              ]
            }
          }
        }
      }'
```