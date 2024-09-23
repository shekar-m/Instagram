import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Profile from "./Profile";
import ProfileDisplay from "./ProfileDisplay";
import axios from "axios";

const ProfileHandler = () => {
  const [profileExists, setProfileExists] = useState(null);
  const [userId, setUserId] = useState(localStorage.getItem("userId"));
  const navigate = useNavigate();

  useEffect(() => {
    const checkProfile = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8001/api/profile/check/${userId}`
        );
        setProfileExists(response.data.exists);
      } catch (error) {
        console.error("Error checking profile:", error);
      }
    };

    if (userId) {
      checkProfile();
    }
  }, [userId]);

  if (profileExists === null) {
    return <div>Loading...</div>;
  }

  return profileExists ? <ProfileDisplay userId={userId} /> : <Profile />;
};

export default ProfileHandler;
