import { useState } from "react";
import { supabase } from "@/lib/supabase";
import Image from "next/image";

import styles from "./ListItem.module.css";

import UnreadMessages from "./UnreadMessage";

import { GoMute } from "react-icons/go";
import { useChatContext } from "@/lib/ChatContext";
import { SlOptionsVertical } from "react-icons/sl";

type RoomListItemProps = {
	roomID: number;
	roomName: string;
	isMuted: boolean;
};

const memberImg = "/defaultPp.png";

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

				<div className={styles.members}>
					<Image
						src={memberImg}
						alt="members profile pic"
						width={20}
						height={20}
					/>
					<Image
						src={memberImg}
						alt="members profile pic"
						width={20}
						height={20}
					/>
					<Image
						src={memberImg}
						alt="members profile pic"
						width={20}
						height={20}
					/>
				</div>
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
					<SlOptionsVertical />
				</button>
			</div>

			{/* {activeChatId !== roomID && <UnreadMessages roomID={roomID} />} */}
		</div>
	);
};

export default ListItem;
