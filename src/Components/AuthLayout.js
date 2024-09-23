import React from "react";
import { Outlet } from "react-router-dom";

const AuthLayout = () => {
  return (
    <div className="container-fluid">
      <Outlet />
    </div>
  );
};

export default AuthLayout;
