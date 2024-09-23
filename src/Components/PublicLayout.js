import React from 'react';
import { Outlet } from 'react-router-dom';
import './Layout.css';
import './PublicLayout.css'; 
const PublicLayout=()=> {
    return (
        <div >
            <Outlet />
        </div>
      );
    };

export default PublicLayout;