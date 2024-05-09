import { useContext, useEffect, useState } from "react";
import styles from "./UnreadMessage.module.css";

import { useAuthContext } from "@/lib/AuthContext";
import { useUnreadsContext } from "@/lib/UnreadsContext";

import RoomContext from "@/lib/RoomContext";

import { Message } from "@/types";

type Props = {
	roomID: number;
};

const UnreadMessages: React.FC<Props> = ({ roomID }) => {
	const { userId } = useAuthContext();
	const { mutedRooms } = useContext(RoomContext);
	const { unreads } = useUnreadsContext();

	const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);

	useEffect(() => {
		const roomUnreads = unreads.filter(
			(message: Message) => message.channel_id === roomID
		);
		setUnreadMessagesCount(roomUnreads.length);
	}, [unreads, roomID, userId]);

	return (
		unreadMessagesCount > 0 &&
		!mutedRooms?.includes(roomID) && (
			<div className={styles.unread}>
				{unreadMessagesCount +
					(unreadMessagesCount > 1 ? " new messages" : " new message")}
			</div>
		)
	);
};

export default UnreadMessages;
