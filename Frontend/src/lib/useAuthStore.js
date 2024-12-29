import { create } from "zustand";
import { axiosInsatnce } from "./aiox";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

// in development mode, the base URL is http://localhost:3001/api
const Base_url = "/api";

export const useAuthStore = create((set, get) => ({
    authUser: null,
    isSigningUp: false,
    isLoggingIn: false,
    isUpdatingProfile: false,
    isCheckingAuth: true,
    authStatus: false,
    onlineUsers: [],
    socket: null,

    checkAuth: async () => {
        try {
            const response = await axiosInsatnce.get("/auth/check");
            if (response.status === 200) {
                await set({
                    authUser: response.data,
                    authStatus: true,
                });
                await get().connectSocket();
            }
        } catch (error) {
            console.error("Error in check auth Zustand:", error);
            set({ authUser: null, isCheckingAuth: false });
        } finally {
            set({ isCheckingAuth: false });
        }
    },

    signUp: async (data) => {
        try {
            set({ isSigningUp: true });
            const response = await axiosInsatnce.post("/auth/signup", data);
            if (response.status === 201) {
                toast.success("Account created successfully!");
                await set({ authUser: response.data });
                await get().connectSocket();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Signup failed!");
        } finally {
            set({ isSigningUp: false });
        }
    },

    login: async (data) => {
        try {
            set({ isLoggingIn: true });
            const response = await axiosInsatnce.post("/auth/login", data);
            if (response.status === 200) {
                toast.success(response.data.message || "Login Successful!");
                get().checkAuth();
                if (get().socket?.connected) {
                    get().disconnetSocket(); // Ensure old socket is disconnected
                }

                await set({ authUser: response.data });
                await get().connectSocket();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Login failed!");
        } finally {
            set({ isLoggingIn: false });
        }
    },

    logOut: async () => {
        try {
            const response = await axiosInsatnce.post("auth/logout");
            if (response.status === 200) {
                toast.success(response.data.message);
                set({ authUser: null });
                get().disconnetSocket();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Logout failed!");
        }
    },

    updateProfile: async (data) => {
        set({ isUpdatingProfile: true });
        try {
            const response = await axiosInsatnce.put(
                "auth/update-profile",
                data
            );
            set({ authUser: response.data });
            toast.success("Profile updated successfully!");
        } catch (error) {
            toast.error("Profile update failed!");
        } finally {
            set({ isUpdatingProfile: false });
        }
    },

    connectSocket: async () => {
        const { authUser, socket } = get();
        console.log("Auth User:", authUser);
        if (!authUser?._id || socket?.connected) {
            console.log("Socket connection skipped.");
            return;
        }

        const newSocket = io(Base_url, {
            query: { userId: authUser._id },
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        newSocket.connect();

        set({ socket: newSocket });

        console.log("Socket connected:", newSocket.connected);

        newSocket.on("getOnlineUsers", (users) => {
            console.log("Online users updated:", users);
            set({ onlineUsers: users });
        });

        newSocket.on("connect_error", (err) => {
            console.error("Socket connection error:", err);
        });
    },

    disconnetSocket: () => {
        const { socket } = get();
        if (socket?.connected) {
            socket.disconnect();
            console.log("Socket disconnected.");
        }
        set({ socket: null, onlineUsers: [] });
    },
}));
