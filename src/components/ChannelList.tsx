import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

import styles from "./ChannelList.module.css";
import Image from "next/image";
import { SlOptionsVertical } from "react-icons/sl";

import AuthContext from "@/lib/AuthContext";
import ChannelsContext from "@/lib/ChannelsContext";
import { MdAddCircle, MdSearch } from "react-icons/md";

import { Message } from "./Messages";
import {
  AiOutlineLogout,
  AiOutlineEdit,
  AiOutlineDelete,
  AiOutlineUserAdd,
} from "react-icons/ai";
import {
  IoAdd,
  IoSearch,
  IoSearchCircle,
  IoSearchOutline,
} from "react-icons/io5";

export type Channel = {
  id: number;
  name: string;
  member_id: string[];
};

const ChannelList = () => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const { activeChannelId, setActiveChannelId, setActiveChannelName } =
    useContext(ChannelsContext);
  const { userId } = useContext(AuthContext);

  const [newMessages, setNewMessages] = useState<Message[]>([]);

  const [channelName, setChannelName] = useState<string>("");

  const [newMsgChannelIds, setNewMsgChannelIds] = useState<number[]>([]);

  useEffect(() => {
    async function getChannelList() {
      let { data, error } = await supabase.from("channels").select("id, name");
      if (data) {
        setChannels(data as Channel[]);
      }
    }

    getChannelList();
  }, []);

  useEffect(() => {
    const subcribeChannels = supabase
      .channel("channels")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "channels" },
        (payload: { new: Channel }) => {
          setChannels((prev) => [...prev, payload.new]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subcribeChannels);
    };
  }, []);

  useEffect(() => {
    const subcribeMessages = supabase
      .channel("messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload: { new: Message }) => {
          const newMsgChannelId = payload.new.channel_id;

          setNewMessages((prevMessages) => [...prevMessages, payload.new]);

          setNewMsgChannelIds((prevIds: number[]) => {
            if (prevIds.includes(newMsgChannelId)) {
              return prevIds;
            }
            return [...prevIds, newMsgChannelId];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subcribeMessages);
    };
  }, []);

  const handleCreateChannel = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const channelName = new FormData(e.currentTarget).get("channelName");

    const { data, error } = await supabase
      .from("channels")
      .insert([{ name: channelName, member_id: [userId] }])
      .select();

    if (e.target instanceof HTMLFormElement) {
      e.target.reset();
    }
    setSearchTerm("");
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  type ChannelWithMessages = {
    id: number;
    name: string;
    newMsgCount: number;
    isSender: boolean;
  };

  const filteredChannelsWithMessages: ChannelWithMessages[] = useMemo(() => {
    return channels
      .filter((channel) =>
        channel.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .map(({ id, name }) => {
        const channelMessages = newMessages.filter(
          (msg) => msg.channel_id === id
        );

        const lastMsg = channelMessages[channelMessages.length - 1];
        const isSender = lastMsg?.user_id === userId;
        const newMsgCount = channelMessages.length;

        return {
          id,
          name,
          newMsgCount,
          isSender,
        };
      });
  }, [channels, searchTerm, newMessages, userId]);

  console.log("filteredChannelsWithMessages", filteredChannelsWithMessages);

  const handleReadNewMessages = (id: number, name: string) => {
    setNewMessages((prevMessages) =>
      prevMessages.filter((msg) => msg.channel_id !== id)
    );
    setNewMsgChannelIds((prevIds: number[]) =>
      prevIds.filter((channelId) => channelId !== id)
    );
  };

  const [dropdownVisible, setDropdownVisible] = useState(false);

  const handleToggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownVisible(false);
        setIsEditing(false);
      }
    };

    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, [dropdownRef]);

  const handleDeleteChannel = async (id: number) => {
    const { data, error } = await supabase
      .from("channels")
      .delete()
      .eq("id", id);

    setChannels((prev) => prev.filter((channel) => channel.id !== id));
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
          channel.id === id ? { ...channel, name: channelName } : channel
        )
      );
    }
    setIsEditing(false);
  };

  const threeMushrooms = "./threeMushrooms.svg";

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Image
          src={threeMushrooms}
          alt="threeMushrooms"
          width={45}
          height={45}
        />
        <h2 className={styles.channelTitle}>mushRooms</h2>
      </header>

      <form className={styles.channelSearch} onSubmit={handleCreateChannel}>
        <input
          name="channelName"
          placeholder="Search or create a room"
          value={searchTerm}
          onChange={handleSearch}
          autoFocus
          autoComplete="off"
          maxLength={35}
        />
        <button type="submit" className={styles.channelSearchIcon}>
          {searchTerm ? <MdAddCircle /> : <MdSearch />}
        </button>
      </form>
      <div className={styles.scrollable}>
        {filteredChannelsWithMessages.map(
          ({ id, name, newMsgCount, isSender }) => (
            <div key={id} className={styles.channelItem}>
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
                  <form onSubmit={(e) => handleSave(id, e)}>
                    <input
                      type="text"
                      className={styles.channelName}
                      defaultValue={name}
                      maxLength={35}
                      onChange={(e) => setChannelName(e.target.value)}
                    />
                    <button type="submit">Save</button>
                  </form>
                ) : (
                  <p className={styles.channelName}>{name}</p>
                )}
                {activeChannelId === id && (
                  <div
                    className={`${styles.kebabMenu} ${styles.showLeft}`}
                    ref={dropdownRef}
                  >
                    <button
                      className={styles.threeDots}
                      onClick={handleToggleDropdown}
                    >
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
                {!isSender &&
                  newMsgCount > 0 &&
                  newMsgChannelIds.includes(id) && (
                    <span className={styles.msgCount}>{newMsgCount}</span>
                  )}
              </button>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default ChannelList;
