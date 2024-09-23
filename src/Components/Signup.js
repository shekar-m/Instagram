import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axiosInstance from "./Interceptors/axiosInterceptor";
import "bootstrap/dist/css/bootstrap.min.css";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

function Signup() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleSignup(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axiosInstance.post("/Signup", {
        fullName,
        username,
        password,
      });
      console.log("Response received:", response.data);

      if (response.data === "exist") {
        setError("User already exists. Please login with your credentials.");
      } else if (response.data === "not exist") {
        navigate("/", { state: { id: username } });
      }
    } catch (error) {
      console.error("Error during signup:", error);
      setError("An error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  }
  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  return (
    <div className="login-page d-flex align-items-center justify-content-center min-vh-100">
      <div
        className="login-form card shadow p-4 w-100"
        style={{ maxWidth: "400px" }}
      >
        <h2 className="text-primary mb-4">Signup</h2>
        <form onSubmit={handleSignup}>
          <div className="form-group mb-3">
            <label htmlFor="fullName" className="form-label">
              Full Name
            </label>
            <input
              type="text"
              id="fullName"
              value={fullName}
              placeholder="Enter your full name"
              onChange={(e) => setFullName(e.target.value)}
              className="form-control"
              required
              aria-label="Full Name"
            />
          </div>
          <div className="form-group mb-3">
            <label htmlFor="username" className="form-label">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              placeholder="Enter your username"
              onChange={(e) => setUsername(e.target.value)}
              className="form-control"
              required
              aria-label="Username"
            />
          </div>
          <div className="form-group mb-3 position-relative">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              className="form-control"
              type={passwordVisible ? "text" : "password"}
              id="password"
              value={password}
              placeholder="Enter your password"
              onChange={(e) => setPassword(e.target.value)}
              required
              aria-label="Password"
              style={{ paddingRight: "40px" }}
            />
            <button
              type="button"
              className="btn btn-link position-absolute"
              style={{
                textDecoration: "none",
                left: "160px",
                top: "50%",
                transform: "translateY(10%)",
              }}
              onClick={togglePasswordVisibility}
              aria-label={passwordVisible ? "Hide password" : "Show password"}
            >
              <FontAwesomeIcon icon={passwordVisible ? faEye : faEyeSlash} />
            </button>
          </div>
          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={loading}
          >
            {loading ? "Signing up..." : "Sign up"}
          </button>
          {error && <div className="alert alert-danger mt-3">{error}</div>}
          <div className="text-center mt-3">
            <p>OR</p>
            <Link to="/" className="btn btn-link">
              Login page
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Signup;
