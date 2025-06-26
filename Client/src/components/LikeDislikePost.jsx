import React, { useEffect, useState } from 'react'
import { FaRegHeart } from 'react-icons/fa'
import { FcLike } from 'react-icons/fc'
import { useSelector } from 'react-redux'
import axios from 'axios'

const LikeDislikePost = (props) => {
  const userId = useSelector(state =>state?.user?.currentUser?.id)
  const token = useSelector(state =>state?.user?.currentUser?.token)
  const [post, setPost] = useState(props.post)
  const [postLiked, setPostLiked] = useState(post?.likes?.includes(userId))



  const handleLikeDislikePost = async () =>{
    try{
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/posts/${post?._id}/like`, {withCredentials:true,
        headers: {Authorization: `Bearer ${token}`}
      })
      setPost(response?.data)
    }catch(error){
      console.log(error)
    }
  }

  const handleCheckIfUserLikedPost =() => {
  if (post?.likes?.includes(userId)){
    setPostLiked(true)
  }else{
    setPostLiked(false)
  }
}
  useEffect(()=>{
    handleCheckIfUserLikedPost()
       // eslint-disable-next-line react-hooks/exhaustive-deps
  },[post])

  return (
    <button className='feed__footer-comments' onClick={handleLikeDislikePost}>
      {postLiked ? <FcLike /> : <FaRegHeart />}
      <small>{post?.likes?.length}</small>
    </button>
    )
}

export default LikeDislikePost