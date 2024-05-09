import { useContext, useState } from "react";

import { supabase } from "@/lib/supabase";

import Messages from "./Messages";

import styles from "./ChatRoom.module.css";

import { IoSearch, IoSend } from "react-icons/io5";
import { RiEmojiStickerLine } from "react-icons/ri";
import { IoIosArrowBack } from "react-icons/io";

import { FaInfoCircle } from "react-icons/fa";
import { useAuthContext } from "@/lib/AuthContext";
import { useChatContext } from "@/lib/ChatContext";
import RoomDetails from "./RoomDetails";

export default function ChatRoom() {
	const { activeChatId, setActiveChatId } = useChatContext();
	const { userId } = useAuthContext();
	const [searchTerm, setSearchTerm] = useState("");
	const [showRoomDetails, setShowRoomDetails] = useState(false);

	const time = new Date().toLocaleTimeString([], {
		hour: "2-digit",
		minute: "2-digit",
	});

	const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const formData = new FormData(e.currentTarget);
		const message = formData.get("message");

		if (!message) return;

		try {
			const { data, error } = await supabase
				.from("messages")
				.insert([
					{
						content: message,
						created_at: time,
						chatroom_id: activeChatId,
						user_id: userId,
					},
				])
				.select();
		} catch (error) {
			console.log(error);
		}
		if (e.target instanceof HTMLFormElement) {
			e.target.reset();
		}
		console.log("subscribe");
	};

	const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearchTerm(e.target.value);
	};

	return (
		<>
			{" "}
			<div className={styles.container}>
				<header className={styles.header}>
					<button
						className={styles.backButton}
						onClick={() => setActiveChatId(null)}
					>
						<IoIosArrowBack />
					</button>
					<div className={styles.titleWrapper}>
						<p className={styles.title}>{activeChatId}</p>
						<button
							className={styles.infoButton}
							onClick={() => setShowRoomDetails(true)}
						>
							<FaInfoCircle />
						</button>
					</div>

					<>
						<div className={styles.inputWrapper}>
							<button className={styles.icon}>
								<IoSearch />
							</button>
							<input
								type="text"
								name="text"
								className={styles.searchInput}
								placeholder="search.."
								value={searchTerm}
								onChange={handleSearch}
							/>
						</div>
					</>
				</header>
				<Messages searchTerm={searchTerm} />
				<footer className={styles.footer}>
					<button className={styles.emojiButton}>
						<RiEmojiStickerLine />
					</button>

					<form onSubmit={handleSendMessage} className={styles.sendBox}>
						<input
							type="text"
							placeholder={"Type something..."}
							name="message"
							autoComplete="off"
						/>
						<button type="submit">
							<IoSend />
						</button>
					</form>
				</footer>
			</div>
			{showRoomDetails && (
				<div className={styles.roomDetails}>
					<RoomDetails setShowRoomDetails={setShowRoomDetails} />
				</div>
			)}
		</>
	);
}
