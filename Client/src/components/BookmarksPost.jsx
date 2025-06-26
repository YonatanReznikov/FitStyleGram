import React, { useState } from 'react'
import { useEffect } from 'react'
import { FaBookmark, FaRegBookmark } from 'react-icons/fa'
import { useSelector } from 'react-redux'
import axios from 'axios'

const BookmarksPost = ({post}) => {

  const [user, setUser] = useState({})
  const [postBookmarked, setPostBookmarked] = useState(user?.bookmarks?.includes(post?._id))
  const userId = useSelector(state =>state?.user?.currentUser?.id)
  const token = useSelector(state =>state?.user?.currentUser?.token)

  const getUser= async ()=> {
    try{
    const response = await axios.get(`${import.meta.env.VITE_API_URL}/users/${userId}`, {withCredentials:true,
          headers: {Authorization: `Bearer ${token}`}
        })
      setUser(response?.data)
      if(response?.data?.bookmarks?.includes(post?._id)){
        setPostBookmarked(true)
      }else{
        setPostBookmarked(false)
      }
      }catch(error){
        console.log(error)
      }
    }

  useEffect(()=>{
    getUser();
       // eslint-disable-next-line react-hooks/exhaustive-deps
  },[user, postBookmarked])

  const createBookmark = async ()=>{
try{
  const response = await axios.get(`${import.meta.env.VITE_API_URL}/posts/${post?._id}/bookmark`, {withCredentials:true,
        headers: {Authorization: `Bearer ${token}`}
      })
    if(response?.data?.bookmarks?.includes(post?._id)) {
      setPostBookmarked(true)
    }
    else{
      setPostBookmarked(false)
    }
    }catch(error){
      console.log(error)
    }
  }


  return (
    <button className="feed_footer-bookmark" onClick={createBookmark}> {postBookmarked ? <FaBookmark /> : <FaRegBookmark />} </button>
    )
}

export default BookmarksPost