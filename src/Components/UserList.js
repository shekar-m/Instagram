import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './UserList.css';

const UserList = ({ onSelectUser }) => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const response = await axios.get('http://localhost:8001/users');
      setUsers(response.data);
    };

    fetchUsers();
  }, []);

  return (
    <div className="user-list bg-black">
      <h2>Users</h2>
      <div className="user-list-container">
        {users.map(user => (
          <div key={user._id} className="user-list-item" onClick={() => onSelectUser(user)}>
            <div className="user-list-item-content">
              <span><img src="/path/to/avatar" alt="Avatar" /></span>
              <span className="user-list-item-username">{user.username}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserList;
