import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import './Layout.css';

const AuthLayout = () => {
  const handleMenuClick = (menu) => {
    console.log(`Menu clicked: ${menu}`);
    // Add additional logic if needed
  };

  return (
    <div className="layout-container">
      <Sidebar onMenuClick={handleMenuClick} />
      <div className="content-container">
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
