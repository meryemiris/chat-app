import Layout from "@/components/Layout";
import ChatRoom from "@/components/ChatRoom";

import ChannelsContext from "@/lib/ChannelsContext";
import { supabase } from "@/lib/supabase";

import { useEffect, useState } from "react";

import { useRouter } from "next/router";
import AuthContext from "@/lib/AuthContext";
import Head from "next/head";

export default function HomePage() {
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
      }
    }

    checkUser();
  }, [router, userId]);

  return (
    <>
      <Head>
        <title>mushRoom</title>
        <meta
          name="description"
          content="Join the Fungal Fun, Chat with your friends"
        />
      </Head>
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
          {isLoggedIn && <Layout>{<ChatRoom />}</Layout>}
        </ChannelsContext.Provider>
      </AuthContext.Provider>
    </>
  );
}
