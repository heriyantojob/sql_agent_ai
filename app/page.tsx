'use client'

import { useState, useCallback, useEffect } from 'react'
import SchemaPanel from '@/components/SchemaPanel'
import ChatMessages from '@/components/ChatMessages'
import ChatInput from '@/components/ChatInput'
import { parseSchema, isDestructiveQuery, DEMO_SCHEMA } from '@/lib/safety'
import { MessageBubble, ChatMessage, Table, AgentResponse } from '@/app/types'

function makeId() {
  return Math.random().toString(36).slice(2)
}

function nowTime() {
  return new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}

export default function HomePage() {
  const [schemaText, setSchemaText] = useState(DEMO_SCHEMA)
  const [currentSchema, setCurrentSchema] = useState('')
  const [tables, setTables] = useState<Table[]>([])
  const [messages, setMessages] = useState<MessageBubble[]>([])
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const addMessage = useCallback((msg: Omit<MessageBubble, 'id' | 'timestamp'>) => {
    setMessages((prev) => [...prev, { ...msg, id: makeId(), timestamp: nowTime() }])
  }, [])

  const loadSchema = useCallback((schema: string) => {
    if (!schema.trim()) return
    const parsed = parseSchema(schema)
    setCurrentSchema(schema)
    setTables(parsed)
    setChatHistory([])
    setMessages([{
      id: makeId(),
      role: 'agent',
      content: {
        safe: true,
        summary: `Schema dimuat — ditemukan ${parsed.length} tabel: ${parsed.map((t) => t.name).join(', ')}. Silakan tanya pertanyaan bisnis kamu.`,
        query: '',
        annotations: [],
      },
      timestamp: nowTime(),
    }])
  }, [])

  // Load demo schema sekali setelah komponen mount
  useEffect(() => {
    loadSchema(DEMO_SCHEMA)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const sendMessage = useCallback(async () => {
    if (!input.trim() || !currentSchema || isLoading) return

    const text = input.trim()
    setInput('')

    if (isDestructiveQuery(text)) {
      addMessage({
        role: 'blocked',
        content: 'Permintaan ini mengandung operasi yang tidak diizinkan. Saya hanya dapat membantu membuat query SELECT.',
      })
      return
    }

    addMessage({ role: 'user', content: text })

    const newHistory: ChatMessage[] = [...chatHistory, { role: 'user', content: text }]
    setChatHistory(newHistory)
    setIsLoading(true)

    try {
      const res = await fetch('/api/sql-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schema: currentSchema, messages: newHistory }),
      })

      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      const data: AgentResponse = await res.json()
      addMessage({ role: 'agent', content: data })

      if (data.safe && data.query) {
        setChatHistory((prev) => [
          ...prev,
          { role: 'assistant', content: JSON.stringify(data) },
        ])
      } else {
        setChatHistory(chatHistory)
      }
    } catch (e) {
      console.error(e)
      addMessage({ role: 'error', content: 'Tidak dapat terhubung ke server. Coba lagi sebentar.' })
      setChatHistory(chatHistory)
    } finally {
      setIsLoading(false)
    }
  }, [input, currentSchema, isLoading, chatHistory, addMessage])

  return (
    <main className="h-screen flex flex-col bg-gray-50">
      <header className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-700 text-sm font-medium shrink-0">
          SQL
        </div>
        <div>
          <h1 className="text-sm font-medium text-gray-900">SQL Query Builder Agent</h1>
          <p className="text-xs text-gray-400">Role: DB assistant · hanya SELECT · query aman &amp; beranotasi</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-xs text-gray-400">Agent aktif</span>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <SchemaPanel
          tables={tables}
          onLoad={loadSchema}
          schemaText={schemaText}
          onSchemaTextChange={setSchemaText}
        />
        <div className="flex flex-col flex-1 overflow-hidden bg-white">
          <ChatMessages messages={messages} isLoading={isLoading} />
          <ChatInput
            value={input}
            onChange={setInput}
            onSend={sendMessage}
            disabled={isLoading}
            hasSchema={!!currentSchema}
          />
        </div>
      </div>
    </main>
  )
}
