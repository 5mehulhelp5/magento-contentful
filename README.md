# Contentful Express Renderer

A Node.js Express server that renders Contentful entries as static HTML pages using React server-side rendering. This tool allows you to fetch content from Contentful CMS and generate static HTML files with comprehensive styling and rich text support.

## 🚀 Features

- **Contentful Integration**: Direct connection to your Contentful space
- **React Server-Side Rendering**: Renders React components to static HTML
- **Rich Text Support**: Advanced rich text rendering with markdown table support
- **Asset Handling**: Automatic image and asset processing
- **Static File Generation**: Saves rendered HTML to output directory
- **Preview Mode**: Live preview of content before generation
- **Responsive Styling**: Comprehensive CSS with responsive design

## 📁 Project Structure

```
express/
├── src/
│   ├── components/
│   │   └── RichTextRenderer.jsx    # Advanced rich text renderer
│   └── pages/
│       └── ArticlePage.jsx         # Article page template
├── output/                         # Generated static HTML files
├── server.js                       # Express server
├── package.json                    # Project dependencies
├── .babelrc                        # Babel configuration
├── .env                            # Environment variables
└── README.md                       # This documentation
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Contentful account with content entries

### Installation
```bash
# Dependencies are already installed, but if needed:
npm install

# For development with auto-reload:
npm install -g nodemon
```

### Environment Configuration
The `.env` file contains your Contentful credentials:
```env
CONTENTFUL_SPACE_ID=bq61jovlhx8i
CONTENTFUL_ACCESS_TOKEN=uP9kJZ8eENzSqCOtV045PiErzIuPoZKBlZyR6O6ZReY
CONTENTFUL_PREVIEW_ACCESS_TOKEN=IwDRPcvdWqDe1oB9qOYJb57r6iHCY5jjFP2Gu9Bc1NM
CONTENTFUL_ENVIRONMENT=master
PORT=3000
```

## 🚀 Usage

### Start the Server
```bash
npm start
# or for development with auto-reload:
npm run dev
```

Server will start at `http://localhost:3000`

### Available Endpoints

| Endpoint | Description | Example |
|----------|-------------|---------|
| `/` | Server instructions and overview | `http://localhost:3000/` |
| `/test` | Test basic server functionality | `http://localhost:3000/test` |
| `/api/entries` | List all Contentful entries | `http://localhost:3000/api/entries` |
| `/preview/article/{id}` | Preview article in browser | `http://localhost:3000/preview/article/123` |
| `/render/article/{id}` | Generate static HTML file | `http://localhost:3000/render/article/123` |

### Workflow
1. **List Entries**: Visit `/api/entries` to see available content
2. **Preview**: Use `/preview/article/{id}` to see how content will look
3. **Generate**: Use `/render/article/{id}` to create static HTML files
4. **Output**: Find generated files in the `/output` directory

## 🎨 Styling & Features

### Rich Text Renderer
The `RichTextRenderer` component handles:
- **Headers** (H1-H6) with proper typography
- **Paragraphs** with optimized line spacing
- **Lists** (ordered and unordered)
- **Links** (internal and external)
- **Images** with responsive sizing
- **Tables** with markdown table parsing
- **Code blocks** with syntax highlighting
- **Blockquotes** with custom styling

### Responsive Design
- Mobile-first approach
- Breakpoints: `sm` (640px), `md` (768px), `lg` (1024px)
- Flexible layouts with max-width constraints
- Optimized typography scale

### CSS Architecture
- Utility-first CSS approach (similar to Tailwind)
- Comprehensive styling for all content types
- Print-friendly styles
- Accessibility considerations

## 📝 Content Types Supported

### Article Pages
- Title and metadata
- Featured images
- Rich text body content
- Publication dates
- Navigation elements

### Rich Text Elements
- Headers (H1-H6)
- Paragraphs with text formatting
- Lists (bulleted and numbered)
- Links and references
- Embedded images and assets
- Tables (including markdown tables)
- Code blocks and inline code
- Blockquotes
- Horizontal rules

## 🔧 Configuration

### Babel Configuration (`.babelrc`)
```json
{
  "presets": [
    "@babel/preset-env",
    ["@babel/preset-react", { "runtime": "classic" }]
  ]
}
```

### Package Scripts
```json
{
  "start": "node server.js",
  "dev": "nodemon server.js",
  "test": "echo \"Error: no test specified\" && exit 1"
}
```

## 🎯 API Reference

### GET `/api/entries`
Returns list of all Contentful entries with basic metadata.

**Response:**
```json
[
  {
    "id": "entry-id",
    "title": "Article Title",
    "contentType": "article",
    "updatedAt": "2025-01-01T00:00:00Z"
  }
]
```

### GET `/preview/article/{id}`
Returns rendered HTML preview of the article.

### GET `/render/article/{id}`
Generates static HTML file and saves to `/output` directory.

**Response:**
```json
{
  "success": true,
  "message": "Article rendered and saved to ./output/entry-id.html",
  "entryId": "entry-id",
  "title": "Article Title"
}
```

## 🔍 Troubleshooting

### Common Issues

1. **Contentful Connection Errors**
   - Verify environment variables are correct
   - Check Contentful space ID and access token
   - Ensure network connectivity

2. **Babel/JSX Errors**
   - Ensure `.babelrc` is properly configured
   - Check for syntax errors in JSX files
   - Verify all imports are correct

3. **Missing Dependencies**
   - Run `npm install` to ensure all packages are installed
   - Check for version compatibility issues

4. **Port Conflicts**
   - Change PORT in `.env` file if 3000 is occupied
   - Use `lsof -i :3000` to check port usage

### Debug Mode
For detailed error logging, set environment variable:
```bash
DEBUG=* npm start
```

## 📦 Dependencies

### Production Dependencies
- `express` - Web framework
- `react` / `react-dom` - UI library and server rendering
- `contentful` - Contentful CMS client
- `@contentful/rich-text-react-renderer` - Rich text rendering
- `@contentful/rich-text-types` - Rich text type definitions
- `dotenv` - Environment variable management

### Development Dependencies
- `@babel/core` - JavaScript transpiler
- `@babel/preset-env` - Environment preset
- `@babel/preset-react` - React preset
- `@babel/register` - Runtime transpilation
- `nodemon` - Development server with auto-reload

## 🔒 Security Considerations

- Environment variables are used for sensitive data
- Contentful access tokens are kept in `.env` file
- Input validation on entry IDs
- Error handling prevents information leakage

## 🚀 Performance

- Server-side rendering for fast initial load
- Efficient CSS generation
- Static file caching
- Minimal JavaScript footprint

## 📈 Extensibility

The server is designed to be easily extended:
- Add new page templates in `/src/pages/`
- Create new components in `/src/components/`
- Modify styling in the CSS section of `server.js`
- Add new content types by creating corresponding page components

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.