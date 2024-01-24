import { ReactNode } from "react";

import styles from "./Layout.module.css";
import Sidebar from "./Sidebar";
import RoomDetails from "./RoomDetails";

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className={styles.chatLayout}>
      <Sidebar />
      {children}
      <RoomDetails />
    </div>
  );
};

export default Layout;
