import React from 'react';
import RichTextRenderer from '../components/RichTextRenderer.jsx';
import Header from '../components/Header.jsx';
import ProductSidebar from '../components/ProductSidebar.jsx';

const ArticlePage = ({ data }) => {
  const { title, body, featuredImage, imageAlt, publishedAt } = data || {};
  
  // Create breadcrumbs for article page
  const headerBreadcrumbs = [
    { name: "Home", href: "/" },
    { name: "Garden Guide", href: "/garden-guide" },
    { name: title || "Article" }
  ];
  
  return React.createElement('div', {
    className: 'article-page'
  }, [
    // Header Component
    React.createElement(Header, {
      key: 'header',
      breadcrumbs: headerBreadcrumbs
    }),
    // Main content wrapper with sidebar
    React.createElement('div', {
      key: 'main-wrapper',
      className: 'article-with-sidebar',
      style: {
        maxWidth: "1314px",
        margin: "0 auto",
        padding: "0 1rem",
        display: "flex",
        gap: "2rem",
        alignItems: "flex-start"
      }
    }, [
      // Main content column
      React.createElement('div', {
        key: 'main-content',
        className: 'article-main-content',
        style: {
          flex: "1",
          minWidth: "0" // Allows content to shrink
        }
      }, [
        // Article Header
        React.createElement('div', {
          key: 'article-header',
          className: 'article-header'
        }, 
          React.createElement('div', {
            className: 'article-container'
          }, [
            React.createElement('h1', {
              key: 'title',
              className: 'article-title'
            }, title || 'Article Title'),
            publishedAt && React.createElement('time', {
              key: 'date',
              className: 'article-date'
            }, `Published ${new Date(publishedAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}`)
          ])
        ),
        
        // Featured Image
        featuredImage && React.createElement('div', {
          key: 'featured-image',
          className: 'article-image-section'
        }, 
          React.createElement('div', {
            className: 'article-image-container'
          }, 
            React.createElement('img', {
              src: featuredImage.fields?.file?.url?.startsWith('//') 
                ? `https:${featuredImage.fields.file.url}`
                : featuredImage.fields?.file?.url,
              alt: imageAlt || title,
              className: 'article-featured-image'
            })
          )
        ),
        
        // Article Content
        React.createElement('article', {
          key: 'content',
          className: 'article-content-section'
        }, 
          React.createElement('div', {
            className: 'article-content'
          }, 
            body && React.createElement(RichTextRenderer, { document: body })
          )
        )
      ]),

      // Sidebar
      React.createElement(ProductSidebar, {
        key: 'sidebar',
        products: [] // Uses default products for now
      })
    ])
  ]);
};

export default ArticlePage;