import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

import styles from "./RoomList.module.css";
import { toast } from "sonner";

import { useAuthContext } from "@/lib/AuthContext";
import { useChatContext } from "@/lib/ChatContext";

import ListItem from "./ListItem";

import {
	MdAddCircle,
	MdOutlineMarkUnreadChatAlt,
	MdSearch,
} from "react-icons/md";
import { IoFilter, IoVolumeMuteOutline } from "react-icons/io5";
import { GoArrowLeft } from "react-icons/go";
import ChatSettings from "./ChatSettings";

const RoomList = () => {
	const [isFilter, setIsFilter] = useState(false);

	const [searchTerm, setSearchTerm] = useState("");

	const { userId } = useAuthContext();

	const [showMuted, setShowMuted] = useState(false);
	const [showUnread, setShowUnread] = useState(false);

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

	const filteredChannels = chatRoomList?.filter(
		(room) =>
			room.channels?.name?.toLowerCase().includes(searchTerm.toLowerCase()) &&
			(showMuted ? room.isMuted : true)
	);

	const filterRoomsRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleClickOutsideFilterRooms = (e: MouseEvent) => {
			if (
				filterRoomsRef.current &&
				!filterRoomsRef.current.contains(e.target as Node)
			) {
				setIsFilter(false);
			}
		};

		const handleClick = (e: MouseEvent) => {
			handleClickOutsideFilterRooms(e);
		};

		document.addEventListener("mousedown", handleClick);

		return () => {
			document.removeEventListener("mousedown", handleClick);
		};
	}, [filterRoomsRef]);

	const handleToggleFilter = () => {
		setIsFilter(!isFilter);
	};

	// const handleShowUnread = () => {
	// 	setIsFilter(false);
	// 	setShowUnread(true);
	// };

	const handleShowMuted = () => {
		setIsFilter(false);
		setShowMuted(true);
	};

	return (
		<div className={styles.container}>
			<header>
				{showMuted ? (
					<>
						<button
							className={styles.backButton}
							onClick={() => setShowMuted(false)}
						>
							<GoArrowLeft />
						</button>
						<h2 className={styles.title}>Muted</h2>
					</>
				) : showUnread ? (
					<>
						<button
							className={styles.backButton}
							onClick={() => setShowUnread(false)}
						>
							<GoArrowLeft />
						</button>
						<h2 className={styles.title}>Unread</h2>
					</>
				) : (
					<>
						<h2 className={styles.title}>Chats</h2>
						<div className={`${styles.kebabMenu} ${styles.showLeft}`}>
							<button
								className={styles.filterButton}
								onClick={handleToggleFilter}
							>
								<IoFilter />
							</button>
							<div
								id="filterRooms"
								ref={filterRoomsRef}
								className={`${styles.dropdown} ${isFilter ? styles.show : ""}`}
							>
								{/* <button onClick={handleShowUnread}>
									Unread <MdOutlineMarkUnreadChatAlt />
								</button> */}
								<button onClick={handleShowMuted}>
									Muted <IoVolumeMuteOutline />
								</button>
							</div>
						</div>
					</>
				)}
			</header>

			<form className={styles.chatSearch} onSubmit={handleCreateChannel}>
				<input
					name="channelName"
					placeholder="Search or create a room"
					value={searchTerm}
					onChange={handleSearch}
					autoFocus
					autoComplete="off"
					maxLength={35}
				/>
				<button type="submit" className={styles.chatSearchButton}>
					{searchTerm ? <MdAddCircle /> : <MdSearch />}
				</button>
			</form>

			<div className={styles.scrollable}>
				{filteredChannels?.map(({ isMuted, channels: { id, name } }) => (
					<ListItem key={id} roomID={id} roomName={name} isMuted={isMuted} />
				))}
			</div>
			{isChatControlOpen && <ChatSettings />}
		</div>
	);
};

export default RoomList;
