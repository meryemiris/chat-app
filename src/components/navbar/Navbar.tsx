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
				onClick={() => router.push("/")}
				className={`${styles.button} ${
					router.pathname === "/" ? styles.buttonActive : ""
				}`}
			>
				{/* {router.pathname !== "/" && <span className={styles.badge}>{"1"}</span>} */}
				<RiChat3Line />
			</button>
			<button
				onClick={() => router.push("/friends")}
				className={`${styles.button} ${
					router.pathname === "/friends" ? styles.buttonActive : ""
				}`}
			>
				<RiUserHeartLine />
			</button>

			<button
				onClick={() => router.push("/profile")}
				className={`${styles.button} ${
					router.pathname === "/profile" ? styles.buttonActive : ""
				}`}
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
