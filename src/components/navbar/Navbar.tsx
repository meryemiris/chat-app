import styles from "./Navbar.module.css";
import Image from "next/image";

import { useUserContext } from "@/lib/UserContext";
import { useRouter } from "next/router";

import { RiChat3Line, RiUserHeartLine } from "react-icons/ri";

const Navbar = () => {
	const router = useRouter();
	const { profileImg } = useUserContext();

	return (
		<div className={styles.container}>
			<button
				onClick={() => router.push("/friends")}
				className={
					router.pathname === "/friends" ? styles.buttonActive : styles.button
				}
			>
				{router.pathname !== "/friends" && (
					<span className={styles.friendBadge}>{"1"}</span>
				)}
				<RiUserHeartLine />
			</button>

			<button
				onClick={() => router.push("/")}
				className={
					router.pathname === "/" ? styles.buttonActive : styles.button
				}
			>
				{router.pathname !== "/" && (
					<span className={styles.chatBadge}>{"1"}</span>
				)}
				<RiChat3Line />
			</button>

			<button
				onClick={() => router.push("/profile")}
				className={
					router.pathname === "/profile" ? styles.buttonActive : styles.button
				}
			>
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
