import { ReactNode, useContext, useState } from "react";

import styles from "./Layout.module.css";
import RightSidebar from "./RightSidebar";

import Navbar from "../navbar/Navbar";
import LeftSidebar from "./LeftSidebar";
import RoomContext from "@/lib/RoomContext";

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { showRoomDetails } = useContext(RoomContext);
  const [showProfile, setShowProfile] = useState(false);

  return (
    <div className={styles.container}>
      <Navbar setShowProfile={setShowProfile} />
      <div className={styles.chatContainer}>
        <RightSidebar showProfile={showProfile} />
        {children}
      </div>
      {showRoomDetails && <LeftSidebar />}
    </div>
  );
};

export default Layout;
