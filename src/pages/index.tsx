import Layout from "@/components/Layout";
import ChatRoom from "@/components/ChatRoom";

import ChannelsContext from "@/lib/ChannelsContext";
import { supabase } from "@/lib/supabase";

import { useContext, useEffect, useState } from "react";

import { useRouter } from "next/router";
import AuthContext from "@/lib/AuthContext";
import Head from "next/head";
import FeedbackContext from "@/lib/FeedbackContext";
import { alertMessage } from "@/components/Alert";
import Loading from "@/components/Loading";
import MessageContext from "@/lib/MessageContext";

export default function HomePage() {
  const router = useRouter();

  const [activeChannelId, setActiveChannelId] = useState(1);
  const [activeChannelName, setActiveChannelName] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [messageLoading, setMessageLoading] = useState(false);
  const [alert, setAlert] = useState<alertMessage | null>(null);

  const [userId, setUserId] = useState("");

  const [newMsgRoomIDs, setNewMsgRoomIDs] = useState<number[]>([]);
  const [newMsgSender, setNewMsgSender] = useState<string>("");
  const [newMsgCount, setNewMsgCount] = useState<number>(0);

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
          <FeedbackContext.Provider
            value={{
              alert,
              setAlert,
              isLoading,
              setIsLoading,
              messageLoading,
              setMessageLoading,
            }}
          >
            <MessageContext.Provider
              value={{
                newMsgRoomIDs,
                setNewMsgRoomIDs,
                newMsgSender,
                setNewMsgSender,
                newMsgCount,
                setNewMsgCount,
              }}
            >
              {isLoading && <Loading />}
              {isLoggedIn && !isLoading && <Layout>{<ChatRoom />}</Layout>}
            </MessageContext.Provider>
          </FeedbackContext.Provider>
        </ChannelsContext.Provider>
      </AuthContext.Provider>
    </>
  );
}
