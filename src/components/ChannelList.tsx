import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

import styles from "./ChannelList.module.css";
import Image from "next/image";

import AuthContext from "@/lib/AuthContext";
import ChannelsContext from "@/lib/ChannelsContext";

import { Message } from "./Messages";

export type Channel = {
  id: number;
  name: string;
  member_id: string[];
};

const ChannelList = () => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const { activeChannelId, setActiveChannelId, setActiveChannelName } =
    useContext(ChannelsContext);
  const { userId } = useContext(AuthContext);

  const [newMessages, setNewMessages] = useState<Message[]>([]);
  console.log("newMessages", newMessages);

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
  // TODO: add addEventListener to document for click outside

  const handleDeleteChannel = async (id: number) => {
    const { data, error } = await supabase
      .from("channels")
      .delete()
      .eq("id", id);

    setChannels((prev) => prev.filter((channel) => channel.id !== id));
  };

  // TODO: add edit function for channels

  const threeMushrooms = "./threeMushrooms.svg";

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Image
          src={threeMushrooms}
          alt="threeMushrooms"
          width={45}
          height={45}
        />
        <h2 className={styles.channelTitle}>mushRooms</h2>
      </div>
      <form onSubmit={handleCreateChannel}>
        <input
          className={styles.channelSearch}
          name="channelName"
          placeholder={`Search or create a new channel`}
          value={searchTerm}
          onChange={handleSearch}
          autoFocus
          autoComplete="off"
        />
      </form>
      <div className={styles.scrollable}>
        {filteredChannelsWithMessages.map(
          ({ id, name, newMsgCount, isSender }) => (
            <button
              onClick={() => {
                setActiveChannelId(id);
                setActiveChannelName(name);
                handleReadNewMessages(id, name);
              }}
              key={id}
              className={
                activeChannelId === id
                  ? styles.activeChannel
                  : styles.channelButton
              }
            >
              <p>{name}</p>
              {activeChannelId === id && (
                <div className={styles.threeDots}>
                  {/* Three dot menu */}
                  <div className={styles.dropdown}>
                    {/* Three dots */}
                    <ul
                      className={`${styles.dropbtn} ${styles.icons} ${
                        styles.btnRight
                      } ${dropdownVisible ? styles.showLeft : ""}`}
                      onClick={handleToggleDropdown}
                    >
                      <li></li>
                      <li></li>
                      <li></li>
                    </ul>
                    {/* Menu */}
                    <div
                      id="dropdown"
                      className={`${styles.dropdownContent} ${
                        dropdownVisible ? styles.show : ""
                      }`}
                    >
                      <button onClick={() => handleDeleteChannel(id)}>
                        Delete
                      </button>
                      <button>Edit</button>
                    </div>
                  </div>
                </div>
              )}

              {!isSender &&
                newMsgCount > 0 &&
                newMsgChannelIds.includes(id) && (
                  <span className={styles.msgCount}>{newMsgCount}</span>
                )}
            </button>
          )
        )}
      </div>
    </div>
  );
};

export default ChannelList;
