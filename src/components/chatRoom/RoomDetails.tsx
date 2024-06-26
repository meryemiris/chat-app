import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

import Image from "next/image";

import styles from "./RoomDetails.module.css";

import Loading from "../utils/Loading";

import { MdGroups2 } from "react-icons/md";
import { IoCloseOutline } from "react-icons/io5";
import { useChatContext } from "@/lib/ChatContext";

type MembersData =
	| {
			users: {
				username: string;
				profile_img: string;
			};
	  }[]
	| null;

type RoomDetailsProps = {
	setShowRoomDetails: React.Dispatch<React.SetStateAction<boolean>>;
};

const RoomDetails: React.FC<RoomDetailsProps> = ({ setShowRoomDetails }) => {
	const [memberLoading, setMemberLoading] = useState<boolean>(false);

	const [memberNames, setMemberNames] = useState<string[]>([]);
	const [profilePics, setProfilePics] = useState<string[]>([]);

	const { activeChatId } = useChatContext();

	useEffect(() => {
		const getMembers = async () => {
			try {
				setMemberLoading(true);
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
					.eq("room_id", activeChatId);

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
			} catch (error) {
				console.log(error);
			} finally {
				setMemberLoading(false);
			}
		};

		getMembers();
	}, [activeChatId]);

	return (
		<div className={styles.container}>
			<button
				className={styles.closeBtn}
				onClick={() => setShowRoomDetails(false)}
			>
				<IoCloseOutline className={styles.closeIcon} />
			</button>
			<h3 className={styles.roomName}>
				<Image
					src={"/activeRoomPic.png"}
					width={25}
					height={25}
					alt="room pic"
				/>
				{activeChatId}
			</h3>
			{memberLoading ? (
				<Loading />
			) : (
				<section>
					<h6 className={styles.membersTitle}>
						Members
						<MdGroups2 className={styles.membersIcon} size={28} color="white" />
					</h6>
					{memberNames.length === 0 ? (
						<p className={styles.noMembers}>No members yet</p>
					) : (
						<ul className={styles.members}>
							{memberNames?.map((username: string, index: number) => (
								<li className={styles.member} key={index}>
									<Image
										className={styles.profilePic}
										src={
											profilePics[index] ? profilePics[index] : "/defaultPp.png"
										}
										width={30}
										height={30}
										alt={`${username}'s profile picture`}
									/>
									<p> {username}</p>
								</li>
							))}
						</ul>
					)}
				</section>
			)}
		</div>
	);
};

export default RoomDetails;
