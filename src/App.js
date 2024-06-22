import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Lo from './Components/Lo';
import Home from './Components/Home';
import Signup from './Components/Signup';
import PublicLayout from './Components/PublicLayout';
import AuthLayout from './Components/AuthLayout';
import Profile from './Components/Profile';
import Messages from './Components/Messages';
import MessagingApp from './Components/MessagingApp';
import Search from './Components/Search';

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Lo />} />
          <Route path="/signup" element={<Signup />} />
        </Route>
        <Route element={<AuthLayout />}>
          <Route path="/Home" element={<Home />} />
          <Route path="/Profile" element={<Profile />} />
          <Route path="/messaging" element={<MessagingApp />} />      
          <Route path="/search" element={<Search />} /> {/* Add Search route */}
          {/* Add other authenticated routes here */}
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
