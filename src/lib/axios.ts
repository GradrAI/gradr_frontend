// lib/axios.ts
import { BASE_URL } from "@/requests/constants";
import axios from "axios";
import useStore from "@/state";

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  return config;
});

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.data.message === "Unauthorized") {
      useStore.getState().reset();
      window.location.href = "/auth/sign-in?expired=true";
    }

    return Promise.reject(error);
  }
);


export default api;

