import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Lo from "./Components/Lo";
import Home from "./Components/Home";
import Signup from "./Components/Signup";
import PublicLayout from "./Components/PublicLayout";
import AuthLayout from "./Components/AuthLayout";
import Search from "./Components/Search";
import ProfileDisplay from "./Components/ProfileDisplay";
import EditProfile from "./Components/EditProfile";
import { ProfileProvider } from "./Components/ProfileContext";
import DashboardLayout from "./Components/DashboardLayout"; // Import the new layout

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Lo />} />
          <Route path="/signup" element={<Signup />} />
        </Route>

        {/* Authenticated Routes */}
        <Route
          element={
            <ProfileProvider>
              <AuthLayout />
            </ProfileProvider>
          }
        >
          <Route element={<DashboardLayout />}>
            <Route path="/home/*" element={<Home />} />
            <Route path="/profile/:id" element={<ProfileDisplay />} />
            <Route path="/edit-profile/:userId" element={<EditProfile />} />
            <Route path="/search" element={<Search />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
