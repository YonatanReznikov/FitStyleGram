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
  const userId = useSelector(state => state?.user?.currentUser?.id);
  const token = useSelector(state => state?.user?.currentUser?.token);

  const createPost = (e) => {
    e.preventDefault();

    if (!media) {
      alert("Please select a media file before posting.");
      return;
    }

    console.log('Posting file:', media);
    console.log('File type:', media?.type);

    const postData = new FormData();
    postData.set('body', body);
    postData.set('image', media);
    onCreatePost(postData);
    setBody("");
    setMedia(null);
    setMediaPreview("");
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <form className='createPost' encType='multipart/form-data' onSubmit={createPost}>
      {error && <p className="createPost__error-message"> {error}</p>}
      <div className='createPost__top'>
        <ProfileImage image={profilePhoto?.profilePhoto} />
        <textarea
          value={body}
          onChange={e => setBody(e.target.value)}
          placeholder="Share your Workout Image or Video!"
        />
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
                console.log('Selected file:', file);
                console.log('Selected file type:', file?.type);

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
