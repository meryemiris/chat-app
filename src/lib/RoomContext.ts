import { createContext, Dispatch, SetStateAction } from "react";

interface RoomContextProps {
	activeChannelName: string;
	setActiveChannelName: Dispatch<SetStateAction<string>>;

	activeChannelId: number | null;
	setActiveChannelId: Dispatch<SetStateAction<number | null>>;

	mutedRooms: number[] | null;
	setMutedRooms: Dispatch<SetStateAction<number[]>>;

	isRoomMuted: boolean;
	setIsRoomMuted: Dispatch<SetStateAction<boolean>>;

	showRoomDetails: boolean;
	setShowRoomDetails: Dispatch<SetStateAction<boolean>>;
}

const RoomContext = createContext<RoomContextProps>({
	activeChannelName: "",
	setActiveChannelName: () => {},

	activeChannelId: null,
	setActiveChannelId: () => {},

	mutedRooms: null,
	setMutedRooms: () => {},

	isRoomMuted: false,
	setIsRoomMuted: () => {},

	showRoomDetails: false,
	setShowRoomDetails: () => {},
});

export default RoomContext;
