import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

const Groups = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [groupData, setGroupData] = useState({ name: '', description: '' });

  const token = useSelector(state => state?.user?.currentUser?.token);
  const currentUserId = useSelector(state => state?.user?.currentUser?.id);

  const fetchGroups = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/groups`, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` }
      });
      setGroups(response.data);
      setLoading(false);
    } catch (error) {
      console.log(error);
    }
  };

  const joinGroupRequest = async (groupId) => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/groups/${groupId}/join-request`, {}, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchGroups();
    } catch (error) {
      console.log(error);
    }
  };

  const createGroup = async (e) => {
    e.preventDefault();
    if (!groupData.name) return alert('Group name is required!');

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/groups`, groupData, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` }
      });
      setGroupData({ name: '', description: '' });
      fetchGroups();
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchGroups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) return <h2>Loading...</h2>;

  const adminGroups = groups.filter(group => group.admin._id === currentUserId);
  const memberGroups = groups.filter(group => group.members.includes(currentUserId) && group.admin._id !== currentUserId);

  return (
    <section className="groups">
      <div className="groups__container">
        <h2>Groups</h2>

        <form onSubmit={createGroup} className="create-group-form">
          <h3>Create New Group</h3>
          <input
            type="text"
            placeholder="Group Name"
            value={groupData.name}
            onChange={e => setGroupData({ ...groupData, name: e.target.value })}
          />
          <textarea
            placeholder="Group Description"
            value={groupData.description}
            onChange={e => setGroupData({ ...groupData, description: e.target.value })}
          ></textarea>
          <button type="submit" className="btn">Create Group</button>
        </form>

        <div className="groups-section">
          <h3>Your Groups (Admin)</h3>
          {adminGroups.length === 0 ? <p>You don't manage any groups yet.</p> : adminGroups.map(group => (
            <div key={group._id} className="group-card">
              <h4>{group.name}</h4>
              <p>{group.description}</p>
              <p><strong>You are the admin</strong></p>
              <Link to={`/groups/${group._id}`} className='btn default'>View</Link>
            </div>
          ))}
        </div>

        <div className="groups-section">
          <h3>Groups You Are In</h3>
          {memberGroups.length === 0 ? <p>You are not a member in any group yet.</p> : memberGroups.map(group => (
            <div key={group._id} className="group-card">
              <h4>{group.name}</h4>
              <p>{group.description}</p>
              {group.pendingRequests.includes(currentUserId) ? (
                <p>Request Pending</p>
              ) : (
                <p>You are a member</p>
              )}
              <Link to={`/groups/${group._id}`} className='btn default'>View</Link>
            </div>
          ))}
        </div>

        <div className="groups-section">
          <h3>Other Groups</h3>
          {groups.filter(group =>
            group.admin._id !== currentUserId &&
            !group.members.includes(currentUserId) &&
            !group.pendingRequests.includes(currentUserId)
          ).map(group => (
            <div key={group._id} className="group-card">
              <h4>{group.name}</h4>
              <p>{group.description}</p>
              <button className='btn' onClick={() => joinGroupRequest(group._id)}>Request to Join</button>
              <Link to={`/groups/${group._id}`} className='btn default'>View</Link>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Groups;
