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
import { Channel } from "@/types";
import RoomContext from "@/lib/RoomContext";
import MessageContext from "@/lib/MessageContext";
import { GoArrowLeft } from "react-icons/go";

const RoomList = () => {
  const [isFilter, setIsFilter] = useState(false);

  const [channels, setChannels] = useState<Channel[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const { userId } = useContext(AuthContext);

  const [showMuted, setShowMuted] = useState(false);
  const [showUnread, setShowUnread] = useState(false);

  const { roomIdsWithUnreadMessages } = useContext(MessageContext);

  const { mutedRooms } = useContext(RoomContext);

  useEffect(() => {
    async function getRoomList() {
      let { data, error } = await supabase.from("channels").select("id, name");
      if (data) {
        setChannels(data as Channel[]);
      }
    }

    getRoomList();
  }, [channels]);

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
    try {
      e.preventDefault();
      const channelName = new FormData(e.currentTarget).get("channelName");

      // Insert channel data into the 'channels' table
      const { data: channelData, error: channelError } = await supabase
        .from("channels")
        .insert([{ name: channelName }])
        .select();

      if (channelError) {
        throw new Error(`Error creating channel: ${channelError.message}`);
      }
      if (e.target instanceof HTMLFormElement) {
        e.target.reset();
      }

      // Retrieve the channelId for the newly created channel
      const { data: channelId, error: channelIdError } = await supabase
        .from("channels")
        .select("id")
        .eq("name", channelName);

      if (channelIdError) {
        throw new Error(`Error getting channel ID: ${channelIdError.message}`);
      }

      // Insert member data into the 'members' table
      const { data: members, error: memberError } = await supabase
        .from("members")
        .insert([{ user_id: userId, room_id: channelId[0].id }])
        .select();

      if (memberError) {
        throw new Error(`Error inserting member: ${memberError.message}`);
      }
      setSearchTerm("");
    } catch (error) {
      console.error("Error in handleCreateChannel:", error);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredChannels = channels.filter(
    (channel) =>
      channel.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (showMuted ? mutedRooms.includes(channel.id) : true) &&
      (showUnread ? roomIdsWithUnreadMessages.includes(channel.id) : true)
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
    setShowUnread(true);
  };

  const handleShowMuted = () => {
    setIsFilter(false);
    setShowMuted(true);
  };

  return (
    <div className={styles.container}>
      <header>
        {showMuted ? (
          <>
            <button
              className={styles.backButton}
              onClick={() => setShowMuted(false)}
            >
              <GoArrowLeft />
            </button>
            <h2 className={styles.title}>Muted</h2>
          </>
        ) : showUnread ? (
          <>
            <button
              className={styles.backButton}
              onClick={() => setShowUnread(false)}
            >
              <GoArrowLeft />
            </button>
            <h2 className={styles.title}>Unread</h2>
          </>
        ) : (
          <>
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
          </>
        )}
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
          <ListItem
            key={id}
            roomID={id}
            roomName={name}
            setChannels={setChannels}
          />
        ))}
      </div>
    </div>
  );
};

export default RoomList;
