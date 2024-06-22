// login.js
import React, { useState } from "react";
import axios from "axios";
import axiosInstance from "./Interceptors/axiosInterceptor";
import { useNavigate, Link } from "react-router-dom";
import "./lo.css";

const Lo = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();

    try {
      const response = await axiosInstance.post("/Login", { username, password });
      console.log("Response received:", response.data);

      console.log("Response received:", response.data);

      if (response.data.user) {
        console.log("User ID:", response.data.user.userId);
        localStorage.setItem("userId", response.data.user.userId);
        localStorage.setItem("token", response.data.token); // Store token
        console.log("token is here from mo.js file", response.data.token)
        navigate("/Home", { state: { id: username } });
      } else if (response.data === "notexist") {
        alert("User has not signed up.");
      }
    } catch (error) {
      alert("Wrong details or error in connecting to the database.");
      console.error("Error during login:", error);
    }
  }

  return (
    <div className="login-page">
      <div className="login-form">
        <h2 className="text-primary">Login</h2>
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <input
              className="input-group input-group-lg"
              type="text"
              id="username"
              value={username}
              placeholder="Please enter your username"
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              id="password"
              value={password}
              placeholder="Please enter your password"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit">Login</button>
          <br />
          <p>OR</p>
          <br />
          <Link to="/Signup">Signup</Link>
        </form>
      </div>
    </div>
  );
};

export default Lo;
