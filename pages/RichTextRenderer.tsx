import { documentToReactComponents } from '@contentful/rich-text-react-renderer'
import { BLOCKS, INLINES, MARKS } from '@contentful/rich-text-types'
import { Document } from '@contentful/rich-text-types'
import Image from 'next/image'
import Link from 'next/link'

// Function to detect and parse markdown tables
function parseMarkdownTable(text: string): { isTable: boolean; tableData?: any; remainingText?: string } {
  // More comprehensive regex that handles tables with or without trailing newlines
  const tableRegex = /\|.*\|\s*\n\|[\s\-\|]*\|\s*\n(\|.*\|\s*(?:\n|$))*/g
  const match = tableRegex.exec(text)
  
  if (!match) {
    return { isTable: false }
  }

  const tableText = match[0]
  const lines = tableText.trim().split('\n')
  
  if (lines.length < 3) {
    return { isTable: false }
  }

  // Parse header
  const headerLine = lines[0]
  const headerCells = headerLine.split('|').map(h => h.trim())
  // Remove first and last empty cells (from leading/trailing |)
  if (headerCells[0] === '') headerCells.shift()
  if (headerCells[headerCells.length - 1] === '') headerCells.pop()
  const headers = headerCells.filter(h => h)
  
  // Parse data rows (skip separator line)
  const dataLines = lines.slice(2).filter(line => line.trim() && !line.match(/^[\|\s\-]*$/))
  
  // Also check if there are any table rows remaining in the text after our match
  const remainingTableRows = text.split(tableText)[1]?.match(/^\|.*\|/gm) || []
  
  const allDataLines = [...dataLines, ...remainingTableRows]
  
  const rows = allDataLines.map(line => {
    // Split by | and trim, but keep empty cells to maintain column alignment
    const cells = line.split('|').map(cell => cell.trim())
    // Remove first and last empty cells (from leading/trailing |)
    if (cells[0] === '') cells.shift()
    if (cells[cells.length - 1] === '') cells.pop()
    return cells
  })

  // Calculate remaining text after removing table and any additional table rows
  let cleanedText = text.replace(tableText, '')
  remainingTableRows.forEach(row => {
    cleanedText = cleanedText.replace(row, '')
  })
  
  return {
    isTable: true,
    tableData: { headers, rows },
    remainingText: cleanedText.trim()
  }
}

