import { useContext, useEffect, useRef, useState } from "react";
import styles from "./ActionButtons.module.css";

import { supabase } from "@/lib/supabase";
import RoomContext from "@/lib/RoomContext";

import {
  AiOutlineDelete,
  AiOutlineEdit,
  AiOutlineLogout,
  AiOutlineUserAdd,
} from "react-icons/ai";
import { SlOptionsVertical } from "react-icons/sl";
import { GoMute, GoUnmute } from "react-icons/go";
import { Channel } from "@/types";
import AuthContext from "@/lib/AuthContext";

type Props = {
  roomID: number;
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
  setChannels: React.Dispatch<React.SetStateAction<Channel[]>>;
  isMember: boolean;
  setIsMember: React.Dispatch<React.SetStateAction<boolean>>;
};

const ActionButtons: React.FC<Props> = ({
  roomID,
  setIsEditing,
  setChannels,
  isMember,
  setIsMember,
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const { setActiveChannelId, setMutedRooms, mutedRooms } =
    useContext(RoomContext);
  const { userId } = useContext(AuthContext);

  // TODO: remove channels from supabase after add all functionalityes to the action buttons

  const handleDeleteRoom = async (roomID: number) => {
    const { data, error } = await supabase
      .from("channels")
      .delete()
      .eq("id", roomID);

    console.log(data, error);

    setChannels((prev) => prev.filter((channel) => channel.id !== roomID));
  };

  //   TODO: add are you sure modal
  // const handleDeleteRoom = (id: number) => {
  //   setChannels((prev) => prev.filter((channel) => channel.id !== roomID));
  // };

  const handleEditRoom = (id: number) => {
    setIsEditing(true);
    setActiveChannelId(id);
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
  }, [setIsEditing]);

  const handleLeaveRoom = async (roomID: number) => {
    const { error } = await supabase
      .from("members")
      .delete()
      .eq("room_id", roomID)
      .eq("user_id", userId);

    setIsMember(false);
    setDropdownVisible(false);
  };

  return (
    <div className={`${styles.kebabMenu} ${styles.showLeft}`} ref={dropdownRef}>
      <button
        style={isMember ? {} : { color: "gray" }}
        className={styles.threeDots}
        onClick={handleToggleDropdown}
      >
        <SlOptionsVertical />
      </button>
      <div
        id="dropdown"
        className={`${styles.dropdown} ${dropdownVisible ? styles.show : ""}`}
      >
        {isMember ? (
          <>
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
            <button
              onClick={() => handleLeaveRoom(roomID)}
              style={{ color: "red" }}
            >
              Leave Room <AiOutlineLogout />
            </button>
          </>
        ) : (
          <button onClick={() => handleDeleteRoom(roomID)}>
            Delete Room <AiOutlineDelete />
          </button>
        )}
      </div>
    </div>
  );
};

export default ActionButtons;
