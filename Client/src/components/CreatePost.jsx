import React, { useEffect, useState } from 'react';
import ProfileImage from './ProfileImage';
import { useSelector } from 'react-redux';
import { SlPicture } from 'react-icons/sl';
import axios from 'axios';

const CreatePost = ({ onCreatePost, error }) => {
  const [body, setBody] = useState("");
  const [media, setMedia] = useState(null);
  const [mediaPreview, setMediaPreview] = useState("");
  const [profilePhoto, setProfilePhoto] = useState({});
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("");

  const userId = useSelector(state => state?.user?.currentUser?.id);
  const token = useSelector(state => state?.user?.currentUser?.token);

  const fetchGroups = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/groups`, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` }
      });

      // תביא רק קבוצות שהמשתמש חבר בהן
      const userGroups = response.data.filter(group =>
        group.members.includes(userId) || group.admin._id === userId
      );

      setGroups(userGroups);
    } catch (error) {
      console.log(error);
    }
  };

  const createPost = (e) => {
    e.preventDefault();

    if (!media) {
      alert("Please select a media file before posting.");
      return;
    }

    const postData = new FormData();
    postData.set('body', body);
    postData.set('image', media);

    if (selectedGroup) {
      postData.set('groupId', selectedGroup);
      postData.set('visibility', 'group');
    } else {
      postData.set('visibility', 'public');
    }

    onCreatePost(postData);
    setBody("");
    setMedia(null);
    setMediaPreview("");
    setSelectedGroup("");
  }

  const getUser = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/users/${userId}`, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfilePhoto(response?.data);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    getUser();
    fetchGroups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <form className='createPost' encType='multipart/form-data' onSubmit={createPost}>
      {error && <p className="createPost__error-message">{error}</p>}
      <div className='createPost__top'>
        <ProfileImage image={profilePhoto?.profilePhoto} />
        <textarea
          value={body}
          onChange={e => setBody(e.target.value)}
          placeholder="Share your Workout Image or Video!"
        />
      </div>

      {/* בחירת קבוצה */}
      <div className="createPost__select-group">
        <label>Select Group (optional)</label>
        <select value={selectedGroup} onChange={e => setSelectedGroup(e.target.value)}>
          <option value="">Public</option>
          {groups.map(group => (
            <option key={group._id} value={group._id}>{group.name}</option>
          ))}
        </select>
      </div>

      {mediaPreview && (
        <div className="createPost__preview">
          {media?.type?.startsWith('image/') ? (
            <img src={mediaPreview} alt="Preview" style={{ maxWidth: '100%', maxHeight: '300px' }} />
          ) : (
            <video src={mediaPreview} controls style={{ maxWidth: '100%', maxHeight: '300px' }} />
          )}
        </div>
      )}

      <div className="createPost__bottom">
        <span></span>
        <div className="createPost__actions">
          <label htmlFor="media"><SlPicture /></label>
          <input
            type="file"
            id="media"
            accept="image/*, video/*"
            onChange={e => {
              const file = e.target.files[0];

              if (file) {
                if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
                  alert("Please select a valid image or video file.");
                  return;
                }

                if (file.type.startsWith("image/") && file.size > 10 * 1024 * 1024) {
                  alert("Image too big. Maximum allowed size is 10MB.");
                  return;
                }

                if (file.type.startsWith("video/") && file.size > 50 * 1024 * 1024) {
                  alert("Video too big. Maximum allowed size is 50MB.");
                  return;
                }

                setMedia(file);
                setMediaPreview(URL.createObjectURL(file));
              }
            }}
          />
          <button type="submit">Post your Workout!</button>
        </div>
      </div>
    </form>
  )
}

export default CreatePost;
