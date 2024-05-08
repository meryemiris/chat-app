import { supabase } from "@/lib/supabase";

import { useRouter } from "next/router";
import { useState } from "react";

import { toast } from "sonner";

import styles from "./Login.module.css";

import Loading from "../utils/Loading";

export default function Login() {
	const router = useRouter();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	const [isLoading, setIsLoading] = useState(false);

	const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		if (!email || !password) {
			toast.warning(
				"Please fill in both email and password before signing in."
			);
			return;
		}

		setIsLoading(true);

		const { error } = await supabase.auth.signInWithPassword({
			email,
			password,
		});

		if (error) {
			const errorMessage =
				error.message === "Invalid login credentials"
					? "User not found or incorrect password. Please double-check your credentials."
					: "Something went wrong while signing in. Please try again later.";

			toast.error(errorMessage);
			setEmail("");
			setPassword("");
		} else {
			toast.success("Welcome back! You've signed in successfully.");
			router.push("/");
		}
		setIsLoading(false);
	};

	return (
		<form
			className={styles.form}
			onSubmit={(e) => {
				handleLogin(e);
			}}
		>
			<div className={styles.inputGroup}>
				<input
					id="email"
					type="text"
					name="email"
					autoComplete="off"
					className={styles.input}
					value={email}
					onChange={(e) => setEmail(e.target.value)}
				/>
				<label className={styles.userLabel} htmlFor="email">
					Email
				</label>
			</div>
			<div className={styles.inputGroup}>
				<input
					id="password"
					type="password"
					name="password"
					autoComplete="off"
					className={styles.input}
					value={password}
					onChange={(e) => setPassword(e.target.value)}
				/>
				<label className={styles.userLabel} htmlFor="password">
					Password
				</label>
			</div>
			<p className={styles.forgotPassword}>Forgot password?</p>
			<button className={styles.button} type="submit">
				{isLoading ? <Loading size="sm" /> : "Login"}
			</button>

			<div className={styles.link}>
				<i>No account?</i>
				<a href="signup">Signup</a>
			</div>
		</form>
	);
}
