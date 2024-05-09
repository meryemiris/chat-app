import { useState } from "react";

import Head from "next/head";

import Layout from "@/components/layout/Layout";

import RoomContext from "@/lib/RoomContext";

import { Message } from "@/types";
import Profile from "@/components/profile/Profile";
import ChatRoom from "@/components/chatRoom/ChatRoom";
import RoomList from "@/components/roomList/RoomlList";

export default function HomePage() {
	const [activeChannelId, setActiveChannelId] = useState<number | null>(null);
	const [activeChannelName, setActiveChannelName] = useState("");

	const [isLoading, setIsLoading] = useState(false);

	const [unreadMessages, setUnreadMessages] = useState<Message[]>([]);
	const [roomIdsWithUnreadMessages, setRoomIdsWithUnreadMessages] = useState<
		number[]
	>([]);
	const [showRoomDetails, setShowRoomDetails] = useState<boolean>(false);

	const [mutedRooms, setMutedRooms] = useState<number[]>([]);
	const [isRoomMuted, setIsRoomMuted] = useState<boolean>(false);

	return (
		<>
			<Head>
				<title>mushRoom</title>
				<meta
					name="description"
					content="Join the Fungal Fun, Chat with your friends"
				/>
			</Head>

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
				<Layout>
					<RoomList />
				</Layout>
			</RoomContext.Provider>
		</>
	);
}
