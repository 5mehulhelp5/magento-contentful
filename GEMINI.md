
*   **Project:** A Node.js/Express server designed to render content from a Contentful CMS into static HTML.
*   **Core Functionality:**
    *   It fetches entries (articles) from Contentful.
    *   It uses React (`react-dom/server`) to render these entries into full HTML pages.
    *   It provides API endpoints to:
        *   Preview rendered articles directly in the browser.
        *   Save the rendered HTML to an `/output` directory.
        *   Push the rendered HTML to a Magento CMS, either creating a new page or updating an existing one.
*   **Key Technologies:**
    *   **Backend:** Express.js
    *   **Templating:** React (using JSX and TSX)
    *   **CMS:** Contentful (source), Magento (destination)
    *   **Authentication:** OAuth 1.0a for Magento API communication.
*   **Observations:**
    *   There appears to be a duplication of components. There are React components written in both JavaScript (`.jsx` in `src/`) and TypeScript (`.tsx` in `pages/`). For example, `RichTextRenderer` and `ArticlePage` exist in both forms.
    *   The server is configured to use Babel to transpile JSX on the fly.
    *   Credentials and keys for Contentful and Magento are managed via a `.env` file.
