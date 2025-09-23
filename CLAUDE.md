# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Server Operations
- `npm start` - Run production server on port 3000
- `npm run dev` - Run development server with auto-reload using nodemon (watches src/, public/styles.css)
- `node server.js` - Direct server execution

### Testing and Validation
- Use the `/api/entries` endpoint to list available Contentful entries
- Use `/preview/article/[entryId]` to preview articles before rendering
- Use `/preview/category/[categoryId]` to preview category list pages
- Use `POST /render-and-submit/[entryId]` to render articles and submit to Magento
- Use `POST /render-and-submit-category/[categoryId]` to render category pages and submit to Magento

### Bulk Operations
- `python3 bulk_sync.py` - Bulk sync articles from Contentful to Magento (requires Python setup)
- `python3 bulk_category_sync.py` - Bulk sync category pages from Contentful to Magento
- `python3 bulk_faq_sync.py` - Bulk sync FAQ content from Contentful to Magento
- `python3 bulk_recipe_sync.py` - Bulk sync recipe content from Contentful to Magento
- `./run_bulk_sync.sh` - Shell script for automated bulk sync
- `./run_category_sync.sh` - Shell script for automated category sync with logging
- `./run_recipe_sync.sh` - Shell script for automated recipe sync with logging
- `./setup_bulk_sync.sh` - Initial setup script for bulk sync environment
- Database integration available via `src/utils/database.js` for MySQL operations

## High-Level Architecture

### Content Management System Integration
This is a **bi-directional content management system** that bridges Contentful CMS with Magento e-commerce platform:

1. **Contentful → Express → Magento Pipeline**:
   - Fetches content from Contentful using Delivery API
   - Renders React components server-side to static HTML 
   - Submits rendered pages to Magento CMS via REST API with OAuth 1.0a authentication
   - Stores Magento page IDs back to Contentful using Management API for tracking

2. **Category Aggregation System**:
   - Hierarchical category support with parent-child relationships
   - Automatic article aggregation from child categories (e.g., 17 articles from 16 child categories)
   - Responsive grid layouts for category listing pages

3. **Magento ID Workflow**:
   - Persistent tracking prevents duplicate pages when Contentful slugs change
   - Automatic create/update logic based on existing Magento IDs
   - Bi-directional sync maintains data integrity between platforms

### React Server-Side Rendering Architecture
- **No JSX in production**: Uses `React.createElement()` for server-side rendering
- **Babel transpilation**: JSX files in `/src/` are transpiled at runtime via `@babel/register` with React classic runtime
- **Component structure**: Reusable components in `/src/components/`, page templates in `/src/pages/`, SVG icons in `/src/svgs/`
- **External CSS**: CSS served from `/public/styles.css` with caching, replacing CSS-in-JS approach
- **Static HTML generation**: Renders to static HTML files in `/output/` directory

### API Integration Patterns
- **OAuth 1.0a for Magento**: Complex authentication flow with signature generation
- **Contentful Management API**: For bi-directional content updates and Magento ID storage  
- **Express middleware pattern**: Webhook handlers for automated content sync
- **Error handling**: Comprehensive error responses with detailed logging

### Database Layer (Optional)
- **MySQL integration**: Direct database queries for advanced Magento operations
- **Connection pooling**: Efficient database connection management
- **Bulk operations**: Mass updates and synchronization capabilities

## Code Organization Patterns

### File Structure Logic
- `/src/components/` - Reusable React components (ArticleCard, RichTextRenderer, Header, HomeHeader, CategorySection, ProductSidebar, CategorySidebar, RecipeCard, RecipeIngredientsList, RecipeInstructionsList)
- `/src/pages/` - Page templates for different content types (ArticlePage, CategoryListPage, HomePage, FAQPage, RecipePage, RecipeCategoryPage, HeaderTestPage)
- `/src/utils/` - Business logic utilities (magentoAPI, contentfulManagement, magentoAuth, database, articleCardTemplate, recipeCardTemplate)
- `/src/svgs/` - SVG React components for category icons (KitchenGardening, PlantCare, FlowersAndMore, GettingStarted)
- `/output/` - Generated static HTML files
- `/public/` - Static assets including external CSS file (styles.css)
- Root-level scripts for deployment and bulk operations (Python and shell scripts)

