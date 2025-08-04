import React from 'react';
import RichTextRenderer from '../components/RichTextRenderer.jsx';

const ArticlePage = ({ data }) => {
  const { title, body, featuredImage, imageAlt, publishedAt } = data || {};
  
  return React.createElement('div', {
    className: 'min-h-screen bg-white'
  }, [
    // Header
    React.createElement('div', {
      key: 'header',
      className: 'bg-white'
    }, 
      React.createElement('div', {
        className: 'max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8'
      }, [
        React.createElement('h1', {
          key: 'title',
          className: 'text-4xl md:text-5xl font-medium text-gray-900 mb-4'
        }, title || 'Article Title'),
        publishedAt && React.createElement('time', {
          key: 'date',
          className: 'text-gray-500'
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
      className: 'max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8'
    }, 
      React.createElement('div', {
        className: 'relative h-96 w-full rounded-lg overflow-hidden'
      }, 
        React.createElement('img', {
          src: featuredImage.fields?.file?.url?.startsWith('//') 
            ? `https:${featuredImage.fields.file.url}`
            : featuredImage.fields?.file?.url,
          alt: imageAlt || title,
          className: 'w-full h-full object-cover'
        })
      )
    ),
    
    // Article Content
    React.createElement('article', {
      key: 'content',
      className: 'max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12'
    }, 
      React.createElement('div', {
        className: 'prose prose-lg max-w-none'
      }, 
        body && React.createElement(RichTextRenderer, { document: body })
      )
    )
  ]);
};

export default ArticlePage;