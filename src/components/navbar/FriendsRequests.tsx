import { useContext, useEffect, useRef, useState } from "react";
import Image from "next/image";

import styles from "./FriendsRequests.module.css";

import AuthContext from "@/lib/AuthContext";
import { supabase } from "@/lib/supabase";

import { alertMessage } from "../utils/Alert";

import { FaBell } from "react-icons/fa";

type Request = {
	room_id: number;
	users: {
		username: string;
		profile_img: string;
	};
	channels: {
		name: string;
	};
} | null;

const FriendRequests = () => {
	const dropdownRef = useRef<HTMLDivElement>(null);
	const [dropdownVisible, setDropdownVisible] = useState(false);
	const { userId } = useContext(AuthContext);

	const [requests, setRequests] = useState<Request[]>([]);

	const handleToggleDropdown = () => {
		setDropdownVisible(!dropdownVisible);
	};

	useEffect(() => {
		const getRequests = async () => {
			let { data, error } = await supabase
				.from("requests")
				.select(
					`
        room_id,
        users (
          username,
          profile_img
        ),
        channels(
          name

        )
      `
				)
				.eq("receiver_id", userId);

			const requestsInfo = data as unknown as Request[];
			console.log("requestsInfo", requestsInfo);
			setRequests(requestsInfo);

			if (error) {
				console.log(error);
			}
		};
		getRequests();
	}, [userId]);

	useEffect(() => {
		const channels = supabase
			.channel("custom-all-channel")
			.on(
				"postgres_changes",
				{
					event: "INSERT",
					schema: "public",
					table: "requests",
				},
				(payload) => {
					if (
						payload.new.receiver_id === userId &&
						!requests.includes(payload.new as Request)
					) {
						setRequests((prevRequests) => [
							...prevRequests,
							payload.new as Request,
						]);
					}
				}
			)
			.subscribe();

		return () => {
			supabase.removeChannel(channels);
		};
	}, [requests, userId]);

	const handleDeclineRequest = async (roomID: number) => {
		try {
			const { data, error: error2 } = await supabase
				.from("requests")
				.delete()
				.eq("room_id", roomID);
		} catch (error) {
			console.log(error);
		} finally {
			setDropdownVisible(false);
			setRequests((prevRequests) => {
				return prevRequests.filter((request) => request?.room_id !== roomID);
			});
		}
	};

	const handleJoinRoom = async (roomID: number) => {
		try {
			const { data, error } = await supabase
				.from("members")
				.insert([{ room_id: roomID, user_id: userId }])
				.select();

			if (error) {
				console.error("Error joining room with:", error.message);
				// Handle error, show user feedback, etc.
			} else {
				console.log("Joined room successfully:", data);
				// Provide positive feedback to the user, update UI, etc.
			}

			// Delete request from database
			try {
				const { data: data2, error: error2 } = await supabase
					.from("requests")
					.delete()
					.eq("room_id", roomID);
			} catch (error) {
				console.log(error);
			}
		} catch (error) {
			console.error("Unexpected error:", error);
		} finally {
			setDropdownVisible(false);
		}
	};

	useEffect(() => {
		const handleClickOutsideDropdown = (e: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(e.target as Node)
			) {
				setDropdownVisible(false);
			}
		};

		const handleClick = (e: MouseEvent) => {
			handleClickOutsideDropdown(e);
		};

		document.addEventListener("mousedown", handleClick);

		return () => {
			document.removeEventListener("mousedown", handleClick);
		};
	}, []);

	return (
		<div className={`${styles.kebabMenu} ${styles.showRight}`}>
			<button className={styles.notification} onClick={handleToggleDropdown}>
				<FaBell />
				{requests !== null && (
					<span className={styles.notificationCount}>
						{requests?.length > 0 && requests?.length}
					</span>
				)}
			</button>
			<div
				ref={dropdownRef}
				id="dropdown"
				className={`${styles.dropdown} ${dropdownVisible ? styles.show : ""} ${
					requests === null ? styles.emptyDropdown : ""
				}`}
			>
				<h6>Room Requests</h6>

				{requests && requests.length > 0 ? (
					requests.map((request) => (
						<div className={styles.request} key={request?.room_id}>
							<Image
								className={styles.profileImg}
								src={request ? request.users?.profile_img : "defaultPp.png"}
								alt="profile"
								width={40}
								height={40}
							/>
							<p>
								<span className={styles.senderName}>
									{request?.users?.username}
								</span>
								invited you to join
								<span className={styles.roomName}>
									{request?.channels?.name}
								</span>
								room
							</p>
							<div className={styles.buttons}>
								<button
									onClick={() => handleJoinRoom(request?.room_id as number)}
									className={styles.acceptButton}
								>
									Accept
								</button>
								<button
									onClick={() =>
										handleDeclineRequest(request?.room_id as number)
									}
									className={styles.declineButton}
								>
									Decline
								</button>
							</div>
						</div>
					))
				) : (
					<p>No requests yet.</p>
				)}
			</div>
		</div>
	);
};

export default FriendRequests;
