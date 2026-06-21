'use client'

import { useEffect, useRef } from 'react'
import { MessageBubble, AgentResponse } from '@/app/types'
import SQLBlock from './SQLBlock'

interface ChatMessagesProps {
  messages: MessageBubble[]
  isLoading: boolean
}

export default function ChatMessages({ messages, isLoading }: ChatMessagesProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  return (
    <div className="flex-1 overflow-y-auto p-3 space-y-3">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`flex flex-col gap-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
        >
          {/* User bubble */}
          {msg.role === 'user' && (
            <div className="max-w-[85%] bg-blue-50 text-blue-900 text-sm px-3 py-2 rounded-xl rounded-tr-sm leading-relaxed">
              {msg.content as string}
            </div>
          )}

          {/* Blocked bubble */}
          {msg.role === 'blocked' && (
            <div className="max-w-[92%] bg-amber-50 border border-amber-200 text-amber-800 text-sm px-3 py-2 rounded-xl rounded-tl-sm leading-relaxed">
              🔒 {msg.content as string}
            </div>
          )}

          {/* Error bubble */}
          {msg.role === 'error' && (
            <div className="max-w-[92%] bg-red-50 border border-red-200 text-red-800 text-sm px-3 py-2 rounded-xl rounded-tl-sm leading-relaxed">
              ⚠️ {msg.content as string}
            </div>
          )}

          {/* Agent bubble */}
          {msg.role === 'agent' && (() => {
            const data = msg.content as AgentResponse

            if (!data.safe) {
              return (
                <div className="max-w-[92%] bg-amber-50 border border-amber-200 text-amber-800 text-sm px-3 py-2 rounded-xl rounded-tl-sm leading-relaxed">
                  🔒 <strong>Permintaan ditolak:</strong> {data.reason}
                </div>
              )
            }

            return (
              <div className="max-w-[92%] bg-white border border-gray-200 text-sm px-3 py-2 rounded-xl rounded-tl-sm">
                {data.summary && (
                  <p className="text-gray-700 mb-2 leading-relaxed">{data.summary}</p>
                )}
                {data.query && <SQLBlock query={data.query} />}
                <div className="mt-2 inline-flex items-center gap-1 text-[11px] bg-green-50 text-green-700 px-2 py-0.5 rounded-full">
                  ✓ Query aman — tidak ada operasi destruktif
                </div>
                {data.annotations && data.annotations.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {data.annotations.map((a, i) => (
                      <li key={i} className="flex gap-2 text-xs text-gray-500">
                        <span className="text-green-500 mt-0.5 shrink-0">ℹ</span>
                        <span>{a}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )
          })()}

          <span className="text-[10px] text-gray-400">{msg.timestamp}</span>
        </div>
      ))}

      {/* Loading dots */}
      {isLoading && (
        <div className="flex items-start">
          <div className="bg-white border border-gray-200 px-3 py-2 rounded-xl rounded-tl-sm">
            <div className="flex gap-1 items-center h-4">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  )
}
