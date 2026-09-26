export type Message = {
  id: string;
  role: "user" | "assistant";
  text: string;
  fallback?: boolean;
};
export type Conversation = { id: string; title: string; messages: Message[] };

function isMessage(value: unknown): value is Message {
  if (typeof value !== "object" || value === null) return false;
  const message = value as Record<string, unknown>;
  return (
    typeof message.id === "string" &&
    (message.role === "user" || message.role === "assistant") &&
    typeof message.text === "string" &&
    (message.fallback === undefined || typeof message.fallback === "boolean")
  );
}

function isConversation(value: unknown): value is Conversation {
  if (typeof value !== "object" || value === null) return false;
  const conversation = value as Record<string, unknown>;
  return (
    typeof conversation.id === "string" &&
    typeof conversation.title === "string" &&
    Array.isArray(conversation.messages) &&
    conversation.messages.every(isMessage)
  );
}

export function loadConversations(storageKey: string): Conversation[] {
  try {
    const saved: unknown = JSON.parse(localStorage.getItem(storageKey) ?? "[]");
    return Array.isArray(saved) ? saved.filter(isConversation) : [];
  } catch {
    return [];
  }
}

