import styles from "./RightSidebar.module.css";
import Profile from "../profile/Profile";
import RoomList from "../roomList/RoomlList";

type Props = {
  showProfile: boolean;
};

const RightSidebar: React.FC<Props> = ({ showProfile }) => {
  return (
    <div className={styles.panel}>
      {showProfile ? <Profile /> : <RoomList />}
    </div>
  );
};

export default RightSidebar;
