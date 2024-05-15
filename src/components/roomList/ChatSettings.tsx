import { useEffect, useRef, useState } from "react";
import styles from "./ChatSettings.module.css";

import { supabase } from "@/lib/supabase";
import { useAuthContext } from "@/lib/AuthContext";
import { useUserContext } from "@/lib/UserContext";

import {
	AiOutlineClose,
	AiOutlineEdit,
	AiOutlineLogout,
	AiOutlineUserAdd,
} from "react-icons/ai";
import { GoMute, GoQuestion, GoUnmute } from "react-icons/go";
import { toast } from "sonner";
import { useChatContext } from "@/lib/ChatContext";

const ChatSettings = () => {
	const dropdownRef = useRef<HTMLDivElement>(null);

	const [isDeleteRoom, setIsDeleteRoom] = useState(false);

	const [isModalOpen, setIsModalOpen] = useState(false);

	const { userId } = useAuthContext();

	const { friendId, setFriendId } = useUserContext();
	const [isAddFriend, setIsAddFriend] = useState(false);

	const { activeChatId, selectedChat, mutedChat, setEditChat } =
		useChatContext();

	const handleMute = async (roomID: number | null) => {
		const { data, error } = await supabase
			.from("members")
			.update({ isMuted: true })
			.eq("room_id", roomID)
			.eq("user_id", userId)
			.select();

		if (error) console.log(error.message);
	};

	const handleUnmute = async (roomID: number) => {
		const { data, error } = await supabase
			.from("members")
			.update({ isMuted: false })
			.eq("room_id", roomID)
			.eq("user_id", userId)
			.select();
	};

	useEffect(() => {
		const handleClickOutsideDropdown = (e: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(e.target as Node)
			) {
				setIsModalOpen(false);
			}
		};

		const handleClickOnChannelButton = (e: MouseEvent) => {
			const target = e.target as HTMLElement;
			if (!target.classList.contains(styles.channelName)) {
			}
		};

		const handleClick = (e: MouseEvent) => {
			handleClickOutsideDropdown(e);
			handleClickOnChannelButton(e);
		};

		document.addEventListener("mousedown", handleClick);

		return () => {
			document.removeEventListener("mousedown", handleClick);
		};
	}, []);

	const handleDeleteRoom = async (roomID: number | null) => {
		const { error } = await supabase
			.from("members")
			.delete()
			.eq("room_id", roomID)
			.eq("user_id", userId);

		toast.success("You've left the room!");
		setIsModalOpen(false);
	};

	const handleSendFriendRequest = async (roomID: number | null) => {
		if (friendId === "") {
			setIsModalOpen(true);
			toast.warning("You forgot to enter your friend's ID");
			setIsModalOpen(false);

			return;
		}

		if (friendId === userId) {
			setIsModalOpen(true);
			toast.warning("You can't be friends with yourself, but you're awesome!");
			return;
		}

		//check if friend exists
		const { data: friendCheck, error: friendCheckError } = await supabase
			.from("users")
			.select("id")
			.eq("id", friendId);

		if (friendCheckError) {
			console.error("Error checking if friend exists:", friendCheckError);

			toast.error(
				"No luck finding your friend. Please check the ID and try again!"
			);
			return;
		}

		// Check if friend request already sent
		const { data: userCheck, error } = await supabase
			.from("requests")
			.select("id")
			.eq("receiver_id", friendId)
			.eq("sender_id", userId);

		if (error) {
			console.error("Error checking friend request:", error);
			return;
		}

		if (userCheck?.length > 0) {
			setIsModalOpen(true);
			toast.warning(
				"You've already sent a friend request to this user. Patience, friend!"
			);
			return;
		}

		// Check if friend is already in the room
		const { data: roomCheck, error: roomCheckError } = await supabase
			.from("members")
			.select("id")
			.eq("room_id", roomID)
			.eq("user_id", friendId);

		if (roomCheck && roomCheck.length > 0) {
			setIsModalOpen(true);
			toast.warning("Your friend is already here!");
			return;
		}

		if (roomCheckError) {
			console.error("Error checking if friend is in room:", roomCheckError);
			return;
		}

		try {
			// Send friend request
			const { data, error } = await supabase
				.from("requests")
				.insert([{ sender_id: userId, receiver_id: friendId, room_id: roomID }])
				.select();
		} catch (error) {
			console.error("Error sending friend request:", error);
		} finally {
			setIsModalOpen(false);
			toast.success("Friend request sent successfully! Fingers crossed 🤞");
		}
	};

	const handleCloseModal = () => {
		setIsModalOpen(false);
		setIsAddFriend(false);
	};
	return (
		<>
			{isModalOpen && (
				<div className={styles.modalOverlay}>
					<div className={styles.modal}>
						<button
							className={styles.closeModal}
							onClick={() => handleCloseModal()}
						>
							<AiOutlineClose />
						</button>

						{isDeleteRoom && (
							<div className={styles.leaveRoom}>
								<GoQuestion className={styles.questionIcon} />

								<p>
									Keep in mind, leaving will remove it from your list of rooms.
								</p>
								<div className={styles.leaveRoomButtons}>
									<button
										className={styles.leaveButton}
										onClick={() => handleDeleteRoom(selectedChat)}
									>
										Leave
									</button>

									<button
										className={styles.stayButton}
										onClick={() => handleCloseModal()}
									>
										Keep chatting
									</button>
								</div>
							</div>
						)}

						{isAddFriend && (
							<div className={styles.addFriend}>
								<p>Enter the ID of your friend to add:</p>
								<div className={styles.pasteId}>
									<input
										className={styles.pasteIdInput}
										type="text"
										onChange={(e) => setFriendId(e.target.value)}
									/>
									<button
										className={styles.addFriendButton}
										onClick={() => handleSendFriendRequest(activeChatId)}
									>
										Send
									</button>
								</div>
							</div>
						)}
					</div>
				</div>
			)}

			<div id="dropdown">
				<button
					onClick={() => {
						mutedChat && selectedChat
							? handleUnmute(selectedChat)
							: handleMute(selectedChat);
					}}
				>
					{mutedChat ? "Unmute" : "Mute"}
					{mutedChat ? <GoUnmute /> : <GoMute />}
				</button>

				<button
					onClick={() => {
						setIsModalOpen(true);
						setIsAddFriend(true);
					}}
				>
					Add Friend <AiOutlineUserAdd />
				</button>
				<button onClick={() => setEditChat(selectedChat)}>
					Edit Room <AiOutlineEdit />
				</button>
				<button
					onClick={() => {
						setIsModalOpen(true);
						setIsDeleteRoom(true);
					}}
					style={{ color: "red" }}
				>
					Leave Room <AiOutlineLogout />
				</button>
			</div>
		</>
	);
};

export default ChatSettings;
