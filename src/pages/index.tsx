import { useEffect, useState } from "react";

import { useRouter } from "next/router";
import Head from "next/head";

import { alertMessage } from "@/components/utils/Alert";
import Loading from "@/components/utils/Loading";
import Layout from "@/components/layout/Layout";
import ChatRoom from "@/components/chatRoom/ChatRoom";

import { supabase } from "@/lib/supabase";
import FeedbackContext from "@/lib/FeedbackContext";
import MessageContext from "@/lib/MessageContext";
import RoomContext from "@/lib/RoomContext";

import { Message } from "@/types";
import UserContext from "@/lib/UserContext";
import RoomList from "@/components/roomList/RoomlList";
import RoomDetails from "@/components/chatRoom/RoomDetails";
import { useAuthContext } from "@/lib/AuthContext";

export default function HomePage() {
	const router = useRouter();

	const [activeChannelId, setActiveChannelId] = useState<number | null>(null);
	const [activeChannelName, setActiveChannelName] = useState("");

	const [isLoading, setIsLoading] = useState(false);
	const [alert, setAlert] = useState<alertMessage | null>(null);

	const [unreadMessages, setUnreadMessages] = useState<Message[]>([]);
	const [roomIdsWithUnreadMessages, setRoomIdsWithUnreadMessages] = useState<
		number[]
	>([]);
	const [showRoomDetails, setShowRoomDetails] = useState<boolean>(false);

	const [mutedRooms, setMutedRooms] = useState<number[]>([]);
	const [isRoomMuted, setIsRoomMuted] = useState<boolean>(false);
	const [username, setUsername] = useState("");
	const [profileImg, setProfileImg] = useState("");

	const [friendId, setFriendId] = useState("");
	const [showProfile, setShowProfile] = useState(false);

	const { userId } = useAuthContext();
	console.log(userId);

	useEffect(() => {
		async function getUser() {
			const { data: user, error: userError } = await supabase
				.from("users")
				.select("profile_img, username")
				.eq("id", userId);

			if (user) {
				setProfileImg(user[0]?.profile_img);
				setUsername(user[0]?.username);
			}
		}
		getUser();
	}, [userId, setProfileImg]);

	return (
		<>
			<Head>
				<title>mushRoom</title>
				<meta
					name="description"
					content="Join the Fungal Fun, Chat with your friends"
				/>
			</Head>

			<UserContext.Provider
				value={{
					username,
					setUsername,
					profileImg,
					setProfileImg,
					friendId,
					setFriendId,
					showProfile,
					setShowProfile,
				}}
			>
				<RoomContext.Provider
					value={{
						activeChannelName,
						setActiveChannelName,
						activeChannelId,
						setActiveChannelId,
						mutedRooms,
						setMutedRooms,
						showRoomDetails,
						setShowRoomDetails,
						isRoomMuted,
						setIsRoomMuted,
					}}
				>
					<FeedbackContext.Provider
						value={{
							alert,
							setAlert,
							isLoading,
							setIsLoading,
						}}
					>
						<MessageContext.Provider
							value={{
								unreadMessages,
								setUnreadMessages,
								roomIdsWithUnreadMessages,
								setRoomIdsWithUnreadMessages,
							}}
						>
							<Layout>
								<RoomList />
							</Layout>
						</MessageContext.Provider>
					</FeedbackContext.Provider>
				</RoomContext.Provider>
			</UserContext.Provider>
		</>
	);
}
