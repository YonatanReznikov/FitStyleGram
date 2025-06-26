import React, { useEffect, useState } from 'react'
import UserProfile from '../components/UserProfile'
import HeaderInfo from '../components/HeaderInfo'
import axios from 'axios'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import Feed from '../components/Feed'
import EditPostModal from '../components/EditPostModal'
import EditProfileModal from '../components/EditProfileModal'

const Profile = () => {
  const [user, setUser] = useState({})
  const [userPosts, setUserPosts] = useState([])
    // eslint-disable-next-line no-unused-vars
  const [isLoading, setIsLoading] = useState(false)
  const {id: userId} = useParams()
  const token = useSelector(state =>state?.user?.currentUser?.token)
  const EditPostModalOpen = useSelector(state => state?.ui?.editPostModalOpen)
  const EditProfileModalOpen = useSelector(state => state?.ui?.EditProfileModalOpen)

  const getUserPosts = async () => {
    setIsLoading(true);
   try{
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/users/${userId}/posts`, {withCredentials: true,headers: {Authorization: `Bearer ${token}`}})
      setUser(response?.data)
      setUserPosts(response?.data?.posts)
      }catch(error){
        console.log(error)
      }
      setIsLoading(false)
    }

    const deletePost = async (postId) => {
    try{
        // eslint-disable-next-line no-unused-vars
        const response = await axios.delete(`${import.meta.env.VITE_API_URL}/posts/${postId}`, {withCredentials: true,headers: {Authorization: `Bearer ${token}`}})
        setUserPosts(userPosts?.filter(p=> p?._id != postId))
        }catch(error){
          console.log(error)
        }
      }

    const updatePost = async (data,postId) => {
    try{
        const response = await axios.patch(`${import.meta.env.VITE_API_URL}/posts/${postId}`, data, {withCredentials: true,headers: {Authorization: `Bearer ${token}`}})
        if (response?.status == 200){
          const updatedPost = response?.data;
          setUserPosts(userPosts?.map(post =>{ 
            if( updatedPost?._id.toString()== post?._id.toString()){
              post.body = updatedPost.body;
            }
            return post;
          }))
        }
      }catch(error){
          console.log(error)
        }
        setIsLoading(false)
      }


  useEffect(()=>{
    getUserPosts()
   // eslint-disable-next-line react-hooks/exhaustive-deps
  },[userId])

  return (
    <section>
      <UserProfile />
      <HeaderInfo text={`${user?.fullName}'s posts`} />
      <section className='profile__posts'>
        {
          userPosts?. length < 1 ? <p className="center">No posts by this user</p> : userPosts?.map(post => <Feed key={post?._id} post={post} onDeletePost={deletePost}/>)
        }
      </section>
      {EditPostModalOpen && <EditPostModal onUpdatePost={updatePost}/>}
      {EditProfileModalOpen && <EditProfileModal />}

    </section>
    )
}

export default Profile