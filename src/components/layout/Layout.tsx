import { ReactNode } from "react";

import styles from "./Layout.module.css";

import Navbar from "../navbar/Navbar";

interface LayoutProps {
	children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
	return (
		<div className={styles.container}>
			{children}
			<Navbar />
		</div>
	);
};

export default Layout;
