# Instructions for Claude Code: React to Static HTML/CSS Renderer

Please create a Node.js project that renders React components with Tailwind CSS into static HTML pages for Magento CMS integration.

## Project Setup

1. Create a new directory called `react-static-renderer` and initialize the project:
```bash
mkdir react-static-renderer
cd react-static-renderer
npm init -y
```

2. Install all required dependencies:
```bash
npm install express react react-dom contentful
npm install -D @babel/core @babel/preset-react @babel/register tailwindcss autoprefixer cssnano postcss @babel/preset-env
```

3. Create the following directory structure:
```
react-static-renderer/
├── src/
│   ├── components/
│   │   └── Button.jsx
│   │   └── Card.jsx
│   └── pages/
│       └── LandingPage.jsx
│       └── ProductPage.jsx
├── output/
├── .babelrc
├── tailwind.config.js
├── server.js
├── package.json
└── .env.example
```

## File Contents

### 1. Create `.babelrc`:
```json
{
  "presets": [
    "@babel/preset-env",
    ["@babel/preset-react", { "runtime": "classic" }]
  ]
}
```

### 2. Create `tailwind.config.js`:
```javascript
module.exports = {
  content: [
    './src/components/**/*.{js,jsx}',
    './src/pages/**/*.{js,jsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

### 3. Create `server.js` with the following content:
```javascript
require('@babel/register')({
  presets: ['@babel/preset-env', '@babel/preset-react'],
  extensions: ['.js', '.jsx']
});

const express = require('express');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const postcss = require('postcss');
const tailwindcss = require('tailwindcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const { createClient } = require('contentful');
const fs = require('fs').promises;
const path = require('path');

const app = express();
app.use(express.json());

// Contentful client setup
const contentfulClient = createClient({
  space: process.env.CONTENTFUL_SPACE_ID || 'your-space-id',
  accessToken: process.env.CONTENTFUL_ACCESS_TOKEN || 'your-access-token',
});

// PostCSS processor for Tailwind
const postcssProcessor = postcss([
  tailwindcss('./tailwind.config.js'),
  autoprefixer(),
  cssnano(),
]);

// Function to render page to static HTML
async function renderPageToStatic(PageComponent, props = {}) {
  const html = renderToStaticMarkup(React.createElement(PageComponent, props));
  
  const tempCss = `
    @tailwind base;
    @tailwind components;
    @tailwind utilities;
  `;
  
  const result = await postcssProcessor.process(tempCss, {
    from: undefined,
  });
  
  const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${props.title || 'Page'}</title>
    <style>${result.css}</style>
</head>
<body>
    ${html}
</body>
</html>`;
  
  return { html: fullHtml, css: result.css };
}

// API Routes
app.get('/render/:pageType/:contentId', async (req, res) => {
  try {
    const { pageType, contentId } = req.params;
    
    // For testing without Contentful, use mock data
    const mockData = {
      fields: {
        title: 'Test Page',
        heading: 'Welcome to our site',
        content: 'This is a test page rendered from React to static HTML.'
      }
    };
    
    const PageComponent = require(`./src/pages/${pageType}.jsx`).default;
    const { html } = await renderPageToStatic(PageComponent, {
      data: mockData.fields,
      title: mockData.fields.title,
    });
    
    // Save to output directory
    await fs.mkdir('./output', { recursive: true });
    await fs.writeFile(`./output/${contentId}.html`, html);
    
    res.json({ 
      success: true, 
      message: `Page rendered and saved to ./output/${contentId}.html`,
      preview: html.substring(0, 200) + '...'
    });
    
  } catch (error) {
    console.error('Error rendering page:', error);
    res.status(500).json({ error: error.message });
  }
});

// Test route
app.get('/test', async (req, res) => {
  try {
    const TestComponent = () => React.createElement('div', {
      className: 'bg-blue-500 text-white p-8 rounded-lg'
    }, 'Hello from React + Tailwind!');
    
    const { html } = await renderPageToStatic(TestComponent, { title: 'Test' });
    res.send(html);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Static renderer server running on http://localhost:${PORT}`);
  console.log(`Test the setup at http://localhost:${PORT}/test`);
});
```

### 4. Create example React components:

#### `src/components/Button.jsx`:
```jsx
import React from 'react';

const Button = ({ children, variant = 'primary', onClick }) => {
  const baseClasses = 'px-4 py-2 rounded-md font-medium transition-colors';
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
  };
  
  return (
    <button 
      className={`${baseClasses} ${variants[variant]}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default Button;
```

#### `src/components/Card.jsx`:
```jsx
import React from 'react';

const Card = ({ title, content, image }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {image && (
        <img src={image} alt={title} className="w-full h-48 object-cover" />
      )}
      <div className="p-6">
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-gray-600">{content}</p>
      </div>
    </div>
  );
};

export default Card;
```

#### `src/pages/LandingPage.jsx`:
```jsx
import React from 'react';
import Button from '../components/Button.jsx';
import Card from '../components/Card.jsx';

const LandingPage = ({ data }) => {
  const { heading, subheading, cards = [] } = data || {};
  
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Your Brand</h1>
        </div>
      </header>
      
      <main className="max-w-6xl mx-auto px-4 py-12">
        <section className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">{heading || 'Welcome'}</h2>
          <p className="text-xl text-gray-600 mb-8">{subheading || 'Build amazing static pages'}</p>
          <Button variant="primary">Get Started</Button>
        </section>
        
        <section className="grid md:grid-cols-3 gap-6">
          {cards.map((card, index) => (
            <Card key={index} {...card} />
          ))}
        </section>
      </main>
    </div>
  );
};

export default LandingPage;
```

### 5. Create `.env.example`:
```
CONTENTFUL_SPACE_ID=your-space-id-here
CONTENTFUL_ACCESS_TOKEN=your-access-token-here
PORT=3000
```

### 6. Update `package.json` scripts:
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```

### 7. Install nodemon for development (optional):
```bash
npm install -D nodemon
```

## Testing the Setup

1. Start the server:
```bash
npm start
```

2. Test the basic setup by visiting:
```
http://localhost:3000/test
```

3. Test rendering a landing page:
```
http://localhost:3000/render/LandingPage/test-page-1
```

This will create a static HTML file in the `output` directory.

## Integration with Magento

To integrate with Magento, you'll need to add a function to send the rendered HTML to Magento's API. Add this to the server.js:

```javascript
async function sendToMagento(pageId, htmlContent) {
  // Example Magento CMS page update via REST API
  const magentoUrl = process.env.MAGENTO_URL;
  const magentoToken = process.env.MAGENTO_ADMIN_TOKEN;
  
  const response = await fetch(`${magentoUrl}/rest/V1/cmsPage/${pageId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${magentoToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      page: {
        content: htmlContent,
        // other page properties
      }
    })
  });
  
  return response.json();
}
```

## Notes

- The setup uses Babel to transpile JSX on the server side
- Tailwind CSS is processed at render time, including only the styles actually used
- You can extend this to support more complex components and page types
- Consider caching rendered pages for better performance
- Add error handling and logging for production use