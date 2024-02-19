import { useContext, useState } from "react";

import { supabase } from "@/lib/supabase";
import ChannelsContext from "@/lib/RoomContext";

import Messages from "./Messages";

import styles from "./ChatRoom.module.css";

import { IoSearch, IoSend } from "react-icons/io5";
import AuthContext from "@/lib/AuthContext";
import { RiEmojiStickerLine } from "react-icons/ri";
import RoomContext from "@/lib/RoomContext";
import { FaInfoCircle } from "react-icons/fa";

export default function ChatRoom() {
  const { activeChannelId, activeChannelName } = useContext(ChannelsContext);
  const { userId } = useContext(AuthContext);
  const { setShowRoomDetails } = useContext(RoomContext);
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
      {activeChannelName ? (
        <>
          <header className={styles.header}>
            <div className={styles.titleWrapper}>
              <p className={styles.title}>{activeChannelName}</p>
              <button
                className={styles.infoButton}
                onClick={() => setShowRoomDetails(true)}
              >
                <FaInfoCircle />
              </button>
            </div>

            <>
              <div className={styles.inputWrapper}>
                <button className={styles.icon}>
                  <IoSearch />
                </button>
                <input
                  type="text"
                  name="text"
                  className={styles.searchInput}
                  placeholder="search.."
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </div>
            </>
          </header>
          <Messages searchTerm={searchTerm} />
          <footer className={styles.footer}>
            <button className={styles.emojiButton}>
              <RiEmojiStickerLine />
            </button>

            <form onSubmit={handleSendMessage} className={styles.sendBox}>
              <input
                type="text"
                placeholder={"Type something..."}
                name="message"
                autoComplete="off"
              />
              <button type="submit">
                <IoSend />
              </button>
            </form>
          </footer>
        </>
      ) : (
        <div className={styles.welcome}>
          <p className={styles.welcomeMessage}>
            🍄 Explore mushroom magic! Join existing rooms or create your own.
            Your journey starts here!
          </p>
        </div>
      )}
    </div>
  );
}
