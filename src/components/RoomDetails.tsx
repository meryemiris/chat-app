import { useContext, useEffect, useState } from "react";
import styles from "./RoomDetails.module.css";
import RoomContext from "@/lib/RoomContext";

import { supabase } from "@/lib/supabase";
import Image from "next/image";
import { MdGroups2 } from "react-icons/md";

type MembersData =
  | {
      users: {
        username: string;
        profile_img: string;
      };
    }[]
  | null;

export default function RoomDetails() {
  const { activeChannelName, activeChannelId } = useContext(RoomContext);

  const [memberNames, setMemberNames] = useState<string[]>([]);
  const [profilePics, setProfilePics] = useState<string[]>([]);

  useEffect(() => {
    const getMembers = async () => {
      const { data, error } = await supabase
        .from("members")
        .select(
          `
          users (
            username,
            profile_img
          )
        `
        )
        .eq("room_id", activeChannelId);

      const membersData = data as MembersData;

      if (!membersData) return;

      const memberNames = membersData?.map(
        (member) => member.users.username as string
      );
      const membersProfilePics = membersData?.map(
        (member) => member.users.profile_img as string
      );

      setMemberNames(memberNames as string[]);
      setProfilePics(membersProfilePics as string[]);
    };

    getMembers();
  }, [activeChannelId]);

  return (
    <div className={styles.container}>
      <h3 className={styles.roomName}>{activeChannelName}</h3>
      <section>
        <h6 className={styles.membersTitle}>
          Members{" "}
          <MdGroups2 className={styles.membersIcon} size={28} color="white" />
        </h6>
        <ul className={styles.members}>
          {memberNames?.map((username: string, index: number) => (
            <li className={styles.member} key={index}>
              <Image
                className={styles.profilePic}
                src={profilePics[index] ? profilePics[index] : "/defaultPp.png"}
                width={30}
                height={30}
                alt={`${username}'s profile picture`}
              />
              <p> {username}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
