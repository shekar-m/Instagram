import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "./Interceptors/axiosInterceptor";
import { ProfileContext } from "./ProfileContext";
import "bootstrap/dist/css/bootstrap.min.css";

const EditProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { profile, setProfile } = useContext(ProfileContext);
  const [formData, setFormData] = useState({
    Name: "",
    Bio: "",
    Gender: "",
    ProfileImageURL: null,
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axiosInstance.post(`/profile/${userId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setFormData({
          fullName: response.data.fullName,
          Bio: response.data.Bio,
          Gender: response.data.Gender,
          ProfileImageURL: response.data.ProfileImageURL,
        });
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    fetchProfile();
  }, [userId]);

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

    console.log("after taking all data in formdata");

    try {
      const response = await axiosInstance.put(`/profile/${userId}`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      await axiosInstance.put(
        `/users/${userId}/fullName`,
        { fullName: formData.Name },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      console.log("after keeping form data in the server");
      setProfile(response.data);
      navigate(`/home/profile`);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
          <h2 className="mb-4 text-center">Edit Profile</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="name" className="form-label">
                fullName
              </label>
              <input
                type="text"
                className="form-control"
                id="name"
                name="Name"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="bio" className="form-label">
                Bio
              </label>
              <textarea
                className="form-control"
                id="bio"
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
            <div className="mb-3">
              <label htmlFor="profileImageURL" className="form-label">
                Profile Image
              </label>
              <input
                type="file"
                className="form-control"
                id="profileImageURL"
                name="ProfileImageURL"
                onChange={handleFileChange}
              />
            </div>
            <button type="submit" className="btn btn-primary w-100">
              Save Changes
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
