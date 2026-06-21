import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { buildSystemPrompt } from '@/lib/prompts'
import { AgentResponse, ChatMessage } from '@/app/types'

// OpenRouter — drop-in OpenAI-compatible API
// Model gratis tersedia: https://openrouter.ai/models?q=free
const client = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
  defaultHeaders: {
    'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    'X-Title': 'SQL Query Builder Agent',
  },
})

// Model default — bisa diganti via env. Contoh model gratis di OpenRouter:
// - meta-llama/llama-3.3-70b-instruct:free
// - mistralai/mistral-7b-instruct:free
// - google/gemma-3-27b-it:free
const MODEL = process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.3-70b-instruct:free'

// Server-side safety check (double layer setelah client-side)
const SERVER_BLOCKED =
  /\b(INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|TRUNCATE|EXEC|EXECUTE|GRANT|REVOKE)\b/i

export async function POST(req: NextRequest) {
  try {
    const { schema, messages } = await req.json()

    if (!schema || typeof schema !== 'string') {
      return NextResponse.json({ error: 'Schema tidak ditemukan' }, { status: 400 })
    }

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Messages tidak valid' }, { status: 400 })
    }

    // Server-side safety: cek pesan terakhir dari user
    const lastUserMsg = [...messages].reverse().find((m: ChatMessage) => m.role === 'user')
    if (lastUserMsg && SERVER_BLOCKED.test(lastUserMsg.content)) {
      const blocked: AgentResponse = {
        safe: false,
        reason: 'Permintaan ini terdeteksi mengandung operasi berbahaya di server.',
        query: '',
        annotations: [],
        summary: '',
      }
      return NextResponse.json(blocked)
    }

    const response = await client.chat.completions.create({
      model: MODEL,
      max_tokens: 1024,
      messages: [
        { role: 'system', content: buildSystemPrompt(schema) },
        ...messages.slice(-8), // kirim max 8 pesan terakhir
      ],
    })

    const rawText = response.choices[0]?.message?.content || '{}'

    // Parse JSON dari response model
    let parsed: AgentResponse
    try {
      const clean = rawText.replace(/```json|```/g, '').trim()
      parsed = JSON.parse(clean)
    } catch {
      parsed = {
        safe: false,
        reason: 'Agent tidak dapat memproses permintaan. Coba ulangi dengan pertanyaan yang lebih spesifik.',
        query: '',
        annotations: [],
        summary: '',
      }
    }

    // Final safety gate: pastikan query yang lolos benar-benar SELECT
    if (parsed.safe && parsed.query) {
      const firstWord = parsed.query.replace(/--[^\n]*/g, '').trim().split(/\s+/)[0]?.toUpperCase()
      if (firstWord && firstWord !== 'SELECT' && firstWord !== 'WITH') {
        parsed = {
          safe: false,
          reason: 'Query yang dihasilkan bukan SELECT — diblokir oleh safety layer.',
          query: '',
          annotations: [],
          summary: '',
        }
      }
    }

    return NextResponse.json(parsed)
  } catch (error) {
    console.error('[sql-agent] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
