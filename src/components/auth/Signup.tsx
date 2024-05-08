import { useState } from "react";
import { supabase } from "../../lib/supabase";

import styles from "./Login.module.css";

import { toast } from "sonner";
import Loading from "../utils/Loading";

export default function Signup() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [username, setUsername] = useState("");

	const [isLoading, setIsLoading] = useState(false);

	const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		const usernameCheck = await supabase
			.from("users")
			.select("username")
			.eq("username", username);

		const emailCheck = await supabase
			.from("users")
			.select("email")
			.eq("email", email);

		if (!email || !password || !username) {
			toast.warning("Please fill in all fields before signing in.");
			return;
		}

		if (emailCheck.data && emailCheck.data.length > 0) {
			toast.warning("Please try another email.");
			return;
		}
		if (usernameCheck.data && usernameCheck.data.length > 0) {
			toast.warning("Username already taken. Please choose another one.");
			return;
		}

		const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailPattern.test(email)) {
			toast.warning("Please enter a valid email address.");
			return;
		}

		if (password.length < 6) {
			toast.warning("Please enter a valid password (at least 6 characters).");
			return;
		}

		setIsLoading(true);

		const {
			data: { user },
			error,
		} = await supabase.auth.signUp({
			email,
			password,
			options: {
				data: { username },
				emailRedirectTo: "https://chat-app-eight-lilac.vercel.app",
			},
		});

		setIsLoading(false);

		if (error) {
			toast.error(error.message);
			return;
		}

		setIsLoading(false);

		if (user) {
			const { data, error: insertError } = await supabase
				.from("users")
				.insert([
					{
						id: user.id,
						username: username,
						email: email,
						profile_img: "",
					},
				])
				.select();

			if (insertError) {
				console.log("Error inserting user:", insertError);
			} else console.log("User inserted successfully:", data);
		}

		toast.success(`Welcome to Mushroom! 🍄,
		\nPlease check your email (${email}) and confirm your account. `);
		setEmail("");
		setPassword("");
		setUsername("");
	};

	return (
		<form onSubmit={handleRegister} className={styles.form}>
			<h1>Start Now!</h1>
			<h2>Join for Free.</h2>
			<div className={styles.inputGroup}>
				<input
					value={email}
					className={styles.input}
					type="email"
					id="email"
					onChange={(e) => setEmail(e.currentTarget.value)}
				/>
				<label className={styles.userLabel} htmlFor="email">
					Email
				</label>
			</div>

			<div className={styles.inputGroup}>
				<input
					value={username}
					className={styles.input}
					type="text"
					id="username"
					onChange={(e) => setUsername(e.currentTarget.value)}
				/>
				<label className={styles.userLabel} htmlFor="username">
					Username
				</label>
			</div>
			<div className={styles.inputGroup}>
				<input
					value={password}
					className={styles.input}
					type="password"
					id="password"
					onChange={(e) => setPassword(e.currentTarget.value)}
				/>
				<label className={styles.userLabel} htmlFor="password">
					Password
				</label>
			</div>
			<button className={styles.button}>
				{isLoading ? <Loading size="sm" /> : "Sign Up"}
			</button>

			<div className={styles.link}>
				<i>Already have an account?</i>
				<a href="login">Login</a>
			</div>
		</form>
	);
}
