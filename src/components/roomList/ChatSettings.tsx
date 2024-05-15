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
	console.log(dropdownRef);

	const [isDeleteRoom, setIsDeleteRoom] = useState(false);

	const [isModalOpen, setIsModalOpen] = useState(false);

	const { userId } = useAuthContext();

	const { friendId, setFriendId } = useUserContext();
	const [isAddFriend, setIsAddFriend] = useState(false);

	const { selectedChat, mutedChat, setEditChat, setSelectedChat } =
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
				setIsAddFriend(false);
				setIsDeleteRoom(false);
				setSelectedChat(null);
			}
		};

		const handleClickOnChannelButton = (e: MouseEvent) => {
			const target = e.target as HTMLElement;
			if (!target.classList.contains(styles.chatName)) {
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
	}, [setSelectedChat]);

	const handleDeleteRoom = async (roomID: number | null) => {
		const { error } = await supabase
			.from("members")
			.delete()
			.eq("room_id", roomID)
			.eq("user_id", userId);

		toast.success("You've left the room!");
		setIsModalOpen(false);
		setSelectedChat(null);
	};

	const handleSendFriendRequest = async (roomID: number | null) => {
		//  close the settings bar if modal is open
		setIsModalOpen(true);
		setSelectedChat(null);

		if (friendId === "") {
			toast.warning("You forgot to enter your friend's ID");
			return;
		}

		if (friendId === userId) {
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
		const { data: userCheck, error: userCheckError } = await supabase
			.from("requests")
			.select("id")
			.eq("receiver_id", friendId)
			.eq("sender_id", userId);

		if (userCheckError) {
			console.error("Error checking friend request:", userCheckError);
			return;
		}

		if (userCheck?.length > 0) {
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
			toast.warning("Your friend is already here!");
			return;
		}

		if (roomCheckError) {
			console.error("Error checking if friend is in room:", roomCheckError);
			return;
		}

		// Send friend request
		const { data, error } = await supabase
			.from("requests")
			.insert([{ sender_id: userId, receiver_id: friendId, room_id: roomID }])
			.select();

		if (error) {
			toast.error(
				"Something went wrong when sending your friend request, Please try again later."
			);
			console.error("Error sending friend request:", error);
			return;
		}

		setIsModalOpen(false);
		toast.success("Friend request sent successfully! Fingers crossed 🤞");
	};

	const handleCloseModal = () => {
		setIsModalOpen(false);
		setIsAddFriend(false);
		setSelectedChat(null);
	};
	return (
		<>
			{isModalOpen && (
				<div className={styles.overlay}>
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
										onClick={() => handleSendFriendRequest(selectedChat)}
									>
										Send
									</button>
								</div>
							</div>
						)}
					</div>
				</div>
			)}

			<div className={styles.overlay}>
				<div ref={dropdownRef} className={styles.container}>
					<button
						onClick={() => {
							setIsModalOpen(true);
							setIsAddFriend(true);
						}}
					>
						Add Friend <AiOutlineUserAdd />
					</button>
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
			</div>
		</>
	);
};

export default ChatSettings;