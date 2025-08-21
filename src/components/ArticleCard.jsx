import React from 'react';

const ArticleCard = ({ article, linkBase = '/preview/article' }) => {
  const { 
    sys, 
    fields: { 
      title, 
      featuredImage, 
      imageAlt, 
      listImage, 
      listImageAlt,
      publishedAt,
      metaDescription 
    } = {} 
  } = article || {};
  
  // Use list image if available, fallback to featured image
  const cardImage = listImage || featuredImage;
  const cardImageAlt = listImageAlt || imageAlt || title;
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Create article URL
  const articleUrl = `${linkBase}/${sys?.id}`;
  
  // Truncate text for card display
  const truncateText = (text, maxLength = 120) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };
  
  return React.createElement('article', {
    className: 'bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-200 hover:border-green-600 group'
  }, [
    React.createElement('a', {
      key: 'link-wrapper',
      href: articleUrl,
      className: 'block'
    }, [
      // Image section
      React.createElement('div', {
        key: 'image',
        className: 'relative h-40 w-full overflow-hidden bg-gray-100'
      }, 
        cardImage ? React.createElement('img', {
          src: cardImage.fields?.file?.url?.startsWith('//') 
            ? `https:${cardImage.fields.file.url}`
            : cardImage.fields?.file?.url,
          alt: cardImageAlt || title,
          className: 'w-full h-full object-cover group-hover:scale-105 transition-transform duration-200'
        }) : React.createElement('div', {
          className: 'flex items-center justify-center h-full bg-gray-100'
        }, React.createElement('svg', {
          className: 'w-8 h-8 text-gray-400',
          fill: 'currentColor',
          viewBox: '0 0 20 20'
        }, React.createElement('path', {
          fillRule: 'evenodd',
          d: 'M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z',
          clipRule: 'evenodd'
        })))
      ),
      
      // Content section
      React.createElement('div', {
        key: 'content',
        className: 'p-4'
      }, [
        // Header with badge and date
        React.createElement('div', {
          key: 'header',
          className: 'flex items-center justify-between mb-2'
        }, [
          React.createElement('span', {
            key: 'badge',
            className: 'inline-flex items-center px-3 py-0.5 rounded-full text-xs font-medium bg-green-600 text-white'
          }, 'Article'),
          
          publishedAt && React.createElement('time', {
            key: 'date',
            className: 'text-xs text-gray-500',
            dateTime: publishedAt
          }, formatDate(publishedAt))
        ]),
        
        // Title
        React.createElement('h3', {
          key: 'title',
          className: 'text-base font-bold text-gray-900 mb-2 line-clamp-3 group-hover:text-green-600 transition-colors leading-tight'
        }, title || 'Untitled Article'),
        
        // Description
        metaDescription && React.createElement('p', {
          key: 'description',
          className: 'text-gray-600 text-xs line-clamp-2 leading-relaxed'
        }, truncateText(metaDescription))
      ])
    ])
  ]);
};

export default ArticleCard;