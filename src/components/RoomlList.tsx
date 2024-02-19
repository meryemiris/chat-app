import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

import styles from "./RoomList.module.css";

import {
  MdAddCircle,
  MdOutlineMarkUnreadChatAlt,
  MdSearch,
} from "react-icons/md";

import { IoFilter, IoVolumeMuteOutline } from "react-icons/io5";
import ListItem from "./ListItem";
import AuthContext from "@/lib/AuthContext";
import { Channel, Message } from "@/types";

const RoomList = () => {
  const [newMessages, setNewMessages] = useState<Message[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const { userId } = useContext(AuthContext);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFilter, setIsFilter] = useState(false);

  useEffect(() => {
    async function getRoomList() {
      let { data, error } = await supabase.from("channels").select("id, name");
      if (data) {
        setChannels(data as Channel[]);
      }
    }

    getRoomList();
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

  const filteredChannels = channels.filter((channel) =>
    channel.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <h2 className={styles.title}>mushRooms</h2>
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

      <form className={styles.roomSearch} onSubmit={handleCreateChannel}>
        <input
          name="channelName"
          placeholder="Search or create a room"
          value={searchTerm}
          onChange={handleSearch}
          autoFocus
          autoComplete="off"
          maxLength={35}
        />
        <button type="submit" className={styles.roomSearchIcon}>
          {searchTerm ? <MdAddCircle /> : <MdSearch />}
        </button>
      </form>
      <div className={styles.scrollable}>
        {filteredChannels.map(({ id, name }) => (
          <ListItem key={id} id={id} name={name} setChannels={setChannels} />
        ))}
      </div>
    </div>
  );
};

export default RoomList;
