import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Post from "./Post";
import MessagingApp from "./MessagingApp";
import './Sidebar.css'; // Import Sidebar CSS
import './Post.css'; // Import Post CSS
import './Home.css'; // Import Home CSS

const Home = () => {
  const [activeComponent, setActiveComponent] = useState('Post');

  return (
    <div className="home-page container-xxl ">
      <Sidebar onMenuClick={setActiveComponent} className="container-xxl" />
      <div className="content-container container-fluid p-0">
        {activeComponent === 'Post' && <Post />}
        {activeComponent === 'Messages' && (
          <div className="row m-0">
            <div className="col-3 p-0">
              <MessagingApp view="userList" />
            </div>
            <div className="col-9 p-0">
              <MessagingApp view="chat" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
