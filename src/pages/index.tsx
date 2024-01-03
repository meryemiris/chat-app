import ChatLayout from "@/components/ChatLayout";
import ChatRoom from "@/components/ChatRoom";

import ChannelsContext from "@/lib/ChannelsContext";
import { supabase } from "@/lib/supabase";

import { useEffect, useState } from "react";

import { Router, useRouter } from "next/router";

export default function Home() {
  const router = useRouter();

  const [activeChannelId, setActiveChannelId] = useState(1);
  const [activeChannelName, setActiveChannelName] = useState("");
  const [isUser, setIsUser] = useState(false);

  useEffect(() => {
    async function checkUser() {
      const { data } = await supabase.auth.getUser();

      if (data.user === null) {
        router.push("/login");
      } else {
        setIsUser(true);
      }
    }

    checkUser();
  }, [router]);

  return (
    <ChannelsContext.Provider
      value={{
        activeChannelName,
        setActiveChannelName,
        activeChannelId,
        setActiveChannelId,
      }}
    >
      {isUser && (
        <ChatLayout>
          <ChatRoom />
        </ChatLayout>
      )}
    </ChannelsContext.Provider>
  );
}
