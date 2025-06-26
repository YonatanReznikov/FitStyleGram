import React, { useEffect } from 'react'
import { useState } from 'react'
import { useSelector } from 'react-redux'
import CreatePost from '../components/CreatePost'
import axios from 'axios'
import Feeds from '../components/Feeds'

const Home = () => {
  const [posts, setPosts] = useState([])
  // eslint-disable-next-line no-unused-vars
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const token = useSelector(state => state?.user?.currentUser?.token)

const createPost = async (data) => {
  setError("")
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/posts`,
      data,
      {
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}`}
      }
    );
    const newPost = response?.data;
    setPosts([newPost, ...posts])
  } catch (err) {
    setError(err?.response?.data?.message || "Something went wrong");
  }
}


const getPosts = async()=> {
  setIsLoading(true)
  try{
    const response = await axios.get(`${import.meta.env.VITE_API_URL}/posts`,{
      withCredentials:true,
      headers:{Authorization: `Bearer ${token}`}
    })
    setPosts(response?.data)
  }catch(err){
    console.log(err)
  }
}
useEffect(() =>{
  getPosts()
   // eslint-disable-next-line react-hooks/exhaustive-deps
},[setPosts]) 


  return (
    <section className="mainArea">
      <CreatePost onCreatePost={createPost} error={error} />
      <Feeds posts={posts} onSetPosts={setPosts} />
    </section>
    )
}

export default Home