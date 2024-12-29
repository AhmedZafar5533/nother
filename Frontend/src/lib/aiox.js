import axios from "axios";

// in development mode, the base URL is http://localhost:3001/api
export const axiosInsatnce = axios.create({
    baseURL: "/api",
    withCredentials: true,
});
