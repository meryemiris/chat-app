import { useContext, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

import styles from "./ListItem.module.css";

import { Channel, Message } from "@/types";

import ChannelsContext from "@/lib/ChannelsContext";
import MessageContext from "@/lib/MessageContext";

import {
  AiOutlineDelete,
  AiOutlineEdit,
  AiOutlineLogout,
  AiOutlineUserAdd,
} from "react-icons/ai";
import { MdCheckCircleOutline } from "react-icons/md";
import { SlOptionsVertical } from "react-icons/sl";
import AuthContext from "@/lib/AuthContext";

type RoomListItemProps = {
  id: number;
  name: string;
  setChannels: React.Dispatch<React.SetStateAction<Channel[]>>;
};

const ListItem: React.FC<RoomListItemProps> = ({ id, name, setChannels }) => {
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const [channelName, setChannelName] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);
  const { activeChannelId, setActiveChannelId, setActiveChannelName } =
    useContext(ChannelsContext);
  const {
    newMsgRoomIDs,

    setNewMsgCount,
    setNewMsgRoomIDs,
    newMsgCount,
    newMsgSender,
    setNewMsgSender,
  } = useContext(MessageContext);

  const { userId } = useContext(AuthContext);

  const dropdownRef = useRef<HTMLDivElement>(null);
  console.log("newMsgRoomIDs", newMsgRoomIDs);

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

  const handleDeleteChannel = async (id: number) => {
    const { data, error } = await supabase
      .from("channels")
      .delete()
      .eq("id", id);

    setChannels((prev) => prev.filter((channel) => activeChannelId !== id));
  };

  const handleEditChannel = (id: number) => {
    setIsEditing(true);
    setActiveChannelId(id);
  };

  const handleSave = async (
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

  const handleReadNewMessages = (id: number, name: string) => {
    setNewMsgCount(0);
    setNewMsgRoomIDs((prev) => prev.filter((roomId) => roomId !== id));
    setNewMsgSender("");
    setActiveChannelId(id);
    setActiveChannelName(name);
  };

  const handleToggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };

  return (
    <>
      <button
        onClick={() => {
          setActiveChannelId(id);
          setActiveChannelName(name);
          handleReadNewMessages(id, name);
        }}
        className={
          activeChannelId === id
            ? `${styles.channelButton} ${styles.active}`
            : styles.channelButton
        }
      >
        {isEditing && activeChannelId === id ? (
          <form
            className={styles.channelNameForm}
            onSubmit={(e) => handleSave(id, e)}
          >
            <input
              className={styles.channelName}
              type="text"
              defaultValue={name}
              maxLength={35}
              onChange={(e) => setChannelName(e.target.value)}
              autoFocus
            />
            <button className={styles.saveButton} type="submit">
              <MdCheckCircleOutline />
            </button>
          </form>
        ) : (
          <p className={styles.channelName}>{name}</p>
        )}
        {activeChannelId === id && (
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
              <button>
                Add Friend <AiOutlineUserAdd />
              </button>
              <button
                onClick={() => {
                  handleToggleDropdown();
                  handleEditChannel(id);
                }}
              >
                Edit Room <AiOutlineEdit />
              </button>
              <button onClick={() => handleDeleteChannel(id)}>
                Delete Room <AiOutlineDelete />
              </button>
              <button style={{ color: "red" }}>
                Leave Room <AiOutlineLogout />
              </button>
            </div>
          </div>
        )}
      </button>
      {newMsgCount > 0 &&
        activeChannelId !== id &&
        newMsgRoomIDs.includes(id) && (
          <span className={styles.newMessage}>
            {newMsgCount} {newMsgCount === 1 ? "new message" : "new messages"}
          </span>
        )}
    </>
  );
};

export default ListItem;
