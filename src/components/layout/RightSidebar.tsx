import styles from "./RightSidebar.module.css";
import Profile from "../profile/Profile";
import RoomList from "../roomList/RoomlList";
import UserContext from "@/lib/UserContext";
import { useContext } from "react";

const RightSidebar = () => {
	const { showProfile } = useContext(UserContext);
	return (
		<div className={styles.panel}>
			{showProfile ? <Profile /> : <RoomList />}
		</div>
	);
};

export default RightSidebar;
