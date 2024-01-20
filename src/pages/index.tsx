import ChatLayout from "@/components/ChatLayout";
import ChatRoom from "@/components/ChatRoom";

import ChannelsContext from "@/lib/ChannelsContext";
import { supabase } from "@/lib/supabase";

import { useEffect, useState } from "react";

import { useRouter } from "next/router";
import AuthContext from "@/lib/AuthContext";

export default function Home() {
  const router = useRouter();

  const [activeChannelId, setActiveChannelId] = useState(1);
  const [activeChannelName, setActiveChannelName] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [userId, setUserId] = useState("");

  useEffect(() => {
    async function checkUser() {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        router.push("/login");
      } else {
        setIsLoggedIn(true);

        setUserId(data.user.id);
        console.log(userId);
      }
    }

    checkUser();
  }, [router, userId]);

  return (
    <AuthContext.Provider
      value={{
        userId,
        setUserId,
        isLoggedIn,
        setIsLoggedIn,
      }}
    >
      <ChannelsContext.Provider
        value={{
          activeChannelName,
          setActiveChannelName,
          activeChannelId,
          setActiveChannelId,
        }}
      >
        {isLoggedIn && (
          <ChatLayout>{activeChannelName && <ChatRoom />}</ChatLayout>
        )}
      </ChannelsContext.Provider>
    </AuthContext.Provider>
  );
}
