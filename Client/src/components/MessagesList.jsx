import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useSelector } from 'react-redux'
import MessageListItem from './MessageListItem'


const MessagesList = () => {
    const [conversations,setConversations] = useState([])
    const token = useSelector(state =>state?.user?.currentUser?.token)
    const socket = useSelector(state =>state?.user?.socket)


    const getConversations = async () =>{
    try{
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/conversations`, {withCredentials: true,headers: {Authorization: `Bearer ${token}`}})
          setConversations(response?.data);
        }catch(error){
          console.log(error)
        }
      }
    useEffect(()=>{
      getConversations()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[socket])


  return (
    <menu className="messageList">
      <h3>Recent Messages</h3>
      {
        conversations?.map(conversation => <MessageListItem key={conversation?._id} conversation={conversation}/>)
      }
    </menu>
  )
}

export default MessagesList