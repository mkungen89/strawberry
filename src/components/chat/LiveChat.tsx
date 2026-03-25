"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { MessageCircle, X, Send, Loader2, PhoneOff } from "lucide-react";
import { Input } from "@/components/ui/input";

interface ChatMsg {
  id: string;
  content: string;
  senderType: string;
  senderName: string;
  createdAt: string;
}

const LS_KEY = "vexcraft_chat";

interface PersistedState {
  conversationId: string;
  name: string;
  email: string;
  step: "intro" | "chat" | "ended";
  messages: ChatMsg[];
}

function loadPersisted(): PersistedState | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function savePersisted(state: PersistedState) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(state));
  } catch {}
}

function clearPersisted() {
  try {
    localStorage.removeItem(LS_KEY);
  } catch {}
}

export default function LiveChat() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"intro" | "chat" | "ended">("intro");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [typing, setTyping] = useState(false);
  const [unread, setUnread] = useState(0);
  const [ending, setEnding] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevMessageCountRef = useRef(0);

  // Restore from localStorage on mount
  useEffect(() => {
    const persisted = loadPersisted();
    if (persisted) {
      setConversationId(persisted.conversationId);
      setName(persisted.name);
      setEmail(persisted.email);
      setStep(persisted.step);
      setMessages(persisted.messages);
      prevMessageCountRef.current = persisted.messages.length;
    }
    setHydrated(true);
  }, []);

  // Persist on relevant state changes
  useEffect(() => {
    if (!hydrated || !conversationId) return;
    savePersisted({ conversationId, name, email, step, messages });
  }, [hydrated, conversationId, name, email, step, messages]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open, typing]);

  // Poll for new messages (when chat is open or minimized)
  const pollMessages = useCallback(async () => {
    if (!conversationId || step === "ended") return;
    try {
      const res = await fetch(`/api/chat/${conversationId}`);
      if (res.ok) {
        const data = await res.json();
        const newMessages: ChatMsg[] = data.messages;
        setMessages((prev) => {
          if (newMessages.length > prev.length) {
            // If chat is minimized, increment unread count
            if (!open) {
              const newCount = newMessages.length - prevMessageCountRef.current;
              if (newCount > 0) setUnread((u) => u + newCount);
            }
            prevMessageCountRef.current = newMessages.length;
            return newMessages;
          }
          return prev;
        });
      }
    } catch {}
  }, [conversationId, step, open]);

  useEffect(() => {
    if (conversationId && step === "chat") {
      pollRef.current = setInterval(pollMessages, 5000);
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [conversationId, step, pollMessages]);

  // Clear unread when opening
  useEffect(() => {
    if (open) setUnread(0);
  }, [open]);

  async function startChat() {
    if (!message.trim()) return;
    setSending(true);
    setTyping(true);
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
        prevMessageCountRef.current = data.messages.length;
        setMessage("");
        setStep("chat");
      }
    } catch {}
    finally {
      setSending(false);
      setTyping(false);
    }
  }

  async function sendMessage() {
    if (!message.trim() || !conversationId) return;
    setSending(true);
    const optimisticMsg: ChatMsg = {
      id: `optimistic-${Date.now()}`,
      content: message.trim(),
      senderType: "VISITOR",
      senderName: name || "Visitor",
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMsg]);
    const sentContent = message.trim();
    setMessage("");
    setTyping(true);
    try {
      const res = await fetch(`/api/chat/${conversationId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: sentContent,
          senderType: "VISITOR",
          senderName: name || "Visitor",
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [
          ...prev.filter((m) => m.id !== optimisticMsg.id),
          data.visitorMessage,
          data.elinMessage,
        ]);
        prevMessageCountRef.current += 2;
      }
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== optimisticMsg.id));
    } finally {
      setSending(false);
      setTyping(false);
    }
  }

  async function endChat() {
    if (!conversationId) return;
    setEnding(true);
    try {
      await fetch(`/api/chat/${conversationId}`, { method: "PATCH" });
    } catch {}
    finally {
      setEnding(false);
      setStep("ended");
      clearPersisted();
      if (pollRef.current) clearInterval(pollRef.current);
    }
  }

  function startNewChat() {
    clearPersisted();
    setConversationId(null);
    setMessages([]);
    setName("");
    setEmail("");
    setMessage("");
    setStep("intro");
    setUnread(0);
    prevMessageCountRef.current = 0;
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (step === "intro") startChat();
      else if (step === "chat") sendMessage();
    }
  }

  if (!hydrated) return null;

  return (
    <>
      {/* Chat bubble */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-[90] flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-xl shadow-purple-600/30 hover:shadow-purple-600/50 hover:scale-105 transition-all duration-300"
          aria-label="Open live chat"
        >
          <MessageCircle className="h-6 w-6" />
          <span className="absolute inset-0 rounded-full bg-purple-500 animate-ping opacity-20" />
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-lg">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </button>
      )}

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-6 right-6 z-[90] w-[380px] flex flex-col rounded-2xl border border-white/10 bg-gray-950/98 backdrop-blur-xl shadow-2xl shadow-purple-900/20 animate-in slide-in-from-bottom-4 duration-300"
          style={{ maxHeight: "min(560px, calc(100vh - 100px))" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between rounded-t-2xl border-b border-white/10 bg-gradient-to-r from-purple-600/20 to-pink-600/10 p-4 shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-sm font-bold text-white">
                  EN
                </div>
                <span className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-gray-950 ${step === "ended" ? "bg-gray-500" : "bg-green-400"}`} />
              </div>
              <div>
                <p className="font-semibold text-white text-sm">Elin Nyström</p>
                <p className={`text-xs ${step === "ended" ? "text-gray-500" : "text-green-400"}`}>
                  {step === "ended" ? "Chat ended" : "Online — typically replies instantly"}
                </p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="rounded-lg p-1.5 text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
              aria-label="Minimize chat"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Intro step */}
          {step === "intro" && (
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
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
              <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
                {messages.map((msg) => {
                  const isVisitor = msg.senderType === "VISITOR";
                  return (
                    <div key={msg.id} className={`flex ${isVisitor ? "justify-end" : "justify-start"}`}>
                      {!isVisitor && (
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-[10px] font-bold text-white mr-2 mt-1">
                          EN
                        </div>
                      )}
                      <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                        isVisitor
                          ? "bg-purple-600 text-white rounded-br-sm"
                          : "bg-white/[0.07] text-gray-200 border border-white/[0.08] rounded-bl-sm"
                      }`}>
                        {msg.content}
                        <p className={`text-[10px] mt-1 ${isVisitor ? "text-purple-200/70" : "text-gray-600"}`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  );
                })}

                {/* Typing indicator */}
                {typing && (
                  <div className="flex justify-start">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-[10px] font-bold text-white mr-2 mt-1">
                      EN
                    </div>
                    <div className="rounded-2xl rounded-bl-sm bg-white/[0.07] border border-white/[0.08] px-4 py-3">
                      <div className="flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce [animation-delay:0ms]" />
                        <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce [animation-delay:150ms]" />
                        <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce [animation-delay:300ms]" />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="border-t border-white/10 p-3 shrink-0 space-y-2">
                <div className="relative">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message..."
                    disabled={sending}
                    className="border-white/10 bg-white/[0.03] text-white placeholder:text-gray-600 text-sm pr-12 disabled:opacity-60"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!message.trim() || sending}
                    className="absolute right-2 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-lg bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-40 transition-all"
                  >
                    {sending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                  </button>
                </div>
                <button
                  onClick={endChat}
                  disabled={ending}
                  className="flex w-full items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs text-gray-600 hover:text-red-400 hover:bg-red-500/5 transition-all duration-200"
                >
                  {ending ? <Loader2 className="h-3 w-3 animate-spin" /> : <PhoneOff className="h-3 w-3" />}
                  End chat
                </button>
              </div>
            </>
          )}

          {/* Ended state */}
          {step === "ended" && (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/[0.05] border border-white/10">
                <PhoneOff className="h-6 w-6 text-gray-500" />
              </div>
              <div>
                <p className="font-semibold text-white mb-1">Chat ended</p>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Thanks for chatting with us! If you have more questions, feel free to start a new conversation.
                </p>
              </div>
              <button
                onClick={startNewChat}
                className="mt-2 rounded-xl bg-purple-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-purple-700 transition-colors"
              >
                Start new chat
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
