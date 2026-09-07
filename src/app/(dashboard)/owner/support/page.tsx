'use client'

import { FormEvent, useEffect, useState } from 'react'
import { Check, Loader2, MessageCircle, Send, Trash2 } from 'lucide-react'

type Message = { id: string; body: string; sender: { username: string; role: string } }
type User = { id: string; username: string; fullName: string | null; email: string; status: string }
type Conversation = { id: string; status: 'OPEN' | 'RESOLVED'; manager: { id: string; username: string; fullName: string | null; email: string }; messages: Message[] }

export default function OwnerSupportPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const selectedConversation = conversations.find((item) => item.manager.id === selectedId)
  const selectedUser = users.find((item) => item.id === selectedId)

  useEffect(() => {
    fetch('/api/support', { credentials: 'include' }).then(async (response) => {
      const data = await response.json()
      if (!response.ok) throw new Error(data.error)
      setConversations(data.conversations)
      setUsers(data.users || [])
      setSelectedId(data.users[0]?.id || null)
    }).catch((loadError) => setError(loadError instanceof Error ? loadError.message : 'Unable to load support.')).finally(() => setLoading(false))
  }, [])

  const sendMessage = async (event: FormEvent) => {
    event.preventDefault()
    if (!selectedUser || !body.trim()) return
    setSending(true)
    setError('')
    try {
      const response = await fetch('/api/support', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ conversationId: selectedConversation?.id, managerId: selectedUser.id, body }), credentials: 'include' })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error)
      setConversations((items) => items.some((item) => item.id === data.conversation.id) ? items.map((item) => item.id === data.conversation.id ? data.conversation : item) : [data.conversation, ...items])
      setBody('')
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : 'Unable to send message.')
    } finally {
      setSending(false)
    }
  }

  const resolve = async () => {
    if (!selectedConversation) return
    const response = await fetch('/api/support', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ conversationId: selectedConversation.id, status: 'RESOLVED' }), credentials: 'include' })
    const data = await response.json()
    if (response.ok) setConversations((items) => items.map((item) => item.id === data.conversation.id ? data.conversation : item))
  }

  const deleteConversation = async () => {
    if (!selectedConversation || !window.confirm('Delete this conversation and all its messages?')) return
    setError('')
    const response = await fetch('/api/support', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ conversationId: selectedConversation.id }), credentials: 'include' })
    const data = await response.json()
    if (!response.ok) {
      setError(data.error || 'Unable to delete conversation.')
      return
    }
    setConversations((items) => items.filter((item) => item.id !== data.deletedConversationId))
    setSelectedId(null)
  }

  return (
    <section className="flex min-h-[calc(100dvh-3rem)] flex-col space-y-5">
      <div className="grid min-h-0 flex-1 grid-rows-[auto_minmax(0,1fr)] gap-4 lg:grid-cols-[18rem_1fr] lg:grid-rows-1">
        <div className="min-h-0 max-h-[30vh] overflow-y-auto rounded-2xl border border-slate-200/80 bg-white/75 p-2 lg:max-h-none dark:border-white/10 dark:bg-slate-900/50">
          {loading && <div className="p-4 text-sm text-slate-500"><Loader2 className="mr-2 inline h-4 w-4 animate-spin" />Loading...</div>}
          {!loading && users.length === 0 && <p className="p-4 text-sm text-slate-500">No users yet.</p>}
          {users.map((user) => { const conversation = conversations.find((item) => item.manager.id === user.id); return <button key={user.id} type="button" onClick={() => setSelectedId(user.id)} className={`w-full rounded-xl p-3 text-left ${selectedUser?.id === user.id ? 'bg-cyan-400/10' : 'hover:bg-slate-100/70 dark:hover:bg-white/5'}`}><div className="flex items-center justify-between text-sm font-medium text-slate-800 dark:text-slate-100">{user.fullName || 'Name not provided'}<span className={`text-[10px] uppercase ${conversation?.status === 'OPEN' ? 'text-amber-500' : conversation ? 'text-emerald-500' : 'text-slate-400'}`}>{conversation?.status || 'NEW'}</span></div><p className="mt-0.5 truncate text-xs text-slate-500">@{user.username}</p><p className="mt-1 truncate text-xs text-slate-400">{conversation?.messages.at(-1)?.body || 'Start a conversation'}</p></button> })}
        </div>
        <div className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white/75 dark:border-white/10 dark:bg-slate-900/50">
          {selectedUser ? <>
              <div className="flex items-center justify-between border-b border-slate-200/70 px-4 py-3 dark:border-white/10"><div><div className="flex items-center gap-2 text-sm font-medium text-slate-800 dark:text-white"><MessageCircle className="h-4 w-4 text-cyan-400" />{selectedUser.fullName || 'Name not provided'}</div><p className="text-xs text-slate-500">@{selectedUser.username} · {selectedUser.email}</p></div><div className="flex items-center gap-2">{selectedConversation?.status === 'OPEN' && <button type="button" onClick={resolve} className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/20 px-3 py-1.5 text-xs text-emerald-500 hover:bg-emerald-500/10"><Check className="h-3.5 w-3.5" />Resolve</button>}{selectedConversation && <button type="button" onClick={deleteConversation} aria-label="Delete conversation" title="Delete conversation" className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200/80 text-slate-400 transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-500/20 dark:border-white/10 dark:text-slate-500 dark:hover:border-rose-400/30 dark:hover:bg-rose-400/10 dark:hover:text-rose-300"><Trash2 className="h-4 w-4" /></button>}</div></div>
            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-slate-50/50 p-4 dark:bg-slate-950/20">{selectedConversation?.messages.map((message) => <div key={message.id} className={`w-fit max-w-[85%] whitespace-pre-wrap break-words rounded-xl px-3 py-2 text-sm leading-5 ${message.sender.role === 'OWNER' ? 'ml-auto rounded-br-sm bg-cyan-500 text-slate-950' : 'rounded-bl-sm bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200'}`}>{message.body}</div>)}</div>
            <form onSubmit={sendMessage} className="flex gap-2 border-t border-slate-200/70 p-4 dark:border-white/10"><input value={body} onChange={(event) => setBody(event.target.value)} placeholder="Reply to publisher..." className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-slate-950/50 dark:text-white" /><button type="submit" disabled={sending || !body.trim()} aria-label="Send reply" className="inline-flex items-center justify-center rounded-lg bg-cyan-500 px-3 text-slate-950 disabled:opacity-50"><Send className="h-4 w-4" /></button></form>
          </> : <p className="p-8 text-sm text-slate-500">Select a conversation to begin.</p>}
          {error && <p className="px-4 pb-4 text-sm text-red-500">{error}</p>}
        </div>
      </div>
    </section>
  )
}