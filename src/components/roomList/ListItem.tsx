import { useContext, useState } from "react";

import styles from "./ListItem.module.css";

import { Channel } from "@/types";

import { supabase } from "@/lib/supabase";
import RoomContext from "@/lib/RoomContext";

import UnreadMessages from "./UnreadMessage";

import { GoMute } from "react-icons/go";
import Image from "next/image";
import ActionButtons from "./ActionButtons";
import { useAuthContext } from "@/lib/AuthContext";
import { useUnreadsContext } from "@/lib/UnreadsContext";

type RoomListItemProps = {
	roomID: number;
	roomName: string;
	setChannels: React.Dispatch<React.SetStateAction<Channel[]>>;
};

const ListItem: React.FC<RoomListItemProps> = ({
	roomID,
	roomName,
	setChannels,
}) => {
	const { setUnreads, setUnreadsChatIds } = useUnreadsContext();

	const [channelName, setChannelName] = useState<string>("");
	const [isEditing, setIsEditing] = useState(false);

	const { userId } = useAuthContext();

	const {
		activeChannelId,
		setActiveChannelId,
		setActiveChannelName,
		mutedRooms,
	} = useContext(RoomContext);

	const [isMember, setIsMember] = useState(true);

	const handleSaveRoom = async (
		id: number,
		e: React.FormEvent<HTMLFormElement>
	) => {
		e.preventDefault();
		const { data, error } = await supabase
			.from("channels")
			.update({ name: channelName })
			.eq("id", activeChannelId);
		if (data) {
			setChannels((prevChannels) =>
				prevChannels.map((channel) =>
					activeChannelId === id ? { ...channel, name: channelName } : channel
				)
			);
		}
		setIsEditing(false);
	};

	const handleReadMessages = (roomID: number, roomName: string) => {
		setUnreadsChatIds((prev) => prev.filter((id) => id !== roomID));
		setUnreads((prev) =>
			prev.filter((message) => message.channel_id !== roomID)
		);
		setActiveChannelId(roomID);
		setActiveChannelName(roomName);
	};

	const handleActiveChannel = async (roomID: number) => {
		try {
			await Promise.all([
				supabase
					.from("members")
					.update({ isActive: false })
					.eq("user_id", userId)
					.neq("room_id", roomID)
					.select(),

				supabase
					.from("members")
					.update({ isActive: true })
					.eq("user_id", userId)
					.eq("room_id", roomID)
					.select(),
			]);

			setActiveChannelId(roomID);
		} catch (error) {
			console.log(error);
		}
	};

	return (
		<>
			<button
				onClick={() => {
					handleActiveChannel(roomID);
					setActiveChannelName(roomName);
					handleReadMessages(roomID, roomName);
				}}
				className={
					activeChannelId === roomID && isMember
						? `${styles.channelButton} ${styles.active}`
						: styles.channelButton
				}
			>
				<Image
					src={
						activeChannelId === roomID && isMember
							? "/activeRoomPic.png"
							: "/inactiveRoomPic.png"
					}
					alt="room"
					width={30}
					height={30}
				/>

				{isEditing && activeChannelId === roomID ? (
					<form
						className={styles.channelNameForm}
						onSubmit={(e) => handleSaveRoom(roomID, e)}
					>
						<input
							className={styles.channelName}
							type="text"
							defaultValue={roomName}
							maxLength={35}
							onChange={(e) => setChannelName(e.target.value)}
							autoFocus
						/>
					</form>
				) : (
					<p className={styles.channelName}>{roomName}</p>
				)}

				{mutedRooms?.includes(roomID) && (
					<div className={styles.muted}>
						<GoMute />
					</div>
				)}
			</button>

			{!isMember && activeChannelId !== roomID && (
				<p className={styles.nonMember}>You are not a member of this room.</p>
			)}
			{activeChannelId !== roomID && !mutedRooms?.includes(roomID) && (
				<UnreadMessages roomID={roomID} />
			)}
			{activeChannelId === roomID && (
				<ActionButtons
					roomID={roomID}
					setChannels={setChannels}
					setIsEditing={setIsEditing}
					isMember={isMember}
					setIsMember={setIsMember}
				/>
			)}
		</>
	);
};

export default ListItem;
