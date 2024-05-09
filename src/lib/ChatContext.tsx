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
};

const ChatContext = createContext<ChatContextType>({} as ChatContextType);
export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const { userId } = useAuthContext();

	const [chatRoomList, setChatRoomList] = useState<ChatRoom[]>([]);

	const [messages, setMessages] = useState<Message[]>([]);
	console.log("messages", messages);

	const [unreadMsgs, setUnreadMsgs] = useState<Message[]>([]);
	const [unreadMsgsChatIds, setUnreadMsgsChatIds] = useState<number[]>([]);
	const [activeChatId, setActiveChatId] = useState<number | null>(null);

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
			const chatRooms = roomList as unknown;
			setChatRoomList(chatRooms as ChatRoom[]);
		}

		getChatRoomList();
	}, [userId]);

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
		messages,
		setMessages,
		unreadMsgs,
		setUnreadMsgs,
		unreadMsgsChatIds,
		setUnreadMsgsChatIds,
		activeChatId,
		setActiveChatId,
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
