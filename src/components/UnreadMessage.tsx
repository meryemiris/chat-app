import { useContext, useEffect, useState } from "react";
import styles from "./ListItem.module.css";

import AuthContext from "@/lib/AuthContext";
import MessageContext from "@/lib/MessageContext";
import { Message } from "@/types";
import ChannelsContext from "@/lib/ChannelsContext";
import { supabase } from "@/lib/supabase";

type Props = {
  roomID: number;
};

const UnreadMessages: React.FC<Props> = ({ roomID }) => {
  const { userId } = useContext(AuthContext);
  const { activeChannelId } = useContext(ChannelsContext);

  const { unreadMessages, roomIdsWithUnreadMessages } =
    useContext(MessageContext);

  console.log("unreads", unreadMessages);
  console.log("roomIds", roomIdsWithUnreadMessages);

  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  console.log("count", unreadMessagesCount);

  useEffect(() => {
    const roomUnreads = unreadMessages.filter(
      (message: Message) => message.channel_id === roomID
    );
    setUnreadMessagesCount(roomUnreads.length);
    console.log("unreadMessagesRoom", roomUnreads);
  }, [unreadMessages, roomID, userId]);

  return (
    unreadMessagesCount > 0 && (
      <div className={styles.newMessage}>
        {unreadMessagesCount +
          (unreadMessagesCount > 1 ? " new messages" : " new message")}
      </div>
    )
  );
};

export default UnreadMessages;
