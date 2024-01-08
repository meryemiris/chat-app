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
  const [profileImg, setProfileImg] = useState("");

  const [username, setUsername] = useState("");
  const [userId, setUserId] = useState("");

  useEffect(() => {
    async function checkUser() {
      const { data } = await supabase.auth.getUser();

      if (data.user === null) {
        router.push("/login");
      } else {
        setIsLoggedIn(true);
        setUsername(data.user.user_metadata.username);
        setUserId(data.user.id);
      }
    }

    checkUser();
  }, [router]);

  useEffect(() => {
    async function getProfilePic() {
      let { data, error } = await supabase
        .from("users")
        .select("profile_img")
        .eq("auth_id", userId);

      const profilePic = data?.[0]?.profile_img;
      if (profilePic) {
        setProfileImg(profilePic);
      }
    }
    getProfilePic();
  }, [userId]);

  return (
    <AuthContext.Provider
      value={{
        username,
        setUsername,
        userId,
        setUserId,
        isLoggedIn,
        setIsLoggedIn,
        profileImg,
        setProfileImg,
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
          <ChatLayout>
            <ChatRoom />
          </ChatLayout>
        )}
      </ChannelsContext.Provider>
    </AuthContext.Provider>
  );
}
