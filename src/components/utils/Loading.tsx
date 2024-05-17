import styles from "./Loading.module.css";
const SIZES = {
	sm: "12px",
	md: "20px",
};

export default function Loading({ size = "md" }: { size?: "sm" | "md" }) {
	return (
		<div className={styles.container}>
			<div className={styles.wrapper}>
				<div
					className={styles.circle}
					style={{
						height: SIZES[size],
						width: SIZES[size],
					}}
				></div>
				<div
					className={styles.circle}
					style={{
						height: SIZES[size],
						width: SIZES[size],
					}}
				></div>
				<div
					className={styles.circle}
					style={{
						height: SIZES[size],
						width: SIZES[size],
					}}
				></div>
				<div
					className={styles.shadow}
					style={{
						width: SIZES[size],
					}}
				></div>
				<div
					className={styles.shadow}
					style={{
						width: SIZES[size],
					}}
				></div>
				<div
					className={styles.shadow}
					style={{
						width: SIZES[size],
					}}
				></div>
			</div>
		</div>
	);
}
