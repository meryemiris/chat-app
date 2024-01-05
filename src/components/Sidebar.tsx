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

import Profile from "./Profile";
import ChannelList from "./ChannelList";

export type Channel = {
  id: number;
  name: string;
  member_id: string[];
};

export default function Sidebar() {
  const router = useRouter();

  const { setActiveChannelId, setActiveChannelName } =
    useContext(ChannelsContext);

  const [channels, setChannels] = useState<Channel[]>([]);
  const [showPanel, setShowPanel] = useState(true);
  const [showProfile, setShowProfile] = useState(false);

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

  const handleShowProfile = () => {
    if (showPanel) {
      setShowProfile(true);
    } else {
      setShowPanel(true);
    }
  };

  const handleShowChannels = () => {
    if (showPanel) {
      setShowProfile(false);
    } else {
      setShowPanel(true);
    }
  };

  return (
    <div className={styles.sidebar}>
      <div className={styles.controls}>
        <button onClick={handleShowChannels} className={styles.controlButtons}>
          <IoChatbubbleEllipsesSharp />
        </button>

        <div>
          <button onClick={handleShowProfile} className={styles.controlButtons}>
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
        <div className={styles.panel}>
          {showProfile ? (
            <Profile />
          ) : (
            <ChannelList
              handleChannelChange={handleChannelChange}
              channels={channels}
            />
          )}
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
    </div>
  );
}
