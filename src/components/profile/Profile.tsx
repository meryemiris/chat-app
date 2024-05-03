import Image from "next/image";
import styles from "./Profile.module.css";
import { useState } from "react";
import { useAuthContext } from "@/lib/AuthContext";
import { supabase } from "@/lib/supabase";
import { IoLogOut } from "react-icons/io5";
import { useRouter } from "next/router";
import { useUserContext } from "@/lib/UserContext";
import { AiOutlineCopy } from "react-icons/ai";

export default function Profile() {
	const { userId } = useAuthContext();

	const { profileImg, setProfileImg, username, setUsername } = useUserContext();

	const [isEdit, setIsEdit] = useState(false);

	const router = useRouter();

	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		e.preventDefault();
		const file = e.target.files?.[0];
		if (file) {
			const reader = new FileReader();
			reader.onloadend = () => {
				setProfileImg(reader.result as string);
			};
			reader.readAsDataURL(file);
		}
		setIsEdit(false);
	};

	const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		e.preventDefault();
		setUsername(e.target.value);
		setIsEdit(false);
	};

	const updateUsername = async () => {
		const { data, error } = await supabase
			.from("users")
			.update({ username: username })
			.eq("id", userId)
			.select();
	};

	const updateProfileImg = async () => {
		const { data, error } = await supabase
			.from("users")
			.update({ profile_img: profileImg })
			.eq("id", userId)
			.select();

		console.log("Response from Supabase:", data, error);
		setIsEdit(false);
	};

	const [copied, setCopied] = useState(false);

	const handleCopyToClipboard = () => {
		navigator.clipboard.writeText(userId).then(() => setCopied(true));
		setTimeout(() => {
			setCopied(false);
		}, 3000);
	};

	return (
		<div className={styles.profile}>
			<div className={styles.infos}>
				<Image
					src={profileImg}
					alt="profile image"
					width={100}
					height={100}
					style={{ borderRadius: "50%" }}
					priority
				/>
				<button
					onClick={() => setIsEdit(!isEdit)}
					className={styles.editProfile}
				>
					{!isEdit ? "Edit" : "Cancel"}
				</button>
				{isEdit && (
					<form className={styles.profileForm} onSubmit={updateProfileImg}>
						<input type="file" name="profilePic" onChange={handleImageChange} />
					</form>
				)}
				<form onSubmit={updateUsername}>
					<input
						className={styles.username}
						type="text"
						onChange={handleUsernameChange}
						name="username"
						value={username}
					/>
				</form>
			</div>

			<div className={styles.shareId}>
				<p>Share your ID! 🚀</p>
				<div className={styles.copyId}>
					<span className={styles.userId}>{userId}</span>
					<button
						className={styles.copyIdButton}
						onClick={handleCopyToClipboard}
						disabled={copied}
					>
						<AiOutlineCopy />
					</button>
				</div>
				{copied && (
					<p className={styles.copySuccess}>ID copied to clipboard! 🎉</p>
				)}
			</div>

			<button
				className={styles.logout}
				onClick={() => {
					router.push("/login");
					supabase.auth.signOut();
				}}
			>
				<div className={styles.icon}>
					<IoLogOut />
				</div>
				<div className={styles.text}>Logout</div>
			</button>
		</div>
	);
}
