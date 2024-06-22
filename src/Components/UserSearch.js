// Components/UserSearch.js
import React, { useState } from 'react';
import axios from 'axios';
import './UserSearch.css';

const UserSearch = ({ onSelectUser }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);

  const handleSearch = async (e) => {
    setSearchTerm(e.target.value);

    if (e.target.value.trim() === '') {
      setResults([]);
      return;
    }

    try {
      const response = await axios.get('http://localhost:8001/search-users', {
        params: { searchTerm: e.target.value }
      });
      setResults(response.data);
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  return (
    <div className="user-search-container">
      <input
        type="text"
        value={searchTerm}
        onChange={handleSearch}
        placeholder="Search users..."
      />
      {results.length > 0 && (
        <div className="search-results">
          {results.map((user) => (
            <div
              key={user._id}
              className="search-result-item"
              onClick={() => onSelectUser(user)}
            >
              {user.username}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserSearch;
