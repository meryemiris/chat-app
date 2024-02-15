import styles from "./Sidebar.module.css";
import Profile from "./Profile";
import RoomList from "./RoomlList";

type Props = {
  showProfile: boolean;
};

const Sidebar: React.FC<Props> = ({ showProfile }) => {
  return (
    <div className={styles.panel}>
      {showProfile ? <Profile /> : <RoomList />}
    </div>
  );
};

export default Sidebar;
