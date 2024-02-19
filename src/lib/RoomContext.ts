import { createContext } from "react";

const RoomContext = createContext({
  activeChannelName: "",
  setActiveChannelName: (name: string) => {},

  activeChannelId: 1,
  setActiveChannelId: (id: number) => {},

  mutedRooms: [] as number[],
  setMutedRooms: (roomIDs: (roomIDs: number[]) => number[]) => {},

  showRoomDetails: false,
  setShowRoomDetails: (show: boolean) => {},
});

export default RoomContext;
