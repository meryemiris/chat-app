import { supabase } from "@/lib/supabase";
import { useRouter } from "next/router";
import { IoChatbubbleEllipsesSharp, IoSettings } from "react-icons/io5";

import styles from "./Navbar.module.css";
import { AiFillNotification } from "react-icons/ai";
import FriendRequests from "./FriendsRequests";

type Props = {
  setShowProfile: React.Dispatch<React.SetStateAction<boolean>>;
};

const Navbar: React.FC<Props> = ({ setShowProfile }) => {
  const handleShowProfile = () => {
    setShowProfile(true);
  };

  const handleShowChannels = () => {
    setShowProfile(false);
  };

  return (
    <div className={styles.container}>
      <FriendRequests />
      <button onClick={handleShowChannels} className={styles.button}>
        <IoChatbubbleEllipsesSharp />
      </button>

      <button onClick={handleShowProfile} className={styles.button}>
        <IoSettings />
      </button>
    </div>
  );
};

export default Navbar;
