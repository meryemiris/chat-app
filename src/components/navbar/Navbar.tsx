import { IoChatbubbleEllipsesSharp, IoSettings } from "react-icons/io5";

import styles from "./Navbar.module.css";
import FriendRequests from "./FriendsRequests";
import Image from "next/image";

import { useContext } from "react";
import UserContext from "@/lib/UserContext";

const Navbar = () => {
	const { setShowProfile, profileImg } = useContext(UserContext);

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
				<Image
					src={profileImg ? profileImg : "/defaultPp.png"}
					alt="go to profile"
					width={40}
					height={40}
					style={{ borderRadius: "50%" }}
				/>
			</button>
		</div>
	);
};

export default Navbar;
