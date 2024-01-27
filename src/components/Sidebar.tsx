import { supabase } from "@/lib/supabase";
import styles from "./Sidebar.module.css";

import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";

import { useContext, useEffect, useState } from "react";
import ChannelsContext from "@/lib/ChannelsContext";

import Profile from "./Profile";
import ChannelList from "./ChannelList";

export type Channel = {
  id: number;
  name: string;
  member_id: string[];
};

type Props = {
  showPanel: boolean;
  setShowPanel: React.Dispatch<React.SetStateAction<boolean>>;
  showProfile: boolean;
};

const Sidebar: React.FC<Props> = ({ showPanel, setShowPanel, showProfile }) => {
  const { setActiveChannelId, setActiveChannelName } =
    useContext(ChannelsContext);

  const [channels, setChannels] = useState<Channel[]>([]);

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
    const channelsSubscribe = supabase
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
      supabase.removeChannel(channelsSubscribe);
    };
  }, []);

  const handleChannelChange = (id: number, name: string) => {
    setActiveChannelId(id);
    setActiveChannelName(name);
  };

  return (
    <>
      {showPanel && (
        <div className={styles.panel}>
          {showProfile ? (
            <Profile />
          ) : (
            <ChannelList
              handleChannelChange={handleChannelChange}
              channels={channels}
            />
          )}
          {/* <button
            className={styles.closeButton}
            onClick={() => {
              setShowPanel((prev) => !prev);
            }}
          >
            {showPanel ? <IoIosArrowBack /> : <IoIosArrowForward />}
          </button> */}
        </div>
      )}
    </>
  );
};

export default Sidebar;
