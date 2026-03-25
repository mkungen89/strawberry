'use client'

import { useState, useEffect, useRef, useCallback, KeyboardEvent } from 'react'
import {
  MessageCircle,
  Send,
  X,
  CheckCircle,
  Clock,
  Users,
  RefreshCw,
  Loader2,
  Mail,
  User,
} from 'lucide-react'
import { toast } from 'sonner'

interface Message {
  id: string
  content: string
  senderType: string
  senderName: string
  createdAt: string
}

interface Conversation {
  id: string
  visitorName: string
  visitorEmail: string | null
  status: string
  assignedTo: string | null
  createdAt: string
  updatedAt: string
  closedAt: string | null
  messages: Message[]
  _count: { messages: number }
}

type FilterTab = 'all' | 'open' | 'closed'

const FILTER_TABS: FilterTab[] = ['all', 'open', 'closed']

function formatRelative(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return 'just now'
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) return `${diffHr}h ago`
  const diffDays = Math.floor(diffHr / 24)
  if (diffDays === 1) return 'yesterday'
  return `${diffDays}d ago`
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('sv-SE', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function initials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}

interface ConversationRowProps {
  conv: Conversation
  selected: boolean
  onClick: () => void
}

function ConversationRow({ conv, selected, onClick }: ConversationRowProps) {
  const lastMsg = conv.messages[0] ?? null
  const isOpen = conv.status === 'OPEN'

  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-3.5 border-b border-white/[0.04] transition-all hover:bg-white/[0.04] ${
        selected
          ? 'bg-purple-600/10 border-l-2 border-l-purple-500'
          : 'border-l-2 border-l-transparent'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="relative shrink-0 mt-0.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.06] text-xs font-bold text-gray-300">
            {initials(conv.visitorName)}
          </div>
          <span
            className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-black ${
              isOpen ? 'bg-green-400' : 'bg-gray-600'
            }`}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <span className="text-sm font-medium text-white truncate">{conv.visitorName}</span>
            <span className="text-[10px] text-gray-600 shrink-0">
              {formatRelative(conv.updatedAt)}
            </span>
          </div>
          {conv.visitorEmail && (
            <p className="text-[10px] text-gray-600 mb-0.5 truncate">{conv.visitorEmail}</p>
          )}
          {lastMsg && (
            <p className="text-xs text-gray-500 truncate leading-relaxed">
              {lastMsg.senderType === 'AGENT' && (
                <span className="text-purple-500">You: </span>
              )}
              {lastMsg.content}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center justify-between mt-2 pl-12">
        <span
          className={`text-[9px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded border ${
            isOpen
              ? 'text-green-400 border-green-500/20 bg-green-500/10'
              : 'text-gray-600 border-white/[0.08] bg-white/[0.04]'
          }`}
        >
          {conv.status}
        </span>
        <span className="text-[10px] text-gray-700">
          {conv._count.messages} msg{conv._count.messages !== 1 ? 's' : ''}
        </span>
      </div>
    </button>
  )
}

interface MessageBubbleProps {
  msg: Message
}

function MessageBubble({ msg }: MessageBubbleProps) {
  const isAgent = msg.senderType === 'AGENT'
  return (
    <div className={`flex gap-2.5 ${isAgent ? 'flex-row-reverse' : 'flex-row'}`}>
      <div
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold mt-auto mb-0.5 ${
          isAgent ? 'bg-purple-600/30 text-purple-300' : 'bg-white/[0.08] text-gray-400'
        }`}
      >
        {initials(msg.senderName)}
      </div>
      <div
        className={`flex flex-col gap-1 max-w-[72%] ${isAgent ? 'items-end' : 'items-start'}`}
      >
        <div
          className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
            isAgent
              ? 'rounded-tr-sm bg-purple-600/20 border border-purple-500/20 text-purple-100'
              : 'rounded-tl-sm bg-white/[0.06] border border-white/[0.06] text-gray-200'
          }`}
        >
          {msg.content}
        </div>
        <span className="text-[10px] text-gray-700 px-1">{formatTime(msg.createdAt)}</span>
      </div>
    </div>
  )
}

interface MessageViewProps {
  convId: string
  onConvUpdated: (conv: Conversation) => void
}

function MessageView({ convId, onConvUpdated }: MessageViewProps) {
  const [conv, setConv] = useState<Conversation | null>(null)
  const [loading, setLoading] = useState(true)
  const [reply, setReply] = useState('')
  const [sending, setSending] = useState(false)
  const [closing, setClosing] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const fetchConv = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true)
      try {
        const res = await fetch(`/api/admin/chat/${convId}`)
        if (res.ok) {
          const data: Conversation = await res.json()
          setConv(data)
          onConvUpdated(data)
        }
      } finally {
        if (!silent) setLoading(false)
      }
    },
    [convId, onConvUpdated]
  )

  useEffect(() => {
    fetchConv()
    const interval = setInterval(() => fetchConv(true), 10000)
    return () => clearInterval(interval)
  }, [fetchConv])

  // Scroll to bottom when messages update
  useEffect(() => {
    if (conv) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [conv?.messages?.length]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSend() {
    const content = reply.trim()
    if (!content || sending) return
    setSending(true)
    try {
      const res = await fetch(`/api/admin/chat/${convId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })
      if (!res.ok) throw new Error('Send failed')
      setReply('')
      await fetchConv(true)
      textareaRef.current?.focus()
    } catch {
      toast.error('Failed to send message')
    } finally {
      setSending(false)
    }
  }

  async function handleClose() {
    if (!conv || closing) return
    setClosing(true)
    try {
      const res = await fetch(`/api/admin/chat/${convId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CLOSED' }),
      })
      if (!res.ok) throw new Error('Close failed')
      toast.success('Conversation closed')
      await fetchConv(true)
    } catch {
      toast.error('Failed to close conversation')
    } finally {
      setClosing(false)
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
      </div>
    )
  }

  if (!conv) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-gray-600 text-sm">Failed to load conversation.</p>
      </div>
    )
  }

  const isClosed = conv.status === 'CLOSED'
  const messages = conv.messages ?? []

  return (
    <div className="flex flex-1 flex-col min-h-0">
      {/* Conversation header */}
      <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-white/[0.06] shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-xs font-bold text-gray-300">
            {initials(conv.visitorName)}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h2 className="font-semibold text-white truncate">{conv.visitorName}</h2>
              <span
                className={`text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded border shrink-0 ${
                  isClosed
                    ? 'text-gray-600 border-white/[0.08] bg-white/[0.04]'
                    : 'text-green-400 border-green-500/20 bg-green-500/10'
                }`}
              >
                {conv.status}
              </span>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {conv.visitorEmail && (
                <span className="flex items-center gap-1 text-xs text-gray-600">
                  <Mail className="w-3 h-3" />
                  {conv.visitorEmail}
                </span>
              )}
              {conv.assignedTo && (
                <span className="flex items-center gap-1 text-xs text-gray-600">
                  <User className="w-3 h-3" />
                  {conv.assignedTo}
                </span>
              )}
              <span className="flex items-center gap-1 text-xs text-gray-700">
                <Clock className="w-3 h-3" />
                {formatDateTime(conv.createdAt)}
              </span>
            </div>
          </div>
        </div>
        {!isClosed && (
          <button
            onClick={handleClose}
            disabled={closing}
            className="flex items-center gap-1.5 shrink-0 px-3.5 py-2 rounded-xl border border-red-500/20 bg-red-500/[0.05] text-xs font-medium text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-50"
          >
            {closing ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <X className="w-3.5 h-3.5" />
            )}
            Close
          </button>
        )}
      </div>

      {/* Closed banner */}
      {isClosed && conv.closedAt && (
        <div className="mx-6 mt-3 flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 shrink-0">
          <CheckCircle className="w-4 h-4 text-gray-600 shrink-0" />
          <p className="text-xs text-gray-500">
            Conversation closed on {formatDateTime(conv.closedAt)}
          </p>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 min-h-0">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-gray-600 text-sm">No messages yet.</p>
          </div>
        ) : (
          messages.map((msg) => <MessageBubble key={msg.id} msg={msg} />)
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Reply area */}
      {isClosed ? (
        <div className="shrink-0 border-t border-white/[0.06] px-6 py-4">
          <div className="flex items-center gap-2 text-xs text-gray-600 justify-center">
            <CheckCircle className="w-3.5 h-3.5" />
            This conversation is closed and cannot receive new messages.
          </div>
        </div>
      ) : (
        <div className="shrink-0 border-t border-white/[0.06] px-6 py-4">
          <div className="flex gap-3 items-end">
            <textarea
              ref={textareaRef}
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message… (Enter to send, Shift+Enter for newline)"
              rows={2}
              className="flex-1 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm text-white placeholder:text-gray-600 resize-none focus:outline-none focus:border-purple-500/40 focus:ring-1 focus:ring-purple-500/20 transition-all"
            />
            <button
              onClick={handleSend}
              disabled={sending || !reply.trim()}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-600/25 border border-purple-500/30 text-purple-300 hover:bg-purple-600/40 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {sending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function ChatAdminPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [filter, setFilter] = useState<FilterTab>('all')
  const [lastRefresh, setLastRefresh] = useState(new Date())
  const [manualRefreshing, setManualRefreshing] = useState(false)

  const fetchConversations = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    else setManualRefreshing(true)
    try {
      const res = await fetch('/api/admin/chat')
      if (res.ok) {
        setConversations(await res.json())
        setLastRefresh(new Date())
      }
    } finally {
      if (!silent) setLoading(false)
      else setManualRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchConversations()
    const interval = setInterval(() => fetchConversations(true), 30000)
    return () => clearInterval(interval)
  }, [fetchConversations])

  const handleConvUpdated = useCallback((updated: Conversation) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === updated.id ? { ...c, ...updated } : c))
    )
  }, [])

  const filtered = conversations.filter((c) => {
    if (filter === 'open') return c.status === 'OPEN'
    if (filter === 'closed') return c.status === 'CLOSED'
    return true
  })

  const openCount = conversations.filter((c) => c.status === 'OPEN').length
  const closedCount = conversations.filter((c) => c.status === 'CLOSED').length

  const tabCount = (tab: FilterTab): number => {
    if (tab === 'all') return conversations.length
    if (tab === 'open') return openCount
    return closedCount
  }

  return (
    <div className="flex h-screen flex-col bg-black text-white">
      {/* Top header */}
      <div className="shrink-0 border-b border-white/[0.06] px-6 py-4 flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-0.5">
            <MessageCircle className="w-5 h-5 text-purple-400" />
            <h1 className="text-xl font-bold text-white">Live Chat</h1>
            {openCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-green-500/20 border border-green-500/30 px-1.5 text-[10px] font-bold text-green-400">
                {openCount}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-600">
            Visitor conversations · updated{' '}
            {lastRefresh.toLocaleTimeString('sv-SE', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            })}
          </p>
        </div>
        <button
          onClick={() => fetchConversations(true)}
          disabled={manualRefreshing || loading}
          className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/[0.05] transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${manualRefreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Two-panel layout */}
      <div className="flex flex-1 min-h-0">
        {/* Sidebar — conversation list */}
        <aside className="flex flex-col w-80 shrink-0 border-r border-white/[0.06] min-h-0">
          {/* Filter tabs */}
          <div className="shrink-0 px-4 py-3 border-b border-white/[0.06]">
            <div className="flex rounded-xl border border-white/[0.06] bg-white/[0.02] p-0.5 gap-0.5">
              {FILTER_TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium transition-all capitalize ${
                    filter === tab
                      ? 'bg-purple-600/25 text-purple-300 border border-purple-500/30'
                      : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  {tab}
                  <span
                    className={`text-[9px] font-bold ${
                      filter === tab ? 'text-purple-400' : 'text-gray-700'
                    }`}
                  >
                    {tabCount(tab)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-5 h-5 animate-spin text-purple-400" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                <MessageCircle className="w-8 h-8 text-gray-700 mb-3" />
                <p className="text-sm font-medium text-gray-500">No conversations</p>
                <p className="text-xs text-gray-700 mt-1">
                  {filter !== 'all'
                    ? `No ${filter} conversations`
                    : 'Visitor chats will appear here'}
                </p>
              </div>
            ) : (
              filtered.map((conv) => (
                <ConversationRow
                  key={conv.id}
                  conv={conv}
                  selected={selectedId === conv.id}
                  onClick={() => setSelectedId(conv.id)}
                />
              ))
            )}
          </div>
        </aside>

        {/* Main message area */}
        <main className="flex flex-1 min-w-0 flex-col min-h-0 bg-black/20">
          {selectedId ? (
            <MessageView
              key={selectedId}
              convId={selectedId}
              onConvUpdated={handleConvUpdated}
            />
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.04] border border-white/[0.06]">
                <Users className="w-7 h-7 text-gray-600" />
              </div>
              <div className="text-center">
                <p className="font-medium text-gray-400">Select a conversation</p>
                <p className="text-sm text-gray-600 mt-0.5">
                  Choose a conversation from the sidebar to start
                </p>
              </div>
              {openCount > 0 && (
                <div className="flex items-center gap-1.5 mt-1 text-xs text-green-500">
                  <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                  {openCount} open conversation{openCount !== 1 ? 's' : ''}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
