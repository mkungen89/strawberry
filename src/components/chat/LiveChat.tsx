"use client";

import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, Loader2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ChatMsg {
  id: string;
  content: string;
  senderType: string;
  senderName: string;
  createdAt: string;
}

export default function LiveChat() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"intro" | "chat">("intro");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Poll for new messages
  useEffect(() => {
    if (conversationId && open) {
      pollRef.current = setInterval(async () => {
        try {
          const res = await fetch(`/api/chat/${conversationId}`);
          if (res.ok) {
            const data = await res.json();
            setMessages(data.messages);
          }
        } catch {
          // silent
        }
      }, 5000);
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [conversationId, open]);

  async function startChat() {
    if (!message.trim()) return;
    setSending(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visitorName: name.trim() || "Visitor",
          visitorEmail: email.trim() || null,
          message: message.trim(),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setConversationId(data.id);
        setMessages(data.messages);
        setMessage("");
        setStep("chat");
      }
    } catch {
      // silent
    } finally {
      setSending(false);
    }
  }

  async function sendMessage() {
    if (!message.trim() || !conversationId) return;
    setSending(true);
    try {
      const res = await fetch(`/api/chat/${conversationId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: message.trim(),
          senderType: "VISITOR",
          senderName: name || "Visitor",
        }),
      });
      if (res.ok) {
        const data = await res.json();
        // Add both visitor message and Elin's response
        setMessages((prev) => [...prev, data.visitorMessage, data.elinMessage]);
        setMessage("");
      }
    } catch {
      // silent
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (step === "intro") startChat();
      else sendMessage();
    }
  }

  return (
    <>
      {/* Chat bubble button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-[90] flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-xl shadow-purple-600/30 hover:shadow-purple-600/50 hover:scale-105 transition-all duration-300"
          aria-label="Open live chat"
        >
          <MessageCircle className="h-6 w-6" />
          {/* Pulse ring */}
          <span className="absolute inset-0 rounded-full bg-purple-500 animate-ping opacity-20" />
        </button>
      )}

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-6 right-6 z-[90] w-[380px] max-h-[560px] flex flex-col rounded-2xl border border-white/10 bg-gray-950/95 backdrop-blur-xl shadow-2xl shadow-purple-900/20 animate-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="flex items-center justify-between rounded-t-2xl border-b border-white/10 bg-gradient-to-r from-purple-600/20 to-pink-600/10 p-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-sm font-bold text-white">
                  EN
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-gray-950 bg-green-400" />
              </div>
              <div>
                <p className="font-semibold text-white text-sm">Elin Nyström</p>
                <p className="text-xs text-green-400">Online — typically replies instantly</p>
              </div>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
                aria-label="Minimize chat"
              >
                <Minimize2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => { setOpen(false); setStep("intro"); setConversationId(null); setMessages([]); }}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
                aria-label="Close chat"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Intro step */}
          {step === "intro" && (
            <div className="flex-1 p-5 space-y-4">
              <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4">
                <p className="text-sm text-gray-300 leading-relaxed">
                  👋 Hi there! I&apos;m <span className="text-purple-400 font-medium">Elin</span>, your project coordinator at Vexcraft.
                  How can I help you today?
                </p>
              </div>

              <div className="space-y-3">
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name (optional)"
                  className="border-white/10 bg-white/[0.03] text-white placeholder:text-gray-600 text-sm"
                />
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email (optional, for follow-up)"
                  type="email"
                  className="border-white/10 bg-white/[0.03] text-white placeholder:text-gray-600 text-sm"
                />
                <div className="relative">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your message..."
                    className="border-white/10 bg-white/[0.03] text-white placeholder:text-gray-600 text-sm pr-12"
                  />
                  <button
                    onClick={startChat}
                    disabled={!message.trim() || sending}
                    className="absolute right-2 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-lg bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-40 transition-all"
                  >
                    {sending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Chat step */}
          {step === "chat" && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[360px] scrollbar-thin">
                {messages.map((msg) => {
                  const isVisitor = msg.senderType === "VISITOR";
                  return (
                    <div key={msg.id} className={`flex ${isVisitor ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                        isVisitor
                          ? "bg-purple-600 text-white rounded-br-md"
                          : "bg-white/[0.06] text-gray-200 border border-white/[0.08] rounded-bl-md"
                      }`}>
                        {!isVisitor && (
                          <p className="text-xs font-medium text-purple-400 mb-1">{msg.senderName}</p>
                        )}
                        {msg.content}
                        <p className={`text-[10px] mt-1 ${isVisitor ? "text-purple-200" : "text-gray-600"}`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="border-t border-white/10 p-3">
                <div className="relative">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message..."
                    className="border-white/10 bg-white/[0.03] text-white placeholder:text-gray-600 text-sm pr-12"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!message.trim() || sending}
                    className="absolute right-2 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-lg bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-40 transition-all"
                  >
                    {sending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                  </button>
                </div>
                <p className="mt-2 text-center text-[10px] text-gray-600">
                  Powered by Vexcraft Support
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
