import React from 'react';
import RichTextRenderer from '../components/RichTextRenderer.jsx';
import Header from '../components/Header.jsx';

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
  ]);
};

export default ArticlePage;