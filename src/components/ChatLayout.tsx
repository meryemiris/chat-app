import { ReactNode } from "react";

import styles from "./ChatLayout.module.css";
import Sidebar from "./Sidebar";

interface ChatLayoutProps {
  children: ReactNode;
}

const ChatLayout: React.FC<ChatLayoutProps> = ({ children }) => {
  return (
    <div className={styles.chatLayout}>
      <Sidebar />
      {children}
    </div>
  );
};

export default ChatLayout;
