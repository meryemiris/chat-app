import { createContext } from "react";

const ChannelsContext = createContext({
  activeChannelName: "",
  setActiveChannelName: (name: string) => {},

  activeChannelId: 1,
  setActiveChannelId: (id: number) => {},
});

export default ChannelsContext;
