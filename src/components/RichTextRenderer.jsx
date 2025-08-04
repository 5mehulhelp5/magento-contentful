import React from 'react';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import { BLOCKS, INLINES, MARKS } from '@contentful/rich-text-types';

// Function to detect and parse markdown tables
function parseMarkdownTable(text) {
  const tableRegex = /\|.*\|\s*\n\|[\s\-\|]*\|\s*\n(\|.*\|\s*(?:\n|$))*/g;
  const match = tableRegex.exec(text);
  
  if (!match) {
    return { isTable: false };
  }

  const tableText = match[0];
  const lines = tableText.trim().split('\n');
  
  if (lines.length < 3) {
    return { isTable: false };
  }

  // Parse header
  const headerLine = lines[0];
  const headerCells = headerLine.split('|').map(h => h.trim());
  // Remove first and last empty cells (from leading/trailing |)
  if (headerCells[0] === '') headerCells.shift();
  if (headerCells[headerCells.length - 1] === '') headerCells.pop();
  const headers = headerCells.filter(h => h);
  
  // Parse data rows (skip separator line)
  const dataLines = lines.slice(2).filter(line => line.trim() && !line.match(/^[\|\s\-]*$/));
  
  // Also check if there are any table rows remaining in the text after our match
  const remainingTableRows = text.split(tableText)[1]?.match(/^\|.*\|/gm) || [];
  
  const allDataLines = [...dataLines, ...remainingTableRows];
  
  const rows = allDataLines.map(line => {
    // Split by | and trim, but keep empty cells to maintain column alignment
    const cells = line.split('|').map(cell => cell.trim());
    // Remove first and last empty cells (from leading/trailing |)
    if (cells[0] === '') cells.shift();
    if (cells[cells.length - 1] === '') cells.pop();
    return cells;
  });

  // Calculate remaining text after removing table and any additional table rows
  let cleanedText = text.replace(tableText, '');
  remainingTableRows.forEach(row => {
    cleanedText = cleanedText.replace(row, '');
  });
  
  return {
    isTable: true,
    tableData: { headers, rows },
    remainingText: cleanedText.trim()
  };
}

// Component to render a markdown table as React elements
function MarkdownTable({ headers, rows }) {
  return React.createElement('div', {
    className: 'overflow-x-auto my-6'
  }, 
    React.createElement('table', {
      className: 'min-w-full divide-y divide-gray-200 border border-gray-300 rounded-lg'
    }, [
      React.createElement('thead', {
        className: 'bg-green-50',
        key: 'thead'
      }, 
        React.createElement('tr', {}, 
          headers.map((header, i) => 
            React.createElement('th', {
              key: i,
              className: 'px-4 py-3 text-left text-sm font-medium text-gray-900 border-b border-gray-200'
            }, header)
          )
        )
      ),
      React.createElement('tbody', {
        className: 'bg-white divide-y divide-gray-200',
        key: 'tbody'
      }, 
        rows.map((row, i) => 
          React.createElement('tr', {
            key: i,
            className: `${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100`
          }, 
            row.map((cell, j) => 
              React.createElement('td', {
                key: j,
                className: 'px-4 py-3 text-sm text-gray-700 border-b border-gray-200'
              }, cell)
            )
          )
        )
      )
    ])
  );
}

