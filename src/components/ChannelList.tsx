import styles from "./ChannelList.module.css";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

import { Channel } from "./Sidebar";

type ChannelListProps = {
  handleChannelChange: (id: number, name: string) => void;
  channels: Channel[];
};
const ChannelList: React.FC<ChannelListProps> = ({
  handleChannelChange,
  channels,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const handleCreateChannel = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const ChannelData = new FormData(e.currentTarget);
    const channelName = ChannelData.get("channelName");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const userId = user?.id;

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

  return (
    <div className={styles.channelContainer}>
      <h2 className={styles.channelTitle}>Channels</h2>
      <form onSubmit={handleCreateChannel}>
        <input
          className={styles.channelInput}
          name="channelName"
          placeholder="Search or create a new channel"
          value={searchTerm}
          onChange={handleSearch}
          autoFocus={channels.length === 0 ? true : false}
        />
      </form>

      {filteredChannels.map(({ id, name }) => (
        <button
          onClick={() => handleChannelChange(id, name)}
          key={id}
          className={styles.channelButton}
        >
          {name}
        </button>
      ))}
    </div>
  );
};

export default ChannelList;
