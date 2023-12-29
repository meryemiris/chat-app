import styles from "./Messages.module.css";

import { Message } from "./ChatRoom";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

type MessagesProps = {
  setUsername: (username: string) => void;
  username: string;
};

const Messages: React.FC<MessagesProps> = ({ setUsername, username }) => {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    const channel = supabase
      .channel("messages")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload: { new: Message }) => {
          setMessages((prev) => [...prev, payload.new]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    const getUsername = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const userId = user?.id;

      const { data } = await supabase
        .from("users")
        .select("username")
        .eq("auth_id", userId);

      if (data) {
        const sender_username = data[0].username;
        return setUsername(sender_username);
      } else return setUsername("");
    };
    getUsername();
  }, [setUsername]);

  return (
    <>
      {messages.map(({ sender_username, content, id, created_at }) => (
        <div key={id} className={styles.messageContainer}>
          <div
            className={
              username === sender_username
                ? styles.myMessage
                : styles.othersMessage
            }
          >
            {username !== sender_username && (
              <p className={styles.username}>{sender_username}</p>
            )}
            <p className={styles.content}>{content}</p>
            <p className={styles.createdAt}>{created_at}</p>
          </div>
        </div>
      ))}
    </>
  );
};

export default Messages;