const options = {
  renderMark: {
    [MARKS.BOLD]: (text) => React.createElement('strong', { className: 'font-semibold' }, text),
    [MARKS.ITALIC]: (text) => React.createElement('em', { className: 'italic' }, text),
    [MARKS.UNDERLINE]: (text) => React.createElement('u', { className: 'underline' }, text),
    [MARKS.CODE]: (text) => React.createElement('code', { 
      className: 'bg-gray-100 rounded px-1 py-0.5 text-sm font-mono' 
    }, text),
  },
  renderNode: {
    [BLOCKS.PARAGRAPH]: (node, children) => {
      // Extract text content from the node to check for tables
      const textContent = node.content
        ?.map((item) => {
          if (item.nodeType === 'text') {
            return item.value || '';
          } else if (item.nodeType === 'hyperlink' && item.content) {
            // Extract text from links for table parsing
            return item.content.map((linkItem) => linkItem.value || '').join('');
          }
          return '';
        })
        .join('') || '';

      // Check if this paragraph contains a markdown table
      const tableResult = parseMarkdownTable(textContent);
      
      if (tableResult.isTable && tableResult.tableData) {
        return React.createElement('div', {}, [
          React.createElement(MarkdownTable, {
            key: 'table',
            headers: tableResult.tableData.headers,
            rows: tableResult.tableData.rows
          }),
          tableResult.remainingText && React.createElement('p', {
            key: 'remaining',
            className: 'mb-4 leading-relaxed text-gray-700'
          }, tableResult.remainingText)
        ]);
      }

      // Default paragraph rendering
      return React.createElement('p', { className: 'mb-4 leading-relaxed text-gray-700' }, children);
    },
    [BLOCKS.HEADING_1]: (node, children) => 
      React.createElement('h1', { className: 'text-4xl font-medium mb-6 text-gray-900' }, children),
    [BLOCKS.HEADING_2]: (node, children) => 
      React.createElement('h2', { className: 'text-3xl font-medium mb-4 mt-8 text-gray-900' }, children),
    [BLOCKS.HEADING_3]: (node, children) => 
      React.createElement('h3', { className: 'text-2xl font-medium mb-3 mt-6 text-gray-900' }, children),
    [BLOCKS.HEADING_4]: (node, children) => 
      React.createElement('h4', { className: 'text-xl font-medium mb-2 mt-4 text-gray-900' }, children),
    [BLOCKS.HEADING_5]: (node, children) => 
      React.createElement('h5', { className: 'text-lg font-medium mb-2 mt-4 text-gray-900' }, children),
    [BLOCKS.HEADING_6]: (node, children) => 
      React.createElement('h6', { className: 'text-base font-medium mb-2 mt-4 text-gray-900' }, children),
    [BLOCKS.UL_LIST]: (node, children) => 
      React.createElement('ul', { className: 'list-disc list-outside ml-6 mb-4 space-y-2 text-gray-700' }, children),
    [BLOCKS.OL_LIST]: (node, children) => 
      React.createElement('ol', { className: 'list-decimal list-outside ml-6 mb-4 space-y-2 text-gray-700' }, children),
    [BLOCKS.LIST_ITEM]: (node, children) => 
      React.createElement('li', {}, children),
    [BLOCKS.QUOTE]: (node, children) => 
      React.createElement('blockquote', { 
        className: 'border-l-4 border-green-500 pl-4 py-2 mb-4 italic text-gray-600 bg-green-50' 
      }, children),
    [BLOCKS.HR]: () => React.createElement('hr', { className: 'border-gray-300 my-8' }),
    [BLOCKS.EMBEDDED_ASSET]: (node) => {
      const asset = node.data.target;
      if (asset?.fields?.file?.url) {
        const url = asset.fields.file.url.startsWith('//')
          ? `https:${asset.fields.file.url}`
          : asset.fields.file.url;
        
        return React.createElement('div', { className: 'my-8' }, [
          React.createElement('img', {
            key: 'img',
            src: url,
            alt: asset.fields.title || asset.fields.description || '',
            className: 'rounded-lg shadow-md mx-auto max-w-full h-auto'
          }),
          asset.fields.description && React.createElement('p', {
            key: 'caption',
            className: 'text-sm text-gray-500 text-center mt-2'
          }, asset.fields.description)
        ]);
      }
      return null;
    },
    [INLINES.HYPERLINK]: (node, children) => {
      const url = node.data.uri;
      
      // Check if it's an internal link
      if (url.startsWith('/')) {
        return React.createElement('a', {
          href: url,
          className: 'text-green-600 hover:text-green-700 underline'
        }, children);
      }
      
      // External link
      return React.createElement('a', {
        href: url,
        target: '_blank',
        rel: 'noopener noreferrer',
        className: 'text-green-600 hover:text-green-700 underline'
      }, children);
    },
    [INLINES.ENTRY_HYPERLINK]: (node, children) => {
      // Handle links to other entries
      return React.createElement('a', {
        href: '#',
        className: 'text-green-600 hover:text-green-700 underline'
      }, children);
    },
  },
};

export default function RichTextRenderer({ document }) {
  return React.createElement('div', { className: 'prose max-w-none' }, 
    documentToReactComponents(document, options)
  );
}