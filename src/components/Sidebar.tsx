import { supabase } from "@/lib/supabase";
import styles from "./Sidebar.module.css";

import { useRouter } from "next/router";
import { IoCreate, IoLogOut } from "react-icons/io5";

import { useEffect, useState } from "react";

export type Channel = {
  id: number;
  name: string;
  user_id: string;
};

export default function Sidebar() {
  const router = useRouter();

  const [channels, setChannels] = useState<Channel[]>([]);

  const HandleCreateChannel = async (e: React.FormEvent<HTMLFormElement>) => {
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

    console.log(data);
  };

  useEffect(() => {
    const channels = supabase
      .channel("cahnnels")
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

  return (
    <div className={styles.sidebar}>
      <div className={styles.channelContainer}>
        <form onSubmit={HandleCreateChannel}>
          <input name="channelName" placeholder="Channel Name" />
          <button type="submit" className={styles.createChannelButton}>
            Create Channel <IoCreate />
          </button>
        </form>
        {channels.map(({ id, name }) => (
          <button key={id} className={styles.channelButton}>
            {name}
          </button>
        ))}
      </div>

      <div className={styles.settingsContainer}>
        <button
          className={styles.logoutButton}
          onClick={() => {
            router.push("/login");
            supabase.auth.signOut();
          }}
        >
          Logout <IoLogOut />
        </button>
      </div>
    </div>
  );
}
