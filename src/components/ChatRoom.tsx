import { useContext, useEffect, useState } from "react";

import { supabase } from "@/lib/supabase";
import ChannelsContext from "@/lib/ChannelsContext";

import Messages from "./Messages";

import styles from "./ChatRoom.module.css";

import { IoSearch, IoSend } from "react-icons/io5";

export type Message = {
  sender_username: string;
  content: string;
  id: number;
  created_at: string;
  channel_id: number;
};

export default function ChatRoom() {
  const [username, setUsername] = useState("");
  const { activeChannelId, activeChannelName } = useContext(ChannelsContext);

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

  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const message = formData.get("message");
    const time = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    if (!message) return;

    try {
      const { data, error } = await supabase
        .from("messages")
        .insert([
          {
            sender_username: username,
            content: message,
            created_at: time,
            channel_id: activeChannelId,
          },
        ])
        .select();
    } catch (error) {
      console.log(error);
    }
    if (e.target instanceof HTMLFormElement) {
      e.target.reset();
    }
    console.log("subscribe");
  };

  return (
    <main className={styles.main}>
      <div className={styles.headerBox}>
        <p className={styles.title}>{activeChannelName}</p> <IoSearch />
      </div>

      <div className={styles.scrollable}>
        <Messages setUsername={setUsername} username={username} />
      </div>

      <form onSubmit={handleSendMessage} className={styles.sendBox}>
        <input type="text" placeholder={"Type something..."} name="message" />
        <button type="submit">
          <IoSend />
        </button>
      </form>
    </main>
  );
}
