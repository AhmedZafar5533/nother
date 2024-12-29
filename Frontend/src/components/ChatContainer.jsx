import React, { useEffect, useRef } from "react";
import { useChatStore } from "../lib/useChatStore";
import ChatHeader from "./ChatHeader";
import MessagesInput from "./MessagesInput";
import MessageSkeleton from "./Skeletons/MessagesSkeleton";
import { useAuthStore } from "../lib/useAuthStore";
import { formatMessageTime } from "../lib/utils";

export default function ChatContainer() {
    const {
        messages,
        isMessagesLoading,
        getMesasges,
        selectedUser,
        subscribeToMessages,
        unsubscribeToMessages,
    } = useChatStore();
    const { authUser, checkAuth } = useAuthStore();
    const messageEndRef = useRef(null);
    useEffect(() => {
        checkAuth();
        getMesasges(selectedUser._id);
        subscribeToMessages();
        return () => {
            unsubscribeToMessages();
        };
    }, [selectedUser._id, getMesasges, checkAuth, subscribeToMessages, unsubscribeToMessages]);
    useEffect(() => {
        if (messageEndRef.current && messages) {
            messageEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);
    if (isMessagesLoading)
        return (
            <div className="flex-1 flex flex-col overflow-auto ">
                <ChatHeader></ChatHeader>
                <MessageSkeleton></MessageSkeleton>
                <MessagesInput></MessagesInput>
            </div>
        );
    return (
        <div className="flex-1 flex flex-col overflow-auto">
            <ChatHeader />

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                    <div
                        key={message._id}
                        className={`chat ${
                            message.senderId === authUser._id
                                ? "chat-end"
                                : "chat-start"
                        }`}
                        ref={messageEndRef}
                    >
                        <div className=" chat-image avatar">
                            <div className="size-10 rounded-full border">
                                <img
                                    src={
                                        message.senderId === authUser._id
                                            ? authUser.profilePic ||
                                              "/avatar.png"
                                            : selectedUser.profilePic ||
                                              "/avatar.png"
                                    }
                                    alt="profile pic"
                                />
                            </div>
                        </div>
                        <div className="chat-header mb-1">
                            <time className="text-xs opacity-50 ml-1">
                                {formatMessageTime(message.createdAt)}
                            </time>
                        </div>
                        <div className="chat-bubble flex flex-col">
                            {message.image && (
                                <img
                                    src={message.image}
                                    alt="Attachment"
                                    className="sm:max-w-[200px] rounded-md mb-2"
                                />
                            )}
                            {message.text && <p>{message.text}</p>}
                        </div>
                    </div>
                ))}
            </div>

            <MessagesInput />
        </div>
    );
}
