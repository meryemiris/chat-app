import ChatLayout from "@/components/ChatLayout";
import ChatRoom from "@/components/ChatRoom";

import ChannelsContext from "@/lib/ChannelsContext";
import { supabase } from "@/lib/supabase";

import { useEffect, useState } from "react";

import { Router, useRouter } from "next/router";
import AuthContext from "@/lib/AuthContext";

export default function Home() {
  const router = useRouter();

  const [activeChannelId, setActiveChannelId] = useState(1);
  const [activeChannelName, setActiveChannelName] = useState("");
  const [isUser, setIsUser] = useState(false);
  const [username, setUsername] = useState("");

  useEffect(() => {
    async function checkUser() {
      const { data } = await supabase.auth.getUser();

      if (data.user === null) {
        router.push("/login");
      } else {
        setIsUser(true);
        setUsername(data.user.user_metadata.username);
        console.log("username:", data.user.user_metadata.username);
        console.log("user:", data.user);
      }
    }

    checkUser();
  }, [router]);

  return (
    <AuthContext.Provider
      value={{ username, setUsername, profilePic: "", setProfilePic: () => {} }}
    >
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
    </AuthContext.Provider>
  );
}
