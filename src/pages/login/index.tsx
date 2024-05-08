import Login from "@/components/auth/Login";
import Image from "next/image";
import styles from "@/styles/Login-SignupPages.module.css";

const lampImg = "/lamp.png";

export default function LoginPage() {
	return (
		<>
			<div className={styles.container}>
				<header className={styles.header}>
					<h1>Welcome!</h1>
					<h2 className={styles.subheader}>Ready to Sign In?</h2>
				</header>
				<Image
					src={lampImg}
					alt="lamp image"
					width={290}
					height={300}
					className={styles.image}
					loading="lazy"
				/>
				<div className={styles.triangle}></div>
			</div>
			<div className={styles.formContainer}>
				<Login />
			</div>
		</>
	);
}
