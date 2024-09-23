import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "./Interceptors/axiosInterceptor";

const Profile = () => {
  const [formData, setFormData] = useState({
    Name: "",
    Bio: "",
    Gender: "",
    ProfileImageURL: "",
  });
  const [showPopup, setShowPopup] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, ProfileImageURL: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();

    data.append("Bio", formData.Bio);
    data.append("Gender", formData.Gender);
    data.append("ProfileImageURL", formData.ProfileImageURL);
    const userId = localStorage.getItem("userId");
    data.append("userId", userId);

    try {
      console.log("coming to here profile component");
      const response = await axiosInstance.post("/profile", data, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      console.log("Profile created:", response.data);

      localStorage.setItem("userId", userId);

      setShowPopup(true);

      setTimeout(() => {
        setShowPopup(false);
        navigate("/");
      }, 3000);
    } catch (error) {
      console.error("Error creating profile:", error);
    }
  };

  return (
    <div className="profile-form">
      {showPopup && (
        <div className="popup">
          <p>Profile created successfully! Redirecting to home page...</p>
        </div>
      )}
      <h2>Create Profile</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Bio:</label>
          <textarea
            name="Bio"
            value={formData.Bio}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="gender" className="form-label">
            Gender
          </label>
          <select
            className="form-select"
            id="gender"
            name="Gender"
            value={formData.Gender}
            onChange={handleChange}
            required
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label>Profile Image:</label>
          <input
            type="file"
            name="ProfileImageURL"
            onChange={handleFileChange}
            required
            className="form-control"
          />
        </div>
        <button type="submit" className="btn btn-primary mt-3">
          Create Profile
        </button>
      </form>
    </div>
  );
};

export default Profile;
