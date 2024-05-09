import { useState } from "react";
import { supabase } from "@/lib/supabase";
import Image from "next/image";

import styles from "./ListItem.module.css";

import { useAuthContext } from "@/lib/AuthContext";

import UnreadMessages from "./UnreadMessage";

import ActionButtons from "./ActionButtons";

import { GoMute } from "react-icons/go";
import { useChatContext } from "@/lib/ChatContext";

type RoomListItemProps = {
	roomID: number;
	roomName: string;
};

const ListItem: React.FC<RoomListItemProps> = ({ roomID, roomName }) => {
	const { userId } = useAuthContext();

	const [newRoomName, setNewRoomName] = useState<string>("");
	const [isEditing, setIsEditing] = useState(false);

	const { setUnreadMsgsChatIds, setUnreadMsgs, activeChatId, setActiveChatId } =
		useChatContext();

	const handleSaveRoom = async (
		id: number,
		e: React.FormEvent<HTMLFormElement>
	) => {
		e.preventDefault();
		const { data, error } = await supabase
			.from("channels")
			.update({ name: newRoomName })
			.eq("id", activeChatId);

		setIsEditing(false);
	};

	const handleReadMessages = (roomID: number, roomName: string) => {
		setUnreadMsgsChatIds((prev) => prev.filter((id) => id !== roomID));
		setUnreadMsgs((prev) =>
			prev.filter((message) => message.chatroom_id !== roomID)
		);
	};

	return (
		<>
			<button
				onClick={() => {
					setActiveChatId(roomID);
					handleReadMessages(roomID, roomName);
				}}
				className={
					activeChatId === roomID
						? `${styles.channelButton} ${styles.active}`
						: styles.channelButton
				}
			>
				<Image
					src={"/activeRoomPic.png"}
					alt=" chat room icon"
					width={30}
					height={30}
				/>

				{isEditing && activeChatId === roomID ? (
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

				{/* <div className={styles.muted}>
						<GoMute />
					</div> */}
			</button>

			{/* {activeChatId !== roomID &&  (
				<UnreadMessages roomID={roomID} />
			)} */}

			{activeChatId === roomID && (
				<ActionButtons roomID={roomID} setIsEditing={setIsEditing} />
			)}
		</>
	);
};

export default ListItem;
