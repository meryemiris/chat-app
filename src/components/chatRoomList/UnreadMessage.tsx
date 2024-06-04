import { useEffect, useState } from "react";
import styles from "./UnreadMessage.module.css";

import { useAuthContext } from "@/lib/AuthContext";

import { Message } from "@/types";
import { useChatContext } from "@/lib/ChatContext";

type Props = {
	roomID: number;
};

const UnreadMessages: React.FC<Props> = ({ roomID }) => {
	const { userId } = useAuthContext();
	const { unreadMsgs, unreadMsgsChatIds } = useChatContext();

	const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);

	useEffect(() => {
		const roomUnreads = unreadMsgs.filter(
			(message: Message) => message.chatroom_id === roomID
		);
		setUnreadMessagesCount(roomUnreads.length);
	}, [unreadMsgs, roomID, userId]);

	return (
		unreadMessagesCount > 0 &&
		unreadMsgsChatIds?.includes(roomID) && (
			<div className={styles.unread}>
				{unreadMessagesCount +
					(unreadMessagesCount > 1 ? " new messages" : " new message")}
			</div>
		)
	);
};

export default UnreadMessages;
