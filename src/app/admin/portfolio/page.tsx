"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus, Trash2, Loader2, Edit2, Check, X, Eye, EyeOff, Star, StarOff, GripVertical, ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface PortfolioProject {
  id: string;
  title: string;
  service: string;
  category: string;
  description: string;
  imageUrl: string | null;
  gradient: string;
  featured: boolean;
  published: boolean;
  sortOrder: number;
  createdAt: string;
}

const CATEGORIES = ["Discord", "YouTube", "Streaming", "Website", "App", "Branding"];

const GRADIENTS = [
  { label: "Purple → Pink", value: "from-purple-600 via-pink-500 to-rose-500" },
  { label: "Blue → Purple", value: "from-blue-700 via-indigo-600 to-purple-700" },
  { label: "Red → Orange", value: "from-red-600 via-orange-500 to-yellow-400" },
  { label: "Pink → Orange", value: "from-pink-500 via-rose-500 to-orange-400" },
  { label: "Cyan → Green", value: "from-cyan-600 via-teal-500 to-green-500" },
  { label: "Violet → Fuchsia", value: "from-violet-600 via-purple-500 to-fuchsia-500" },
  { label: "Emerald → Cyan", value: "from-emerald-600 via-teal-600 to-cyan-500" },
  { label: "Slate → Zinc", value: "from-slate-600 via-gray-700 to-zinc-600" },
  { label: "Orange → Yellow", value: "from-orange-600 via-amber-500 to-yellow-400" },
  { label: "Purple → Indigo", value: "from-purple-700 via-violet-600 to-indigo-500" },
  { label: "Fuchsia → Blue", value: "from-fuchsia-600 via-purple-600 to-blue-600" },
  { label: "Sky → Indigo", value: "from-sky-600 via-blue-600 to-indigo-600" },
  { label: "Purple → Red", value: "from-purple-600 via-pink-500 to-red-500" },
  { label: "Amber → Red", value: "from-amber-500 via-orange-500 to-red-500" },
  { label: "Green → Teal", value: "from-green-600 via-emerald-500 to-teal-400" },
  { label: "Rose → Pink", value: "from-red-600 via-rose-500 to-pink-500" },
];

const EMPTY_FORM = {
  title: "",
  service: "",
  category: "Discord",
  description: "",
  imageUrl: "",
  gradient: GRADIENTS[0].value,
  featured: false,
  published: true,
  sortOrder: 0,
};

