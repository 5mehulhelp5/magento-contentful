require('dotenv').config();
require('@babel/register')({
  presets: ['@babel/preset-env', '@babel/preset-react'],
  extensions: ['.js', '.jsx']
});

const express = require('express');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { createClient } = require('contentful');
const fs = require('fs').promises;
const path = require('path');
const { submitToMagento } = require('./src/utils/magentoAPI');

const app = express();
app.use(express.json());

// Contentful client setup
const contentfulClient = createClient({
  space: process.env.CONTENTFUL_SPACE_ID,
  accessToken: process.env.CONTENTFUL_ACCESS_TOKEN,
  environment: process.env.CONTENTFUL_ENVIRONMENT || 'master'
});

// Basic CSS for styling
const basicCSS = `
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    line-height: 1.6;
    margin: 0;
    padding: 0;
    background-color: #ffffff;
  }
  
  .min-h-screen { min-height: 100vh; }
  .bg-white { background-color: #ffffff; }
  .bg-gray-50 { background-color: #f9fafb; }
  .bg-green-50 { background-color: #f0fdf4; }
  .text-gray-900 { color: #111827; }
  .text-gray-700 { color: #374151; }
  .text-gray-600 { color: #4b5563; }
  .text-gray-500 { color: #6b7280; }
  .text-green-600 { color: #16a34a; }
  .text-green-700 { color: #15803d; }
  .max-w-4xl { max-width: 896px; }
  .mx-auto { margin-left: auto; margin-right: auto; }
  .px-4 { padding-left: 16px; padding-right: 16px; }
  .px-6 { padding-left: 24px; padding-right: 24px; }
  .px-8 { padding-left: 32px; padding-right: 32px; }
  .py-8 { padding-top: 32px; padding-bottom: 32px; }
  .py-12 { padding-top: 48px; padding-bottom: 48px; }
  .mb-4 { margin-bottom: 16px; }
  .mb-6 { margin-bottom: 24px; }
  .mt-8 { margin-top: 32px; }
  .mt-6 { margin-top: 24px; }
  .mt-4 { margin-top: 16px; }
  .my-6 { margin-top: 24px; margin-bottom: 24px; }
  .my-8 { margin-top: 32px; margin-bottom: 32px; }
  .text-4xl { font-size: 36px; line-height: 40px; }
  .text-3xl { font-size: 30px; line-height: 36px; }
  .text-2xl { font-size: 24px; line-height: 32px; }
  .text-xl { font-size: 20px; line-height: 28px; }
  .text-lg { font-size: 18px; line-height: 28px; }
  .text-base { font-size: 16px; line-height: 24px; }
  .text-sm { font-size: 14px; line-height: 20px; }
  .font-medium { font-weight: 500; }
  .font-semibold { font-weight: 600; }
  .leading-relaxed { line-height: 1.625; }
  .underline { text-decoration: underline; }
  .italic { font-style: italic; }
  .rounded-lg { border-radius: 8px; }
  .shadow-md { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); }
  .overflow-hidden { overflow: hidden; }
  .overflow-x-auto { overflow-x: auto; }
  .object-cover { object-fit: cover; }
  .max-w-full { max-width: 100%; }
  .h-auto { height: auto; }
  .h-96 { height: 384px; }
  .w-full { width: 100%; }
  .w-full { width: 100%; }
  .h-full { height: 100%; }
  .prose { color: #374151; }
  .prose h1 { font-size: 36px; font-weight: 500; margin-bottom: 24px; }
  .prose h2 { font-size: 30px; font-weight: 500; margin-bottom: 16px; margin-top: 32px; }
  .prose h3 { font-size: 24px; font-weight: 500; margin-bottom: 12px; margin-top: 24px; }
  .prose p { margin-bottom: 16px; line-height: 1.625; }
  .prose ul { list-style-type: disc; margin-left: 24px; margin-bottom: 16px; }
  .prose ol { list-style-type: decimal; margin-left: 24px; margin-bottom: 16px; }
  .prose li { margin-bottom: 8px; }
  .prose blockquote { border-left: 4px solid #16a34a; padding-left: 16px; padding-top: 8px; padding-bottom: 8px; margin-bottom: 16px; font-style: italic; color: #4b5563; background-color: #f0fdf4; }
  .prose code { background-color: #f3f4f6; border-radius: 4px; padding: 2px 4px; font-size: 14px; font-family: Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace; }
  .prose table { min-width: 100%; border-collapse: collapse; border: 1px solid #d1d5db; border-radius: 8px; }
  .prose th { padding: 12px 16px; text-align: left; font-weight: 500; background-color: #f0fdf4; border-bottom: 1px solid #d1d5db; }
  .prose td { padding: 12px 16px; border-bottom: 1px solid #d1d5db; }
  .prose tr:nth-child(even) { background-color: #f9fafb; }
  .prose tr:hover { background-color: #f3f4f6; }
  .prose strong { font-weight: 600; }
  .prose em { font-style: italic; }
  .prose u { text-decoration: underline; }
  .prose hr { border-color: #d1d5db; margin: 32px 0; }
  .prose a { color: #16a34a; text-decoration: underline; }
  .prose a:hover { color: #15803d; }
  .prose img { border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); margin: 0 auto; }
  .prose .text-center { text-align: center; }
  .prose .mt-2 { margin-top: 8px; }
  .flex { display: flex; }
  .items-center { align-items: center; }
  
  @media (min-width: 640px) {
    .sm\:px-6 { padding-left: 24px; padding-right: 24px; }
  }
  
  @media (min-width: 1024px) {
    .lg\:px-8 { padding-left: 32px; padding-right: 32px; }
  }
  
  @media (min-width: 768px) {
    .md\:text-5xl { font-size: 48px; line-height: 1; }
  }
`;

