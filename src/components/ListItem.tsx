import { useContext, useEffect, useRef, useState } from "react";

import styles from "./ListItem.module.css";

import { Channel } from "@/types";

import { supabase } from "@/lib/supabase";
import RoomContext from "@/lib/RoomContext";
import MessageContext from "@/lib/MessageContext";

import UnreadMessages from "./UnreadMessage";

import {
  AiOutlineDelete,
  AiOutlineEdit,
  AiOutlineLogout,
  AiOutlineUserAdd,
} from "react-icons/ai";
import { MdCheckCircleOutline } from "react-icons/md";
import { SlOptionsVertical } from "react-icons/sl";
import { GoMute, GoUnmute } from "react-icons/go";

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
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { setRoomIdsWithUnreadMessages, setUnreadMessages } =
    useContext(MessageContext);

  const [channelName, setChannelName] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);

  const {
    activeChannelId,
    setActiveChannelId,
    setActiveChannelName,
    mutedRooms,
    setMutedRooms,
  } = useContext(RoomContext);

  useEffect(() => {
    const handleClickOutsideDropdown = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownVisible(false);
      }
    };

    const handleClickOnChannelButton = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.classList.contains(styles.channelName)) {
        setIsEditing(false);
      }
    };

    const handleClick = (e: MouseEvent) => {
      handleClickOutsideDropdown(e);
      handleClickOnChannelButton(e);
    };

    document.addEventListener("mousedown", handleClick);

    return () => {
      document.removeEventListener("mousedown", handleClick);
    };
  }, []);

  const handleDeleteRoom = async (id: number) => {
    const { data, error } = await supabase
      .from("channels")
      .delete()
      .eq("id", id);

    setChannels((prev) => prev.filter((channel) => activeChannelId !== id));
  };

  const handleEditRoom = (id: number) => {
    setIsEditing(true);
    setActiveChannelId(id);
  };

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

  const handleToggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };

  const handleToggleMute = (roomID: number) => {
    setMutedRooms((prev) => {
      if (prev.includes(roomID)) {
        return prev.filter((id) => id !== roomID);
      } else {
        return [...prev, roomID];
      }
    });
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
          <div
            className={`${styles.kebabMenu} ${styles.showLeft}`}
            ref={dropdownRef}
          >
            <button className={styles.threeDots} onClick={handleToggleDropdown}>
              <SlOptionsVertical />
            </button>
            <div
              id="dropdown"
              className={`${styles.dropdown} ${
                dropdownVisible ? styles.show : ""
              }`}
            >
              {/* TODO: add are you sure modal */}
              <button onClick={() => handleToggleMute(roomID)}>
                {mutedRooms.includes(roomID) ? (
                  <>
                    Unmute <GoUnmute />
                  </>
                ) : (
                  <>
                    Mute <GoMute />
                  </>
                )}
              </button>

              <button>
                Add Friend <AiOutlineUserAdd />
              </button>
              <button
                onClick={() => {
                  handleToggleDropdown();
                  handleEditRoom(roomID);
                }}
              >
                Edit Room <AiOutlineEdit />
              </button>
              <button onClick={() => handleDeleteRoom(roomID)}>
                Delete Room <AiOutlineDelete />
              </button>
              <button style={{ color: "red" }}>
                Leave Room <AiOutlineLogout />
              </button>
            </div>
          </div>
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
