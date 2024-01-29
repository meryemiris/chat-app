import styles from "./Sidebar.module.css";
import Profile from "./Profile";
import ChannelList from "./ChannelList";

type Props = {
  showProfile: boolean;
};

const Sidebar: React.FC<Props> = ({ showProfile }) => {
  return (
    <div className={styles.panel}>
      {showProfile ? <Profile /> : <ChannelList />}
    </div>
  );
};

export default Sidebar;
