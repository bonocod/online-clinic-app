import { io } from "socket.io-client";
const SOCKET_URL =
  process.env.REACT_APP_SOCKET_URL ||
  process.env.REACT_APP_API_BASE_URL ||
  "http://localhost:5000";

let socket = null;

const emitAuth = () => {
  const token = localStorage.getItem("token");
  if (socket && token) {
    socket.emit("auth", { token });
  }
};

export const getSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false,
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 500,
    });
    socket.on("connect", () => {
      emitAuth();
    });
  }
  return socket;
};

export const connectSocket = () => {
  const s = getSocket();
  if (!s.connected) s.connect();
  else emitAuth();
  return s;
};

// Existing joins (unchanged)
export const joinGroup = (groupId) => getSocket().emit("joinGroup", groupId);
export const leaveGroup = (groupId) => getSocket().emit("leaveGroup", groupId);
export const joinCircle = (circleId) => getSocket().emit("joinCircle", circleId);
export const leaveCircle = (circleId) => getSocket().emit("leaveCircle", circleId);
export const joinCategory = (categoryId) => getSocket().emit("joinCategory", categoryId);
export const leaveCategory = (categoryId) => getSocket().emit("leaveCategory", categoryId);
export const joinPost = (postId) => getSocket().emit("joinPost", postId);
export const leavePost = (postId) => getSocket().emit("leavePost", postId);
export const joinDiscussion = (discussionId) => getSocket().emit("joinDiscussion", discussionId);
export const leaveDiscussion = (discussionId) => getSocket().emit("leaveDiscussion", discussionId);
export const joinLiveSession = (sessionId) => getSocket().emit("joinLiveSession", sessionId);
export const leaveLiveSession = (sessionId) => getSocket().emit("leaveLiveSession", sessionId);
export const joinUserRoom = (userId) => getSocket().emit("joinUser", userId);
export const leaveUserRoom = (userId) => getSocket().emit("leaveUser", userId);
export const joinAdmin = () => getSocket().emit("joinAdmin");
export const leaveAdmin = () => getSocket().emit("leaveAdmin");
export const joinProfessionals = () => getSocket().emit("joinProfessionals");
export const leaveProfessionals = () => getSocket().emit("leaveProfessionals");
export const joinDoctors = () => getSocket().emit("joinDoctors");
export const leaveDoctors = () => getSocket().emit("leaveDoctors");

// NEW PUBLIC HEALTH HUB SOCKETS
export const joinPublicHealthHub = () => getSocket().emit("joinPublicHealthHub");
export const leavePublicHealthHub = () => getSocket().emit("leavePublicHealthHub");
export const joinPublicHealthEvent = (eventId) => getSocket().emit("joinPublicHealthEvent", eventId);
export const leavePublicHealthEvent = (eventId) => getSocket().emit("leavePublicHealthEvent", eventId);