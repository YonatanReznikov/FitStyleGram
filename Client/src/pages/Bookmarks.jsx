import React, { useEffect } from 'react'
import { useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import Feed from '../components/Feed';
import FeedSkeleton from '../components/FeedSkeleton'
import { HeaderInfo } from '../components/HeaderInfo';


const Bookmarks = () => {

  const token = useSelector(state =>state?.user?.currentUser?.token)
  const [bookmarks, setBookmarks] = useState([])
  const [isLoading, setIsLoading] = useState(false);

  const getBookmarks = async ()=> {
    setIsLoading(true)
    try{
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/users/bookmarks`, {withCredentials: true,headers: {Authorization: `Bearer ${token}`}})
          setBookmarks(response?.data?.bookmarks);
        }catch(error){
          console.log(error)
        }
        setIsLoading(false)
      }
      useEffect(()=>{
        getBookmarks()
   // eslint-disable-next-line react-hooks/exhaustive-deps
      },[])

  return (
    <section>
      <HeaderInfo text="My Bookmarks"/>
      {isLoading ? <FeedSkeleton /> :
      bookmarks?.length < 1 ? <p className='center'>No posts bookmarked</p> : bookmarks?.map(bookmark => <Feed key={bookmark?._id} post={bookmark} />)}
    </section>
    )
}

export default Bookmarks