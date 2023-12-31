import { useContext, useEffect, useState, useRef } from "react";

import { supabase } from "@/lib/supabase";
import ChannelsContext from "@/lib/ChannelsContext";

import Messages from "./Messages";

import styles from "./ChatRoom.module.css";

import { IoSearch, IoSend } from "react-icons/io5";
import AuthContext from "@/lib/AuthContext";

export default function ChatRoom() {
  const { activeChannelId, activeChannelName } = useContext(ChannelsContext);
  const { userId } = useContext(AuthContext);

  const [isSearch, setIsSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const time = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const message = formData.get("message");

    if (!message) return;

    try {
      const { data, error } = await supabase
        .from("messages")
        .insert([
          {
            content: message,
            created_at: time,
            channel_id: activeChannelId,
            user_id: userId,
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

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className={styles.container}>
      {activeChannelName && (
        <header className={styles.header}>
          <p className={styles.title}>{activeChannelName}</p>
          <div className={styles.search}>
            {isSearch && (
              <input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={handleSearch}
              ></input>
            )}
            <button onClick={() => setIsSearch(!isSearch)}>
              <IoSearch />
            </button>
          </div>
        </header>
      )}

      <Messages searchTerm={searchTerm} />

      <footer>
        <form onSubmit={handleSendMessage} className={styles.sendBox}>
          <input type="text" placeholder={"Type something..."} name="message" />
          <button type="submit">
            <IoSend />
          </button>
        </form>
      </footer>
    </div>
  );
}
