import { useRef, useState } from "react";

import { supabase } from "@/lib/supabase";
import { useAuthContext } from "@/lib/AuthContext";
import { useChatContext } from "@/lib/ChatContext";

import Messages from "./Messages";
import styles from "./ChatRoom.module.css";
import RoomDetails from "./RoomDetails";
import { toast } from "sonner";

import {
	RiArrowLeftSLine,
	RiEmojiStickerLine,
	RiInformationLine,
	RiSearchLine,
	RiSendPlaneLine,
} from "react-icons/ri";

export default function ChatRoom() {
	const { activeChatId, setActiveChatId } = useChatContext();
	const { userId } = useAuthContext();
	const [searchTerm, setSearchTerm] = useState("");
	const [showRoomDetails, setShowRoomDetails] = useState(false);

	const searchInputRef = useRef<HTMLInputElement>(null);

	const time = new Date().toLocaleTimeString([], {
		hour: "2-digit",
		minute: "2-digit",
	});

	const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const formData = new FormData(e.currentTarget);
		const message = formData.get("message");

		if (!message) return;

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
		if (error) toast.error(error.message);

		if (e.target instanceof HTMLFormElement) {
			e.target.reset();
		}
	};

	const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearchTerm(e.target.value);
	};

	const handleFocusSearch = () => {
		if (searchInputRef.current) {
			searchInputRef.current.focus();
		}
	};

	return (
		<>
			<div className={styles.container}>
				<header className={styles.header}>
					<button
						className={styles.backButton}
						onClick={() => setActiveChatId(null)}
					>
						<RiArrowLeftSLine />
					</button>
					<div className={styles.titleWrapper}>
						<p className={styles.title}>{activeChatId}</p>
						<button
							className={styles.infoButton}
							onClick={() => setShowRoomDetails(true)}
						>
							<RiInformationLine />
						</button>
					</div>

					<>
						<div className={styles.inputWrapper}>
							<button className={styles.searchIcon} onClick={handleFocusSearch}>
								<RiSearchLine />
							</button>
							<input
								type="text"
								name="text"
								ref={searchInputRef}
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
							<RiSendPlaneLine />
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
