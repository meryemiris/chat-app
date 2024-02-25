import { useContext, useEffect, useRef, useState } from "react";
import styles from "./ActionButtons.module.css";

import { supabase } from "@/lib/supabase";
import RoomContext from "@/lib/RoomContext";

import {
  AiOutlineClose,
  AiOutlineDelete,
  AiOutlineEdit,
  AiOutlineLogout,
  AiOutlineUserAdd,
} from "react-icons/ai";
import { SlOptionsVertical } from "react-icons/sl";
import { GoMute, GoUnmute } from "react-icons/go";
import { Channel } from "@/types";
import AuthContext from "@/lib/AuthContext";
import { FaPaste } from "react-icons/fa";

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

  const [friendUserId, setFriendId] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { userId } = useContext(AuthContext);

  // const friendUserId = "e980c3ea-c38a-48ba-8fc3-a24b7ae9c91b";

  // TODO: add functionalityes to the action buttons

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

  const handleMute = async (roomID: number) => {
    try {
      const { data, error } = await supabase
        .from("members")
        .update({ isMuted: true })
        .eq("room_id", roomID)
        .eq("user_id", userId)
        .select();

      if (!mutedRooms?.includes(roomID)) {
        setMutedRooms((prev: number[]) => [...prev, roomID]);
      } else return;
    } catch (error) {
      console.log(error);
    } finally {
      setDropdownVisible(false);
    }
  };

  const handleUnmute = async (roomID: number) => {
    try {
      const { data, error } = await supabase
        .from("members")
        .update({ isMuted: false })
        .eq("room_id", roomID)
        .eq("user_id", userId)
        .select();

      if (mutedRooms?.includes(roomID)) {
        setMutedRooms((prev: number[]) => prev?.filter((id) => id !== roomID));
      } else return;
    } catch (error) {
      console.log(error);
    } finally {
      setDropdownVisible(false);
    }
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

  const handleAddFriend = async (roomID: number) => {
    try {
      // Assuming friendUserId is defined somewhere in your component
      const { data, error } = await supabase
        .from("members")
        .insert([{ room_id: roomID, user_id: friendUserId }])
        .select();

      if (error) {
        console.error("Error adding friend:", error.message);
        // Handle error, show user feedback, etc.
      } else {
        console.log("Friend added successfully:", data);
        // Provide positive feedback to the user, update UI, etc.
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      // Handle unexpected errors, show user feedback, etc.
    } finally {
      setDropdownVisible(false);
      setIsModalOpen(false);
    }
  };

  return (
    <>
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <button
              className={styles.closeModal}
              onClick={() => setIsModalOpen(false)}
            >
              <AiOutlineClose />
            </button>

            <div className={styles.addFriend}>
              <p>Enter the ID of your friend to add:</p>
              <div className={styles.pasteId}>
                <input
                  className={styles.pasteIdInput}
                  type="text"
                  onChange={(e) => setFriendId(e.target.value)}
                />
                <button
                  className={styles.addFriendButton}
                  onClick={() => {
                    handleAddFriend(roomID);
                    setIsModalOpen(false);
                  }}
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <div
        className={`${styles.kebabMenu} ${styles.showLeft}`}
        ref={dropdownRef}
      >
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
              {mutedRooms?.includes(roomID) ? (
                <button
                  onClick={() => {
                    handleUnmute(roomID);
                  }}
                >
                  Unmute <GoUnmute />
                </button>
              ) : (
                <button
                  onClick={() => {
                    handleMute(roomID);
                  }}
                >
                  Mute <GoMute />
                </button>
              )}

              <button
                onClick={() => {
                  setIsModalOpen(true);
                  setDropdownVisible(false);
                }}
              >
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
    </>
  );
};

export default ActionButtons;
