export type ChatRoom = {
	channels: {
		name: string;
		id: number;
	};
	isMuted: boolean;
	users: {
		id: string;
		username: string;
		profile_img: string;
	}[];
};

export type Message = {
	id: number;
	content: string;
	created_at: string;
	chatroom_id: number;
	user_id: string;
	users: {
		username: string;
		profile_img: string;
	};
};
