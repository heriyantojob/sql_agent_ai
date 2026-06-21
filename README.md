# SQL Query Builder Agent

AI Agent berbasis Next.js + Anthropic SDK yang generate SQL SELECT query dari pertanyaan bisnis.

## Arsitektur Agent

```
Role    → DB assistant yang HANYA buat SELECT query
Memory  → Schema DB disimpan di system prompt + chat history (max 8 pesan)  
Goal    → Query benar + aman + beranotasi
Rules   → Tolak INSERT/UPDATE/DELETE/DROP dll (3 layer safety)
```

## Struktur File

```
sql-agent/
├── app/
│   ├── api/sql-agent/route.ts   ← API route (API key aman di server)
│   ├── page.tsx                 ← Main page + state management
│   ├── types.ts                 ← TypeScript interfaces
│   └── layout.tsx
├── components/
│   ├── SchemaPanel.tsx          ← Sidebar schema + table list
│   ├── ChatMessages.tsx         ← Render semua bubble pesan
│   ├── ChatInput.tsx            ← Input + example questions
│   └── SQLBlock.tsx             ← Syntax highlighted SQL + copy
├── lib/
│   ├── prompts.ts               ← buildSystemPrompt(schema)
│   ├── safety.ts                ← BLOCKED_PATTERNS + parseSchema
│   └── highlight.ts             ← SQL syntax highlighter
└── .env.local                   ← ANTHROPIC_API_KEY (jangan di-commit!)
```

## Safety Layer (3 Lapis)

1. **Client-side** (`lib/safety.ts`) — regex `BLOCKED_PATTERNS` cek input user sebelum API call
2. **Server-side** (`api/sql-agent/route.ts`) — cek ulang di server sebelum kirim ke Anthropic
3. **Model-level** (`lib/prompts.ts`) — system prompt instruksikan model tolak query destruktif + return `safe: false`

## Setup

```bash
# 1. Clone / copy folder ini
cd sql-agent

# 2. Install dependencies
npm install

# 3. Set API key
cp .env.local.example .env.local
# Edit .env.local, isi ANTHROPIC_API_KEY

# 4. Jalankan
npm run dev
```

Buka http://localhost:3000

## Cara Pakai

1. Paste schema SQL di panel kiri (atau gunakan demo schema yang sudah ada)
2. Klik "Muat Schema"
3. Tanya pertanyaan bisnis dalam bahasa Indonesia
4. Agent generate query SELECT yang aman + beranotasi

## Extend Project Ini

- Tambah **query history** dengan `localStorage`
- Tambah **format export** ke CSV/Excel
- Integrasikan **database real** dengan `pg` / `mysql2` untuk eksekusi langsung
- Tambah **multiple schema** support (pilih DB dari dropdown)
