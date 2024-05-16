import {
	Dispatch,
	SetStateAction,
	createContext,
	useContext,
	useEffect,
	useState,
} from "react";

import { supabase } from "./supabase";
import { useAuthContext } from "./AuthContext";

import { Message, ChatRoom } from "@/types";
import { toast } from "sonner";

export type ChatContextType = {
	chatRoomList: ChatRoom[];
	setChatRoomList: Dispatch<SetStateAction<ChatRoom[]>>;

	messages: Message[];
	setMessages: Dispatch<SetStateAction<Message[]>>;

	unreadMsgs: Message[];
	setUnreadMsgs: Dispatch<SetStateAction<Message[]>>;

	unreadMsgsChatIds: number[];
	setUnreadMsgsChatIds: Dispatch<SetStateAction<number[]>>;

	activeChatId: number | null;
	setActiveChatId: Dispatch<SetStateAction<number | null>>;

	selectedChat: number | null;
	setSelectedChat: Dispatch<SetStateAction<number | null>>;

	mutedChat: boolean;
	setMutedChat: Dispatch<SetStateAction<boolean>>;

	isChatControlOpen: boolean;
	setIsChatControlOpen: Dispatch<SetStateAction<boolean>>;

	editChat: number | null;
	setEditChat: Dispatch<SetStateAction<number | null>>;
};

const ChatContext = createContext<ChatContextType>({} as ChatContextType);
export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const { userId } = useAuthContext();

	const [chatRoomList, setChatRoomList] = useState<ChatRoom[]>([]);
	const [messages, setMessages] = useState<Message[]>([]);

	const [unreadMsgs, setUnreadMsgs] = useState<Message[]>([]);
	const [unreadMsgsChatIds, setUnreadMsgsChatIds] = useState<number[]>([]);
	const [activeChatId, setActiveChatId] = useState<number | null>(null);

	const [selectedChat, setSelectedChat] = useState<number | null>(null);

	const [mutedChat, setMutedChat] = useState<boolean>(false);

	const [isChatControlOpen, setIsChatControlOpen] = useState<boolean>(false);

	const [editChat, setEditChat] = useState<number | null>(null);

	useEffect(() => {
		async function getChatRoomList() {
			if (!userId) return;

			const { data: roomList, error: memberRoomsError } = await supabase
				.from("members")
				.select(
					`
						isMuted,
						channels (
							name,
							id
						)
					`
				)
				.eq("user_id", userId);

			if (memberRoomsError) {
				console.log(memberRoomsError);
				toast.error(memberRoomsError.message);
				return;
			}

			const chatRoomsWithMembers = await Promise.all(
				roomList.map(async (room) => {
					const { data: members, error: memberError } = await supabase
						.from("members")
						.select(
							`
							users (
								id,
								username,
								profile_img
							)
						`
						)
						.eq("room_id", room.channels.id);

					if (memberError) {
						console.log(memberError);
						toast.error(memberError.message);
						return {
							...room,
							users: [],
						};
					}

					return {
						...room,
						users: members.map((member) => member.users),
					};
				}) as unknown as ChatRoom[]
			);

			setChatRoomList(chatRoomsWithMembers);
		}

		getChatRoomList();
	}, [userId]);

	useEffect(() => {
		chatRoomList.forEach((chatRoom) => {
			if (chatRoom.isMuted === true && chatRoom.channels?.id === selectedChat) {
				setMutedChat(true);
			}
		});
	}, [chatRoomList, selectedChat]);

	useEffect(() => {
		async function getChatMsgs() {
			if (activeChatId === null) return;

			const { data, error } = await supabase
				.from("messages")
				.select(
					"users(username, profile_img), id, content, created_at, user_id"
				)
				.eq("chatroom_id", activeChatId);

			if (error) {
				throw error;
			}

			if (data) {
				setMessages(data as []);
			} else {
				console.log(error);
			}
		}

		getChatMsgs();
	}, [activeChatId, setMessages]);

	const value = {
		chatRoomList,
		setChatRoomList,

		activeChatId,
		setActiveChatId,

		messages,
		setMessages,

		unreadMsgs,
		setUnreadMsgs,
		unreadMsgsChatIds,
		setUnreadMsgsChatIds,

		selectedChat,
		setSelectedChat,

		mutedChat,
		setMutedChat,

		isChatControlOpen,
		setIsChatControlOpen,

		editChat,
		setEditChat,
	};

	return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export function useChatContext() {
	const context = useContext(ChatContext);

	if (context === undefined) {
		throw new Error("useChatContext must be used within a ChatContextProvider");
	}

	return context;
}
