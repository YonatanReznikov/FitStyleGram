import React, { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import { useDispatch, useSelector } from 'react-redux'
import { userActions } from '../store/user-slice'
import ProfileImage from '../components/ProfileImage'
import MessagesItem from '../components/MessagesItem'
import { IoMdSend } from 'react-icons/io'

const Messages = () => {

  const {receiverId} = useParams()
  const [messages, setMessages]= useState([])
  const [otherMessager, setOtherMessager]= useState({})
  const [messageBody, setMessageBody]= useState("")
  const [conversationId, setConversationId]= useState("")
  const messageEndRef = useRef()

  const token = useSelector(state =>state?.user?.currentUser?.token)

  const getOtherMessager= async () =>{
    const response = await axios.get(`${import.meta.env.VITE_API_URL}/users/${receiverId}`, {withCredentials: true,headers: {Authorization: `Bearer ${token}`}})
    setOtherMessager(response?.data);
  }

  useEffect(()=>{
    messageEndRef?.current?.scrollIntoView()
  },[messages])

  const getMessages = async () =>{
    try{
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/messages/${receiverId}`, {withCredentials: true,headers: {Authorization: `Bearer ${token}`}})
        setMessages(response?.data);
        setConversationId(response?.data?.[0]?.conversationId)
        }catch(error){
           if (error.response?.status === 404) {
            setMessages([]);
            setConversationId("");
          } else {
            console.log(error);
    }
  }
};

    const socket = useSelector(state=> state?.user?.socket)


    const sendMessage = async(e)=>{
      e.preventDefault()
      try{
          const response = await axios.post(`${import.meta.env.VITE_API_URL}/messages/${receiverId}`,{messageBody}, {withCredentials: true,headers: {Authorization: `Bearer ${token}`}})
          setMessages(prevMessages => [...prevMessages, response?.data]);
          setMessageBody('')
          }catch(error){
            console.log(error)
          }
        }
    
        const dispatch=useDispatch()
        const conversations = useSelector(state => state?.user?.conversations)


    useEffect(()=>{
      socket?.on("newMessage",(message)=>{
        setMessages(prevMessages=>[...prevMessages, message])

        dispatch(userActions?.setConversations(conversations.map(conversation =>{
          if(conversation?._id == conversationId) {
            return{...conversation, lastMessage: {...conversation.lastMessage, seen: true}}
          }
        })))
        return () => socket.off("newMessage")
      })
     // eslint-disable-next-line react-hooks/exhaustive-deps
    },[socket, messages])

    useEffect(()=>{
      getMessages()
      getOtherMessager()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[receiverId])
  
  return (
    <>
    {<section className='messagesBox'>
      <header className='messagesBox__header'>
        <ProfileImage image={otherMessager?.profilePhoto} />
        <div className="messagesBox__header-info">
          <h4>{otherMessager?.fullName}</h4>
        </div>
      </header>
      <ul className='messagesBox__messages'>
        {messages?.map(message => <MessagesItem key={message._id} message={message}/>)}
        <div ref={messageEndRef}></div>
      </ul>
      <form onSubmit={sendMessage}>
        <input type="text" value={messageBody} onChange={({target}) => setMessageBody(target.value)} placeholder='Enter message...' autoFocus />
        <button type='submit'><IoMdSend /></button>
      </form>
      </section>}
    </>
    )
}

export default Messages