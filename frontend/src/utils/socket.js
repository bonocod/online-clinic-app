// frontend/src/utils/socket.js
import { io } from "socket.io-client";

const SOCKET_URL =
  process.env.REACT_APP_SOCKET_URL ||
  process.env.REACT_APP_API_BASE_URL ||
  "http://localhost:5000";

let socket = null;

export const getSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false,
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 500,
    });
  }
  return socket;
};

export const connectSocket = () => {
  const s = getSocket();
  if (!s.connected) s.connect();

  const token = localStorage.getItem("token");
  if (token) s.emit("auth", { token });

  return s;
};

export const joinGroup = (groupId) => getSocket().emit("joinGroup", groupId);
export const leaveGroup = (groupId) => getSocket().emit("leaveGroup", groupId);

export const joinCategory = (categoryId) => getSocket().emit("joinCategory", categoryId);
export const leaveCategory = (categoryId) => getSocket().emit("leaveCategory", categoryId);

export const joinPost = (postId) => getSocket().emit("joinPost", postId);
export const leavePost = (postId) => getSocket().emit("leavePost", postId);

export const joinDiscussion = (discussionId) => getSocket().emit("joinDiscussion", discussionId);
export const leaveDiscussion = (discussionId) => getSocket().emit("leaveDiscussion", discussionId);

export const joinUserRoom = (userId) => getSocket().emit("joinUser", userId);
export const leaveUserRoom = (userId) => getSocket().emit("leaveUser", userId);
export const joinAdmin = (userId) => getSocket().emit('joinAdmin');