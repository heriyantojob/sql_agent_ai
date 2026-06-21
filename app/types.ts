export interface Column {
  name: string
  type: string
  pk: boolean
}

export interface Table {
  name: string
  cols: Column[]
}

export interface AgentResponse {
  safe: boolean
  reason?: string
  query?: string
  annotations?: string[]
  summary?: string
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface MessageBubble {
  id: string
  role: 'user' | 'agent' | 'error' | 'blocked'
  content: string | AgentResponse
  timestamp: string
}
