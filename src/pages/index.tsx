import ChatLayout from "@/components/ChatLayout";
import ChatRoom from "@/components/ChatRoom";
import ChannelsContext from "@/lib/ChannelsContext";
import { useState } from "react";

export default function Home() {
  const [activeChannelId, setActiveChannelId] = useState(1);
  const [activeChannelName, setActiveChannelName] = useState("");

  return (
    <ChannelsContext.Provider
      value={{
        activeChannelName,
        setActiveChannelName,
        activeChannelId,
        setActiveChannelId,
      }}
    >
      <ChatLayout>
        <ChatRoom />
      </ChatLayout>
    </ChannelsContext.Provider>
  );
}
