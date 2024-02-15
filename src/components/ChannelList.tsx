import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

import styles from "./ChannelList.module.css";

import {
  MdAddCircle,
  MdOutlineMarkUnreadChatAlt,
  MdSearch,
} from "react-icons/md";

import { IoFilter, IoVolumeMuteOutline } from "react-icons/io5";
import RoomListItem from "./RoomListItem";
import AuthContext from "@/lib/AuthContext";
import { Channel, Message } from "@/types";

const ChannelList = () => {
  const [newMessages, setNewMessages] = useState<Message[]>([]);

  const [channels, setChannels] = useState<Channel[]>([]);
  const { userId } = useContext(AuthContext);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFilter, setIsFilter] = useState(false);

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

  const filterRoomsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutsideFilterRooms = (e: MouseEvent) => {
      if (
        filterRoomsRef.current &&
        !filterRoomsRef.current.contains(e.target as Node)
      ) {
        setIsFilter(false);
      }
    };

    const handleClick = (e: MouseEvent) => {
      handleClickOutsideFilterRooms(e);
    };

    document.addEventListener("mousedown", handleClick);

    return () => {
      document.removeEventListener("mousedown", handleClick);
    };
  }, [filterRoomsRef]);

  const handleToggleFilter = () => {
    setIsFilter(!isFilter);
  };

  const handleShowUnread = () => {
    setIsFilter(false);
    // TODO: add unread filter function
  };

  const handleShowMuted = () => {
    setIsFilter(false);
    // TODO: add muted filter function
  };

  return (
    <div className={styles.container}>
      <header>
        <h2 className={styles.channelTitle}>mushRooms</h2>
        <div className={`${styles.kebabMenu} ${styles.showLeft}`}>
          <button className={styles.threeDots} onClick={handleToggleFilter}>
            <IoFilter />
          </button>
          <div
            id="filterRooms"
            ref={filterRoomsRef}
            className={`${styles.dropdown} ${isFilter ? styles.show : ""}`}
          >
            {/* TODO: add fiter functions */}
            <button onClick={handleShowUnread}>
              Unread <MdOutlineMarkUnreadChatAlt />
            </button>
            <button onClick={handleShowMuted}>
              Muted <IoVolumeMuteOutline />
            </button>
          </div>
        </div>
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
            <RoomListItem
              key={id}
              id={id}
              name={name}
              newMsgCount={newMsgCount}
              isSender={isSender}
              setChannels={setChannels}
              setNewMessages={setNewMessages}
            />
          )
        )}
      </div>
    </div>
  );
};

export default ChannelList;
