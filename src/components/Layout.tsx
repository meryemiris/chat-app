import { ReactNode, useState } from "react";

import styles from "./Layout.module.css";
import Sidebar from "./Sidebar";

import Navbar from "./Navbar";

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [showProfile, setShowProfile] = useState(false);

  return (
    <div className={styles.container}>
      <Navbar setShowProfile={setShowProfile} />
      <div className={styles.chatContainer}>
        <Sidebar showProfile={showProfile} />
        {children}
      </div>
    </div>
  );
};

export default Layout;
