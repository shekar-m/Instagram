import React, { useState, useEffect } from 'react';
import axiosInstance from './Interceptors/axiosInterceptor'; // Import the custom axios instance
import './Post.css';
import { faHeart, faComment, faShare } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const Post = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axiosInstance.get('/posts');
        const postsData = response.data;

        const postsWithCorrectedUrls = postsData.map(post => ({
          ...post,
          imageUrl: `http://localhost:8001/${post.imageUrl}`
        }));

        setPosts(postsWithCorrectedUrls);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching posts:', error);
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) {
    return <div className='text-primary'>Loading...</div>;
  }

  const handleLike = (postId) => {
    setPosts(posts.map(post => 
      post._id === postId ? { ...post, liked: !post.liked, likes: post.liked ? post.likes - 1 : post.likes + 1 } : post
    ));
  };

  return (
    <div className="container-fluid bg-body-secondary">
      {posts.map(post => {
        const isVideo = post.imageUrl.endsWith(".mp4");

        return (
          <div key={post._id} className="post-container border border-primary mb-2">
            <p className="post-text"><strong>User:</strong> {post.user.username}</p>
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
                    e.target.style.display = 'none'; 
                  }} 
                />
              )}
            </div>
            <div className="post-content">
              <h3 className="post-title">{post.caption}</h3>
              <p className="post-text"><small className="text-muted"><strong>Date:</strong> {new Date(post.date).toLocaleDateString()}</small></p>
              <div className="post-actions">
                <FontAwesomeIcon 
                  icon={faHeart} 
                  className={`post-icon ${post.liked ? 'liked' : ''}`} 
                  onClick={() => handleLike(post._id)} 
                /> 
                <FontAwesomeIcon icon={faComment} className="post-icon" />
                <FontAwesomeIcon icon={faShare} className="post-icon" />
                <span className="post-likes">{post.likes} likes</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Post;
