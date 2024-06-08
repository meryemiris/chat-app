import React, { ReactNode } from "react";
import styles from "./AuthLayout.module.css";
import Image from "next/image";

const lampImg = "/lamp.png";

interface LayoutProps {
	children: ReactNode;
	header: string;
	subheader: string;
}

const AuthLayout: React.FC<LayoutProps> = ({ children, header, subheader }) => {
	return (
		<>
			<div className={styles.container}>
				<header className={styles.header}>
					<h1>{header}</h1>
					<h2 className={styles.subheader}>{subheader}</h2>
				</header>
				<Image
					src={lampImg}
					alt="lamp image"
					width={90}
					height={90}
					className={styles.image}
					priority
				/>
				<div className={styles.triangle}></div>
			</div>
			<main className={styles.formContainer}>{children}</main>
		</>
	);
};

export default React.memo(AuthLayout);
