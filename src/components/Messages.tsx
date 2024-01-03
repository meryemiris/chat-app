import { useContext, useEffect, useRef, useState } from "react";

import styles from "./Messages.module.css";

import { Message } from "./ChatRoom";
import { supabase } from "@/lib/supabase";

import ChannelsContext from "@/lib/ChannelsContext";

type MessagesProps = {
  setUsername: (username: string) => void;
  username: string;
  searchTerm: string;
};

const Messages: React.FC<MessagesProps> = ({
  setUsername,
  username,
  searchTerm,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const { activeChannelId } = useContext(ChannelsContext);
  const messageEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function getMessages() {
      let { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("channel_id", activeChannelId);

      if (data) {
        setMessages(data);
      }
    }
    getMessages();
  }, [activeChannelId]);

  useEffect(() => {
    const channel = supabase
      .channel("messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `channel_id=eq.${activeChannelId}`,
        },
        (payload: { new: Message }) => {
          setMessages((prev) => [...prev, payload.new]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeChannelId]);

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

  const filteredMessages = messages.filter((message) =>
    message.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const scrollToBottom = () => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollTop = messageEndRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <main ref={messageEndRef} className={styles.scrollable}>
      {filteredMessages.map(({ sender_username, content, id, created_at }) => (
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
    </main>
  );
};

export default Messages;
