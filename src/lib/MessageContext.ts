import { createContext, Dispatch, SetStateAction } from "react";

interface MessageContextProps {
  newMsgSender: string;
  setNewMsgSender: Dispatch<SetStateAction<string>>;

  newMsgCount: number; // Change this line
  setNewMsgCount: Dispatch<SetStateAction<number>>; // Change this line

  newMsgRoomIDs: number[];
  setNewMsgRoomIDs: Dispatch<SetStateAction<number[]>>; // Change this line
}

const MessageContext = createContext<MessageContextProps>({
  newMsgSender: "",
  setNewMsgSender: () => {},

  newMsgCount: 0,
  setNewMsgCount: () => {},

  newMsgRoomIDs: [],
  setNewMsgRoomIDs: () => {},
});

export default MessageContext;
