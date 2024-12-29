import { create } from "zustand";
import { axiosInsatnce } from "./aiox";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
    messages: [],
    users: [],
    selectedUser: null,
    isUsersLoading: false,
    isMessagesLoading: false,
    getUsers: async () => {
        set({ isUsersLoading: true });
        try {
            const response = await axiosInsatnce.get("/message/users");
            set({ users: response.data });
        } catch (error) {
            toast.error(error.response.data.message);
        } finally {
            set({ isUsersLoading: false });
        }
    },
    getMesasges: async (userId) => {
        set({ isMessagesLoading: true });
        try {
            const response = await axiosInsatnce.get(`/message/${userId}`);
            if (response.data.length > 0)
                return set({ messages: response.data });
            return set({ messages: [] });
        } catch (error) {
            toast.error(error.response.data.message);
            return set({ messages: [] });
        } finally {
            set({ isMessagesLoading: false });
        }
    },

    sendMessages: async (messageData) => {
        const { selectedUser, messages } = get();
        try {
            const response = await axiosInsatnce.post(
                `/message/send/${selectedUser._id}`,
                messageData
            );
            console.log("Send messages fucntion:");
            console.log(response.data);
            set({ messages: [...messages, response.data] });
        } catch (error) {
            toast.error(error.response.data.message);
        }
    },
    subscribeToMessages: () => {
        const { selectedUser } = get();
        if (!selectedUser) return;
        const socket = useAuthStore.getState().socket;
        if (!socket) return;
        socket.on("newMessage", (data) => {
            if (data.senderId === selectedUser._id) {
                set({ messages: [...get().messages, data] });
            }
        });
    },
    unsubscribeToMessages: () => {
        const socket = useAuthStore.getState().socket;
        if (!socket) return;
        socket.off("newMessage");
    },
    setSelectedUser: (selectedUser) => {
        set({ selectedUser: selectedUser });
    },
}));
