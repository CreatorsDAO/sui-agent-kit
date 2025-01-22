import React from "react";
import styles from "./ChatMessage.module.css";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const ChatMessage: React.FC<ChatMessageProps> = ({
  role,
  content,
  timestamp,
}) => {
  return (
    <div className={`${styles.messageContainer} ${styles[role]}`}>
      <div className={styles.avatar}>{role === "user" ? "👤" : "🤖"}</div>
      <div className={styles.messageContent}>
        <div className={styles.message}>{content}</div>
        <div className={styles.timestamp}>{timestamp.toLocaleTimeString()}</div>
      </div>
    </div>
  );
};

export default ChatMessage;
