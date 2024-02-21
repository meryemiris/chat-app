import { useContext, useEffect, useState } from "react";
import styles from "./UnreadMessage.module.css";

import AuthContext from "@/lib/AuthContext";
import MessageContext from "@/lib/MessageContext";
import RoomContext from "@/lib/RoomContext";

import { Message } from "@/types";

type Props = {
  roomID: number;
};

const UnreadMessages: React.FC<Props> = ({ roomID }) => {
  const { userId } = useContext(AuthContext);
  const { mutedRooms } = useContext(RoomContext);
  const { unreadMessages } = useContext(MessageContext);

  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);

  useEffect(() => {
    const roomUnreads = unreadMessages.filter(
      (message: Message) => message.channel_id === roomID
    );
    setUnreadMessagesCount(roomUnreads.length);
  }, [unreadMessages, roomID, userId]);

  return (
    unreadMessagesCount > 0 &&
    !mutedRooms.includes(roomID) && (
      <div className={styles.unread}>
        {unreadMessagesCount +
          (unreadMessagesCount > 1 ? " new messages" : " new message")}
      </div>
    )
  );
};

export default UnreadMessages;
