import { NextPage } from "next";
import { ReactElement, ReactNode } from "react";

export type ChatRoom = {
	id: number;
	channels: {
		name: string;
		id: number;
	};
	isMuted: boolean;
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

export type NextPageWithLayout = NextPage & {
	getLayout?: (page: ReactElement) => ReactNode;
};
