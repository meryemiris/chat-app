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
import RoomList from "@/components/roomList/RoomlList";
import Profile from "@/components/profile/Profile";

export default function HomePage() {
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
							<Profile />
						</Layout>
					</MessageContext.Provider>
				</FeedbackContext.Provider>
			</RoomContext.Provider>
		</>
	);
}
