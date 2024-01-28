import styles from "./ChannelList.module.css";
import { useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

import { Channel } from "./Sidebar";
import ChannelsContext from "@/lib/ChannelsContext";
import AuthContext from "@/lib/AuthContext";

type ChannelListProps = {
  handleChannelChange: (id: number, name: string) => void;
  channels: Channel[];
};
const ChannelList: React.FC<ChannelListProps> = ({
  handleChannelChange,
  channels,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const { activeChannelId } = useContext(ChannelsContext);
  const [newMessages, setNewMessages] = useState(false);
  const { userId } = useContext(AuthContext);

  const [newMsgChannelIds, setNewMsgChannelIds] = useState<number[]>([]);
  const [newMsgSenderId, setNewMsgSenderId] = useState("");

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

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredChannels = channels.filter((channel) =>
    channel.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const channel = supabase
      .channel("messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          console.log("payload", payload);

          const channel_id = payload.new.channel_id;
          const user_id = payload.new.user_id;

          setNewMessages(true);

          setNewMsgChannelIds((prevIds: number[]) => {
            if (!prevIds.includes(channel_id)) {
              return [...prevIds, channel_id];
            }
            return prevIds;
          });
          setNewMsgSenderId(user_id);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeChannelId]);

  return (
    <div className={styles.container}>
      <h2 className={styles.channelTitle}>Channels</h2>
      <form onSubmit={handleCreateChannel}>
        <input
          className={styles.channelInput}
          name="channelName"
          placeholder="Search or create a new channel"
          value={searchTerm}
          onChange={handleSearch}
          autoFocus
        />
      </form>
      <div className={styles.channelContainer}>
        {filteredChannels.map(({ id, name }) => (
          <button
            onClick={() => {
              handleChannelChange(id, name);
              setNewMsgChannelIds((prevIds: number[]) =>
                prevIds.filter((channelId) => channelId !== id)
              );
            }}
            key={id}
            className={
              activeChannelId === id
                ? styles.activeChannel
                : styles.channelButton
            }
          >
            {name}

            {newMessages &&
              newMsgChannelIds.includes(id) &&
              activeChannelId !== id &&
              userId !== newMsgSenderId && (
                <span className={styles.msgCount}></span>
              )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ChannelList;
