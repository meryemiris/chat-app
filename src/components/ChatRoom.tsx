import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

import styles from "./ChatRoom.module.css";
import { IoSend } from "react-icons/io5";

export type Message = {
  sender_username: string;
  content: string;
  id: number;
  created_at: string;
};

export default function ChatRoom() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [username, setUsername] = useState("");

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
  }, []);

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

  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const message = formData.get("message");
    const time = new Date().toLocaleTimeString();

    if (!message) return;

    try {
      const { data, error } = await supabase
        .from("messages")
        .insert([
          { sender_username: username, content: message, created_at: time },
        ])
        .select();
    } catch (error) {
      console.log(error);
    }

    console.log("subscribe");
  };

  return (
    <main className={styles.main}>
      <div className={styles.chatBox}>
        {messages.map(({ sender_username, content, id, created_at }) => (
          <div key={id} className={styles.messageBox}>
            <p className={styles.username}>{sender_username}</p>
            <p className={styles.content}>{content}</p>
            <p className="text-xs text-gray-400">{created_at}</p>
          </div>
        ))}
      </div>
      <form onSubmit={handleSendMessage} className={styles.sendBox}>
        <input type="text" placeholder="Type something..." name="message" />
        <button type="submit">
          <IoSend />
        </button>
      </form>
    </main>
  );
}
