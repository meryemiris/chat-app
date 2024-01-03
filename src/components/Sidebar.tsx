import { supabase } from "@/lib/supabase";
import styles from "./Sidebar.module.css";

import { useRouter } from "next/router";
import {
  IoChatbubbleEllipsesSharp,
  IoLogOut,
  IoSettings,
} from "react-icons/io5";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";

import { useContext, useEffect, useState } from "react";
import ChannelsContext from "@/lib/ChannelsContext";

export type Channel = {
  id: number;
  name: string;
  member_id: string[];
};

export default function Sidebar() {
  const router = useRouter();

  const [channels, setChannels] = useState<Channel[]>([]);
  const [showPanel, setShowPanel] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { setActiveChannelId, setActiveChannelName } =
    useContext(ChannelsContext);

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
  };

  useEffect(() => {
    async function getChannels() {
      let { data, error } = await supabase.from("channels").select("id, name");
      if (data) {
        setChannels(data as Channel[]);
      }
    }

    getChannels();
  }, []);

  useEffect(() => {
    const channels = supabase
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
      supabase.removeChannel(channels);
    };
  }, []);

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

  return (
    <>
      <div className={styles.controlPanel}>
        <button
          onClick={() => setShowPanel((prev) => !prev)}
          className={styles.controlButtons}
        >
          <IoChatbubbleEllipsesSharp />
        </button>

        <div>
          <button className={styles.controlButtons}>
            <IoSettings />
          </button>
          <button
            className={styles.controlButtons}
            onClick={() => {
              router.push("/login");
              supabase.auth.signOut();
            }}
          >
            <IoLogOut />
          </button>
        </div>
      </div>

      {showPanel && (
        <div className={styles.channelPanel}>
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
                autoFocus={channels.length === 0 ? false : true}
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className={styles.closePanel}>
        <button
          className={styles.closeButton}
          onClick={() => {
            setShowPanel((prev) => !prev);
          }}
        >
          {showPanel ? <IoIosArrowBack /> : <IoIosArrowForward />}
        </button>
      </div>
    </>
  );
}
