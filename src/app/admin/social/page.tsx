"use client";

import { useState, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Send, Plus, ExternalLink, Loader2, CheckCircle2,
  AlertCircle, RefreshCw, MessageSquare, X, Image, Copy, Check, Hash
} from "lucide-react";
import { toast } from "sonner";

interface TeamMember { id: string; name: string; role: string; }
interface SocialReply { id: string; content: string; status: string; authorName: string; publishedAt: string | null; errorMsg: string | null; }
interface SocialPost {
  id: string; platform: string; content: string; title: string | null;
  link: string | null; boardName: string | null; imageUrl: string | null;
  subreddit: string | null; status: string; authorName: string; externalUrl: string | null;
  errorMsg: string | null; publishedAt: string | null; createdAt: string;
  replies: SocialReply[];
}
interface Board { id: string; name: string; }

const PLATFORM_META: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  X: { label: "X (Twitter)", color: "bg-black border-white/20 text-white", icon: <X className="h-3.5 w-3.5" /> },
  PINTEREST: { label: "Pinterest", color: "bg-red-600/20 border-red-500/30 text-red-300", icon: <Image className="h-3.5 w-3.5" /> },
  REDDIT: { label: "Reddit", color: "bg-orange-600/20 border-orange-500/30 text-orange-300", icon: <Hash className="h-3.5 w-3.5" /> },
};

const STATUS_META: Record<string, { label: string; color: string }> = {
  DRAFT: { label: "Draft", color: "bg-gray-500/20 text-gray-400 border-gray-500/20" },
  PUBLISHED: { label: "Published", color: "bg-green-500/20 text-green-400 border-green-500/20" },
  FAILED: { label: "Failed", color: "bg-red-500/20 text-red-400 border-red-500/20" },
};

