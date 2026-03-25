'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  CheckCircle2,
  XCircle,
  Clock,
  Bug,
  ChevronDown,
  ChevronUp,
  Plus,
  X,
  RefreshCw,
  ShieldCheck,
  User,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface TaskUpdate {
  id: string
  content: string
  authorName: string
  createdAt: string
  updateType: string
  bugsFound: string[]
}

interface Task {
  id: string
  title: string
  description: string | null
  status: string
  priority: string
  progress: number
  dueDate: string | null
  assigneeName: string | null
  qaStatus: string | null
  submittedForReviewAt: string | null
  reviewedBy: string | null
  approvedAt: string | null
  rejectedAt: string | null
  project: { id: string; title: string; color: string } | null
  assignee: { id: string; name: string; role: string } | null
  updates: TaskUpdate[]
}

function formatRelative(iso: string | null): string {
  if (!iso) return '—'
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

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('sv-SE', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function PriorityBadge({ priority }: { priority: string }) {
  const isHigh = priority === 'URGENT' || priority === 'HIGH'
  return (
    <Badge
      className={
        isHigh
          ? 'bg-red-600/20 text-red-400 border border-red-600/30 text-[10px] font-semibold'
          : 'bg-zinc-800/60 text-zinc-400 border border-zinc-700/50 text-[10px] font-semibold'
      }
    >
      {priority}
    </Badge>
  )
}

function TaskSkeleton() {
  return (
    <Card className="bg-[#111111] border-zinc-800 animate-pulse">
      <CardContent className="p-5 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2 flex-1">
            <div className="h-4 w-2/3 bg-zinc-800 rounded" />
            <div className="h-3 w-full bg-zinc-800/60 rounded" />
            <div className="h-3 w-1/2 bg-zinc-800/60 rounded" />
          </div>
          <div className="h-5 w-16 bg-zinc-800 rounded-full" />
        </div>
        <div className="flex gap-2 pt-1">
          <div className="h-6 w-24 bg-zinc-800 rounded-full" />
          <div className="h-6 w-20 bg-zinc-800 rounded-full" />
        </div>
        <div className="flex gap-2 pt-2 border-t border-zinc-800">
          <div className="h-8 w-28 bg-zinc-800 rounded-xl" />
          <div className="h-8 w-24 bg-zinc-800 rounded-xl" />
          <div className="h-8 w-28 bg-zinc-800 rounded-xl ml-auto" />
        </div>
      </CardContent>
    </Card>
  )
}

interface ApproveDialogProps {
  open: boolean
  taskTitle: string
  onClose: () => void
  onConfirm: (note: string) => Promise<void>
}

function ApproveDialog({ open, taskTitle, onClose, onConfirm }: ApproveDialogProps) {
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    setLoading(true)
    try {
      await onConfirm(note)
      setNote('')
    } finally {
      setLoading(false)
    }
  }

  function handleClose() {
    if (loading) return
    setNote('')
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="bg-[#0f0f11] border-white/[0.08] text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-green-400">
            <CheckCircle2 className="w-5 h-5" />
            Approve Task
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5">
            <p className="text-sm font-medium text-white truncate">{taskTitle}</p>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-zinc-400">
              Approver note <span className="text-zinc-600">(optional)</span>
            </Label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Great work! All checks passed..."
              rows={3}
              className="bg-white/[0.03] border-white/[0.08] text-white placeholder:text-zinc-600 resize-none focus:border-green-500/40 focus:ring-green-500/20"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 pt-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={loading}
            className="border-white/[0.08] text-zinc-400 hover:text-white hover:bg-white/[0.05]"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-green-600/20 hover:bg-green-600/30 border border-green-500/30 text-green-300"
          >
            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />}
            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
            Approve Task
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface RejectDialogProps {
  open: boolean
  taskTitle: string
  onClose: () => void
  onConfirm: (bugs: string[], notes: string) => Promise<void>
}

function RejectDialog({ open, taskTitle, onClose, onConfirm }: RejectDialogProps) {
  const [bugs, setBugs] = useState<string[]>([''])
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [bugError, setBugError] = useState('')

  function addBug() {
    setBugs((prev) => [...prev, ''])
  }

  function removeBug(i: number) {
    setBugs((prev) => prev.filter((_, idx) => idx !== i))
  }

  function updateBug(i: number, val: string) {
    setBugError('')
    setBugs((prev) => prev.map((b, idx) => (idx === i ? val : b)))
  }

  async function handleSubmit() {
    const validBugs = bugs.map((b) => b.trim()).filter(Boolean)
    if (validBugs.length === 0) {
      setBugError('At least one bug description is required.')
      return
    }
    setBugError('')
    setLoading(true)
    try {
      await onConfirm(validBugs, notes)
      setBugs([''])
      setNotes('')
    } finally {
      setLoading(false)
    }
  }

  function handleClose() {
    if (loading) return
    setBugs([''])
    setNotes('')
    setBugError('')
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="bg-[#0f0f11] border-white/[0.08] text-white max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-400">
            <XCircle className="w-5 h-5" />
            Reject Task
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5">
            <p className="text-sm font-medium text-white truncate">{taskTitle}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium text-zinc-400">
                Bugs Found <span className="text-red-400">*</span>
              </Label>
              <button
                type="button"
                onClick={addBug}
                className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 transition-colors"
              >
                <Plus className="w-3 h-3" />
                Add bug
              </button>
            </div>
            <div className="space-y-2">
              {bugs.map((bug, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-500/20 text-[10px] font-bold text-red-400">
                    {i + 1}
                  </div>
                  <Input
                    value={bug}
                    onChange={(e) => updateBug(i, e.target.value)}
                    placeholder={`Bug description #${i + 1}`}
                    className="bg-white/[0.03] border-white/[0.08] text-white placeholder:text-zinc-600 focus:border-red-500/40"
                  />
                  {bugs.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeBug(i)}
                      className="text-zinc-600 hover:text-red-400 transition-colors shrink-0"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {bugError && <p className="text-xs text-red-400">{bugError}</p>}
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-zinc-400">
              General notes <span className="text-zinc-600">(optional)</span>
            </Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional context or suggestions for the developer..."
              rows={3}
              className="bg-white/[0.03] border-white/[0.08] text-white placeholder:text-zinc-600 resize-none focus:border-red-500/40"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 pt-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={loading}
            className="border-white/[0.08] text-zinc-400 hover:text-white hover:bg-white/[0.05]"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-300"
          >
            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />}
            <XCircle className="w-3.5 h-3.5 mr-1.5" />
            Reject Task
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface TaskCardProps {
  task: Task
  onApproved: (id: string) => void
  onRejected: (id: string) => void
}

function TaskCard({ task, onApproved, onRejected }: TaskCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [history, setHistory] = useState<TaskUpdate[] | null>(null)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [approveOpen, setApproveOpen] = useState(false)
  const [rejectOpen, setRejectOpen] = useState(false)

  const devNote = [...task.updates]
    .reverse()
    .find((u) => u.updateType === 'QA_SUBMITTED')

  async function handleToggleExpand() {
    if (!expanded && history === null) {
      setHistoryLoading(true)
      try {
        const res = await fetch(`/api/admin/tasks/${task.id}/updates`)
        if (res.ok) setHistory(await res.json())
        else toast.error('Failed to load history')
      } catch {
        toast.error('Failed to load history')
      } finally {
        setHistoryLoading(false)
      }
    }
    setExpanded((prev) => !prev)
  }

  async function handleApprove(note: string) {
    const res = await fetch(`/api/admin/tasks/${task.id}/approve`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approverNote: note || undefined }),
    })
    if (!res.ok) {
      toast.error('Failed to approve task')
      throw new Error('approve failed')
    }
    toast.success(`Task approved: ${task.title}`)
    setApproveOpen(false)
    onApproved(task.id)
  }

  async function handleReject(bugs: string[], notes: string) {
    const res = await fetch(`/api/admin/tasks/${task.id}/reject`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bugsFound: bugs, notes: notes || undefined }),
    })
    if (!res.ok) {
      toast.error('Failed to reject task')
      throw new Error('reject failed')
    }
    toast.error(`Task rejected: ${task.title}`, {
      description: `${bugs.length} bug${bugs.length !== 1 ? 's' : ''} reported`,
    })
    setRejectOpen(false)
    onRejected(task.id)
  }

  const isUrgent = task.priority === 'URGENT' || task.priority === 'HIGH'
  const displayUpdates = history ?? task.updates

  return (
    <>
      <Card
        className={`border transition-colors ${
          isUrgent
            ? 'bg-red-500/[0.02] border-red-500/20 hover:border-red-500/30'
            : 'bg-[#111111] border-zinc-800 hover:border-zinc-700'
        }`}
      >
        <CardContent className="p-5">
          {/* Title row */}
          <div className="flex items-start gap-3 mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-white text-sm leading-snug mb-1 truncate">
                {task.title}
              </h3>
              {task.description && (
                <p className="text-xs text-zinc-500 leading-relaxed line-clamp-2">
                  {task.description}
                </p>
              )}
            </div>
            <PriorityBadge priority={task.priority} />
          </div>

          {/* Meta badges */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {task.project && (
              <span
                className="text-[10px] font-medium px-2 py-0.5 rounded-full border"
                style={{
                  color: task.project.color,
                  borderColor: `${task.project.color}30`,
                  backgroundColor: `${task.project.color}15`,
                }}
              >
                {task.project.title}
              </span>
            )}
            {task.assignee && (
              <span className="flex items-center gap-1 text-[10px] text-zinc-500">
                <User className="w-3 h-3" />
                {task.assignee.name}
                <span className="text-zinc-700">·</span>
                <span className="text-zinc-600">{task.assignee.role}</span>
              </span>
            )}
            {task.submittedForReviewAt && (
              <span className="flex items-center gap-1 text-[10px] text-zinc-600 ml-auto">
                <Clock className="w-3 h-3" />
                Submitted {formatRelative(task.submittedForReviewAt)}
                <span className="text-zinc-700">·</span>
                {formatDateTime(task.submittedForReviewAt)}
              </span>
            )}
          </div>

          {/* Developer note */}
          {devNote && (
            <div className="rounded-xl border border-blue-500/10 bg-blue-500/[0.04] px-3 py-2.5 mb-3">
              <p className="text-[10px] font-semibold text-blue-400 uppercase tracking-wide mb-1">
                Developer Note
              </p>
              <p className="text-xs text-zinc-300 leading-relaxed">{devNote.content}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-zinc-800/60">
            <Button
              size="sm"
              onClick={() => setApproveOpen(true)}
              className="bg-green-600/15 hover:bg-green-600/25 border border-green-500/25 text-green-300 text-xs font-semibold h-8 px-3"
            >
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
              Approve
            </Button>
            <Button
              size="sm"
              onClick={() => setRejectOpen(true)}
              className="bg-red-600/15 hover:bg-red-600/25 border border-red-500/25 text-red-300 text-xs font-semibold h-8 px-3"
            >
              <XCircle className="w-3.5 h-3.5 mr-1" />
              Reject
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleToggleExpand}
              disabled={historyLoading}
              className="ml-auto text-xs text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04] h-8 px-3"
            >
              {historyLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
              ) : expanded ? (
                <ChevronUp className="w-3.5 h-3.5 mr-1" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 mr-1" />
              )}
              History
            </Button>
          </div>

          {/* Expanded history */}
          {expanded && (
            <div className="mt-3 pt-3 border-t border-zinc-800/60">
              {historyLoading ? (
                <div className="flex items-center gap-2 text-xs text-zinc-600 py-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Loading history...
                </div>
              ) : displayUpdates.length === 0 ? (
                <p className="text-xs text-zinc-600 py-2 text-center">No updates found.</p>
              ) : (
                <div className="space-y-3">
                  {displayUpdates.map((u) => (
                    <div key={u.id} className="flex gap-3">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-purple-500/20 text-[9px] font-bold text-purple-400 mt-0.5">
                        {u.authorName.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                          <span className="text-xs font-semibold text-purple-400">
                            {u.authorName}
                          </span>
                          {u.updateType !== 'COMMENT' && (
                            <span className="text-[9px] font-medium text-zinc-600 bg-white/[0.04] border border-white/[0.04] rounded px-1.5 py-0.5">
                              {u.updateType}
                            </span>
                          )}
                          <span className="text-[10px] text-zinc-700 ml-auto">
                            {formatDateTime(u.createdAt)}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400 leading-relaxed">{u.content}</p>
                        {u.bugsFound && u.bugsFound.length > 0 && (
                          <div className="mt-1.5 space-y-0.5">
                            {u.bugsFound.map((bug, i) => (
                              <div key={i} className="flex items-start gap-1.5 text-xs text-red-400">
                                <Bug className="w-3 h-3 mt-0.5 shrink-0" />
                                {bug}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <ApproveDialog
        open={approveOpen}
        taskTitle={task.title}
        onClose={() => setApproveOpen(false)}
        onConfirm={handleApprove}
      />
      <RejectDialog
        open={rejectOpen}
        taskTitle={task.title}
        onClose={() => setRejectOpen(false)}
        onConfirm={handleReject}
      />
    </>
  )
}

export default function QAReviewPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [lastRefresh, setLastRefresh] = useState(new Date())

  const fetchTasks = useCallback(async (silent = false) => {
    if (silent) setRefreshing(true)
    else setLoading(true)
    try {
      const res = await fetch('/api/admin/tasks?status=REVIEW')
      if (!res.ok) throw new Error('Failed to fetch')
      setTasks(await res.json())
      setLastRefresh(new Date())
    } catch {
      if (!silent) toast.error('Failed to load review queue')
    } finally {
      if (silent) setRefreshing(false)
      else setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTasks()
    const interval = setInterval(() => fetchTasks(true), 30000)
    return () => clearInterval(interval)
  }, [fetchTasks])

  function removeTask(id: string) {
    setTasks((prev) => prev.filter((t) => t.id !== id))
  }

  const pending = tasks.filter((t) => t.qaStatus !== 'APPROVED' && t.qaStatus !== 'REJECTED')

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <ShieldCheck className="w-6 h-6 text-purple-400" />
              <h1 className="text-2xl font-bold text-white">QA Review</h1>
              {!loading && pending.length > 0 && (
                <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-purple-600/25 border border-purple-500/30 px-2 text-xs font-bold text-purple-300">
                  {pending.length}
                </span>
              )}
            </div>
            <p className="text-sm text-zinc-500">
              Code review queue · updated{' '}
              {lastRefresh.toLocaleTimeString('sv-SE', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchTasks(true)}
            disabled={refreshing || loading}
            className="border-white/[0.08] text-zinc-400 hover:text-white hover:bg-white/[0.05] shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <TaskSkeleton key={i} />
            ))}
          </div>
        ) : pending.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-500/60" />
            </div>
            <h3 className="text-base font-semibold text-zinc-300 mb-1">Queue is clear</h3>
            <p className="text-sm text-zinc-600 max-w-xs">
              No tasks are currently waiting for QA review. Great work!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {pending.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onApproved={removeTask}
                onRejected={removeTask}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
