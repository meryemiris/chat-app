import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";

import styles from "./Messages.module.css";
import Image from "next/image";

import { useAuthContext } from "@/lib/AuthContext";
import { useUserContext } from "@/lib/UserContext";

import { Message } from "@/types";
import { useChatContext } from "@/lib/ChatContext";

type MessagesProps = {
	searchTerm: string;
};

const Messages: React.FC<MessagesProps> = ({ searchTerm }) => {
	const { userId } = useAuthContext();
	const { profileImg } = useUserContext();
	const {
		messages,
		setMessages,
		activeChatId,
		setUnreadMsgs,
		setUnreadMsgsChatIds,
	} = useChatContext();

	const messageEndRef = useRef<HTMLDivElement>(null);

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

					if (payload.new.chatroom_id === activeChatId) {
						setMessages(
							(prev: Message[]) => [...prev, newMessage] as Message[]
						);
					} else {
					}

					if (userId !== payload.new.user_id && activeChatId) {
						setUnreadMsgs((prev) => [...prev, payload.new]);
						setUnreadMsgsChatIds((prev: number[]) => [
							...prev,
							payload.new.chatroom_id,
						]);
					}
				}
			)

			.subscribe();

		return () => {
			supabase.removeChannel(channel);
		};
	}, [activeChatId, setMessages, userId, setUnreadMsgs, setUnreadMsgsChatIds]);

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
						{isSender && <p className={styles.username}>{users?.username}</p>}
						<p className={styles.content}>{content}</p>
						<p className={styles.createdAt}>
							{created_at.split(":").slice(0, 2).join(":")}
						</p>
					</div>
				</div>
			))}
		</main>
	);
};

export default Messages;
