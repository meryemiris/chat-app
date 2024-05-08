import { useState } from "react";

import Head from "next/head";

import Layout from "@/components/layout/Layout";

import MessageContext from "@/lib/MessageContext";
import RoomContext from "@/lib/RoomContext";

import { Message } from "@/types";
import Profile from "@/components/profile/Profile";

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
				<MessageContext.Provider
					value={{
						unreadMessages,
						setUnreadMessages,
						roomIdsWithUnreadMessages,
						setRoomIdsWithUnreadMessages,
					}}
				>
					<Layout>
						<Profile />
					</Layout>
				</MessageContext.Provider>
			</RoomContext.Provider>
		</>
	);
}
