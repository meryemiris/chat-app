import { useState } from "react";
import { supabase } from "@/lib/supabase";

import styles from "./ListItem.module.css";

import { GoMute } from "react-icons/go";
import { useChatContext } from "@/lib/ChatContext";

import { RiMore2Line } from "react-icons/ri";

type RoomListItemProps = {
	roomID: number;
	roomName: string;
	isMuted: boolean;
	members: { username: string; profile_img: string; id: string }[];
};

const ListItem: React.FC<RoomListItemProps> = ({
	roomID,
	roomName,
	isMuted,
}) => {
	const [newRoomName, setNewRoomName] = useState<string>("");
	const {
		setUnreadMsgsChatIds,
		setUnreadMsgs,
		setActiveChatId,
		setSelectedChat,
		editChat,
		setEditChat,
		setIsChatControlOpen,
	} = useChatContext();

	const handleSaveRoom = async (
		id: number,
		e: React.FormEvent<HTMLFormElement>
	) => {
		e.preventDefault();
		const { data, error } = await supabase
			.from("channels")
			.update({ name: newRoomName })
			.eq("id", roomID);

		setEditChat(null);
	};

	const handleReadMessages = (roomID: number) => {
		setUnreadMsgsChatIds((prev) => prev.filter((id) => id !== roomID));
		setUnreadMsgs((prev) =>
			prev.filter((message) => message.chatroom_id !== roomID)
		);
	};

	return (
		<div className={styles.container}>
			<button
				onClick={() => {
					handleReadMessages(roomID);
					setActiveChatId(roomID);
				}}
				className={styles.chatContent}
			>
				{editChat === roomID ? (
					<form
						className={styles.chatNameForm}
						onSubmit={(e) => handleSaveRoom(roomID, e)}
					>
						<input
							className={styles.chatName}
							type="text"
							defaultValue={roomName}
							maxLength={45}
							onChange={(e) => setNewRoomName(e.target.value)}
							autoFocus
						/>
					</form>
				) : (
					<p className={styles.chatName}>{roomName}</p>
				)}
			</button>

			<div className={styles.chatActions}>
				<div className={styles.muted}>{isMuted && <GoMute />}</div>

				<button
					className={styles.threeDots}
					onClick={() => {
						setSelectedChat(roomID);
						setIsChatControlOpen(true);
					}}
				>
					<RiMore2Line />
				</button>
			</div>

			{/* {activeChatId !== roomID && <UnreadMessages roomID={roomID} />} */}
		</div>
	);
};

export default ListItem;
