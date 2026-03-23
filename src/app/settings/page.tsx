"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useSession, authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, User, Lock, Shield, Save } from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [name, setName] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    if (!isPending && !session) router.push("/login");
    if (session) setName(session.user.name || "");
  }, [session, isPending, router]);

  async function handleUpdateName(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSavingName(true);
    try {
      await authClient.updateUser({ name: name.trim() });
      toast.success("Name updated!");
    } catch {
      toast.error("Could not update name.");
    } finally {
      setSavingName(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    setSavingPassword(true);
    try {
      await authClient.changePassword({
        currentPassword,
        newPassword,
      });
      toast.success("Password updated!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      toast.error("Could not change password. Check your current password.");
    } finally {
      setSavingPassword(false);
    }
  }

  if (isPending || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-8">Account Settings</h1>

        {/* Profile */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10">
              <User className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <h2 className="font-semibold">Profile</h2>
              <p className="text-xs text-gray-500">Update your display name</p>
            </div>
          </div>
          <form onSubmit={handleUpdateName} className="space-y-4">
            <div>
              <Label className="text-gray-400 text-sm">Email</Label>
              <div className="mt-1 flex items-center gap-2">
                <Input
                  value={session.user.email}
                  disabled
                  className="border-white/10 bg-white/[0.02] text-gray-500"
                />
                <Badge className="bg-green-500/20 text-green-300 border-green-500/20 shrink-0">Verified</Badge>
              </div>
            </div>
            <div>
              <Label className="text-gray-400 text-sm">Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 border-white/10 bg-white/[0.03] text-white"
              />
            </div>
            <Button
              type="submit"
              disabled={savingName || name === session.user.name}
              className="bg-purple-600 text-white hover:bg-purple-700"
              size="sm"
            >
              {savingName ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save
            </Button>
          </form>
        </div>

        {/* Change password */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10">
              <Lock className="h-5 w-5 text-orange-400" />
            </div>
            <div>
              <h2 className="font-semibold">Change Password</h2>
              <p className="text-xs text-gray-500">Update your account password</p>
            </div>
          </div>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <Label className="text-gray-400 text-sm">Current password</Label>
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="mt-1 border-white/10 bg-white/[0.03] text-white"
              />
            </div>
            <div>
              <Label className="text-gray-400 text-sm">New password</Label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min. 8 characters"
                required
                className="mt-1 border-white/10 bg-white/[0.03] text-white placeholder:text-gray-600"
              />
            </div>
            <div>
              <Label className="text-gray-400 text-sm">Confirm new password</Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="mt-1 border-white/10 bg-white/[0.03] text-white"
              />
            </div>
            <Button
              type="submit"
              disabled={savingPassword}
              className="bg-purple-600 text-white hover:bg-purple-700"
              size="sm"
            >
              {savingPassword ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lock className="mr-2 h-4 w-4" />}
              Change password
            </Button>
          </form>
        </div>

        {/* Account info */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">
              <Shield className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <h2 className="font-semibold">Account</h2>
              <p className="text-xs text-gray-500">Account details and security</p>
            </div>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Role</span>
              <Badge className="bg-purple-500/20 text-purple-300">
                {(session.user as { role?: string }).role || "USER"}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Member since</span>
              <span className="text-gray-300">
                {new Date(session.user.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
              </span>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
