import { supabase } from "@/lib/supabase";
import { useRouter } from "next/router";
import {
  IoChatbubbleEllipsesSharp,
  IoLogOut,
  IoSettings,
} from "react-icons/io5";

import styles from "./Navbar.module.css";

type Props = {
  setShowProfile: React.Dispatch<React.SetStateAction<boolean>>;
  setShowPanel: React.Dispatch<React.SetStateAction<boolean>>;
  showPanel: boolean;
};

const Navbar: React.FC<Props> = ({
  setShowPanel,
  setShowProfile,
  showPanel,
}) => {
  const router = useRouter();

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
    <div className={styles.container}>
      <button onClick={handleShowChannels} className={styles.button}>
        <div className={styles.icon}>
          <IoChatbubbleEllipsesSharp />
        </div>
        <div className={styles.text}>Chats</div>
      </button>

      <div>
        <button onClick={handleShowProfile} className={styles.button}>
          <div className={styles.icon}>
            <IoSettings />
          </div>
          <div className={styles.text}>Profile</div>
        </button>

        <button
          className={styles.button}
          onClick={() => {
            router.push("/login");
            supabase.auth.signOut();
          }}
        >
          <div className={styles.icon}>
            <IoLogOut />
          </div>

          <div className={styles.text}>Logout</div>
        </button>
      </div>
    </div>
  );
};

export default Navbar;
