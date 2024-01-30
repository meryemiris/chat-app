import { useContext, useEffect, useState } from "react";
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

  const { activeChannelId } = useContext(ChannelsContext);
  const { userId } = useContext(AuthContext);
  const { setActiveChannelId, setActiveChannelName } =
    useContext(ChannelsContext);

  const [isNewMessages, setIsNewMessages] = useState(false);
  const [newMsgChannelIds, setNewMsgChannelIds] = useState<number[]>([]);
  const [newMsgSenderId, setNewMsgSenderId] = useState("");
  const [newMessages, setNewMessages] = useState<Message[]>([]);
  const [newMsgCount, setNewMsgCount] = useState(0);

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
          const channel_id = payload.new.channel_id;
          const user_id = payload.new.user_id;

          setIsNewMessages(true);
          setNewMessages((prevMessages) => [...prevMessages, payload.new]);

          setNewMsgChannelIds((prevIds: number[]) => {
            if (!prevIds.includes(channel_id)) {
              return [...prevIds, channel_id];
            }
            return prevIds;
          });
          setNewMsgSenderId(user_id);
          console.log(channel_id);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subcribeMessages);
    };
  }, [activeChannelId]);

  const handleCreateChannel = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const ChannelData = new FormData(e.currentTarget);
    const channelName = ChannelData.get("channelName");

    const { data, error } = await supabase
      .from("channels")
      .insert([{ name: channelName, member_id: [userId] }])
      .select();

    if (e.target instanceof HTMLFormElement) {
      e.target.reset();
    }
    setSearchTerm("");
  };

  const handleChannelChange = (id: number, name: string) => {
    setActiveChannelId(id);
    setActiveChannelName(name);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredChannels = channels.filter((channel) =>
    channel.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  console.log("newMsgChannelIds", newMsgChannelIds);
  console.log("newMessges", newMessages);

  const handleReadNewMessages = (id: number) => {
    const count = newMessages.filter((msg) => msg.channel_id === id).length + 1;
    setNewMsgCount(count);
    setNewMsgChannelIds((prevIds: number[]) =>
      prevIds.filter((channelId) => channelId !== id)
    );
    setNewMessages((prevMessages) =>
      prevMessages.filter((msg) => msg.channel_id !== id)
    );
  };

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
        {filteredChannels.map(({ id, name }) => (
          <button
            onClick={() => {
              handleChannelChange(id, name);
              handleReadNewMessages(id);
            }}
            key={id}
            className={
              activeChannelId === id
                ? styles.activeChannel
                : styles.channelButton
            }
          >
            {name}

            {newMsgChannelIds.includes(id) &&
              activeChannelId !== id &&
              userId !== newMsgSenderId && (
                <span className={styles.msgCount}>{newMsgCount}</span>
              )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ChannelList;