export default function PortfolioAdminPage() {
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState("All");

  const [form, setForm] = useState(EMPTY_FORM);
  const [editForm, setEditForm] = useState<Partial<PortfolioProject>>({});

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/portfolio");
      if (!res.ok) throw new Error();
      setProjects(await res.json());
    } catch {
      toast.error("Failed to load portfolio projects");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  async function handleCreate() {
    if (!form.title.trim() || !form.service.trim() || !form.description.trim()) {
      toast.error("Title, service and description are required");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, imageUrl: form.imageUrl || null }),
      });
      if (!res.ok) throw new Error();
      toast.success("Project added");
      setForm(EMPTY_FORM);
      setShowAdd(false);
      fetchProjects();
    } catch {
      toast.error("Failed to create project");
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate(id: string, data: Partial<PortfolioProject>) {
    try {
      const res = await fetch(`/api/admin/portfolio/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      fetchProjects();
    } catch {
      toast.error("Update failed");
    }
  }

  async function handleSaveEdit(id: string) {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/portfolio/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...editForm, imageUrl: editForm.imageUrl || null }),
      });
      if (!res.ok) throw new Error();
      toast.success("Project updated");
      setEditingId(null);
      fetchProjects();
    } catch {
      toast.error("Update failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this project?")) return;
    try {
      const res = await fetch(`/api/admin/portfolio/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Project deleted");
      fetchProjects();
    } catch {
      toast.error("Delete failed");
    }
  }

  const filtered = filterCategory === "All"
    ? projects
    : projects.filter((p) => p.category === filterCategory);

  const totalPublished = projects.filter((p) => p.published).length;
  const totalFeatured = projects.filter((p) => p.featured).length;

  return (
    <div className="min-h-screen bg-black p-6 lg:p-8">
      <div className="mx-auto max-w-5xl space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Portfolio</h1>
            <p className="mt-1 text-sm text-gray-500">Manage the projects shown on the public portfolio page.</p>
          </div>
          <Button
            onClick={() => setShowAdd((v) => !v)}
            className="bg-purple-600 text-white hover:bg-purple-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add project
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total projects", value: projects.length, color: "purple" },
            { label: "Published", value: totalPublished, color: "green" },
            { label: "Featured", value: totalFeatured, color: "amber" },
          ].map(({ label, value, color }) => (
            <div key={label} className={`rounded-2xl border border-white/[0.06] bg-gradient-to-br from-${color}-500/10 to-${color}-600/5 p-4`}>
              <p className="text-2xl font-bold text-white">{value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Add form */}
        {showAdd && (
          <div className="rounded-2xl border border-purple-500/20 bg-white/[0.02] p-6 space-y-4">
            <h2 className="text-sm font-semibold text-white">New project</h2>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-gray-400">Title *</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Gaming Community Hub"
                  className="border-white/20 bg-white/5 text-white placeholder:text-gray-600"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-gray-400">Service *</Label>
                <Input
                  value={form.service}
                  onChange={(e) => setForm({ ...form, service: e.target.value })}
                  placeholder="Discord Server"
                  className="border-white/20 bg-white/5 text-white placeholder:text-gray-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-gray-400">Category</Label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full rounded-md border border-white/20 bg-white/5 px-3 py-2 text-sm text-white"
                >
                  {CATEGORIES.map((c) => <option key={c} value={c} className="bg-black">{c}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-gray-400">Sort order</Label>
                <Input
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
                  className="border-white/20 bg-white/5 text-white"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-gray-400">Description *</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Describe the project..."
                className="border-white/20 bg-white/5 text-white placeholder:text-gray-600"
                rows={2}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-gray-400">Image URL (optional)</Label>
              <Input
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                placeholder="https://..."
                className="border-white/20 bg-white/5 text-white placeholder:text-gray-600"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-gray-400">Gradient (used when no image)</Label>
              <div className="grid grid-cols-4 gap-2">
                {GRADIENTS.map((g) => (
                  <button
                    key={g.value}
                    type="button"
                    onClick={() => setForm({ ...form, gradient: g.value })}
                    className={`relative h-10 rounded-lg bg-gradient-to-br ${g.value} transition-all ${
                      form.gradient === g.value ? "ring-2 ring-white ring-offset-1 ring-offset-black" : "opacity-60 hover:opacity-100"
                    }`}
                    title={g.label}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.published}
                  onChange={(e) => setForm({ ...form, published: e.target.checked })}
                  className="accent-purple-500"
                />
                <span className="text-sm text-gray-300">Published</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                  className="accent-purple-500"
                />
                <span className="text-sm text-gray-300">Featured</span>
              </label>
            </div>

            <div className="flex gap-3 pt-2">
              <Button onClick={handleCreate} disabled={saving} className="bg-purple-600 text-white hover:bg-purple-700">
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                Add project
              </Button>
              <Button
                variant="ghost"
                onClick={() => { setShowAdd(false); setForm(EMPTY_FORM); }}
                className="border border-white/10 text-gray-400 hover:text-white"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Filter */}
        <div className="flex flex-wrap gap-2">
          {["All", ...CATEGORIES].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-all ${
                filterCategory === cat
                  ? "border-purple-500 bg-purple-600 text-white"
                  : "border-white/10 bg-white/5 text-gray-400 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Project list */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-purple-400" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-12 text-center">
            <p className="text-gray-500 text-sm">No projects yet. Add your first one above.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((project) => (
              <div
                key={project.id}
                className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden"
              >
                {editingId === project.id ? (
                  /* ── Edit mode ── */
                  <div className="p-5 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs text-gray-400">Title</Label>
                        <Input
                          value={editForm.title ?? ""}
                          onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                          className="border-white/20 bg-white/5 text-white"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs text-gray-400">Service</Label>
                        <Input
                          value={editForm.service ?? ""}
                          onChange={(e) => setEditForm({ ...editForm, service: e.target.value })}
                          className="border-white/20 bg-white/5 text-white"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs text-gray-400">Category</Label>
                        <select
                          value={editForm.category ?? ""}
                          onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                          className="w-full rounded-md border border-white/20 bg-white/5 px-3 py-2 text-sm text-white"
                        >
                          {CATEGORIES.map((c) => <option key={c} value={c} className="bg-black">{c}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs text-gray-400">Sort order</Label>
                        <Input
                          type="number"
                          value={editForm.sortOrder ?? 0}
                          onChange={(e) => setEditForm({ ...editForm, sortOrder: Number(e.target.value) })}
                          className="border-white/20 bg-white/5 text-white"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-gray-400">Description</Label>
                      <Textarea
                        value={editForm.description ?? ""}
                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                        className="border-white/20 bg-white/5 text-white"
                        rows={2}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-gray-400">Image URL</Label>
                      <Input
                        value={editForm.imageUrl ?? ""}
                        onChange={(e) => setEditForm({ ...editForm, imageUrl: e.target.value })}
                        placeholder="https://..."
                        className="border-white/20 bg-white/5 text-white placeholder:text-gray-600"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-gray-400">Gradient</Label>
                      <div className="grid grid-cols-4 gap-2">
                        {GRADIENTS.map((g) => (
                          <button
                            key={g.value}
                            type="button"
                            onClick={() => setEditForm({ ...editForm, gradient: g.value })}
                            className={`h-10 rounded-lg bg-gradient-to-br ${g.value} transition-all ${
                              (editForm.gradient ?? project.gradient) === g.value
                                ? "ring-2 ring-white ring-offset-1 ring-offset-black"
                                : "opacity-60 hover:opacity-100"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Button onClick={() => handleSaveEdit(project.id)} disabled={saving} className="bg-purple-600 text-white hover:bg-purple-700">
                        {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                        Save
                      </Button>
                      <Button variant="ghost" onClick={() => setEditingId(null)} className="border border-white/10 text-gray-400 hover:text-white">
                        <X className="mr-2 h-4 w-4" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  /* ── View mode ── */
                  <div className="flex items-center gap-4 p-4">
                    {/* Gradient/image preview */}
                    <div className={`h-14 w-20 shrink-0 rounded-lg bg-gradient-to-br ${project.gradient} flex items-center justify-center overflow-hidden`}>
                      {project.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={project.imageUrl} alt={project.title} className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-xl font-black text-white/30 select-none">{project.title.charAt(0)}</span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-white text-sm truncate">{project.title}</p>
                        {project.featured && (
                          <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/20 text-xs">Featured</Badge>
                        )}
                        {!project.published && (
                          <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/20 text-xs">Hidden</Badge>
                        )}
                      </div>
                      <p className="text-xs text-purple-400 mt-0.5">{project.service} · {project.category}</p>
                      <p className="text-xs text-gray-500 mt-0.5 truncate">{project.description}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleUpdate(project.id, { published: !project.published })}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-white/10 hover:text-white transition-all"
                        title={project.published ? "Hide" : "Publish"}
                      >
                        {project.published ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => handleUpdate(project.id, { featured: !project.featured })}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-white/10 hover:text-white transition-all"
                        title={project.featured ? "Unfeature" : "Feature"}
                      >
                        {project.featured ? <Star className="h-4 w-4 text-amber-400" /> : <StarOff className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => { setEditingId(project.id); setEditForm({ ...project }); }}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-white/10 hover:text-white transition-all"
                        title="Edit"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(project.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-red-500/20 hover:text-red-400 transition-all"
                        title="Delete"
                      >
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
