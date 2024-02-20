import { useContext, useEffect, useRef, useState } from "react";
import styles from "./ListItem.module.css";

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

type Props = {
  roomID: number;
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
  setChannels: React.Dispatch<React.SetStateAction<Channel[]>>;
};

const ActionButtons: React.FC<Props> = ({
  roomID,
  setIsEditing,
  setChannels,
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const { activeChannelId, setActiveChannelId, setMutedRooms, mutedRooms } =
    useContext(RoomContext);

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

  return (
    <div className={`${styles.kebabMenu} ${styles.showLeft}`} ref={dropdownRef}>
      <button className={styles.threeDots} onClick={handleToggleDropdown}>
        <SlOptionsVertical />
      </button>
      <div
        id="dropdown"
        className={`${styles.dropdown} ${dropdownVisible ? styles.show : ""}`}
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
  );
};

export default ActionButtons;
