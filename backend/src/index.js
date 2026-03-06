// FILE: backend/src/index.js
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const i18n = require("./config/i18n");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const cloudinary = require("cloudinary").v2;

dotenv.config();
connectDB();

const app = express();

/**
 * CORS
 * If you later use cookies/credentials, replace origin:"*" with your frontend URL
 */
app.use(cors({ origin: "*", methods: ["GET", "POST", "PUT", "PATCH", "DELETE"] }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(i18n.init);

// Debug (optional)
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Serve static files for uploads
app.use("/uploads/posts", express.static(path.join(process.cwd(), "uploads/posts")));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/diseases", require("./routes/diseases"));
app.use("/api/users", require("./routes/users"));

// Community Forum
app.use("/api/forum", require("./routes/forum"));

// Professional Console
app.use("/api/professional", require("./routes/professional"));

app.use("/api/behaviors", require("./routes/behaviors"));

// Videos
app.use("/api/categories", require("./routes/categories"));
app.use("/api/videos", require("./routes/videos"));

// Admin routes
app.use("/api/admin", require("./routes/admin"));

// Create server FIRST, then socket.io
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  },
});

app.set("io", io);

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  /**
   * Existing rooms (you already use some of these)
   */
  socket.on("joinGroup", (groupId) => socket.join(String(groupId)));
  socket.on("joinCircle", (circleId) => socket.join(`circle_${circleId}`));
  socket.on("joinLiveSession", (sessionId) => socket.join(`live_${sessionId}`));

  /**
   * Forum rooms (Category page live updates)
   * Backend emits to: category_<id>
   */
  socket.on("joinCategory", (categoryId) => socket.join(`category_${categoryId}`));
  socket.on("leaveCategory", (categoryId) => socket.leave(`category_${categoryId}`));

  /**
   * Discussion rooms (Discussion page live updates)
   * Backend emits to: discussion_<id>
   */
  socket.on("joinDiscussion", (discussionId) => socket.join(`discussion_${discussionId}`));
  socket.on("leaveDiscussion", (discussionId) => socket.leave(`discussion_${discussionId}`));

  /**
   * Post rooms (Post detail page live updates)
   * NOTE: your forum.js emitPostEvent ALWAYS emits to: post_<postId>
   */
  socket.on("joinPost", (postId) => socket.join(`post_${postId}`));
  socket.on("leavePost", (postId) => socket.leave(`post_${postId}`));

  /**
   * Role / user targeted rooms used by your forum.js routes:
   * - io.to("admin")...
   * - io.to("professionals")...
   * - io.to("doctors")...
   * - io.to(`user_${id}`)...
   */
  socket.on("joinAdmin", () => socket.join("admin"));
  socket.on("leaveAdmin", () => socket.leave("admin"));

  socket.on("joinProfessionals", () => socket.join("professionals"));
  socket.on("leaveProfessionals", () => socket.leave("professionals"));

  socket.on("joinDoctors", () => socket.join("doctors"));
  socket.on("leaveDoctors", () => socket.leave("doctors"));

  socket.on("joinUser", (userId) => {
    if (!userId) return;
    socket.join(`user_${String(userId)}`);
    socket.data.userId = String(userId);
  });
  socket.on("leaveUser", (userId) => {
    if (!userId) return;
    socket.leave(`user_${String(userId)}`);
    if (socket.data.userId === String(userId)) socket.data.userId = null;
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id, socket.data?.userId ? `(user_${socket.data.userId})` : "");
  });
});

// Global error handler
app.use(require("./utils/errorHandler"));

app.get("/", (req, res) => res.send("Online Clinic API is running!"));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));