import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

import styles from "./RoomList.module.css";
import { toast } from "sonner";

import { useAuthContext } from "@/lib/AuthContext";
import { useChatContext } from "@/lib/ChatContext";

import ListItem from "./ListItem";
import ChatSettings from "./ChatSettings";

import { MdAddCircle, MdSearch } from "react-icons/md";
import { RiFilter3Fill } from "react-icons/ri";

const RoomList = () => {
	const [isFilter, setIsFilter] = useState(false);

	const [searchTerm, setSearchTerm] = useState("");

	const { userId } = useAuthContext();

	const { chatRoomList, setChatRoomList, isChatControlOpen } = useChatContext();

	const handleCreateChannel = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const chatRoomName = new FormData(e.currentTarget).get("channelName");

		if (chatRoomName === "") return;

		// Check if the chat room already exists
		const existingChatRoom = chatRoomList.find(
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
			.from("members")
			.insert([{ user_id: userId, room_id: newChatRoomId[0].id }])
			.select();

		if (memberInsertError) {
			console.error("Error inserting member:", memberInsertError);
			return;
		}

		if (memberInsert) {
			setChatRoomList([...chatRoomList, newChatRoom[0]]);
		}
		setSearchTerm("");
	};

	const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearchTerm(e.target.value);
	};

	const filteredChannels = chatRoomList?.filter((room) =>
		room.channels?.name?.toLowerCase().includes(searchTerm.toLowerCase())
	);

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
				{filteredChannels?.map(({ isMuted, channels: { id, name }, users }) => (
					<ListItem
						key={id}
						roomID={id}
						roomName={name}
						isMuted={isMuted}
						members={users}
					/>
				))}
			</div>
			{isChatControlOpen && <ChatSettings />}
		</div>
	);
};

export default RoomList;
