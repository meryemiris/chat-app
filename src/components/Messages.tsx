import { useContext, useEffect, useRef, useState } from "react";
import Image from "next/image";

import styles from "./Messages.module.css";

import { supabase } from "@/lib/supabase";
import ChannelsContext from "@/lib/ChannelsContext";
import AuthContext from "@/lib/AuthContext";
import FeedbackContext from "@/lib/FeedbackContext";
import MessageContext from "@/lib/MessageContext";
import { Message } from "@/types";

import Loading from "./Loading";

type MessagesProps = {
  searchTerm: string;
};

const Messages: React.FC<MessagesProps> = ({ searchTerm }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const { activeChannelId } = useContext(ChannelsContext);
  const { userId } = useContext(AuthContext);

  const messageEndRef = useRef<HTMLDivElement>(null);
  const { messageLoading, setMessageLoading } = useContext(FeedbackContext);

  const {
    setNewMsgSender,
    setNewMsgRoomIDs,
    newMsgCount,
    setNewMsgCount,
    newMsgRoomIDs,
  } = useContext(MessageContext);

  useEffect(() => {
    async function getMessages() {
      try {
        setMessageLoading(true);
        const { data, error } = await supabase
          .from("messages")
          .select(
            "users(username, profile_img), id, content, created_at, user_id"
          )
          .eq("channel_id", activeChannelId);

        if (error) {
          throw error;
        }

        if (data) {
          setMessages(data as []);
        } else {
          console.log(error);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setMessageLoading(false);
      }
    }

    getMessages();
  }, [activeChannelId, userId, setMessageLoading]);

  useEffect(() => {
    const channel = supabase
      .channel("messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `channel_id=eq.${activeChannelId}`,
        },
        async (payload: { new: Message }) => {
          const userData = await supabase
            .from("users")
            .select("username, profile_img")
            .eq("id", payload.new.user_id)
            .single();

          const newMsg = payload.new;

          if (newMsgRoomIDs.includes(payload.new.channel_id)) {
            return;
          } else {
            setNewMsgRoomIDs(
              (prev) => [...prev, newMsg.channel_id] as number[]
            );
          }

          setNewMsgSender(newMsg.user_id);

          const newMessage = {
            ...payload.new,
            users: userData.data,
          };

          setMessages((prev) => [...prev, newMessage] as Message[]);
          // setNewMsgCount(newMsgCount + 1);

          if (activeChannelId === newMsg.channel_id) {
            setNewMsgCount(newMsgCount + 1);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [
    activeChannelId,
    userId,
    setNewMsgSender,
    setNewMsgRoomIDs,
    newMsgCount,
    setNewMsgCount,
    newMsgRoomIDs,
  ]);

  const filteredMessages = messages.filter((message) =>
    message.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const scrollToBottom = () => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollTop = messageEndRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <main ref={messageEndRef} className={styles.scrollable}>
      {messageLoading ? (
        <Loading />
      ) : (
        <>
          {filteredMessages.length === 0 && (
            <p className={styles.noMessages}>
              No messages? Time to break the silence! 🤐💬
            </p>
          )}
          {filteredMessages.map(
            ({ user_id, content, id, created_at, users }) => (
              <div
                key={id}
                className={
                  userId === user_id
                    ? styles.myMessageContainer
                    : styles.messageContainer
                }
              >
                <div>
                  {userId !== user_id && (
                    <Image
                      className={styles.avatar}
                      src={
                        users.profile_img ? users.profile_img : "/defaultPp.png"
                      }
                      alt=""
                      width={50}
                      height={50}
                    />
                  )}
                </div>
                <div
                  className={
                    userId === user_id ? styles.myMessage : styles.message
                  }
                >
                  {userId !== user_id && (
                    <p className={styles.username}>{users?.username}</p>
                  )}
                  <p className={styles.content}>{content}</p>
                  <p className={styles.createdAt}>
                    {created_at.split(":").slice(0, 2).join(":")}
                  </p>
                </div>
              </div>
            )
          )}
        </>
      )}
    </main>
  );
};

export default Messages;