export default function SocialPage() {
  const [tab, setTab] = useState<"compose" | "replies">("compose");
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  // Compose form
  const [platform, setPlatform] = useState("X");
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");
  const [boardId, setBoardId] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [authorId, setAuthorId] = useState("");
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  // Reply form
  const [subreddit, setSubreddit] = useState("");
  const [replyContent, setReplyContent] = useState("");
  const [replyAuthorId, setReplyAuthorId] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [postsRes, membersRes] = await Promise.all([
      fetch("/api/admin/social/posts"),
      fetch("/api/admin/team"),
    ]);
    if (postsRes.ok) setPosts(await postsRes.json());
    if (membersRes.ok) {
      const m = await membersRes.json();
      setMembers(m);
      // Default author = Noah (Growth Strategist)
      const noah = m.find((x: TeamMember) => x.role.toLowerCase().includes("growth"));
      if (noah) setAuthorId(noah.id);
      const cm = m.find((x: TeamMember) => x.role.toLowerCase().includes("community"));
      if (cm) setReplyAuthorId(cm.id);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    if (platform === "PINTEREST" && boards.length === 0) {
      fetch("/api/admin/social/boards")
        .then((r) => r.ok ? r.json() : [])
        .then((b) => { setBoards(b); if (b.length > 0) setBoardId(b[0].id); })
        .catch(() => { toast.error("Could not load Pinterest boards"); });
    }
  }, [platform, boards.length]);

  async function handleSaveDraft() {
    if (!content.trim() || !authorId) return;
    setSaving(true);
    const res = await fetch("/api/admin/social/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        platform, content, title: title || null, link: link || null,
        boardId: boardId || null,
        boardName: boards.find(b => b.id === boardId)?.name || null,
        imageUrl: imageUrl || null,
        subreddit: subreddit || null,
        authorId,
      }),
    });
    if (res.ok) {
      const post = await res.json();
      setPosts((p) => [post, ...p]);
      setContent(""); setTitle(""); setLink(""); setImageUrl("");
      toast.success("Draft saved!");
    } else {
      toast.error("Failed to save draft.");
    }
    setSaving(false);
  }

  async function handlePublish(postId: string) {
    setPublishing(postId);
    const res = await fetch(`/api/admin/social/posts/${postId}/publish`, { method: "POST" });
    if (res.ok) {
      const updated = await res.json();
      setPosts((p) => p.map((x) => x.id === postId ? updated : x));
      toast.success("Published!");
    } else {
      const err = await res.json();
      toast.error(err.error || "Failed to publish.");
      setPosts((p) => p.map((x) => x.id === postId ? { ...x, status: "FAILED", errorMsg: err.error } : x));
    }
    setPublishing(null);
  }

  function handleCopy(postId: string, text: string) {
    navigator.clipboard.writeText(text);
    setCopied(postId);
    setTimeout(() => setCopied(null), 2000);
    toast.success("Copied to clipboard!");
  }

  async function handleMarkPosted(postId: string) {
    setPublishing(postId);
    const res = await fetch(`/api/admin/social/posts/${postId}/mark-posted`, { method: "POST" });
    if (res.ok) {
      const updated = await res.json();
      setPosts((p) => p.map((x) => x.id === postId ? updated : x));
      toast.success("Marked as posted!");
    } else {
      toast.error("Failed to update.");
    }
    setPublishing(null);
  }

  async function handleSendReply(postId: string) {
    if (!replyContent.trim() || !replyAuthorId) return;
    setSendingReply(true);
    const res = await fetch("/api/admin/social/replies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId, content: replyContent, authorId: replyAuthorId }),
    });
    if (res.ok) {
      const reply = await res.json();
      setPosts((p) => p.map((x) => x.id === postId ? { ...x, replies: [...x.replies, reply] } : x));
      setReplyContent(""); setReplyingTo(null);
      toast.success("Reply saved as draft!");
    } else {
      toast.error("Failed to save reply.");
    }
    setSendingReply(false);
  }

  async function handlePublishReply(replyId: string, postId: string) {
    setPublishing(replyId);
    const res = await fetch(`/api/admin/social/replies/${replyId}/publish`, { method: "POST" });
    if (res.ok) {
      const updated = await res.json();
      setPosts((p) => p.map((post) =>
        post.id === postId
          ? { ...post, replies: post.replies.map((r) => r.id === replyId ? updated : r) }
          : post
      ));
      toast.success("Reply published!");
    } else {
      toast.error("Failed to publish reply.");
    }
    setPublishing(null);
  }

  const growthMembers = members.filter((m) => m.role.toLowerCase().includes("growth"));
  const communityMembers = members.filter((m) => m.role.toLowerCase().includes("community"));
  const publishedPosts = posts.filter((p) => p.status === "PUBLISHED");
  const charLimit = platform === "X" ? 280 : 500;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Social Media</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage posts and replies across X and Pinterest</p>
        </div>
        <div className="flex items-center gap-2">
          <a href="/api/admin/social/pinterest/connect">
            <Button size="sm" variant="ghost" className="border border-red-500/20 text-red-400 hover:bg-red-500/10 text-xs">
              <Image className="mr-1.5 h-3.5 w-3.5" /> Connect Pinterest
            </Button>
          </a>
          <Button size="sm" variant="ghost" className="border border-white/10 text-gray-400" onClick={fetchData}>
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl border border-white/[0.06] bg-white/[0.02] p-1 w-fit">
        {[{ id: "compose", label: "Compose", sub: "Noah" }, { id: "replies", label: "Reply Queue", sub: "Leo & Selma" }].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as "compose" | "replies")}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              tab === t.id ? "bg-purple-600 text-white" : "text-gray-500 hover:text-white"
            }`}
          >
            {t.label}
            <span className={`text-[10px] rounded-full px-1.5 py-0.5 ${tab === t.id ? "bg-white/20" : "bg-white/[0.05]"}`}>
              {t.sub}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
        </div>
      ) : (
        <>
          {/* Compose Tab */}
          {tab === "compose" && (
            <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
              {/* Compose form */}
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 space-y-4 h-fit">
                <h2 className="font-semibold text-white flex items-center gap-2">
                  <Plus className="h-4 w-4 text-purple-400" /> New Post
                </h2>

                {/* Platform */}
                <div>
                  <Label className="text-xs text-gray-500 mb-2 block">Platform</Label>
                  <div className="flex flex-wrap gap-2">
                    {["X", "PINTEREST", "REDDIT"].map((p) => (
                      <button
                        key={p}
                        onClick={() => setPlatform(p)}
                        className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-all ${
                          platform === p
                            ? "border-purple-500/50 bg-purple-600/20 text-white"
                            : "border-white/10 text-gray-500 hover:border-white/20 hover:text-gray-300"
                        }`}
                      >
                        {PLATFORM_META[p].icon} {PLATFORM_META[p].label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Author */}
                <div>
                  <Label className="text-xs text-gray-500 mb-1.5 block">Posted by</Label>
                  <select
                    value={authorId}
                    onChange={(e) => setAuthorId(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white"
                  >
                    {growthMembers.length === 0
                      ? members.map((m) => <option key={m.id} value={m.id}>{m.name} — {m.role}</option>)
                      : growthMembers.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)
                    }
                  </select>
                </div>

                {/* X manual posting note */}
                {platform === "X" && (
                  <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 px-3 py-2 text-xs text-blue-300">
                    X-inlägg postas manuellt — spara utkastet, kopiera texten och posta på X.
                  </div>
                )}

                {/* Reddit fields + note */}
                {platform === "REDDIT" && (
                  <>
                    <div className="rounded-lg bg-orange-500/10 border border-orange-500/20 px-3 py-2 text-xs text-orange-300">
                      Reddit-inlägg postas manuellt — spara utkastet, kopiera texten och posta i subredditen.
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500 mb-1.5 block">Subreddit</Label>
                      <div className="flex items-center gap-1">
                        <span className="text-gray-500 text-sm">r/</span>
                        <Input value={subreddit} onChange={(e) => setSubreddit(e.target.value)} placeholder="webdesign" className="border-white/10 bg-white/[0.03] text-white text-sm" />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500 mb-1.5 block">Title</Label>
                      <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Post title..." className="border-white/10 bg-white/[0.03] text-white text-sm" />
                    </div>
                  </>
                )}

                {/* Pinterest fields */}
                {platform === "PINTEREST" && (
                  <>
                    <div>
                      <Label className="text-xs text-gray-500 mb-1.5 block">Title</Label>
                      <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Pin title..." className="border-white/10 bg-white/[0.03] text-white text-sm" />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500 mb-1.5 block">Board</Label>
                      <select value={boardId} onChange={(e) => setBoardId(e.target.value)} className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white">
                        {boards.length === 0
                          ? <option value="">No boards — connect Pinterest first</option>
                          : boards.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)
                        }
                      </select>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500 mb-1.5 block">Destination link (optional)</Label>
                      <Input value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://..." type="url" className="border-white/10 bg-white/[0.03] text-white text-sm" />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500 mb-1.5 block">Image URL (optional)</Label>
                      <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." type="url" className="border-white/10 bg-white/[0.03] text-white text-sm" />
                    </div>
                  </>
                )}

                {/* Content */}
                <div>
                  <Label className="text-xs text-gray-500 mb-1.5 block">
                    {platform === "PINTEREST" ? "Description" : "Post content"}
                  </Label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder={platform === "X" ? "What's happening?" : "Describe your pin..."}
                    rows={4}
                    className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white placeholder:text-gray-600 resize-none focus:outline-none focus:border-purple-500/50"
                  />
                  <div className={`text-right text-[11px] mt-1 ${content.length > charLimit ? "text-red-400" : "text-gray-600"}`}>
                    {content.length}/{charLimit}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleSaveDraft} disabled={saving || !content.trim() || !authorId || content.length > charLimit} className="flex-1 bg-white/[0.05] text-white hover:bg-white/10 border border-white/10" size="sm">
                    {saving ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <Plus className="mr-2 h-3.5 w-3.5" />}
                    Save draft
                  </Button>
                </div>
              </div>

              {/* Posts list */}
              <div className="space-y-3">
                <h2 className="font-semibold text-white text-sm">All Posts</h2>
                {posts.length === 0 ? (
                  <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-10 text-center text-sm text-gray-600">
                    No posts yet. Compose your first one.
                  </div>
                ) : (
                  posts.map((post) => (
                    <div key={post.id} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className={`text-[10px] border ${PLATFORM_META[post.platform]?.color ?? "bg-gray-500/20 text-gray-400"}`}>
                            {PLATFORM_META[post.platform]?.icon}
                            <span className="ml-1">{PLATFORM_META[post.platform]?.label ?? post.platform}</span>
                          </Badge>
                          <Badge className={`text-[10px] border ${STATUS_META[post.status]?.color ?? ""}`}>
                            {post.status === "PUBLISHED" && <CheckCircle2 className="mr-1 h-3 w-3" />}
                            {post.status === "FAILED" && <AlertCircle className="mr-1 h-3 w-3" />}
                            {STATUS_META[post.status]?.label ?? post.status}
                          </Badge>
                          <span className="text-[11px] text-gray-600">by {post.authorName}</span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {post.externalUrl && (
                            <a href={post.externalUrl} target="_blank" rel="noopener noreferrer">
                              <Button size="sm" variant="ghost" className="h-7 px-2 text-gray-500 hover:text-white text-xs">
                                <ExternalLink className="h-3.5 w-3.5" />
                              </Button>
                            </a>
                          )}
                          {(post.platform === "X" || post.platform === "REDDIT") ? (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleCopy(post.id, post.content)}
                                className="h-7 bg-white/[0.06] text-white hover:bg-white/10 border border-white/10 text-xs px-3"
                              >
                                {copied === post.id ? <Check className="h-3 w-3 mr-1 text-green-400" /> : <Copy className="h-3 w-3 mr-1" />}
                                {copied === post.id ? "Copied!" : "Copy"}
                              </Button>
                              {post.status !== "PUBLISHED" && (
                                <Button
                                  size="sm"
                                  onClick={() => handleMarkPosted(post.id)}
                                  disabled={publishing === post.id}
                                  className="h-7 bg-green-600/20 text-green-400 hover:bg-green-600/30 border border-green-500/20 text-xs px-3"
                                >
                                  {publishing === post.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3 w-3 mr-1" />}
                                  Mark posted
                                </Button>
                              )}
                            </>
                          ) : (
                            post.status !== "PUBLISHED" && (
                              <Button
                                size="sm"
                                onClick={() => handlePublish(post.id)}
                                disabled={publishing === post.id}
                                className="h-7 bg-purple-600 text-white hover:bg-purple-700 text-xs px-3"
                              >
                                {publishing === post.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3 mr-1" />}
                                {publishing === post.id ? "Publishing..." : "Publish"}
                              </Button>
                            )
                          )}
                        </div>
                      </div>

                      {post.platform === "REDDIT" && post.subreddit && (
                        <p className="text-[11px] text-orange-400">r/{post.subreddit}</p>
                      )}
                      {post.title && <p className="text-sm font-medium text-white">{post.title}</p>}
                      <p className="text-sm text-gray-300 whitespace-pre-wrap">{post.content}</p>

                      {post.errorMsg && (
                        <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2 text-xs text-red-400">
                          {post.errorMsg}
                        </div>
                      )}

                      {post.replies.length > 0 && (
                        <div className="border-t border-white/[0.06] pt-3 space-y-2">
                          <p className="text-[11px] text-gray-600 uppercase tracking-wider">Replies ({post.replies.length})</p>
                          {post.replies.map((reply) => (
                            <div key={reply.id} className="flex items-start gap-3 rounded-lg bg-white/[0.02] border border-white/[0.04] p-3">
                              <div className="flex-1 text-sm text-gray-300">{reply.content}</div>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className="text-[10px] text-gray-600">{reply.authorName}</span>
                                <Badge className={`text-[10px] border ${STATUS_META[reply.status]?.color ?? ""}`}>
                                  {STATUS_META[reply.status]?.label ?? reply.status}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Reply Queue Tab */}
          {tab === "replies" && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <h2 className="font-semibold text-white text-sm">Published Posts</h2>
                <Badge className="bg-white/[0.05] text-gray-400 border-white/10 text-xs">{publishedPosts.length} posts</Badge>
                <div className="ml-auto">
                  <Label className="text-xs text-gray-500 mr-2">Replying as</Label>
                  <select
                    value={replyAuthorId}
                    onChange={(e) => setReplyAuthorId(e.target.value)}
                    className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-sm text-white"
                  >
                    {communityMembers.length === 0
                      ? members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)
                      : communityMembers.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)
                    }
                  </select>
                </div>
              </div>

              {publishedPosts.length === 0 ? (
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-10 text-center text-sm text-gray-600">
                  No published posts yet. Publish a post first.
                </div>
              ) : (
                publishedPosts.map((post) => (
                  <div key={post.id} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <Badge className={`text-[10px] border ${PLATFORM_META[post.platform]?.color ?? ""}`}>
                          {PLATFORM_META[post.platform]?.icon}
                          <span className="ml-1">{PLATFORM_META[post.platform]?.label ?? post.platform}</span>
                        </Badge>
                        <span className="text-[11px] text-gray-600">
                          Posted by {post.authorName} · {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : ""}
                        </span>
                      </div>
                      {post.externalUrl && (
                        <a href={post.externalUrl} target="_blank" rel="noopener noreferrer" className="text-[11px] text-purple-400 hover:text-purple-300 flex items-center gap-1">
                          View on {post.platform === "X" ? "X" : "Pinterest"} <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>

                    {post.title && <p className="font-medium text-white text-sm">{post.title}</p>}
                    <p className="text-sm text-gray-300 whitespace-pre-wrap">{post.content}</p>

                    {/* Existing replies */}
                    {post.replies.length > 0 && (
                      <div className="space-y-2 border-t border-white/[0.06] pt-3">
                        <p className="text-[11px] text-gray-600 uppercase tracking-wider">Replies</p>
                        {post.replies.map((reply) => (
                          <div key={reply.id} className="flex items-center gap-3 rounded-lg bg-white/[0.02] border border-white/[0.04] p-3">
                            <div className="flex-1 text-sm text-gray-300">{reply.content}</div>
                            <span className="text-[10px] text-gray-600 shrink-0">{reply.authorName}</span>
                            <Badge className={`text-[10px] border shrink-0 ${STATUS_META[reply.status]?.color ?? ""}`}>
                              {STATUS_META[reply.status]?.label ?? reply.status}
                            </Badge>
                            {reply.status === "DRAFT" && (
                              <Button
                                size="sm"
                                onClick={() => handlePublishReply(reply.id, post.id)}
                                disabled={publishing === reply.id}
                                className="h-6 bg-purple-600 text-white hover:bg-purple-700 text-[10px] px-2 shrink-0"
                              >
                                {publishing === reply.id ? <Loader2 className="h-3 w-3 animate-spin" /> : "Publish"}
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Reply form */}
                    {replyingTo === post.id ? (
                      <div className="border-t border-white/[0.06] pt-3 space-y-2">
                        <textarea
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          placeholder="Write a reply..."
                          rows={2}
                          className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white placeholder:text-gray-600 resize-none focus:outline-none focus:border-purple-500/50"
                        />
                        <div className="flex gap-2">
                          <Button onClick={() => handleSendReply(post.id)} disabled={sendingReply || !replyContent.trim()} size="sm" className="bg-purple-600 text-white hover:bg-purple-700">
                            {sendingReply ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <MessageSquare className="mr-1.5 h-3.5 w-3.5" />}
                            Save reply
                          </Button>
                          <Button onClick={() => { setReplyingTo(null); setReplyContent(""); }} size="sm" variant="ghost" className="border border-white/10 text-gray-400">
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        onClick={() => { setReplyingTo(post.id); setReplyContent(""); }}
                        size="sm"
                        variant="ghost"
                        className="border border-white/10 text-gray-400 hover:text-white text-xs"
                      >
                        <MessageSquare className="mr-1.5 h-3.5 w-3.5" /> Write reply
                      </Button>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
