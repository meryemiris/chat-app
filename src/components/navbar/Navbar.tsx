import { IoChatbubbleEllipsesSharp } from "react-icons/io5";

import styles from "./Navbar.module.css";
// import FriendRequests from "./FriendsRequests";
import Image from "next/image";

import { useUserContext } from "@/lib/UserContext";
import { useRouter } from "next/router";
import { FaBell } from "react-icons/fa";

const Navbar = () => {
	const router = useRouter();
	const { profileImg } = useUserContext();

	return (
		<div className={styles.container}>
			<span className={styles.badge}>{"1"}</span>
			<button onClick={() => router.push("/friends")} className={styles.button}>
				<FaBell />
			</button>
			<button onClick={() => router.push("/")} className={styles.button}>
				<IoChatbubbleEllipsesSharp />
			</button>

			<button onClick={() => router.push("/profile")} className={styles.button}>
				<Image
					src={profileImg}
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
