import { useRef, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

import styles from "./ChannelList.module.css";

import ChannelsContext from "@/lib/ChannelsContext";
import AuthContext from "@/lib/AuthContext";
import { Message } from "./Messages";

export type Channel = {
  id: number;
  name: string;
  member_id: string[];
};

const ChannelList = () => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const { activeChannelId, setActiveChannelId, setActiveChannelName } =
    useContext(ChannelsContext);
  const { userId } = useContext(AuthContext);

  const [newMessages, setNewMessages] = useState<Message[]>([]);
  console.log("newMessages", newMessages);

  const [newMsgChannelIds, setNewMsgChannelIds] = useState<number[]>([]);

  const [senderName, setSenderName] = useState("");
  const senderIdRef = useRef<string>("");

  useEffect(() => {
    async function getChannelList() {
      let { data, error } = await supabase.from("channels").select("id, name");
      if (data) {
        setChannels(data as Channel[]);
      }
    }

    getChannelList();
  }, []);

  useEffect(() => {
    const subcribeChannels = supabase
      .channel("channels")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "channels" },
        (payload: { new: Channel }) => {
          setChannels((prev) => [...prev, payload.new]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subcribeChannels);
    };
  }, []);

  useEffect(() => {
    const subcribeMessages = supabase
      .channel("messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload: { new: Message }) => {
          const newMsgChannelId = payload.new.channel_id;

          setNewMessages((prevMessages) => [...prevMessages, payload.new]);

          setNewMsgChannelIds((prevIds: number[]) => {
            if (prevIds.includes(newMsgChannelId)) {
              return prevIds;
            }
            return [...prevIds, newMsgChannelId];
          });
          senderIdRef.current = payload.new.user_id;
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subcribeMessages);
    };
  }, []);

  const handleCreateChannel = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const channelName = new FormData(e.currentTarget).get("channelName");

    const { data, error } = await supabase
      .from("channels")
      .insert([{ name: channelName, member_id: [userId] }])
      .select();

    if (e.target instanceof HTMLFormElement) {
      e.target.reset();
    }
    setSearchTerm("");
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredChannelsWithMessages = channels
    .filter((channel) =>
      channel.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .map(({ id, name }) => {
      const channelMessages = newMessages.filter(
        (msg) => msg.channel_id === id
      );

      const lastMsg = channelMessages[channelMessages.length - 1];
      const isSender = lastMsg?.user_id === userId;
      const newMsgCount = channelMessages.length;

      return { id, name, lastMsg, newMsgCount, isSender };
    });

  const handleReadNewMessages = (id: number, name: string) => {
    setNewMessages((prevMessages) =>
      prevMessages.filter((msg) => msg.channel_id !== id)
    );
    setNewMsgChannelIds((prevIds: number[]) =>
      prevIds.filter((channelId) => channelId !== id)
    );
  };

  useEffect(() => {
    async function getUser() {
      if (senderIdRef.current) {
        const { data: user, error: userError } = await supabase
          .from("users")
          .select("profile_img, username")
          .eq("id", senderIdRef.current);

        if (user) {
          setSenderName(user[0]?.username);
        }
      }
    }
    getUser();
  }, [senderIdRef]);

  return (
    <div className={styles.container}>
      <h2 className={styles.channelTitle}>Channels</h2>
      <form onSubmit={handleCreateChannel}>
        <input
          className={styles.channelSearch}
          name="channelName"
          placeholder="Search or create a new channel"
          value={searchTerm}
          onChange={handleSearch}
          autoFocus
          autoComplete="off"
        />
      </form>
      <div className={styles.channelContainer}>
        {filteredChannelsWithMessages.map(
          ({ id, name, newMsgCount, lastMsg, isSender }) => (
            <button
              onClick={() => {
                setActiveChannelId(id);
                setActiveChannelName(name);
                handleReadNewMessages(id, name);
              }}
              key={id}
              className={
                activeChannelId === id
                  ? styles.activeChannel
                  : styles.channelButton
              }
            >
              <div className={styles.channelDetails}>
                <h6>{name}</h6>
                {newMsgCount > 0 ? (
                  <>
                    <p className={styles.lastMsg}>
                      <span className={styles.senderName}>
                        {isSender ? "You: " : `${senderName}: `}
                      </span>
                      {lastMsg && lastMsg.content.length > 20
                        ? lastMsg.content.slice(0, 20) + "..."
                        : lastMsg.content}
                    </p>
                    <p> {lastMsg?.created_at}</p>
                  </>
                ) : (
                  <i style={{ color: "grey" }}>No messages yet</i>
                )}
              </div>

              {!isSender &&
                newMsgCount > 0 &&
                newMsgChannelIds.includes(id) && (
                  <span className={styles.msgCount}>{newMsgCount}</span>
                )}
            </button>
          )
        )}
      </div>
    </div>
  );
};

export default ChannelList;