// Component to render a markdown table as React elements
function MarkdownTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto my-6">
      <table className="min-w-full divide-y divide-gray-200 border border-gray-300 rounded-lg">
        <thead className="bg-faded-green">
          <tr>
            {headers.map((header, i) => (
              <th key={i} className="px-4 py-3 text-left text-sm font-medium text-gray-900 border-b border-gray-200">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {rows.map((row, i) => (
            <tr key={i} className={`${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100`}>
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-3 text-sm text-gray-700 border-b border-gray-200">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

interface RichTextRendererProps {
  document: Document
}

const options = {
  renderMark: {
    [MARKS.BOLD]: (text: any) => <strong className="font-semibold">{text}</strong>,
    [MARKS.ITALIC]: (text: any) => <em className="italic">{text}</em>,
    [MARKS.UNDERLINE]: (text: any) => <u className="underline">{text}</u>,
    [MARKS.CODE]: (text: any) => (
      <code className="bg-gray-100 rounded px-1 py-0.5 text-sm font-mono">{text}</code>
    ),
  },
  renderNode: {
    [BLOCKS.PARAGRAPH]: (node: any, children: any) => {
      // Extract text content from the node to check for tables
      // Handle both plain text and formatted text (links, etc.)
      const textContent = node.content
        ?.map((item: any) => {
          if (item.nodeType === 'text') {
            return item.value || ''
          } else if (item.nodeType === 'hyperlink' && item.content) {
            // Extract text from links for table parsing
            return item.content.map((linkItem: any) => linkItem.value || '').join('')
          }
          return ''
        })
        .join('') || ''

      // Check if this paragraph contains a markdown table
      const tableResult = parseMarkdownTable(textContent)
      
      if (tableResult.isTable && tableResult.tableData) {
        return (
          <div>
            <MarkdownTable 
              headers={tableResult.tableData.headers} 
              rows={tableResult.tableData.rows} 
            />
            {tableResult.remainingText && (
              <p className="mb-4 leading-relaxed text-gray-700">
                {tableResult.remainingText}
              </p>
            )}
          </div>
        )
      }

      // Default paragraph rendering
      return <p className="mb-4 leading-relaxed text-gray-700">{children}</p>
    },
    [BLOCKS.HEADING_1]: (node: any, children: any) => (
      <h1 className="text-4xl font-medium mb-6 text-gray-900 font-reckless">{children}</h1>
    ),
    [BLOCKS.HEADING_2]: (node: any, children: any) => (
      <h2 className="text-3xl font-medium mb-4 mt-8 text-gray-900 font-reckless">{children}</h2>
    ),
    [BLOCKS.HEADING_3]: (node: any, children: any) => (
      <h3 className="text-2xl font-medium mb-3 mt-6 text-gray-900 font-reckless">{children}</h3>
    ),
    [BLOCKS.HEADING_4]: (node: any, children: any) => (
      <h4 className="text-xl font-medium mb-2 mt-4 text-gray-900 font-reckless">{children}</h4>
    ),
    [BLOCKS.HEADING_5]: (node: any, children: any) => (
      <h5 className="text-lg font-medium mb-2 mt-4 text-gray-900 font-reckless">{children}</h5>
    ),
    [BLOCKS.HEADING_6]: (node: any, children: any) => (
      <h6 className="text-base font-medium mb-2 mt-4 text-gray-900 font-reckless">{children}</h6>
    ),
    [BLOCKS.UL_LIST]: (node: any, children: any) => (
      <ul className="list-disc list-outside ml-6 mb-4 space-y-2 text-gray-700">{children}</ul>
    ),
    [BLOCKS.OL_LIST]: (node: any, children: any) => (
      <ol className="list-decimal list-outside ml-6 mb-4 space-y-2 text-gray-700">{children}</ol>
    ),
    [BLOCKS.LIST_ITEM]: (node: any, children: any) => (
      <li>{children}</li>
    ),
    [BLOCKS.QUOTE]: (node: any, children: any) => (
      <blockquote className="border-l-4 border-green-500 pl-4 py-2 mb-4 italic text-gray-600 bg-green-50">
        {children}
      </blockquote>
    ),
    [BLOCKS.HR]: () => <hr className="border-gray-300 my-8" />,
    [BLOCKS.EMBEDDED_ASSET]: (node: any) => {
      const asset = node.data.target
      if (asset?.fields?.file?.url) {
        const url = asset.fields.file.url.startsWith('//')
          ? `https:${asset.fields.file.url}`
          : asset.fields.file.url
        
        return (
          <div className="my-8">
            <Image
              src={url}
              alt={asset.fields.title || asset.fields.description || ''}
              width={asset.fields.file.details.image?.width || 800}
              height={asset.fields.file.details.image?.height || 600}
              className="rounded-lg shadow-md mx-auto"
            />
            {asset.fields.description && (
              <p className="text-sm text-gray-500 text-center mt-2">
                {asset.fields.description}
              </p>
            )}
          </div>
        )
      }
      return null
    },
    [INLINES.HYPERLINK]: (node: any, children: any) => {
      const url = node.data.uri
      
      // Check if it's an internal link
      if (url.startsWith('/')) {
        return (
          <Link href={url} className="text-green-600 hover:text-green-700 underline">
            {children}
          </Link>
        )
      }
      
      // External link
      return (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-green-600 hover:text-green-700 underline"
        >
          {children}
        </a>
      )
    },
    [INLINES.ENTRY_HYPERLINK]: (node: any, children: any) => {
      // Handle links to other entries
      return (
        <Link href="#" className="text-green-600 hover:text-green-700 underline">
          {children}
        </Link>
      )
    },
  },
}

export default function RichTextRenderer({ document }: RichTextRendererProps) {
  return <div className="prose max-w-none">{documentToReactComponents(document, options)}</div>
}