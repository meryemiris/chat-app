import { supabase } from "@/lib/supabase";
import styles from "@/styles/Home.module.css";
import { useEffect, useState } from "react";
import { IoSend } from "react-icons/io5";

type Message = {
  sender_username: string;
  content: string;
  id: number;
  created_at: string;
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    const channel = supabase
      .channel("messages")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload: { new: Message }) => {
          console.log(payload);
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

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const userId = user?.id;

    const { data, error } = await supabase
      .from("users")
      .select("username")
      .eq("auth_id", userId);
    console.log("users data:", data);

    const username = data![0].username;

    if (!message) return;

    try {
      const { data, error } = await supabase
        .from("messages")
        .insert([{ sender_username: username, content: message }])
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
