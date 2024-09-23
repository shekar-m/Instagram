import React, { useEffect, useContext, useState } from "react";
import axiosInstance from "./Interceptors/axiosInterceptor";
import { ProfileContext } from "./ProfileContext";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const ProfileDisplay = ({ userId }) => {
  const { profile, setProfile } = useContext(ProfileContext);
  const [fullName, setFullName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!userId) {
      console.error("No userId provided");
      return;
    }

    const fetchProfile = async () => {
      try {
        console.log("coming to here profileDisply component");
        const response = await axiosInstance.get(`/profile/${userId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        });
        console.log("deta here", response.data);
        setProfile(response.data);

        const userResponse = await axiosInstance.get(`/users/${userId}`);
        setFullName(userResponse.data.fullName);
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };
    fetchProfile();
  }, [userId, setProfile]);

  console.log("insightfull", profile);
  if (!profile) {
    console.log("inside the profiledisplay at loading point");
    return <div>Loading...</div>;
  }

  const profileImageUrl = `http://localhost:8001/api/${
    profile.ProfileImageURL
  }?t=${new Date().getTime()}`;
  console.log("here1211==>", profileImageUrl);
  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-12 col-md-4 d-flex justify-content-center mb-4 mb-md-0">
          <img
            src={profileImageUrl}
            alt="Profile"
            className="rounded-circle img-fluid bg-body-secondary"
            style={{ width: "110px", height: "110px", objectFit: "cover" }}
          />
        </div>
        <div className="col-12 col-md-8">
          <h2 className="text-center text-md-start">{fullName}</h2>
          <p className="text-center text-md-start">
            <strong>Bio:</strong> {profile.Bio}
          </p>
          <p className="text-center text-md-start">
            <strong>Gender:</strong> {profile.Gender}
          </p>
          <button
            className="btn btn-primary mt-3"
            onClick={() => navigate(`/edit-profile/${userId}`)}
          >
            Edit Profile
          </button>
        </div>
      </div>
      <hr />
    </div>
  );
};

export default ProfileDisplay;
