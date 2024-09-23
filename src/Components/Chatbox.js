import React, { useState, useEffect, useRef } from "react";
import axiosInstance from "./Interceptors/axiosInterceptor";
import io from "socket.io-client";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  FaPaperclip,
  FaMicrophone,
  FaPaperPlane,
  FaTimes,
  FaReply,
  FaSmile,
} from "react-icons/fa";
import EmojiPicker from "emoji-picker-react";
import "./Chatbox.css";
import RecordingBar from "./RecordingBar";

const Chatbox = ({
  userId,
  selectedUser,
  onBack,
  onNewMessage,
  selectedPost,
  onPostShared,
  onPostClickInChat,
}) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const [audioURL, setAudioURL] = useState("");
  const [inputFocused, setInputFocused] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const audioChunksRef = useRef([]);
  const messagesEndRef = useRef(null);
  console.log("Selected ==>values User ID:", selectedUser);
  console.log("Selected ==>post object values ===>:", selectedPost);
  console.log("onPostShared object values ===>:", onPostShared);
  const Socket = io("http://localhost:8001", {
    transports: ["websocket"],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    query: { userId: userId },
  });

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(
    () => {
      scrollToBottom();
      console.log("Selected User ID:", selectedUser);
      if (!selectedUser || !selectedUser.userId) {
        console.error("No selected user or userId");
        return;
      }
      const fetchMessages = async () => {
        try {
          const response = await axiosInstance.get(
            `/messages/${selectedUser.userId}`
          );
          setMessages(response.data);
          console.log("here data of messages route==>", response.data);
        } catch (error) {
          console.error("Error fetching messages:", error);
        }
      };
      fetchMessages();
    },
    [selectedUser],
    messages
  );

  useEffect(() => {
    console.log("Socket setup effect executed");
    console.log("Socket ID:", Socket.id); // Check if you have a socket ID
    if (!userId || !selectedUser || !selectedUser.userId) return;
    Socket.emit("join", userId);
    console.log("userID====>here==>", userId);

    Socket.on("connect", () => {
      console.log("Socket connected:===>here11", Socket.id);
    });

    Socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", Socket.id, "Reason:", reason);
    });
    // Listen for user's online status

    Socket.on("userOnline", (user) => {
      console.log("User online:", user);
      if (user.userId === selectedUser.userId) {
        setIsOnline(true);
      }
    });

    Socket.on("userOffline", (user) => {
      console.log("User offline:", user);
      if (user.userId === selectedUser.userId) {
        setIsOnline(false);
      }
    });

    return () => {
      Socket.off("userOnline");
      Socket.off("userOffline");
      Socket.off("connect");
      Socket.off("disconnect");
    };
  }, [userId, selectedUser, onNewMessage]);

  useEffect(() => {
    Socket.on("receiveMessage", (message) => {
      if (
        message.sender === selectedUser.userId ||
        message.receiver === selectedUser.userId
      ) {
        setMessages((prevMessages) => [...prevMessages, message]);
        onNewMessage(message.sender);
      }
    });

    return () => {
      Socket.off("receiveMessage");
    };
  }, [userId, selectedUser, onNewMessage]);

  const handlePostClick = (post) => {
    if (!post) {
      console.error("Post is undefined");
      return;
    }
    console.log(
      "here post object in handlepostclick method in chatbox==>",
      post
    );
    onPostClickInChat(post.postId);
  };

  const handleSendMessage = async () => {
    console.log("inside the handlesend messages method");
    if (
      newMessage.trim() === "" &&
      !selectedFile &&
      !audioURL &&
      !selectedPost
    ) {
      console.error("Cannot send an empty message.");
      return;
    }
    if (!selectedUser || !selectedUser.userId) {
      console.error("No selected user or userId");
      return;
    }

    const receiverId = selectedUser.userId;

    const messageData = {
      sender: userId,
      receiverId: receiverId,
      content: newMessage,
      mediaUrl: audioURL || null,
      mediaType: audioURL ? "audio" : null,
      timestamp: new Date().toISOString(),
      replyTo: replyingTo ? replyingTo._id : null,
      post: selectedPost || null,
    };

    if (selectedFile || audioURL) {
      const formData = new FormData();
      if (selectedFile) {
        formData.append("file", selectedFile);
      } else if (audioURL) {
        const response = await fetch(audioURL);
        const blob = await response.blob();
        formData.append("file", blob, "voice_message.webm");
      }

      formData.append("senderId", userId);
      formData.append("receiverId", receiverId);
      formData.append("content", newMessage);
      formData.append("replyTo", replyingTo ? replyingTo._id : null);

      if (selectedPost) {
        formData.append("post", selectedPost);
      }

      try {
        const response = await axiosInstance.post("/messages", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        messageData.mediaUrl = response.data.mediaUrl;
        messageData.mediaType = selectedFile
          ? selectedFile.type.split("/")[0]
          : "audio"; // 'image', 'video', etc.
      } catch (error) {
        console.error("Error uploading file:", error);
      }
    } else {
      try {
        await axiosInstance.post("/messages", messageData);
        console.log("here message data======>", messageData);
      } catch (error) {
        console.error(
          "Error sending message:",
          error.response?.data || error.message
        );
      }
    }

    setNewMessage("");
    setSelectedFile(null);

    setAudioURL("");
    setMessages((prevMessages) => [...prevMessages, messageData]);
    setReplyingTo(null);

    if (onPostShared) {
      onPostShared();
    }
  };

  const handleVoiceRecording = () => {
    if (!recording && !isPaused) {
      startRecording();
    } else if (recording && !isPaused) {
      handleStopRecording();
    }
    setRecording(!recording);
  };

  const startRecording = () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          const mediaRecorderInstance = new MediaRecorder(stream);
          setMediaRecorder(mediaRecorderInstance);

          mediaRecorderInstance.ondataavailable = (event) => {
            if (event.data.size > 0) {
              console.log("Data available:", event.data);
              console.log("Chunks pushed: ", audioChunksRef.current.length);
              audioChunksRef.current.push(event.data);
            }
          };

          mediaRecorderInstance.onstart = () => {
            console.log("Recording started...");
          };

          mediaRecorderInstance.onpause = () => {
            console.log("Recording paused...");
          };

          mediaRecorderInstance.onresume = () => {
            console.log("Recording resumed...");
          };

          mediaRecorderInstance.onstop = async () => {
            console.log("Recording stopped...");
            console.log(
              "Chunks length at stop: ",
              audioChunksRef.current.length
            );
            if (audioChunksRef.current.length > 0) {
              const audioBlob = new Blob(audioChunksRef.current, {
                type: "audio/webm",
              });
              const audioURL = URL.createObjectURL(audioBlob);
              setAudioURL(audioURL);
              console.log("Audio Blob URL:", audioURL);

              await handleSendAudioMessage(audioBlob);
              audioChunksRef.current = [];
            } else {
              console.error("No audio chunks were recorded");
            }
          };

          mediaRecorderInstance.start();
          console.log("Media Recorder started...");
        })
        .catch((error) => {
          console.error("Error accessing microphone:", error);
        });
    } else {
      console.error("Browser does not support getUserMedia");
    }
  };

  const handleSendAudioMessage = async (audioBlob) => {
    const formData = new FormData();
    formData.append("file", audioBlob, "voice_message.webm");
    formData.append("senderId", userId);
    formData.append("receiverId", selectedUser.userId);
    formData.append("content", "");

    try {
      const response = await axiosInstance.post("/messages", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const messageData = {
        sender: userId,
        receiver: selectedUser.userId,
        mediaUrl: response.data.mediaUrl,
        mediaType: "audio",
        timestamp: new Date().toISOString(),
      };

      Socket.emit("sendMessage", messageData);
      setMessages((prevMessages) => [...prevMessages, messageData]);
    } catch (error) {
      console.error(
        "Error uploading audio:",
        error.response?.data || error.message,
        error
      );
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setRecording(false); // Update state here to avoid confusion
    }
    setAudioURL(""); // Clear audio URL to avoid resending the same file
    setAudioChunks([]); // Clear audio chunks
  };

  const handlePauseRecording = () => {
    if (mediaRecorder && mediaRecorder.state === "recording") {
      mediaRecorder.pause();
      setIsPaused(true);
      // Update to indicate recording is paused
    }
  };

  const handleResumeRecording = () => {
    if (mediaRecorder && mediaRecorder.state === "paused") {
      mediaRecorder.resume();
      setIsPaused(false);
      //Update to indicate recording is resumed
    }
  };

  const handleEmojiClick = (emojiObject) => {
    setNewMessage((prevMessage) => prevMessage + emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  const handleReply = (message) => {
    console.log("Replying to message:", message);
    setReplyingTo(message);
  };

  const renderMedia = (message, isSmall = false) => {
    console.log(
      "here message.media type ==>",
      message.mediaType,
      "message.mediaUrl is here==>",
      message.mediaUrl
    );
    if (!message || !message.mediaType || !message.mediaUrl) return null;

    const mediaClass = isSmall ? "media-small" : "media";
    console.log("here shekar inside the renderMedia");
    return (
      <div className="media-container">
        {message.mediaType === "image" && (
          <img src={message.mediaUrl} alt="Attachment" className={mediaClass} />
        )}
        {message.mediaType === "video" && (
          <video src={message.mediaUrl} controls className={mediaClass} />
        )}
        {message.mediaType === "audio" && (
          <div className="audio-player">
            <audio
              src={message.mediaUrl}
              controls
              className={mediaClass}
              type="audio/webm"
            >
              Your browser does not support the audio element.
            </audio>
          </div>
        )}
      </div>
    );
  };

  const renderMediaPreview = () => {
    console.log("inside the rendermediapreview");
    if (!selectedFile) return null;

    const fileURL = URL.createObjectURL(selectedFile);

    return (
      <div className="media-preview position-relative mb-2">
        {selectedFile.type.startsWith("image") && (
          <img src={fileURL} alt="Preview" className="media" />
        )}
        {selectedFile.type.startsWith("video") && (
          <video src={fileURL} controls className="media" />
        )}
        {selectedFile.type.startsWith("audio") && (
          <audio src={fileURL} controls className="media" />
        )}
        <button
          className="btn btn-danger btn-sm position-absolute top-0 end-0 m-2"
          onClick={() => setSelectedFile(null)}
        >
          <FaTimes />
        </button>
      </div>
    );
  };

  const renderMessage = (message) => {
    const repliedMessage = message.replyTo
      ? messages.find((msg) => msg._id === message.replyTo)
      : null;
    console.log("Rendering message:", message);
    console.log("message.post:", message.post);
    return (
      <div
        key={message._id || message.timestamp}
        className={`d-flex ${
          message.sender === userId
            ? "justify-content-end"
            : "justify-content-start"
        } mb-2`}
      >
        <div
          className={`p-2 rounded ${
            message.sender === userId
              ? "bg-primary text-white"
              : "bg-white border"
          }`}
        >
          {repliedMessage && (
            <div className="reply-preview bg-light p-2 rounded mb-1 text-black">
              <strong className="d-block small text-muted">Replying to:</strong>
              <div>{repliedMessage.content}</div>
              {renderMedia(repliedMessage, true)}{" "}
              {/* Pass true to render small-sized media */}
            </div>
          )}
          {message.content && <div>{message.content}</div>}

          {message.post && (
            <div
              className="shared-post-preview mt-2"
              onClick={() => handlePostClick(message.post)}
            >
              <strong>{message.post.caption}</strong>

              {message.post.imageUrl &&
                (message.post.imageUrl.endsWith(".mp4") ? (
                  <video controls className="w-100">
                    <source src={message.post.imageUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <img
                    src={message.post.imageUrl}
                    alt={message.post.caption}
                    className="w-100"
                  />
                ))}
            </div>
          )}
          {renderMedia(message)}
          <div className="mt-1 small text-end d-flex align-items-center">
            <span className="text-muted">
              {new Date(message.timestamp).toLocaleTimeString()}
            </span>
            <div>
              <button
                className="btn btn-link text-muted ms-2 "
                onClick={() => handleReply(message)}
              >
                <FaReply />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };
  const handleSend = async () => {
    if (recording) {
      await handleStopRecording();
      await handleSendMessage(); // Send the message with the audio URL
    } else {
      // Send the regular message
      await handleSendMessage();
    }
    setAudioURL(""); // Clear audio URL to avoid resending the same file
  };

  return (
    <div className="container-fluid p-3 d-flex flex-column vh-100">
      <header className="d-flex align-items-center bg-primary text-white p-2 rounded">
        <button
          onClick={onBack}
          className="btn btn-light"
          style={{ maxWidth: "50px" }}
        >
          &larr;
        </button>
        <h2 className="m-3">{selectedUser?.fullName}</h2>
        <span
          className={`status-indicator ms-2 p-3 ${
            isOnline ? "online" : "offline"
          }`}
        >
          {" "}
        </span>
      </header>
      <div className="flex-grow-1 bg-light my-3 p-3 rounded overflow-auto">
        {messages.map(renderMessage)}
      </div>

      {selectedPost && (
        <div className="shared-post bg-light p-2 rounded mb-3">
          <p>{selectedPost.caption}</p>

          {selectedPost.imageUrl &&
            (selectedPost.imageUrl.endsWith(".mp4") ? (
              <video controls className="w-100">
                <source src={selectedPost.imageUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            ) : (
              <img
                src={selectedPost.imageUrl}
                alt={selectedPost.caption}
                className="w-100"
              />
            ))}
        </div>
      )}
      {renderMediaPreview()}

      {replyingTo && (
        <div className="alert alert-info d-flex align-items-center">
          <span className="me-2 ">Replying to: {replyingTo.content}</span>
          <button
            className="btn btn-link text-danger"
            onClick={() => setReplyingTo(null)}
          >
            <FaTimes />
          </button>
        </div>
      )}

      <div className="d-flex p-2 bg-white border-top position-relative">
        {!recording ? (
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="form-control me-2"
            onFocus={() => setInputFocused(true)}
            onBlur={() => setInputFocused(false)}
          />
        ) : (
          <RecordingBar
            onStopRecording={handleStopRecording}
            onPauseRecording={handlePauseRecording}
            onResumeRecording={handleResumeRecording}
            isRecording={recording}
            isPaused={isPaused}
          />
        )}

        {!recording && (
          <>
            <button
              className="btn btn-light me-2"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            >
              <FaSmile />
            </button>
            <input
              type="file"
              id="file-input"
              accept="image/*,video/*,audio/*"
              onChange={(e) => setSelectedFile(e.target.files[0])}
              className="d-none"
            />
            <label htmlFor="file-input" className="btn btn-light me-2">
              <FaPaperclip />
            </label>
            <button
              className="btn btn-light me-2"
              onClick={handleVoiceRecording}
            >
              {recording ? (
                <FaMicrophone className="text-danger" />
              ) : (
                <FaMicrophone />
              )}
            </button>
          </>
        )}

        <button className="btn btn-primary" onClick={handleSend}>
          {recording ? (
            <FaMicrophone className="text-danger" />
          ) : (
            <FaPaperPlane />
          )}
        </button>

        {showEmojiPicker && (
          <div className="emoji-picker-container position-absolute bottom-100 end-0 mb-2">
            <EmojiPicker onEmojiClick={handleEmojiClick} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Chatbox;
