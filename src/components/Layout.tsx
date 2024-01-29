import { ReactNode, useState } from "react";

import styles from "./Layout.module.css";
import Sidebar from "./Sidebar";

import Navbar from "./Navbar";

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [showPanel, setShowPanel] = useState(true);
  const [showProfile, setShowProfile] = useState(false);

  return (
    <div className={styles.chatLayout}>
      <Navbar setShowProfile={setShowProfile} />
      <Sidebar showProfile={showProfile} />
      {children}
    </div>
  );
};

export default Layout;
