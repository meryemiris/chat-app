import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";

import { toast } from "sonner";

import { useAuthContext } from "@/lib/AuthContext";
import { useUserContext } from "@/lib/UserContext";
import { supabase } from "@/lib/supabase";

import styles from "./Profile.module.css";

import { IoLogOut } from "react-icons/io5";
import { AiOutlineCopy } from "react-icons/ai";

export default function Profile() {
	const { userId } = useAuthContext();
	const bottomSheetRef = useRef<HTMLDivElement>(null);

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
	};

	const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		e.preventDefault();
		setUsername(e.target.value);
	};

	const updateUsername = async () => {
		const { data, error } = await supabase
			.from("users")
			.update({ username: username })
			.eq("id", userId)
			.select();
		setIsEdit(false);
	};

	const updateProfileImg = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setIsEdit(false);

		const { data, error } = await supabase
			.from("users")
			.update({ profile_img: profileImg })
			.eq("id", userId)
			.select();

		if (error) toast.error(error.message);
		else toast.success("Profile image updated!");

		console.log("Response from Supabase:", data, error);
	};

	const handleCopyToClipboard = () => {
		navigator.clipboard.writeText(userId);
		toast.success("ID copied to clipboard!");
	};

	useEffect(() => {
		const handleClickOutsideBottomsheet = (e: MouseEvent) => {
			if (
				bottomSheetRef.current &&
				!bottomSheetRef.current.contains(e.target as Node)
			) {
				setIsEdit(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutsideBottomsheet);

		return () => {
			document.removeEventListener("mousedown", handleClickOutsideBottomsheet);
		};
	}, [bottomSheetRef]);

	return (
		<>
			<header className={styles.header}>
				<h1 className={styles.title}>Profile</h1>
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
			</header>
			<main className={styles.profile}>
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
						edit
					</button>

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
						>
							<AiOutlineCopy />
						</button>
					</div>
				</div>

				{isEdit && (
					<div className={styles.overlay}>
						<div className={styles.bottomSheet} ref={bottomSheetRef}>
							<header>
								<Image
									src={profileImg}
									alt="edit profile img"
									width={40}
									height={40}
								/>
								<h3>Edit Profile Picture</h3>
							</header>
							<form className={styles.profileForm} onSubmit={updateProfileImg}>
								<input
									type="file"
									name="profilePic"
									onChange={handleImageChange}
								/>
								<button type="submit">Update</button>
							</form>
						</div>
					</div>
				)}
			</main>
		</>
	);
}
