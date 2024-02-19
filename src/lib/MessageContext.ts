import { Message } from "@/types";
import { createContext } from "react";

const MessageContext = createContext({
  unreadMessages: [] as Message[],
  setUnreadMessages: (unreadMessages: (messages: Message[]) => Message[]) => {},

  roomIdsWithUnreadMessages: [] as number[],
  setRoomIdsWithUnreadMessages: (
    roomIDs: (roomIDs: number[]) => number[]
  ) => {},
});

export default MessageContext;
