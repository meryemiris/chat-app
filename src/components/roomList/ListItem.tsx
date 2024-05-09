import { useState } from "react";
import { supabase } from "@/lib/supabase";
import Image from "next/image";

import styles from "./ListItem.module.css";

import UnreadMessages from "./UnreadMessage";

import ActionButtons from "./ActionButtons";

import { GoMute } from "react-icons/go";
import { useChatContext } from "@/lib/ChatContext";

type RoomListItemProps = {
	roomID: number;
	roomName: string;
	isMuted: boolean;
};

const ListItem: React.FC<RoomListItemProps> = ({
	roomID,
	roomName,
	isMuted,
}) => {
	const [newRoomName, setNewRoomName] = useState<string>("");

	const { setUnreadMsgsChatIds, setUnreadMsgs, activeChatId, selectedChatId } =
		useChatContext();

	const handleSaveRoom = async (
		id: number,
		e: React.FormEvent<HTMLFormElement>
	) => {
		e.preventDefault();
		const { data, error } = await supabase
			.from("channels")
			.update({ name: newRoomName })
			.eq("id", selectedChatId);
	};

	const handleReadMessages = (roomID: number) => {
		setUnreadMsgsChatIds((prev) => prev.filter((id) => id !== roomID));
		setUnreadMsgs((prev) =>
			prev.filter((message) => message.chatroom_id !== roomID)
		);
	};

	return (
		<>
			<button
				onClick={() => {
					handleReadMessages(roomID);
				}}
				className={styles.channelButton}
			>
				<Image
					src={"/activeRoomPic.png"}
					alt="chat room icon"
					width={30}
					height={30}
				/>

				{selectedChatId === roomID ? (
					<form
						className={styles.channelNameForm}
						onSubmit={(e) => handleSaveRoom(roomID, e)}
					>
						<input
							className={styles.channelName}
							type="text"
							defaultValue={roomName}
							maxLength={35}
							onChange={(e) => setNewRoomName(e.target.value)}
							autoFocus
						/>
					</form>
				) : (
					<p className={styles.channelName}>{roomName}</p>
				)}

				{isMuted && (
					<div className={styles.muted}>
						<GoMute />
					</div>
				)}
			</button>

			{activeChatId !== roomID && <UnreadMessages roomID={roomID} />}
			<ActionButtons roomID={roomID} isMuted={isMuted} />
		</>
	);
};

export default ListItem;
