import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

import styles from "./ChatRoomList.module.css";
import { toast } from "sonner";

import { useAuthContext } from "@/lib/AuthContext";
import { useChatContext } from "@/lib/ChatContext";

import ListItem from "./ListItem";
import ChatSettings from "./ChatSettings";

import { MdAddCircle, MdSearch } from "react-icons/md";
import { RiFilter3Fill } from "react-icons/ri";
import { ChatRoom } from "@/types";

const ChatRoomList = () => {
	const [isFilter, setIsFilter] = useState(false);
	const [searchTerm, setSearchTerm] = useState("");

	const { userId } = useAuthContext();

	const { chats, setChats, isChatControlOpen } = useChatContext();

	const handleCreateChannel = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const chatRoomName = new FormData(e.currentTarget).get("channelName");

		if (chatRoomName === "") return;

		// Check if the chat room already exists
		const existingChatRoom = chats.find(
			(room) => room.channels?.name === chatRoomName
		);

		if (existingChatRoom) {
			toast.error("Chat room already exists");
			return;
		}

		// Create the new chat room, insert to channels table
		const { data: newChatRoom, error: chatRoomCreateError } = await supabase
			.from("channels")
			.insert([{ name: chatRoomName }])
			.select();

		if (chatRoomCreateError) {
			console.error(
				"Sorry there was an error creating the new chat room, please try again later.",
				chatRoomCreateError
			);
			toast.error(chatRoomCreateError.message);
			return;
		}

		// Retrieve the channelId for the newly created channel
		const { data: newChatRoomId, error: chatRoomIdError } = await supabase
			.from("channels")
			.select("id")
			.eq("name", chatRoomName);

		if (chatRoomIdError) {
			console.error("Error retrieving channelId:", chatRoomIdError);
			return;
		}

		// Insert the new chat room into the members table
		const { data: memberInsert, error: memberInsertError } = await supabase
			.from("membership")
			.insert([{ user_id: userId, room_id: newChatRoomId[0].id }])
			.select();

		if (memberInsertError) {
			console.error("Error inserting member:", memberInsertError);
			return;
		}

		if (memberInsert) {
			setChats([...chats, newChatRoom[0]]);
		}
		setSearchTerm("");
	};

	const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearchTerm(e.target.value);
	};

	const filteredChannels = chats?.filter((room) =>
		room.channels?.name?.toLowerCase().includes(searchTerm.toLowerCase())
	);

	useEffect(() => {
		const channels = supabase
			.channel("custom-all-channel")
			.on(
				"postgres_changes",
				{ event: "DELETE", schema: "public", table: "membership" },
				(payload) => {
					setChats(chats.filter((room) => room.id !== payload.old.id));
				}
			)
			.subscribe();
		return () => {
			supabase.removeChannel(channels);
		};
	}, [chats, setChats]);

	return (
		<div className={styles.container}>
			<h1 className={styles.title}>Chats</h1>
			<div className={styles.searchAndFilter}>
				<form className={styles.chatSearch} onSubmit={handleCreateChannel}>
					<input
						name="channelName"
						placeholder="Search or create a room"
						value={searchTerm}
						onChange={handleSearch}
						autoComplete="off"
						maxLength={35}
					/>
					<button type="submit" className={styles.chatSearchButton}>
						{searchTerm ? <MdAddCircle /> : <MdSearch />}
					</button>
				</form>
				<button
					className={isFilter ? styles.filterButtonActive : styles.filterButton}
					onClick={() => setIsFilter(!isFilter)}
				>
					<RiFilter3Fill />
				</button>
			</div>

			<div className={styles.scrollable}>
				{filteredChannels?.map(({ isMuted, channels: { id, name } }) => (
					<ListItem key={id} roomID={id} roomName={name} isMuted={isMuted} />
				))}
			</div>
			{isChatControlOpen && <ChatSettings />}
		</div>
	);
};

export default ChatRoomList;
