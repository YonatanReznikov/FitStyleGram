import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

const GroupDetails = () => {
  const { id: groupId } = useParams();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = useSelector(state => state?.user?.currentUser?.token);
  const currentUserId = useSelector(state => state?.user?.currentUser?.id);

  const fetchGroup = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/groups/${groupId}`, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` }
      });
      setGroup(response.data);
      setLoading(false);
    } catch (error) {
      console.log(error);
    }
  };

  const handleAcceptRequest = async (userId) => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/groups/${groupId}/accept-request`, { userId }, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchGroup();
    } catch (error) {
      console.log(error);
    }
  };

  const handleDeclineRequest = async (userId) => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/groups/${groupId}/decline-request`, { userId }, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchGroup();
    } catch (error) {
      console.log(error);
    }
  };

  const handleRemoveMember = async (userId) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/groups/${groupId}/remove-member`, {
        data: { userId },
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchGroup();
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchGroup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) return <h2>Loading...</h2>;
  if (!group) return <h2>Group not found</h2>;

  const isAdmin = group.admin._id === currentUserId;

  return (
    <section className="group-details">
      <div className="group-details__container">
        <h2>{group.name}</h2>
        <p>{group.description}</p>
        <p><strong>Admin:</strong> {group.admin.fullName}</p>

        {isAdmin && (
          <>
            <div className="group-section">
              <h3>Pending Requests</h3>
              {group.pendingRequests.length === 0 ? (
                <p>No pending requests.</p>
              ) : (
                group.pendingRequests.map(user => (
                  <div key={user._id} className="user-card">
                    <p>{user.fullName}</p>
                    <button className='btn' onClick={() => handleAcceptRequest(user._id)}>Accept</button>
                    <button className='btn dark' onClick={() => handleDeclineRequest(user._id)}>Decline</button>
                  </div>
                ))
              )}
            </div>

            <div className="group-section">
              <h3>Members</h3>
              {group.members.map(user => (
                <div key={user._id} className="user-card">
                  <p>{user.fullName}</p>
                  {user._id !== currentUserId && (
                    <button className='btn danger' onClick={() => handleRemoveMember(user._id)}>Remove</button>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {!isAdmin && (
          <div className="group-section">
            <h3>Members</h3>
            {group.members.map(user => (
              <div key={user._id} className="user-card">
                <p>{user.fullName}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default GroupDetails;
