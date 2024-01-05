import { useContext, useEffect, useRef, useState } from "react";

import styles from "./Messages.module.css";

import { Message } from "./ChatRoom";
import { supabase } from "@/lib/supabase";

import ChannelsContext from "@/lib/ChannelsContext";

import Image from "next/image";
import AuthContext from "@/lib/AuthContext";

type MessagesProps = {
  searchTerm: string;
};

const Messages: React.FC<MessagesProps> = ({ searchTerm }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const { activeChannelId } = useContext(ChannelsContext);

  const { username } = useContext(AuthContext);

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
      {filteredMessages.map(
        ({ sender_username, content, id, created_at, sender_pp }) => (
          <div
            key={id}
            className={
              username === sender_username
                ? styles.myMessageContainer
                : styles.messageContainer
            }
          >
            <div>
              <Image
                className={styles.avatar}
                src={sender_pp}
                alt=""
                width={40}
                height={40}
              />
            </div>
            <div
              className={
                username === sender_username ? styles.myMessage : styles.message
              }
            >
              {username !== sender_username && (
                <p className={styles.username}>{sender_username}</p>
              )}
              <p className={styles.content}>{content}</p>
              <p className={styles.createdAt}>{created_at}</p>
            </div>
          </div>
        )
      )}
    </main>
  );
};

export default Messages;
