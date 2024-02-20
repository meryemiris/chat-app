import { useContext, useEffect, useRef, useState } from "react";

import styles from "./ListItem.module.css";

import { Channel } from "@/types";

import { supabase } from "@/lib/supabase";
import RoomContext from "@/lib/RoomContext";
import MessageContext from "@/lib/MessageContext";

import UnreadMessages from "./UnreadMessage";

import { MdCheckCircleOutline } from "react-icons/md";
import { GoMute } from "react-icons/go";
import Image from "next/image";
import ActionButtons from "./ActionButtons";

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
  const { setRoomIdsWithUnreadMessages, setUnreadMessages } =
    useContext(MessageContext);

  const [channelName, setChannelName] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);

  const {
    activeChannelId,
    setActiveChannelId,
    setActiveChannelName,
    mutedRooms,
  } = useContext(RoomContext);

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
    setRoomIdsWithUnreadMessages((prev) => prev.filter((id) => id !== roomID));
    setUnreadMessages((prev) =>
      prev.filter((message) => message.channel_id !== roomID)
    );
    setActiveChannelId(roomID);
    setActiveChannelName(roomName);
  };

  return (
    <>
      <button
        onClick={() => {
          setActiveChannelId(roomID);
          setActiveChannelName(roomName);
          handleReadMessages(roomID, roomName);
        }}
        className={
          activeChannelId === roomID
            ? `${styles.channelButton} ${styles.active}`
            : styles.channelButton
        }
      >
        <Image
          src={
            activeChannelId === roomID
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
            <button className={styles.saveButton} type="submit">
              <MdCheckCircleOutline />
            </button>
          </form>
        ) : (
          <p className={styles.channelName}>{roomName}</p>
        )}
        {activeChannelId === roomID && (
          <ActionButtons
            roomID={roomID}
            setChannels={setChannels}
            setIsEditing={setIsEditing}
          />
        )}
        {mutedRooms.includes(roomID) && activeChannelId !== roomID && (
          <div className={styles.muted}>
            <GoMute />
          </div>
        )}
      </button>

      {activeChannelId !== roomID && !mutedRooms.includes(roomID) && (
        <UnreadMessages roomID={roomID} />
      )}
    </>
  );
};

export default ListItem;
