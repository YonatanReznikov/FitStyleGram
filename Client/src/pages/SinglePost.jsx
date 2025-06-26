import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import ProfileImage from '../components/ProfileImage'
import TimeAgo from 'react-timeago'
import { useSelector } from 'react-redux'
import LikeDislikePost from '../components/LikeDislikePost'
import { FaRegCommentDots } from 'react-icons/fa'
import { IoMdSend, IoMdShare } from 'react-icons/io'
import BookmarksPost from '../components/BookmarksPost'
import PostComment from '../components/PostComment'

const SinglePost = () => {
  const token = useSelector(state => state?.user?.currentUser?.token)
  let { id } = useParams()
  const [post, setPost] = useState({})
  const [comment, setComment] = useState("")

  const getPost = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/posts/${id}`, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` }
      })
      setPost(response?.data)
    } catch (error) {
      console.log(error)
    }
  }

  const deleteComment = async (commentId) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/comments/${commentId}`, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` }
      })
      setPost(prev => ({
        ...prev,
        comments: prev.comments.filter(c => c._id !== commentId)
      }))
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    getPost()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const createComment = async (e) => {
    e.preventDefault()
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/comments/${id}`, { comment }, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` }
      })
      const newComment = response?.data
      setPost(prev => ({
        ...prev,
        comments: [newComment, ...prev.comments]
      }))
      setComment("")
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <section className='singlePost'>
      <header className="feed__header">
        <ProfileImage image={post?.creator?.profilePhoto} />
        <div className="feed__header-details">
          <h4>{post?.creator?.fullName}</h4>
          <small><TimeAgo date={post?.createdAt} /></small>
        </div>
      </header>

      <div className="feed__body">
        <p>{post?.body}</p>
      <div className="feed__images">
        {post?.mediaType && post?.image && post.mediaType.startsWith('image/') ? (
          <img src={post?.image} alt="Post" />
        ) : post?.mediaType && post?.image && post.mediaType.startsWith('video/') ? (
          <video
            controls
            src={post?.image}
            style={{ width: '100%', borderRadius: '10px' }}
          >
            Your browser does not support the video tag.
          </video>
        ) : (
          <p>No media available</p>
        )}
      </div>
      </div>

      <footer className="feed__footer">
        <div>
          {post?.likes && <LikeDislikePost post={post} />}
          <button className="feed__footer-comments"><FaRegCommentDots /></button>
          <button className="feed__footer-share"><IoMdShare /></button>
        </div>
        <BookmarksPost post={post} />
      </footer>

      <ul className="singlePost__comments">
        <form className="singlePost__comments-form" onSubmit={createComment}>
          <textarea
            placeholder="Enter your comment..."
            value={comment}
            onChange={e => setComment(e.target.value)}
          />
          <button type='submit' className='singlePost__comments-btn'><IoMdSend /></button>
        </form>
        {post?.comments?.map(comment => (
          <PostComment key={comment?._id} comment={comment} onDeleteComment={deleteComment} />
        ))}
      </ul>
    </section>
  )
}

export default SinglePost
