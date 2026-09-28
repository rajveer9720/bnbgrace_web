import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { useGenerateReplyMutation } from "../stores/apis/agentApi";
import { getApiError } from "../utils/api-error.util";
import { useAuth } from "../auth/authContext";
import { loadConversations } from "../lib/conversations";
import type { Conversation, Message } from "../lib/conversations";

export function useAgentChat() {
  const [generateReply] = useGenerateReplyMutation();
  const { user, logout } = useAuth();
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    try {
      return localStorage.getItem("bnbgrace-theme") === "dark"
        ? "dark"
        : "light";
    } catch {
      return "light";
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem("bnbgrace-theme", theme);
    } catch {
      /* Theme still works when browser storage is unavailable. */
    }
  }, [theme]);
  const chatStorageKey = `bnbgrace-chats-${user?.id ?? "guest"}`;
  const [chats, setChats] = useState<Conversation[]>(() =>
    loadConversations(chatStorageKey),
  );
  useEffect(() => {
    try {
      localStorage.setItem(chatStorageKey, JSON.stringify(chats));
    } catch {
      /* Recent chats remain available until the page is closed. */
    }
  }, [chatStorageKey, chats]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [failedQuestion, setFailedQuestion] = useState("");
  const [copyStatus, setCopyStatus] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const busy = useRef(false);
  const input = useRef<HTMLTextAreaElement>(null);
  const end = useRef<HTMLDivElement>(null);
  const active = chats.find((chat) => chat.id === activeId);
  const messages = active?.messages ?? [];

  useEffect(() => {
    end.current?.scrollIntoView({ behavior: "auto", block: "end" });
  }, [chats, loading, activeId, error]);
  useEffect(() => {
    if (input.current) {
      input.current.style.height = "auto";
      input.current.style.height = `${Math.min(input.current.scrollHeight, 160)}px`;
    }
  }, [question]);
  useEffect(() => {
    function close(event: KeyboardEvent) {
      if (event.key === "Escape") setSidebarOpen(false);
    }
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);

  function newChat() {
    if (busy.current) return;
    setActiveId(null);
    setQuestion("");
    setError("");
    setFailedQuestion("");
    setCopyStatus("");
    setSidebarOpen(false);
    input.current?.focus();
  }
  function selectChat(id: string) {
    if (busy.current) return;
    setActiveId(id);
    setQuestion("");
    setError("");
    setFailedQuestion("");
    setCopyStatus("");
    setSidebarOpen(false);
  }
  async function send(text: string, retry = false) {
    const trimmed = text.trim();
    if (!trimmed || busy.current) return;
    busy.current = true;
    const chatId = activeId ?? crypto.randomUUID();
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      text: trimmed,
    };
    if (!activeId) {
      setChats((previous) => [
        { id: chatId, title: trimmed, messages: [userMessage] },
        ...previous,
      ]);
      setActiveId(chatId);
    } else if (!retry) {
      setChats((previous) =>
        previous.map((chat) =>
          chat.id === chatId
            ? { ...chat, messages: [...chat.messages, userMessage] }
            : chat,
        ),
      );
    }
    setLoading(true);
    setQuestion("");
    setError("");
    setFailedQuestion("");
    setCopyStatus("");
    try {
      const data = await generateReply({ question: trimmed }).unwrap();
      if (
        !data ||
        typeof data.reply !== "string" ||
        !data.reply.trim() ||
        typeof data.fallback !== "boolean"
      )
        throw new Error(
          "The assistant returned an invalid reply. Please try again.",
        );
      const reply: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        text: data.reply,
        fallback: data.fallback,
      };
      setChats((previous) =>
        previous.map((chat) =>
          chat.id === chatId
            ? { ...chat, messages: [...chat.messages, reply] }
            : chat,
        ),
      );
    } catch (cause) {
      setError(getApiError(cause));
      setFailedQuestion(trimmed);
    } finally {
      busy.current = false;
      setLoading(false);
      input.current?.focus();
    }
  }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void send(question);
  }
  async function copy(message: Message) {
    try {
      await navigator.clipboard.writeText(message.text);
      setCopyStatus("Reply copied.");
    } catch {
      setCopyStatus(
        "Could not copy. Select the reply text and copy it manually.",
      );
    }
  }

  return {
    user,
    logout,
    theme,
    setTheme,
    chats,
    activeId,
    question,
    setQuestion,
    loading,
    error,
    failedQuestion,
    copyStatus,
    sidebarOpen,
    setSidebarOpen,
    input,
    end,
    messages,
    newChat,
    selectChat,
    send,
    submit,
    copy,
  };
}
