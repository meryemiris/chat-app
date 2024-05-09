import { useContext, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

import styles from "./Messages.module.css";
import Image from "next/image";

import ChannelsContext from "@/lib/RoomContext";
import { useAuthContext } from "@/lib/AuthContext";
import { useUserContext } from "@/lib/UserContext";
import { useUnreadsContext } from "@/lib/UnreadsContext";

import { Message } from "@/types";

import Loading from "../utils/Loading";

type MessagesProps = {
	searchTerm: string;
};

const Messages: React.FC<MessagesProps> = ({ searchTerm }) => {
	const { activeChannelId } = useContext(ChannelsContext);

	const { userId } = useAuthContext();
	const { profileImg } = useUserContext();

	const [messages, setMessages] = useState<Message[]>([]);

	const [loading, setLoading] = useState(false);

	const messageEndRef = useRef<HTMLDivElement>(null);

	const { setUnreads, unreadsChatIds, setUnreadsChatIds } = useUnreadsContext();

	useEffect(() => {
		async function getMessages() {
			try {
				setLoading(true);
				const { data, error } = await supabase
					.from("messages")
					.select(
						"users(username, profile_img), id, content, created_at, user_id"
					)
					.eq("channel_id", activeChannelId);

				if (error) {
					throw error;
				}

				if (data) {
					setMessages(data as []);
				} else {
					console.log(error);
				}
			} catch (error) {
			} finally {
				setLoading(false);
			}
		}

		getMessages();
	}, [activeChannelId, setMessages, setLoading]);

	useEffect(() => {
		const channel = supabase
			.channel("messages")
			.on(
				"postgres_changes",
				{
					event: "INSERT",
					schema: "public",
					table: "messages",
				},
				async (payload: { new: Message }) => {
					const userData = await supabase
						.from("users")
						.select("username, profile_img")
						.eq("id", payload.new.user_id)
						.single();

					const newMessage = {
						...payload.new,
						users: userData.data,
					};

					if (payload.new.channel_id === activeChannelId) {
						setMessages(
							(prev: Message[]) => [...prev, newMessage] as Message[]
						);
					} else {
					}

					if (
						userId !== payload.new.user_id &&
						activeChannelId &&
						!unreadsChatIds.includes(activeChannelId)
					) {
						setUnreads((prev) => [...prev, payload.new]);
						setUnreadsChatIds((prev: number[]) => [
							...prev,
							payload.new.channel_id,
						]);
					}
				}
			)

			.subscribe();

		return () => {
			supabase.removeChannel(channel);
		};
	}, [activeChannelId, setUnreads, unreadsChatIds, setUnreadsChatIds, userId]);

	const filteredMessages = messages.filter((message) =>
		message.content.toLowerCase().includes(searchTerm.toLowerCase())
	);

	const scrollToBottom = () => {
		if (messageEndRef.current) {
			messageEndRef.current.scrollTop = messageEndRef.current.scrollHeight;
		}
	};

	useEffect(() => {
		scrollToBottom();
	}, [messages]);

	const isSender = userId !== messages[0]?.user_id;
	const isReceiver = userId === messages[0]?.user_id;

	return (
		<main ref={messageEndRef} className={styles.scrollable}>
			{loading ? (
				<Loading />
			) : (
				<>
					{messages.length === 0 && (
						<p className={styles.noMessages}>
							No messages? Time to break the silence! 🤐💬
						</p>
					)}
					{filteredMessages.length === 0 && (
						<p className={styles.noMessages}>No messages match your search.</p>
					)}
					{filteredMessages?.map(({ content, id, created_at, users }) => (
						<div
							key={id}
							className={
								isReceiver ? styles.myMessageContainer : styles.messageContainer
							}
						>
							<div>
								{isSender && (
									<Image
										className={styles.avatar}
										src={profileImg}
										alt="sender image"
										width={50}
										height={50}
									/>
								)}
							</div>
							<div className={isReceiver ? styles.myMessage : styles.message}>
								{isSender && (
									<p className={styles.username}>{users?.username}</p>
								)}
								<p className={styles.content}>{content}</p>
								<p className={styles.createdAt}>
									{created_at.split(":").slice(0, 2).join(":")}
								</p>
							</div>
						</div>
					))}
				</>
			)}
		</main>
	);
};

export default Messages;