### Component Design Patterns
- **Functional components**: All components use function declarations, not arrow functions
- **Props-based rendering**: Components receive data as props and render statically
- **CSS scoping**: Custom `.contentful-category-page` scoping prevents Magento conflicts
- **Responsive design**: Custom `.responsive-grid` class handles cross-browser compatibility

### API Response Patterns
- **Consistent error handling**: All endpoints return `{success: boolean, error?: string}` format
- **Detailed logging**: Console output for debugging OAuth, API calls, and rendering
- **Status code consistency**: Proper HTTP status codes for different error conditions

## Environment Configuration

### Required Environment Variables
```
CONTENTFUL_SPACE_ID - Contentful space identifier
CONTENTFUL_ACCESS_TOKEN - Delivery API token for reading content
CONTENTFUL_MANAGEMENT_TOKEN - Management API token for bi-directional updates
STAGING_MAGENTO_BASE_URL - Magento REST API base URL
STAGING_MAGENTO_CONSUMER_KEY - OAuth consumer key
STAGING_MAGENTO_CONSUMER_SECRET - OAuth consumer secret
STAGING_MAGENTO_ACCESS_TOKEN - OAuth access token
STAGING_MAGENTO_TOKEN_SECRET - OAuth token secret
DATABASE_HOST/USER/PASSWORD/NAME - MySQL connection (optional)
```

### Authentication Flow
- Contentful uses bearer token authentication
- Magento uses OAuth 1.0a with signature generation (see `src/utils/magentoAuth.js`)
- Database connections use standard MySQL authentication

## Content Types and Data Flow

### Article Content Type
- **Primary content type** with rich text body, metadata, and featured images
- **Magento ID field** added for persistent tracking across slug changes
- **Rich text rendering** handles tables, lists, images, and complex formatting

### Category Content Type
- **Hierarchical structure** with parent-child relationships via Contentful references
- **Article aggregation** automatically collects articles from child categories
- **Magento ID field** for category page tracking and bi-directional sync

### Recipe Content Type
- **Recipe-specific data structure** with ingredients, instructions, and metadata
- **Rich text rendering** for complex cooking instructions and descriptions
- **Magento ID field** for recipe page tracking and bi-directional sync

### FAQ Content Type
- **Question-answer format** with rich text support for detailed explanations
- **Organized content** for help and support pages
- **Magento ID field** for FAQ page tracking and bi-directional sync

### Page Generation Process
1. Fetch content from Contentful (article or category data)
2. Render React component server-side using `renderToStaticMarkup`
3. Extract body content and scope CSS for Magento compatibility
4. Submit to Magento CMS API with proper authentication
5. Store returned Magento page ID back to Contentful for future updates

## Special Considerations

### Magento Integration Challenges
- **CSS conflicts**: All styles are scoped to `.contentful-category-page` container
- **HTML format**: Full HTML documents are stripped to body content only for CMS insertion
- **URL key management**: Magento requires unique identifiers, handled via fallback generation
- **Loading screen issues**: Resolved by proper CSS scoping and HTML extraction

### Performance Optimizations
- **Custom grid system**: `.responsive-grid` class replaces problematic Tailwind responsive classes
- **Efficient rendering**: Server-side rendering reduces client-side JavaScript
- **Asset optimization**: Images and rich text are optimized during rendering
- **Caching strategy**: Static HTML files cached in `/output/` directory

## Deployment Notes
- Server runs on configurable port (default 3000)
- Webhook endpoints available for automated Contentful → Magento sync
- Bulk sync capabilities for large content migrations
- Database integration optional but recommended for advanced operations
- I usually have the server running with nodemon on 3000. Always try it before starting your own server.
- Only make commits when I specifically ask you to.

## Testing and Development
- Use test files `WEBHOOK_TESTS.md` and `TESTING_MAGENTO_ID_WORKFLOW.md` for curl commands to test endpoints
- Preview endpoints available for all content types before publishing to Magento
- Webhook testing can be done locally with ngrok for Contentful integration testing
- Environment configuration stored in `.env` file with backup in `.env.local`
- Babel configuration in `.babelrc` for JSX transpilation
- Nodemon configuration in `nodemon.json` for development server auto-reload

# important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.