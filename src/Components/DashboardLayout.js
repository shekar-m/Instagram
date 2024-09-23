import React from "react";
import { Outlet } from "react-router-dom";

const DashboardLayout = () => {
  return (
    <div className="d-flex">
      <div className="content p-4 flex-grow-1">
        <Outlet />
      </div>
    </div>
  );
};

export default DashboardLayout;
