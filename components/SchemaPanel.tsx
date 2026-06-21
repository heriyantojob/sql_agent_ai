'use client'

import { Table } from '@/app/types'

interface SchemaPanelProps {
  tables: Table[]
  onLoad: (schema: string) => void
  schemaText: string
  onSchemaTextChange: (val: string) => void
}

export default function SchemaPanel({
  tables,
  onLoad,
  schemaText,
  onSchemaTextChange,
}: SchemaPanelProps) {
  return (
    <aside className="w-56 border-r border-gray-200 flex flex-col overflow-hidden shrink-0">
      {/* Header */}
      <div className="px-3 py-2 text-xs font-medium text-gray-400 border-b border-gray-200 bg-gray-50">
        Schema aktif
      </div>

      {/* Table list */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {tables.length === 0 ? (
          <p className="text-xs text-gray-400 text-center pt-4 leading-relaxed">
            Belum ada schema.<br />Paste di bawah untuk memulai.
          </p>
        ) : (
          tables.map((t) => (
            <div key={t.name}>
              <div className="flex items-center gap-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded px-2 py-1 border border-gray-200">
                <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 6h18M3 14h18M3 18h18" />
                </svg>
                {t.name}
              </div>
              <div className="pl-4 pt-1 space-y-0.5">
                {t.cols.map((c) => (
                  <div key={c.name} className="flex items-center gap-1.5 text-xs text-gray-500">
                    <span className="truncate">{c.name}</span>
                    <span className="font-mono text-[10px] text-gray-400 bg-gray-100 px-1 rounded">{c.type}</span>
                    {c.pk && (
                      <span className="text-[9px] bg-amber-100 text-amber-700 px-1 rounded font-medium">PK</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Schema input */}
      <div className="p-2 border-t border-gray-200 space-y-2">
        <textarea
          className="w-full text-[11px] font-mono p-2 rounded border border-gray-200 bg-gray-50 text-gray-700 resize-none outline-none focus:border-blue-300 focus:ring-1 focus:ring-blue-100 leading-relaxed"
          rows={5}
          placeholder={"Paste schema SQL...\n\nCREATE TABLE users (\n  id INT PRIMARY KEY,\n  name VARCHAR(100)\n);"}
          value={schemaText}
          onChange={(e) => onSchemaTextChange(e.target.value)}
        />
        <button
          onClick={() => onLoad(schemaText)}
          disabled={!schemaText.trim()}
          className="w-full text-xs font-medium py-1.5 rounded border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Muat Schema
        </button>
      </div>
    </aside>
  )
}
