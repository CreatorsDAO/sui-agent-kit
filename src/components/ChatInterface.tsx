import React, { useState, useRef, useEffect } from "react";
import ChatMessage from "./ChatMessage";
import { ChatMessage as ChatMessageType } from "../types/chat";
import styles from "./ChatInterface.module.css";

interface ChatResponse {
  success: boolean;
  data: {
    input: string;
    output: string;
  };
}

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessageType = {
      role: "user",
      content: input,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    const loadingMessage: ChatMessageType = {
      role: "assistant",
      content: "Thinking...",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, loadingMessage]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: input }),
      });

      const data: ChatResponse = await response.json();

      if (!response.ok) {
        throw new Error(
          `HTTP error! status: ${response.status}, message: ${
            data.error || "Unknown error"
          }`
        );
      }

      if (data.success && data.data) {
        setMessages((prev) =>
          prev.slice(0, -1).concat({
            role: "assistant",
            content: data.data.output,
            timestamp: new Date(),
          })
        );
      } else {
        throw new Error(data.error || "Unknown error");
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) =>
        prev.slice(0, -1).concat({
          role: "assistant",
          content: `Error: ${
            error instanceof Error
              ? error.message
              : "An unexpected error occurred. Please try again."
          }`,
          timestamp: new Date(),
        })
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.messagesContainer}>
        {messages.map((msg, index) => (
          <ChatMessage
            key={index}
            role={msg.role}
            content={msg.content}
            timestamp={msg.timestamp}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className={styles.inputForm}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message here..."
          className={styles.input}
          disabled={isLoading}
        />
        <button
          type="submit"
          className={styles.sendButton}
          disabled={isLoading}
        >
          {isLoading ? "Sending..." : "Send"}
        </button>
      </form>
    </div>
  );
};

export default ChatInterface;
