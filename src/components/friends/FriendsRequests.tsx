import { useEffect, useState } from "react";
import Image from "next/image";

import styles from "./FriendsRequests.module.css";

import { supabase } from "@/lib/supabase";

import { useAuthContext } from "@/lib/AuthContext";
import { toast } from "sonner";

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
	const { userId } = useAuthContext();
	const [requests, setRequests] = useState<Request[]>([]);

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
		const { data, error: error2 } = await supabase
			.from("requests")
			.delete()
			.eq("room_id", roomID);

		if (error2) {
			toast.error(error2.message);
			console.log(error2);
		}

		setRequests((prevRequests) => {
			return prevRequests.filter((request) => request?.room_id !== roomID);
		});
	};

	const handleJoinRoom = async (roomID: number) => {
		const { data, error } = await supabase
			.from("membership")
			.insert([{ room_id: roomID, user_id: userId }])
			.select();

		if (error) {
			console.error("Error joining room with:", error.message);
			toast.error(error.message);
		} else {
			toast.success("Joined chat successfully");
		}

		// Delete request from database

		const { data: data2, error: error2 } = await supabase
			.from("requests")
			.delete()
			.eq("room_id", roomID);

		if (error2) {
			console.error("Error deleting request with:", error2.message);
			toast.error(error2.message);
		}
	};

	return (
		<div className={styles.container}>
			<h1 className={styles.title}>Chat Requests</h1>

			{requests && requests.length > 0 ? (
				requests.map((request) => (
					<div className={styles.request} key={request?.room_id}>
						<div className={styles.requestInfo}>
							<Image
								className={styles.profileImg}
								src={request ? request.users?.profile_img : "defaultPp.png"}
								alt="request sender profile img"
								width={40}
								height={40}
							/>
							<p>
								<span className={styles.senderName}>
									{request?.users?.username}{" "}
								</span>
								invited you to join{" "}
								<span className={styles.roomName}>
									{request?.channels?.name}
									{"."}
								</span>
							</p>
						</div>

						<div className={styles.buttons}>
							<button
								onClick={() => handleJoinRoom(request?.room_id as number)}
								className={styles.acceptButton}
							>
								Accept
							</button>
							<button
								onClick={() => handleDeclineRequest(request?.room_id as number)}
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
	);
};

export default FriendRequests;
