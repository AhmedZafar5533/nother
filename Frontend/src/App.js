import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import SignUpPage from "./Pages/SignUpPage";
import HomePage from "./Pages/HomePage";
import LoginPage from "./Pages/LoginPage";
import SettingsPage from "./Pages/Settings";
import ProfilePage from "./Pages/ProfilePage";
import { useAuthStore } from "./lib/useAuthStore";
import { useEffect } from "react";
import { Loader } from "lucide-react";
import { Toaster } from "react-hot-toast";
import { useThemeStore } from "./lib/useTheme";

function App() {
    const { authUser, checkAuth, isCheckingAuth } = useAuthStore();
    const { theme } = useThemeStore();
    useEffect(() => {
        checkAuth();
    }, [checkAuth]);
    if (isCheckingAuth && !authUser) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader className="size-10 animate-spin"></Loader>
            </div>
        );
    }
    return (
        <div data-theme={theme} className=" flex flex-col">
            <Navbar>NavBar</Navbar>
            <Routes>
                <Route
                    path="/"
                    element={authUser ? <HomePage /> : <Navigate to="/login" />}
                ></Route>
                <Route
                    path="/signup"
                    element={!authUser ? <SignUpPage /> : <Navigate to="/" />}
                ></Route>
                <Route
                    path="/login"
                    element={!authUser ? <LoginPage /> : <Navigate to="/" />}
                ></Route>
                <Route path="/settings" element={<SettingsPage />}></Route>
                <Route
                    path="/profile"
                    element={
                        authUser ? <ProfilePage /> : <Navigate to="/login" />
                    }
                ></Route>
            </Routes>
            <Toaster></Toaster>
        </div>
    );
}

export default App;
