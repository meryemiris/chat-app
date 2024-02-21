import { useEffect, useState } from "react";

import { useRouter } from "next/router";
import Head from "next/head";

import { alertMessage } from "@/components/Alert";
import Loading from "@/components/Loading";
import Layout from "@/components/Layout";
import ChatRoom from "@/components/ChatRoom";

import { supabase } from "@/lib/supabase";
import AuthContext from "@/lib/AuthContext";
import FeedbackContext from "@/lib/FeedbackContext";
import MessageContext from "@/lib/MessageContext";
import RoomContext from "@/lib/RoomContext";

import { Message } from "@/types";

export default function HomePage() {
  const router = useRouter();

  const [userId, setUserId] = useState("");

  const [activeChannelId, setActiveChannelId] = useState<number | null>(null);
  const [activeChannel, setActiveChannel] = useState([]);
  const [activeChannelName, setActiveChannelName] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState<alertMessage | null>(null);

  const [unreadMessages, setUnreadMessages] = useState<Message[]>([]);
  const [roomIdsWithUnreadMessages, setRoomIdsWithUnreadMessages] = useState<
    number[]
  >([]);
  const [showRoomDetails, setShowRoomDetails] = useState<boolean>(false);

  const [mutedRooms, setMutedRooms] = useState<number[]>([]);
  const [isRoomMuted, setIsRoomMuted] = useState<boolean>(false);

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
        <RoomContext.Provider
          value={{
            activeChannelName,
            setActiveChannelName,
            activeChannelId,
            setActiveChannelId,
            mutedRooms,
            setMutedRooms,
            showRoomDetails,
            setShowRoomDetails,
            isRoomMuted,
            setIsRoomMuted,
          }}
        >
          <FeedbackContext.Provider
            value={{
              alert,
              setAlert,
              isLoading,
              setIsLoading,
            }}
          >
            <MessageContext.Provider
              value={{
                unreadMessages,
                setUnreadMessages,
                roomIdsWithUnreadMessages,
                setRoomIdsWithUnreadMessages,
              }}
            >
              {isLoading && <Loading />}
              {isLoggedIn && !isLoading && <Layout>{<ChatRoom />}</Layout>}
            </MessageContext.Provider>
          </FeedbackContext.Provider>
        </RoomContext.Provider>
      </AuthContext.Provider>
    </>
  );
}
