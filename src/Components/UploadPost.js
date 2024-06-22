import React, { useState } from 'react';
import axios from 'axios';
import axiosInstance from './Interceptors/axiosInterceptor';

const UploadPost = () => {
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState('');
 

  const onFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const onCaptionChange = (e) => {
    setCaption(e.target.value);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('file', file);
    formData.append('caption', caption);
    formData.append('userId', localStorage.getItem('userId')); // Use the userId from localStorage

    try {
      const res = await axiosInstance.post('http://localhost:8001/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log(res.data);
      
      // Handle success (e.g., show a success message, reset the form, etc.)
    } catch (err) {
      console.error(err);
      // Handle error (e.g., show an error message)
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
      <button type="submit" >Post</button>
    </form>
  );
};

export default UploadPost;
