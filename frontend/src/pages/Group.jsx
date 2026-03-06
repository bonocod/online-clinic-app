// frontend/src/pages/Group.jsx
import React, { useEffect, useRef, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import api, { getApiBase } from "../services/api";
import { AlertCircle, Send, Heart, MessageCircle } from "lucide-react";
import {
  connectSocket,
  joinGroup,
  leaveGroup,
} from "../utils/socket";

const Group = () => {
  const { id } = useParams();
  const { t } = useTranslation();

  const API_BASE = useMemo(() => getApiBase(), []);

  const [group, setGroup] = useState(null);
  const [posts, setPosts] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newComments, setNewComments] = useState({}); // { postId: 'content' }

  const messagesEndRef = useRef(null);

  const mediaUrl = (p) => {
    if (!p?.mediaUrl) return "";
    if (p.mediaUrl.startsWith("http")) return p.mediaUrl;
    return `${API_BASE}${p.mediaUrl}`;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const mergePost = (postId, patch) => {
    setPosts((prev) => prev.map((p) => (p._id === postId ? { ...p, ...patch } : p)));
  };

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const [resGroup, resPosts, resMessages, resProfile] = await Promise.all([
          api.get(`/forum/groups/${id}`),
          api.get(`/forum/groups/${id}/posts`),
          api.get(`/forum/groups/${id}/messages`),
          api.get("/auth/profile"),
        ]);

        if (!mounted) return;
        setGroup(resGroup.data);
        setPosts(Array.isArray(resPosts.data) ? resPosts.data : []);
        setMessages(Array.isArray(resMessages.data) ? resMessages.data : []);
        setUser(resProfile.data);
      } catch (err) {
        console.error("Fetch error:", err);
        if (!mounted) return;
        setError(t("forum.errorLoad"));
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchData();

    // ----- SOCKET -----
    const s = connectSocket();
    joinGroup(id);

    const onMessage = (msg) => setMessages((prev) => [...prev, msg]);

    const onNewPost = (post) => {
      // backend emits to group room, so this is already scoped
      setPosts((prev) => [post, ...prev]);
    };

    const onPostLiked = ({ postId, likes, upvotes }) => {
      // keep both updated
      mergePost(postId, { likes: likes || [], upvotes: upvotes || [] });
    };

    const onNewComment = (comment) => {
      const pid = comment?.post;
      if (!pid) return;

      setPosts((prev) =>
        prev.map((p) =>
          p._id === pid
            ? { ...p, comments: [...(p.comments || []), comment] }
            : p
        )
      );
    };

    s.on("message", onMessage);
    s.on("newPost", onNewPost);
    s.on("postLiked", onPostLiked);
    s.on("newComment", onNewComment);

    return () => {
      mounted = false;
      leaveGroup(id);
      s.off("message", onMessage);
      s.off("newPost", onNewPost);
      s.off("postLiked", onPostLiked);
      s.off("newComment", onNewComment);
    };
  }, [id, t]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    try {
      await api.post(`/forum/groups/${id}/messages`, { content: newMessage });
      setNewMessage("");
      // live comes from socket event
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  const handleLike = async (postId) => {
    try {
      // backend emits postLiked now
      await api.post(`/forum/posts/${postId}/like`);
    } catch (err) {
      console.error("Failed to like post:", err);
    }
  };

  const handleAddComment = async (postId) => {
    const content = newComments[postId];
    if (!content?.trim()) return;
    try {
      await api.post(`/forum/posts/${postId}/comments`, { content });
      setNewComments((prev) => ({ ...prev, [postId]: "" }));
      // live comes from socket event
    } catch (err) {
      console.error("Failed to add comment:", err);
    }
  };

  if (loading) return <p className="text-center text-lg py-10">{t("forum.loading")}</p>;

  if (error)
    return (
      <p className="text-red-500 text-center flex items-center justify-center py-10">
        <AlertCircle className="mr-2" />
        {error}
      </p>
    );

  if (!group || !user) return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-4 text-center text-dark">{group.name}</h1>
      <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto">{group.description}</p>

      <Link to={`/group/${id}/create-post`} className="btn-primary mb-10 block w-fit mx-auto px-8 py-3 text-lg">
        + {t("forum.createPost")}
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Posts */}
        <div className="lg:col-span-2 glass-card overflow-y-auto max-h-[90vh] pb-4">
          <h2 className="text-2xl font-bold mb-6 px-4 pt-4">{t("forum.posts")}</h2>

          <div className="space-y-10 px-4">
            {posts.length === 0 ? (
              <p className="text-center text-gray-500 py-10">No posts yet. Be the first to share!</p>
            ) : (
              posts.map((post) => {
                const liked = (post.likes || []).some((l) => l?.toString?.() === user._id?.toString?.());

                return (
                  <div key={post._id} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center p-4">
                      <img
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(post.author?.name || "User")}&background=random`}
                        alt="avatar"
                        className="w-10 h-10 rounded-full mr-3"
                      />
                      <span className="font-semibold text-lg">{post.author?.name || "User"}</span>
                    </div>

                    {/* Media */}
                    <div className="relative aspect-square bg-black">
                      {post.mediaType === "image" ? (
                        <img src={mediaUrl(post)} alt="post" className="w-full h-full object-cover" />
                      ) : post.mediaType === "video" ? (
                        <video
                          src={mediaUrl(post)}
                          className="w-full h-full object-cover"
                          autoPlay
                          loop
                          muted
                          playsInline
                          controls
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/70">
                          No media
                        </div>
                      )}

                      {post.caption && post.captionStyle && (
                        <div
                          className="absolute pointer-events-none"
                          style={{
                            left: `${post.captionStyle.position?.x ?? 50}%`,
                            top: `${post.captionStyle.position?.y ?? 50}%`,
                            fontSize: `${post.captionStyle.fontSize ?? 22}px`,
                            color: post.captionStyle.color || "#ffffff",
                            transform: "translate(-50%, -50%)",
                            textShadow: "0 0 10px rgba(0,0,0,0.8)",
                            maxWidth: "90%",
                            textAlign: "center",
                            fontWeight: "bold",
                          }}
                        >
                          {post.caption}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="p-4">
                      <div className="flex items-center space-x-4 mb-3">
                        <button onClick={() => handleLike(post._id)} className="flex items-center space-x-1">
                          <Heart className={`w-7 h-7 ${liked ? "text-red-500 fill-red-500" : "text-gray-800 hover:text-red-500"}`} />
                          <span className="text-lg font-medium">{(post.likes || []).length}</span>
                        </button>
                        <div className="flex items-center space-x-1">
                          <MessageCircle className="w-7 h-7 text-gray-800" />
                          <span className="text-lg font-medium">{(post.comments || []).length}</span>
                        </div>
                      </div>

                      {/* Comments */}
                      <div className="mt-4">
                        <h3 className="font-semibold mb-2">{t("post.comments")}</h3>

                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {(post.comments || []).length === 0 ? (
                            <p className="text-gray-500 italic">No comments yet</p>
                          ) : (
                            (post.comments || []).map((c) => (
                              <div key={c._id} className="text-sm">
                                <span className="font-medium mr-2">{c.author?.name || "User"}:</span>
                                <span>{c.content}</span>
                              </div>
                            ))
                          )}
                        </div>

                        {/* Add Comment */}
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            handleAddComment(post._id);
                          }}
                          className="flex gap-2 mt-4"
                        >
                          <input
                            type="text"
                            placeholder={t("post.addComment")}
                            value={newComments[post._id] || ""}
                            onChange={(e) => setNewComments((prev) => ({ ...prev, [post._id]: e.target.value }))}
                            className="input-field flex-1 text-sm"
                          />
                          <button type="submit" className="btn-primary px-4 py-2">
                            <Send className="w-5 h-5" />
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Chat */}
        <div className="glass-card h-[80vh] flex flex-col">
          <h2 className="text-2xl font-bold p-4 border-b">{t("forum.groupChat")}</h2>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => {
              const mine = msg.author?._id?.toString?.() === user._id?.toString?.();
              return (
                <div key={i} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[75%] px-4 py-2 rounded-2xl ${mine ? "bg-primary text-white" : "bg-gray-200 text-gray-900"}`}>
                    {!mine && <div className="text-xs font-medium mb-1 opacity-80">{msg.author?.name || "User"}</div>}
                    <div>{msg.content}</div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder={t("forum.messagePlaceholder")}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                className="input-field flex-1"
              />
              <button onClick={handleSendMessage} className="btn-primary px-4 py-2 flex items-center justify-center">
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

      </div>
    </motion.div>
  );
};

export default Group;