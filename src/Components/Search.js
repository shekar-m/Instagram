import React, { useState } from "react";

import "./Search.css";
import axiosInstance from "./Interceptors/axiosInterceptor";

const Search = ({ onSelectUser }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    const searchTerm = e.target.value;
    setQuery(searchTerm);
    if (searchTerm.length > 1) {
      setLoading(true);
      try {
        const response = await axiosInstance.get("/search", {
          params: { query: searchTerm },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setResults(response.data);
      } catch (error) {
        console.error("Error fetching search results:", error);
      } finally {
        setLoading(false);
      }
    } else {
      setResults([]);
    }
  };

  return (
    <div className="search-container">
      <input
        type="text"
        value={query}
        onChange={handleSearch}
        placeholder="Search..."
        className="search-input"
      />
      <ul className="search-results">
        {loading ? (
          <div className="shimmer-wrapper">
            <div className="shimmer"></div>
          </div>
        ) : results.length > 0 ? (
          results.map((user, index) => (
            <li
              key={index}
              className="search-result-item"
              onClick={() => onSelectUser(user)}
            >
              {user.fullName}
            </li>
          ))
        ) : (
          query.length > 1 && (
            <li className="search-result-item">No records found</li>
          )
        )}
      </ul>
    </div>
  );
};

export default Search;
