// lib/axios.ts
import { BASE_URL } from "@/requests/constants";
import axios from "axios";
import useStore from "@/state";

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = useStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

import { queryClient } from "@/lib/queryClient";

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      queryClient.clear();
      useStore.getState().reset();
      window.location.href = "/auth/sign-in?expired=true";
    }

    return Promise.reject(error);
  }
);


export default api;

