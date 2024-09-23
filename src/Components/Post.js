import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useLayoutEffect,
} from "react";
import axiosInstance from "./Interceptors/axiosInterceptor";
import "./Post.css";
import { faHeart, faShare } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ShareModal from "./ShareModal";
import ShimmerPlaceholder from "./ShimmerPlaceholder";
import useSocket from "./useSocket";

const Post = ({ onSharePost, selectedPost }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [currentPost, setCurrentPost] = useState(null);
  const postRefs = useRef({});
  const socketOptions = useMemo(
    () => ({
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    }),
    []
  );

  const socket = useSocket("http://localhost:8001", socketOptions);

  useEffect(() => {
    const fetchPosts = async () => {
      console.log("onPostClickInChat in 1 useEffect:");
      try {
        const response = await axiosInstance.get("/posts");
        const postsData = response.data;
        console.log("posts data here==>", postsData);
        const postsWithCorrectedUrls = postsData.map((post) => ({
          ...post,
          imageUrl: `http://localhost:8001/api/${post.imageUrl}`,
        }));

        setPosts(postsWithCorrectedUrls);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
    if (socket) {
      socket.on("newPost", (newPost) => {
        setPosts((prevPosts) => [newPost, ...prevPosts]);
      });

      return () => {
        socket.off("newPost");
      };
    }
  }, [socket]);

  useLayoutEffect(() => {
    console.log("onPostClickInChat in useLayoutEffect:", selectedPost);
    console.log("posts in useLayoutEffect:", posts);
    if (selectedPost && posts.length > 0) {
      setTimeout(() => {
        const postElement = postRefs.current[selectedPost];
        if (postElement) {
          console.log("Scrolling to post:", postElement);

          postElement.scrollIntoView({ behavior: "auto", block: "center" });

          postElement.classList.add("highlighted-post");

          setTimeout(() => {
            postElement.classList.remove("highlighted-post");
          }, 2000);
        } else {
          console.log("Post element not found:", selectedPost);
        }
      }, 2500);
    } else {
      console.log("selectedPost is not defined or does not have an _id");
    }
  }, [selectedPost, posts]);

  const handleLike = async (postId) => {
    try {
      const response = await axiosInstance.post(
        `/posts/${postId}/like`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setPosts(
        posts.map((post) =>
          post._id === postId
            ? {
                ...post,
                liked: response.data.liked,
                likes: response.data.likes,
              }
            : post
        )
      );
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  const handleShare = (post) => {
    console.log(
      "in post at handleshare metthod  sharing post object here==>",
      post
    );
    setCurrentPost(post);
    setIsShareModalOpen(true);
  };

  const handleUserSelection = (user) => {
    if (currentPost) {
      console.log(
        `Share post  herer is the post _id${currentPost._id} with user ${user.fullName}`
      );
      onSharePost(user, currentPost);
    }

    setIsShareModalOpen(false);
  };

  if (loading) {
    return (
      <div className="container-fluid bg-body-secondary shimmer-container">
        <ShimmerPlaceholder />
        <ShimmerPlaceholder />
        <ShimmerPlaceholder />
      </div>
    );
  }

  return (
    <div className="container-fluid bg-body-secondary p-2">
      {posts.map((post) => {
        const isVideo = post.imageUrl.endsWith(".mp4");
        return (
          <div
            key={post._id}
            id={` ${post._id}`}
            className="post-container border border-primary mb-2"
            ref={(el) => {
              postRefs.current[post._id] = el;
              console.log("Post ref set:", post._id, el);
            }}
          >
            <p className="post-text text-black">
              <strong>User:</strong> {post.user.fullName}
            </p>
            <div className="post border-top">
              {isVideo ? (
                <video controls>
                  <source src={post.imageUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <img
                  src={post.imageUrl}
                  alt={post.caption}
                  loading="lazy"
                  onError={(e) => {
                    console.error(`Failed to load image: ${post.imageUrl}`);
                    if (!e.target.hasError) {
                      e.target.hasError = true;
                      e.target.src = "fallback-image.jpg";
                    }
                  }}
                />
              )}
            </div>
            <div className="post-content">
              <h3 className="post-title">{post.caption}</h3>
              <p className="post-text">
                <small className="text-muted">
                  <strong>Date:</strong>{" "}
                  {new Date(post.date).toLocaleDateString()}
                </small>
              </p>
              <div className="post-actions">
                <FontAwesomeIcon
                  icon={faHeart}
                  className={`post-icon ${post.liked ? "liked" : ""}`}
                  onClick={() => handleLike(post._id)}
                  style={{ color: post.liked ? "pink" : "white" }}
                />
                <FontAwesomeIcon
                  icon={faShare}
                  className="post-icon"
                  onClick={() => handleShare(post)}
                />
                <span className="post-likes">{post.likes} likes</span>
              </div>
            </div>
          </div>
        );
      })}
      <ShareModal
        show={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        selectedPost={currentPost}
        onSelectUser={handleUserSelection}
      />
    </div>
  );
};

export default Post;
