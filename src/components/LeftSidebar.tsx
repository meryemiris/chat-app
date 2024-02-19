import { useContext, useEffect, useState } from "react";
import styles from "./LeftSidebar.module.css";
import RoomContext from "@/lib/RoomContext";
import { IoClose } from "react-icons/io5";
import { supabase } from "@/lib/supabase";

type Members = {
  username: string;
};

const LeftSidebar = () => {
  const { activeChannelName, activeChannelId } = useContext(RoomContext);
  const { setShowRoomDetails } = useContext(RoomContext);

  const [members, setMembers] = useState<Members[]>([]);

  useEffect(() => {
    const getMembers = async () => {
      const { data: membersData, error } = await supabase
        .from("members")
        .select(
          `
        users (
          username
        )
      `
        )
        .eq("room_id", activeChannelId);

      setMembers(membersData?.map((member) => member.users.username));
    };

    getMembers();
  }, [activeChannelId]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <h3>{activeChannelName}</h3>
        <section>
          <h6> Members</h6>
          <ul>
            {members.map((member, index) => (
              <li key={index}>{member}</li>
            ))}
          </ul>
        </section>
      </div>
      <div>
        <button
          onClick={() => setShowRoomDetails(false)}
          className={styles.closeButton}
        >
          <IoClose />
        </button>
      </div>
    </div>
  );
};

export default LeftSidebar;
