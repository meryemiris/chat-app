import Signup from "@/components/auth/Signup";
import Image from "next/image";
import styles from "@/styles/Login-SignupPages.module.css";

const lampImg = "/lamp.png";

export default function SignupPage() {
	return (
		<>
			<div className={styles.container}>
				<header className={styles.header}>
					<h1>Start Now!</h1>
					<h2 className={styles.subheader}>Join for Free.</h2>
				</header>
				<Image
					src={lampImg}
					alt="lamp image"
					width={90}
					height={90}
					loading="lazy"
					className={styles.image}
				/>
				<div className={styles.triangle}></div>
			</div>
			<div className={styles.formContainer}>
				<Signup />
			</div>
		</>
	);
}
