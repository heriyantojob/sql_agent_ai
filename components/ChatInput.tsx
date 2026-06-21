'use client'

import { useRef, KeyboardEvent } from 'react'

interface ChatInputProps {
  value: string
  onChange: (val: string) => void
  onSend: () => void
  disabled: boolean
  hasSchema: boolean
}

export default function ChatInput({ value, onChange, onSend, disabled, hasSchema }: ChatInputProps) {
  const ref = useRef<HTMLTextAreaElement>(null)

  const handleKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSend()
    }
  }

  const handleInput = () => {
    if (ref.current) {
      ref.current.style.height = 'auto'
      ref.current.style.height = Math.min(ref.current.scrollHeight, 120) + 'px'
    }
  }

  return (
    <div className="p-3 border-t border-gray-200 space-y-2">
      {/* Example questions */}
      {hasSchema && (
        <div className="flex flex-wrap gap-1.5">
          {[
            'Tampilkan semua user aktif',
            'Total penjualan per produk bulan ini',
            'Siapa 10 customer dengan order terbanyak?',
            'Produk dengan stok di bawah 10',
          ].map((q) => (
            <button
              key={q}
              onClick={() => onChange(q)}
              className="text-[11px] px-2 py-1 rounded border border-blue-200 text-blue-600 bg-transparent hover:bg-blue-50 transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      <div className="flex gap-2 items-end">
        <textarea
          ref={ref}
          className="flex-1 text-sm px-3 py-2 rounded-lg border border-gray-300 resize-none outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 text-gray-800 leading-relaxed"
          placeholder={
            hasSchema
              ? 'Tanya dalam bahasa Indonesia... (Enter kirim, Shift+Enter baris baru)'
              : 'Muat schema terlebih dahulu...'
          }
          rows={1}
          value={value}
          onChange={(e) => { onChange(e.target.value); handleInput() }}
          onKeyDown={handleKey}
          disabled={!hasSchema || disabled}
          style={{ minHeight: '38px', maxHeight: '120px' }}
        />
        <button
          onClick={onSend}
          disabled={!hasSchema || disabled || !value.trim()}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors h-[38px] shrink-0"
        >
          Kirim ↑
        </button>
      </div>
    </div>
  )
}