// Function to render page to static HTML
async function renderPageToStatic(PageComponent, props = {}) {
  const html = renderToStaticMarkup(React.createElement(PageComponent, props));
  
  const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${props.title || 'Page'}</title>
    <style>${basicCSS}</style>
</head>
<body>
    ${html}
</body>
</html>`;
  
  return { html: fullHtml };
}

// Get content from Contentful
async function getContentfulEntry(entryId) {
  try {
    const entry = await contentfulClient.getEntry(entryId);
    return entry;
  } catch (error) {
    console.error('Error fetching Contentful entry:', error);
    return null;
  }
}

// Search for a Magento CMS page by identifier
async function findMagentoPageByIdentifier(identifier) {
  const request = {
    url: `${process.env.MAGENTO_API_URL}/rest/default/V1/cmsPage/search?searchCriteria[filter_groups][0][filters][0][field]=identifier&searchCriteria[filter_groups][0][filters][0][value]=${identifier}&searchCriteria[filter_groups][0][filters][0][condition_type]=eq`,
    method: 'GET',
  };

  const authHeader = getOAuthHeaders(request);

  const response = await fetch(request.url, {
    method: request.method,
    headers: {
      ...authHeader,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  const searchResults = await response.json();
  return searchResults.items.length > 0 ? searchResults.items[0] : null;
}

// API Routes
app.get('/render/article/:entryId', async (req, res) => {
  try {
    const { entryId } = req.params;
    
    // Fetch content from Contentful
    const contentfulEntry = await getContentfulEntry(entryId);
    
    if (!contentfulEntry) {
      return res.status(404).json({ error: 'Content not found' });
    }
    
    const PageComponent = require('./src/pages/ArticlePage.jsx').default;
    const { html } = await renderPageToStatic(PageComponent, {
      data: contentfulEntry.fields,
      title: contentfulEntry.fields.title,
    });
    
    // Save to output directory
    await fs.mkdir('./output', { recursive: true });
    await fs.writeFile(`./output/${entryId}.html`, html);
    
    res.json({ 
      success: true, 
      message: `Article rendered and saved to ./output/${entryId}.html`,
      entryId: entryId,
      title: contentfulEntry.fields.title
    });
    
  } catch (error) {
    console.error('Error rendering article:', error);
    res.status(500).json({ error: error.message });
  }
});

// New route: Render and submit to Magento
app.post('/render-and-submit/:entryId', async (req, res) => {
  try {
    const { entryId } = req.params;
    
    // Fetch content from Contentful
    const contentfulEntry = await getContentfulEntry(entryId);
    
    if (!contentfulEntry) {
      return res.status(404).json({ error: 'Content not found' });
    }
    
    const PageComponent = require('./src/pages/ArticlePage.jsx').default;
    const { html } = await renderPageToStatic(PageComponent, {
      data: contentfulEntry.fields,
      title: contentfulEntry.fields.title,
    });
    
    // Save to output directory
    await fs.mkdir('./output', { recursive: true });
    await fs.writeFile(`./output/${entryId}.html`, html);
    
    // Submit to Magento
    const magentoResult = await submitToMagento(contentfulEntry, html);
    
    if (magentoResult.success) {
      res.json({
        success: true,
        message: `Article rendered and ${magentoResult.action} in Magento`,
        entryId: entryId,
        title: contentfulEntry.fields.title,
        magento: {
          action: magentoResult.action,
          identifier: magentoResult.identifier,
          status: magentoResult.status
        }
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Article rendered but failed to submit to Magento',
        entryId: entryId,
        title: contentfulEntry.fields.title,
        error: magentoResult.error
      });
    }
    
  } catch (error) {
    console.error('Error rendering and submitting article:', error);
    res.status(500).json({ error: error.message });
  }
});

// Render and send to Magento
app.post('/render/article/:entryId/magento', async (req, res) => {
  try {
    const { entryId } = req.params;

    // Fetch content from Contentful
    const contentfulEntry = await getContentfulEntry(entryId);

    if (!contentfulEntry) {
      return res.status(404).json({ error: 'Content not found' });
    }

    const PageComponent = require('./src/pages/ArticlePage.jsx').default;
    const { html } = await renderPageToStatic(PageComponent, {
      data: contentfulEntry.fields,
      title: contentfulEntry.fields.title,
    });

    const magentoIdentifier = entryId.toLowerCase();

    // Check if the page already exists in Magento
    const existingPage = await findMagentoPageByIdentifier(magentoIdentifier);

    let magentoResponse;
    if (existingPage) {
      // Update existing page
      const pageData = {
        page: {
          id: existingPage.id,
          title: contentfulEntry.fields.title,
          content: html,
          active: true,
        },
      };
      magentoResponse = await updateMagentoPage(existingPage.id, pageData);
    } else {
      // Create new page
      const pageData = {
        page: {
          identifier: magentoIdentifier,
          title: contentfulEntry.fields.title,
          page_layout: 'cms-full-width',
          content: html,
          active: true,
        },
      };
      magentoResponse = await createMagentoPage(pageData);
    }

    res.json({
      success: true,
      message: `Article ${existingPage ? 'updated' : 'created'} in Magento.`,
      magentoResponse,
    });

  } catch (error) {
    console.error('Error processing Magento request:', error);
    res.status(500).json({ error: error.message });
  }
});

// Preview route to view rendered content
app.get('/preview/article/:entryId', async (req, res) => {
  try {
    const { entryId } = req.params;
    
    // Fetch content from Contentful
    const contentfulEntry = await getContentfulEntry(entryId);
    
    if (!contentfulEntry) {
      return res.status(404).send('<h1>Content not found</h1>');
    }
    
    const PageComponent = require('./src/pages/ArticlePage.jsx').default;
    const { html } = await renderPageToStatic(PageComponent, {
      data: contentfulEntry.fields,
      title: contentfulEntry.fields.title,
    });
    
    res.send(html);
    
  } catch (error) {
    console.error('Error previewing article:', error);
    res.status(500).send('<h1>Error loading content</h1>');
  }
});

// List all entries
// Webhook for Contentful
app.post('/webhook/contentful', async (req, res) => {
  try {
    const contentfulTopic = req.headers['x-contentful-topic'];
    
    // Ensure it's an entry publish event
    if (contentfulTopic === 'ContentManagement.Entry.publish') {
      const entryId = req.body?.sys?.id;

      if (!entryId) {
        return res.status(400).json({ error: 'Missing entryId in webhook payload.' });
      }

      // Trigger the Magento push logic
      // We'll simulate a request to our own /render/article/:entryId/magento endpoint
      // This is a simplified internal call, in a real app you might refactor the logic
      // to be directly callable without simulating an HTTP request.
      const internalReq = {
        params: { entryId: entryId },
        body: {} // Webhook doesn't send body for this internal call
      };
      const internalRes = {
        json: (data) => {
          console.log('Magento push result:', data);
          res.status(200).json({ success: true, message: 'Webhook processed', magentoResult: data });
        },
        status: (code) => {
          return {
            json: (data) => {
              console.error('Magento push error:', data);
              res.status(code).json({ success: false, message: 'Webhook processing failed', error: data });
            }
          };
        }
      };
      
      // Call the Magento push handler
      await app.post('/render/article/:entryId/magento', internalReq, internalRes);

    } else {
      res.status(200).json({ message: `Ignoring webhook topic: ${contentfulTopic}` });
    }

  } catch (error) {
    console.error('Error processing Contentful webhook:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/entries', async (req, res) => {
  try {
    const entries = await contentfulClient.getEntries({
      limit: 10
    });
    
    const entriesData = entries.items.map(entry => ({
      id: entry.sys.id,
      title: entry.fields.title || 'Untitled',
      contentType: entry.sys.contentType.sys.id,
      updatedAt: entry.sys.updatedAt
    }));
    
    res.json(entriesData);
    
  } catch (error) {
    console.error('Error fetching entries:', error);
    res.status(500).json({ error: error.message });
  }
});

// Root route with instructions
app.get('/', (req, res) => {
  const instructions = `
    <html>
      <head>
        <title>Contentful Express Renderer</title>
        <style>${basicCSS}</style>
      </head>
      <body style="padding: 2rem; max-width: 800px; margin: 0 auto;">
        <h1>Contentful Express Renderer</h1>
        <p>This server renders Contentful entries as static HTML pages.</p>
        
        <h2>Available Routes:</h2>
        <ul>
          <li><a href="/api/entries">/api/entries</a> - List all Contentful entries</li>
          <li>/preview/article/[entryId] - Preview an article</li>
          <li>/render/article/[entryId] - Render and save article to output folder</li>
          <li><strong>/render-and-submit/[entryId] (POST)</strong> - Render article and submit to Magento</li>
        </ul>
        
        <h2>Example Usage:</h2>
        <p>To preview an article, use: <code>/preview/article/YOUR_ENTRY_ID</code></p>
        <p>To render and save an article, use: <code>/render/article/YOUR_ENTRY_ID</code></p>
        <p>To render and submit to Magento, use: <code>POST /render-and-submit/YOUR_ENTRY_ID</code></p>
        
        <h2>Configuration:</h2>
        <ul>
          <li>Contentful Space ID: ${process.env.CONTENTFUL_SPACE_ID || 'Not configured'}</li>
          <li>Environment: ${process.env.CONTENTFUL_ENVIRONMENT || 'master'}</li>
        </ul>
      </body>
    </html>
  `;
  
  res.send(instructions);
});

// Test route
app.get('/test', async (req, res) => {
  try {
    const TestComponent = () => React.createElement('div', {
      className: 'bg-green-50 text-gray-900 px-8 py-8 rounded-lg max-w-4xl mx-auto mt-8'
    }, [
      React.createElement('h1', { key: 'title', className: 'text-3xl font-medium mb-4' }, 'Test Page'),
      React.createElement('p', { key: 'content', className: 'text-gray-700' }, 'Express server with Contentful integration is working!')
    ]);
    
    const { html } = await renderPageToStatic(TestComponent, { title: 'Test Page' });
    res.send(html);
  } catch (error) {
    console.error('Error in test route:', error);
    res.status(500).json({ error: error.message });
  }
});

// Test OAuth generation
app.get('/test-oauth', async (req, res) => {
  try {
    const { generateOAuthHeader } = require('./src/utils/magentoAuth');
    const testUrl = 'https://mcstaging.burpee.com/rest/default/V1/store/storeConfigs';
    const authHeader = generateOAuthHeader('GET', testUrl);
    
    res.json({
      url: testUrl,
      authHeader: authHeader,
      env: {
        consumerKey: process.env.MAGENTO_CONSUMER_KEY ? 'Set' : 'Not set',
        consumerSecret: process.env.MAGENTO_CONSUMER_SECRET ? 'Set' : 'Not set', 
        accessToken: process.env.MAGENTO_ACCESS_TOKEN ? 'Set' : 'Not set',
        tokenSecret: process.env.MAGENTO_TOKEN_SECRET ? 'Set' : 'Not set'
      }
    });
  } catch (error) {
    console.error('Error testing OAuth:', error);
    res.status(500).json({ error: error.message });
  }
});

// Test page search functionality
app.get('/test-search/:identifier', async (req, res) => {
  try {
    const { getCmsPageByIdentifier } = require('./src/utils/magentoAPI');
    const identifier = req.params.identifier;
    
    console.log(`Searching for page: ${identifier}`);
    const page = await getCmsPageByIdentifier(identifier);
    
    res.json({
      identifier: identifier,
      found: page !== null,
      page: page
    });
  } catch (error) {
    console.error('Error testing search:', error);
    res.status(500).json({ error: error.message });
  }
});

// List all CMS pages
app.get('/test-list-pages', async (req, res) => {
  try {
    const { generateOAuthHeader } = require('./src/utils/magentoAuth');
    const baseUrl = process.env.MAGENTO_BASE_URL;
    const endpoint = `${baseUrl}/rest/default/V1/cmsPage/search`;
    const queryString = 'searchCriteria[pageSize]=20';
    const searchEndpoint = `${endpoint}?${queryString}`;

    const authHeader = generateOAuthHeader('GET', searchEndpoint);
    
    const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
    const response = await fetch(searchEndpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader
      }
    });

    const responseText = await response.text();
    let responseData;
    
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      responseData = { message: responseText };
    }

    res.json({
      status: response.status,
      data: responseData
    });
  } catch (error) {
    console.error('Error listing pages:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\\n🚀 Contentful Express Renderer running on http://localhost:${PORT}`);
  console.log(`📝 Test the setup at http://localhost:${PORT}/test`);
  console.log(`📚 View instructions at http://localhost:${PORT}/`);
  console.log(`🔍 List entries at http://localhost:${PORT}/api/entries`);
  console.log(`\\n💡 To preview an article: http://localhost:${PORT}/preview/article/[entryId]`);
  console.log(`💾 To render an article: http://localhost:${PORT}/render/article/[entryId]\\n`);
});