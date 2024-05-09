import Head from "next/head";
import Layout from "@/components/layout/Layout";

import { useChatContext } from "@/lib/ChatContext";

import ChatRoom from "@/components/chatRoom/ChatRoom";
import RoomList from "@/components/roomList/RoomlList";
import Loading from "@/components/utils/Loading";

export default function HomePage() {
	const { activeChatId } = useChatContext();

	return (
		<>
			<Head>
				<title>mushRoom</title>
				<meta
					name="description"
					content="Join the Fungal Fun, Chat with your friends"
				/>
			</Head>

			{activeChatId ? (
				<ChatRoom />
			) : (
				<Layout>
					<RoomList />
				</Layout>
			)}
		</>
	);
}
