// api/chatEndpoints.js

import axiosInstance from "./apiinstance";


export const getChatMessages = (bookingId) =>{

    return axiosInstance.get(`/api/chat/${bookingId}`);
}

export const getUnreadCount = () => {
  return axiosInstance.get("/api/chat/unread/count");
}

export const getMyConversations = () => {
  return axiosInstance.get("/api/chat/conversations");
};