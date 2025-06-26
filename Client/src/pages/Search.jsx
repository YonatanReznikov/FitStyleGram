import React, { useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

const Search = () => {
  const token = useSelector(state => state?.user?.currentUser?.token);
  const [searchType, setSearchType] = useState('posts');
  const [params, setParams] = useState({ body: '', email: '', fromDate: '', toDate: '' });
  const [results, setResults] = useState([]);

  const today = new Date().toISOString().split('T')[0];

  const handleInputChange = e => {
    setParams(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const searchHandler = async (e) => {
    e.preventDefault();
    try {
      let url = '';
      if (searchType === 'posts') {
        url = `${import.meta.env.VITE_API_URL}/posts/search?body=${params.body}&fromDate=${params.fromDate}&toDate=${params.toDate}`;
      } else {
      let queryParams = [];
      if (params.body.trim() !== '') {
        queryParams.push(`fullName=${encodeURIComponent(params.body.trim())}`);
      }
      if (params.email.trim() !== '') {
        queryParams.push(`email=${encodeURIComponent(params.email.trim())}`);
      }
      url = `${import.meta.env.VITE_API_URL}/users/search?${queryParams.join('&')}`;
    }

      const response = await axios.get(url, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` }
      });

      setResults(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <section className='searchPage container'>
      <h2>Advanced Search</h2>

      <form onSubmit={searchHandler} className='searchForm'>
        <label>
          Search Type:
          <select value={searchType} onChange={e => setSearchType(e.target.value)}>
            <option value="posts">Posts</option>
            <option value="users">Users</option>
          </select>
        </label>

        {searchType === 'posts' ? (
          <>
            <input type="text" name="body" placeholder="Search by content" onChange={handleInputChange} />

            <label>
              From Date:
              <input
                type="date"
                name="fromDate"
                max={today}
                onChange={handleInputChange}
              />
            </label>

            <label>
              To Date:
              <input
                type="date"
                name="toDate"
                max={today}
                onChange={handleInputChange}
              />
            </label>
          </>
        ) : (
          <>
            <input type="text" name="body" placeholder="Search by full name" onChange={handleInputChange} />
            <input type="email" name="email" placeholder="Search by email" onChange={handleInputChange} />
          </>
        )}

        <button type="submit" className="btn primary">Search</button>
      </form>

      <div className="searchResults">
        {results.map(result => (
          <div key={result._id} className="searchResultCard">
            {searchType === 'posts' ? (
              <Link to={`/posts/${result._id}`} className='searchResultLink'>
                <h4>Post</h4>
                {result?.mediaType?.startsWith('image/') ? (
                  <img
                    src={result.image}
                    alt="Post"
                    style={{ width: '100%', maxHeight: '300px', objectFit: 'cover', borderRadius: '10px' }}
                  />
                ) : result?.mediaType?.startsWith('video/') ? (
                  <video
                    controls
                    src={result.image}
                    style={{ width: '100%', maxHeight: '300px', borderRadius: '10px' }}
                  >
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <p>No media available</p>
                )}
                <p>{result.body}</p>
              </Link>
            ) : (
              <Link to={`/users/${result._id}`} className='searchResultLink'>
                <h4>User</h4>
                <p>{result.fullName}</p>
                <p>{result.email}</p>
              </Link>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default Search;
