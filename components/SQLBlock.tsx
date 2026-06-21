'use client'

import { useState } from 'react'
import { highlightSQL } from '@/lib/highlight'

interface SQLBlockProps {
  query: string
}

export default function SQLBlock({ query }: SQLBlockProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(query)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="mt-2 border border-gray-200 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-3 py-1.5 bg-gray-50 border-b border-gray-200">
        <span className="text-[10px] font-mono font-medium text-gray-400">SQL · SELECT only</span>
        <button
          onClick={handleCopy}
          className="text-[10px] text-blue-600 hover:underline"
        >
          {copied ? '✓ Tersalin!' : 'Salin'}
        </button>
      </div>
      <pre
        className="p-3 text-xs font-mono leading-relaxed overflow-x-auto whitespace-pre-wrap text-gray-800"
        dangerouslySetInnerHTML={{ __html: highlightSQL(query) }}
      />
    </div>
  )
}
