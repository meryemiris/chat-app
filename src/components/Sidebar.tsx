import { supabase } from "@/lib/supabase";
import styles from "./Sidebar.module.css";

import { useRouter } from "next/router";
import { IoLogOut } from "react-icons/io5";

export default function Sidebar() {
  const router = useRouter();
  return (
    <div className={styles.sidebar}>
      <div className={styles.channelContainer}>
        <button className={styles.channelButton}>Channel1</button>
        <button className={styles.channelButton}>Channel1</button>
        <button className={styles.channelButton}>Channel1</button>
        <button className={styles.channelButton}>Channel1</button>
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
