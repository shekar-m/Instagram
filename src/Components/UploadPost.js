import React, { useState } from "react";
import axiosInstance from "./Interceptors/axiosInterceptor";

const UploadPost = ({ onSuccess }) => {
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState("");

  const onFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const onCaptionChange = (e) => {
    setCaption(e.target.value);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("file", file);
    formData.append("caption", caption);
    formData.append("userId", localStorage.getItem("userId"));

    try {
      const res = await axiosInstance.post("/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      console.log(res.data);

      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("Error uploading post:", err);
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <div>
        <label htmlFor="file">Choose an image:</label>
        <input type="file" id="file" onChange={onFileChange} required />
      </div>
      <div>
        <label htmlFor="caption">Caption:</label>
        <input
          type="text"
          id="caption"
          value={caption}
          onChange={onCaptionChange}
          placeholder="Caption"
          required
        />
      </div>
      <button className="mt-2" type="submit">
        Post
      </button>
    </form>
  );
};

export default UploadPost;
