import React, { useState } from 'react';
import axios from 'axios';

const Search = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const handleSearch = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.get(`http://localhost:8001/search`, {
        params: { query },
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}` // Assuming you store the token in localStorage
        }
      });
      setResults(response.data);
    } catch (error) {
      console.error("Error fetching search results:", error);
    }
  };

  return (
    <div>
      <form onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search for users..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit">Search</button>
      </form>
      <ul>
        {results.map(user => (
          <li key={user.userId}>
            {user.username} - {user.userId}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Search;
