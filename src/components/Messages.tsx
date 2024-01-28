import { useContext, useEffect, useRef, useState } from "react";

import styles from "./Messages.module.css";

import { supabase } from "@/lib/supabase";

import ChannelsContext from "@/lib/ChannelsContext";

import Image from "next/image";
import AuthContext from "@/lib/AuthContext";

export type Message = {
  id: number;
  content: string;
  created_at: string;
  channel_id: string;
  user_id: string;
  users: {
    username: string;
    profile_img: string;
  };
};

type MessagesProps = {
  searchTerm: string;
};

const Messages: React.FC<MessagesProps> = ({ searchTerm }) => {
  const [messages, setMessages] = useState<Message[]>([]);

  const { activeChannelId } = useContext(ChannelsContext);
  const { userId } = useContext(AuthContext);

  const messageEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function getMessages() {
      const { data, error } = await supabase
        .from("messages")
        .select(
          "users(username, profile_img), id, content, created_at, user_id"
        )
        .eq("channel_id", activeChannelId);
      if (error) throw error;

      if (data) {
        setMessages(data);
        console.log("messages:", data);
      } else {
        console.log(error);
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
        async (payload: { new: Message }) => {
          const userData = await supabase
            .from("users")
            .select("username, profile_img")
            .eq("id", payload.new.user_id)
            .single();

          const newMessage = {
            ...payload.new,
            users: userData.data,
          };

          setMessages((prev) => [...prev, newMessage] as Message[]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeChannelId, userId]);

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
      {filteredMessages.map(({ user_id, content, id, created_at, users }) => (
        <div
          key={id}
          className={
            userId === user_id
              ? styles.myMessageContainer
              : styles.messageContainer
          }
        >
          <div>
            {userId !== user_id && (
              <Image
                className={styles.avatar}
                src={users?.profile_img}
                alt=""
                width={40}
                height={40}
              />
            )}
          </div>
          <div
            className={userId === user_id ? styles.myMessage : styles.message}
          >
            {userId !== user_id && (
              <p className={styles.username}>{users?.username}</p>
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
