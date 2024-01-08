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

  useEffect(() => {
    async function getProfilePic() {
      let { data, error } = await supabase
        .from("users")
        .select("profile_img")
        .eq("id", userId);

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
