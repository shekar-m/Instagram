// Profile.js

import React from 'react';
import './Profile.css';

const Profile = () => {
  const posts = [
    // Add your post data here
    // Example:
    { id: 1, imageUrl: '/path/to/image1.jpg' },
    { id: 2, imageUrl: '/path/to/image2.jpg' },
    // Add more posts as needed
  ];

  return (
    <>
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-picture">
          <img src="https://image.pollinations.ai/prompt/An%20image%20of%20Elon%20Musk,%20innovative,%20ambitious,%20futuristic,%20modern,%20with%20a%20space%20theme" alt="Profile" />
        </div>
        <div className="profile-info">
          <h2>Elon musk</h2>
          <p>Amercia</p>
          <div className="profile-stats">
            <span><b>100</b> posts</span>
            <span><b>200</b> followers</span>
            <span><b>150</b> following</span>
          </div>
        </div>
      </div>
      <hr></hr>
      <div className="profile-posts">
        {posts.map(post => (
          <div key={post.id} className="post">
            <img src={post.imageUrl} alt={`Post ${post.id}`} />
          </div>
        ))}
      </div>
    </div>
    </>
  );
};

export default Profile;
