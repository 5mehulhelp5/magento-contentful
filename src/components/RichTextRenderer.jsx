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
  return (
    <div style={{
      overflowX: 'auto',
      margin: '1.5rem 0'
    }}>
      <table style={{
        minWidth: '100%',
        borderCollapse: 'collapse',
        border: '1px solid #d1d5db',
        borderRadius: '0.5rem'
      }}>
        <thead style={{
          backgroundColor: '#f0f9f0'
        }}>
          <tr>
            {headers.map((header, i) => (
              <th key={i} style={{
                padding: '0.75rem 1rem',
                textAlign: 'left',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#111827',
                borderBottom: '1px solid #e5e7eb'
              }}>
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody style={{
          backgroundColor: 'white'
        }}>
          {rows.map((row, i) => (
            <tr key={i} style={{
              backgroundColor: i % 2 === 0 ? 'white' : '#f9fafb'
            }}>
              {row.map((cell, j) => (
                <td key={j} style={{
                  padding: '0.75rem 1rem',
                  fontSize: '0.875rem',
                  color: '#374151',
                  borderBottom: '1px solid #e5e7eb'
                }}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const options = {
  renderMark: {
    [MARKS.BOLD]: (text) => <strong style={{ fontWeight: '600' }}>{text}</strong>,
    [MARKS.ITALIC]: (text) => <em style={{ fontStyle: 'italic' }}>{text}</em>,
    [MARKS.UNDERLINE]: (text) => <u style={{ textDecoration: 'underline' }}>{text}</u>,
    [MARKS.CODE]: (text) => (
      <code style={{
        backgroundColor: '#f3f4f6',
        borderRadius: '0.25rem',
        padding: '0.125rem 0.25rem',
        fontSize: '0.875rem',
        fontFamily: 'monospace'
      }}>{text}</code>
    ),
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
        return (
          <div>
            <MarkdownTable 
              headers={tableResult.tableData.headers} 
              rows={tableResult.tableData.rows} 
            />
            {tableResult.remainingText && (
              <p style={{
                marginBottom: '1rem',
                lineHeight: '1.625',
                color: '#374151'
              }}>
                {tableResult.remainingText}
              </p>
            )}
          </div>
        );
      }

      // Default paragraph rendering
      return <p style={{
        marginBottom: '1rem',
        lineHeight: '1.625',
        color: '#374151'
      }}>{children}</p>;
    },
    [BLOCKS.HEADING_1]: (node, children) => (
      <h1 style={{
        fontSize: '2.25rem',
        fontWeight: '500',
        marginBottom: '1.5rem',
        color: '#111827',
        fontFamily: 'serif'
      }}>{children}</h1>
    ),
    [BLOCKS.HEADING_2]: (node, children) => (
      <h2 style={{
        fontSize: '1.875rem',
        fontWeight: '500',
        marginBottom: '1rem',
        marginTop: '2rem',
        color: '#111827',
        fontFamily: 'serif'
      }}>{children}</h2>
    ),
    [BLOCKS.HEADING_3]: (node, children) => (
      <h3 style={{
        fontSize: '1.5rem',
        fontWeight: '500',
        marginBottom: '0.75rem',
        marginTop: '1.5rem',
        color: '#111827',
        fontFamily: 'serif'
      }}>{children}</h3>
    ),
    [BLOCKS.HEADING_4]: (node, children) => (
      <h4 style={{
        fontSize: '1.25rem',
        fontWeight: '500',
        marginBottom: '0.5rem',
        marginTop: '1rem',
        color: '#111827',
        fontFamily: 'serif'
      }}>{children}</h4>
    ),
    [BLOCKS.HEADING_5]: (node, children) => (
      <h5 style={{
        fontSize: '1.125rem',
        fontWeight: '500',
        marginBottom: '0.5rem',
        marginTop: '1rem',
        color: '#111827',
        fontFamily: 'serif'
      }}>{children}</h5>
    ),
    [BLOCKS.HEADING_6]: (node, children) => (
      <h6 style={{
        fontSize: '1rem',
        fontWeight: '500',
        marginBottom: '0.5rem',
        marginTop: '1rem',
        color: '#111827',
        fontFamily: 'serif'
      }}>{children}</h6>
    ),
    [BLOCKS.UL_LIST]: (node, children) => (
      <ul style={{
        listStyleType: 'disc',
        listStylePosition: 'outside',
        marginLeft: '1.5rem',
        marginBottom: '1rem',
        color: '#374151'
      }}>{children}</ul>
    ),
    [BLOCKS.OL_LIST]: (node, children) => (
      <ol style={{
        listStyleType: 'decimal',
        listStylePosition: 'outside',
        marginLeft: '1.5rem',
        marginBottom: '1rem',
        color: '#374151'
      }}>{children}</ol>
    ),
    [BLOCKS.LIST_ITEM]: (node, children) => (
      <li style={{ marginBottom: '0.5rem' }}>{children}</li>
    ),
    [BLOCKS.QUOTE]: (node, children) => (
      <blockquote style={{
        borderLeft: '4px solid #10b981',
        paddingLeft: '1rem',
        paddingTop: '0.5rem',
        paddingBottom: '0.5rem',
        marginBottom: '1rem',
        fontStyle: 'italic',
        color: '#4b5563',
        backgroundColor: '#f0fdf4'
      }}>
        {children}
      </blockquote>
    ),
    [BLOCKS.HR]: () => <hr style={{
      borderColor: '#d1d5db',
      margin: '2rem 0'
    }} />,
    [BLOCKS.EMBEDDED_ASSET]: (node) => {
      const asset = node.data.target;
      if (asset?.fields?.file?.url) {
        const url = asset.fields.file.url.startsWith('//')
          ? `https:${asset.fields.file.url}`
          : asset.fields.file.url;
        
        return (
          <div style={{ margin: '2rem 0' }}>
            <img
              src={url}
              alt={asset.fields.title || asset.fields.description || ''}
              style={{
                borderRadius: '0.5rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                margin: '0 auto',
                display: 'block',
                maxWidth: '100%',
                height: 'auto'
              }}
            />
            {asset.fields.description && (
              <p style={{
                fontSize: '0.875rem',
                color: '#6b7280',
                textAlign: 'center',
                marginTop: '0.5rem'
              }}>
                {asset.fields.description}
              </p>
            )}
          </div>
        );
      }
      return null;
    },
    [INLINES.HYPERLINK]: (node, children) => {
      const url = node.data.uri;
      
      // Check if it's an internal link
      if (url.startsWith('/')) {
        return (
          <a href={url} style={{
            color: '#059669',
            textDecoration: 'underline'
          }}>
            {children}
          </a>
        );
      }
      
      // External link
      return (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: '#059669',
            textDecoration: 'underline'
          }}
        >
          {children}
        </a>
      );
    },
    [INLINES.ENTRY_HYPERLINK]: (node, children) => {
      // Handle links to other entries
      return (
        <a href="#" style={{
          color: '#059669',
          textDecoration: 'underline'
        }}>
          {children}
        </a>
      );
    },
  },
};

export default function RichTextRenderer({ document }) {
  return <div style={{
    maxWidth: 'none',
    lineHeight: '1.75',
    color: '#374151'
  }}>{documentToReactComponents(document, options)}</div>;
}