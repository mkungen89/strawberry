"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, Edit2, Check, X, Eye, EyeOff, Loader2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Testimonial {
  id: string;
  name: string;
  handle: string | null;
  service: string;
  stars: number;
  text: string;
  published: boolean;
  sortOrder: number;
  createdAt: string;
}

const EMPTY_FORM = { name: "", handle: "", service: "", stars: 5, text: "", published: true, sortOrder: 0 };

export default function TestimonialsPage() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editForm, setEditForm] = useState<Partial<Testimonial>>({});

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/testimonials");
      if (!res.ok) throw new Error();
      setItems(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function handleCreate() {
    if (!form.name.trim() || !form.service.trim() || !form.text.trim()) {
      toast.error("Name, service and text are required");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, handle: form.handle || null }),
      });
      if (!res.ok) throw new Error();
      toast.success("Testimonial added");
      setForm(EMPTY_FORM);
      setShowAdd(false);
      fetchData();
    } catch {
      toast.error("Failed to create");
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveEdit(id: string) {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/testimonials/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...editForm, handle: editForm.handle || null }),
      });
      if (!res.ok) throw new Error();
      toast.success("Updated");
      setEditingId(null);
      fetchData();
    } catch {
      toast.error("Update failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(id: string, published: boolean) {
    try {
      const res = await fetch(`/api/admin/testimonials/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published }),
      });
      if (!res.ok) throw new Error();
      setItems((prev) => prev.map((t) => t.id === id ? { ...t, published } : t));
    } catch {
      toast.error("Update failed");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this testimonial?")) return;
    try {
      const res = await fetch(`/api/admin/testimonials/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Deleted");
      setItems((prev) => prev.filter((t) => t.id !== id));
    } catch {
      toast.error("Delete failed");
    }
  }

  const StarSelector = ({ value, onChange }: { value: number; onChange: (n: number) => void }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" onClick={() => onChange(n)}>
          <Star className={`h-5 w-5 transition-colors ${n <= value ? "fill-yellow-400 text-yellow-400" : "text-gray-600 hover:text-yellow-400"}`} />
        </button>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-black p-6 lg:p-8">
      <div className="mx-auto max-w-4xl space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Testimonials</h1>
            <p className="mt-1 text-sm text-gray-500">Curated quotes shown on the portfolio page.</p>
          </div>
          <Button onClick={() => setShowAdd((v) => !v)} className="bg-purple-600 text-white hover:bg-purple-700">
            <Plus className="mr-2 h-4 w-4" /> Add testimonial
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-br from-purple-500/10 to-purple-600/5 p-4">
            <p className="text-2xl font-bold text-white">{items.length}</p>
            <p className="text-xs text-gray-500 mt-0.5">Total testimonials</p>
          </div>
          <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-br from-green-500/10 to-green-600/5 p-4">
            <p className="text-2xl font-bold text-white">{items.filter((t) => t.published).length}</p>
            <p className="text-xs text-gray-500 mt-0.5">Published</p>
          </div>
        </div>

        {/* Add form */}
        {showAdd && (
          <div className="rounded-2xl border border-purple-500/20 bg-white/[0.02] p-6 space-y-4">
            <h2 className="text-sm font-semibold text-white">New testimonial</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-gray-400">Name *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Marcus L." className="border-white/20 bg-white/5 text-white placeholder:text-gray-600" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-gray-400">Handle (optional)</Label>
                <Input value={form.handle} onChange={(e) => setForm({ ...form, handle: e.target.value })}
                  placeholder="@marcusgaming" className="border-white/20 bg-white/5 text-white placeholder:text-gray-600" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-gray-400">Service *</Label>
                <Input value={form.service} onChange={(e) => setForm({ ...form, service: e.target.value })}
                  placeholder="Discord Server" className="border-white/20 bg-white/5 text-white placeholder:text-gray-600" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-gray-400">Rating</Label>
                <StarSelector value={form.stars} onChange={(n) => setForm({ ...form, stars: n })} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-gray-400">Quote *</Label>
              <Textarea value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })}
                placeholder="What they said about the service..." rows={3}
                className="border-white/20 bg-white/5 text-white placeholder:text-gray-600" />
            </div>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} className="accent-purple-500" />
                <span className="text-sm text-gray-300">Published</span>
              </label>
            </div>
            <div className="flex gap-3 pt-1">
              <Button onClick={handleCreate} disabled={saving} className="bg-purple-600 text-white hover:bg-purple-700">
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                Add
              </Button>
              <Button variant="ghost" onClick={() => { setShowAdd(false); setForm(EMPTY_FORM); }}
                className="border border-white/10 text-gray-400 hover:text-white">
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* List */}
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-purple-400" /></div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-white/[0.06] p-12 text-center text-sm text-gray-600">
            No testimonials yet.
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((t) => (
              <div key={t.id} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
                {editingId === t.id ? (
                  <div className="p-5 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs text-gray-400">Name</Label>
                        <Input value={editForm.name ?? ""} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          className="border-white/20 bg-white/5 text-white" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs text-gray-400">Handle</Label>
                        <Input value={editForm.handle ?? ""} onChange={(e) => setEditForm({ ...editForm, handle: e.target.value })}
                          className="border-white/20 bg-white/5 text-white" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs text-gray-400">Service</Label>
                        <Input value={editForm.service ?? ""} onChange={(e) => setEditForm({ ...editForm, service: e.target.value })}
                          className="border-white/20 bg-white/5 text-white" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs text-gray-400">Rating</Label>
                        <StarSelector value={editForm.stars ?? 5} onChange={(n) => setEditForm({ ...editForm, stars: n })} />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-gray-400">Quote</Label>
                      <Textarea value={editForm.text ?? ""} onChange={(e) => setEditForm({ ...editForm, text: e.target.value })}
                        rows={3} className="border-white/20 bg-white/5 text-white" />
                    </div>
                    <div className="flex gap-3">
                      <Button onClick={() => handleSaveEdit(t.id)} disabled={saving} className="bg-purple-600 text-white hover:bg-purple-700">
                        {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />} Save
                      </Button>
                      <Button variant="ghost" onClick={() => setEditingId(null)} className="border border-white/10 text-gray-400 hover:text-white">
                        <X className="mr-2 h-4 w-4" /> Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-4 p-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <div className="flex gap-0.5">
                          {Array.from({ length: t.stars }).map((_, i) => (
                            <Star key={i} className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                        <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/20 text-xs">{t.service}</Badge>
                        {!t.published && <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/20 text-xs">Hidden</Badge>}
                      </div>
                      <p className="text-sm text-gray-300 leading-relaxed mb-2">&ldquo;{t.text}&rdquo;</p>
                      <p className="text-xs font-medium text-white">{t.name}{t.handle && <span className="text-gray-500 font-normal ml-1">{t.handle}</span>}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => handleToggle(t.id, !t.published)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-white/10 hover:text-white transition-all">
                        {t.published ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </button>
                      <button onClick={() => { setEditingId(t.id); setEditForm({ ...t }); }}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-white/10 hover:text-white transition-all">
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(t.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-red-500/20 hover:text-red-400 transition-all">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
