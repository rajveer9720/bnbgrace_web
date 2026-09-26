import Icon from "../Icon";
import type { Message } from "../../lib/conversations";

interface ChatMessageProps {
  message: Message;
  onCopy: (message: Message) => Promise<void>;
}

export default function ChatMessage({ message, onCopy }: ChatMessageProps) {
  return (
    <article
      className={`chat-message ${message.role}`}
      aria-label={
        message.role === "user" ? "You" : "bnbgrace assistant"
      }
    >
      {message.role === "assistant" && (
        <span className="message-avatar">
          <Icon name="spark" />
        </span>
      )}
      <div className="message-body">
        {message.role === "assistant" && (
          <span className="message-author">bnbgrace</span>
        )}
        {message.fallback && (
          <p className="chat-fallback">Needs supervisor check</p>
        )}
        <div className="message-text">{message.text}</div>
        {message.role === "assistant" && (
          <button
            className="message-copy"
            onClick={() => void onCopy(message)}
          >
            <Icon name="copy" /> Copy reply
          </button>
        )}
      </div>
    </article>
  );
}
