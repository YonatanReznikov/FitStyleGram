import React from 'react'
import { useSelector } from 'react-redux'
import ProfileImage from './ProfileImage'
import TrimText from '../helpers/TrimText'
import TimeAgo from 'react-timeago'
import { Link } from 'react-router-dom'

const MessageListItem = ({ conversation }) => {
  const currentUserId = useSelector(state => state?.user?.currentUser?.id)
  const onlineUsers = useSelector(state => state?.user?.onlineUsers)

  const otherUser = conversation?.participants?.find(
    p => p?._id && p._id.toString() !== currentUserId?.toString()
  )

  if (!otherUser) return null

  return (
    <Link to={`/messages/${otherUser._id}`} className='messageList__item'>
      <ProfileImage
        image={otherUser.profilePhoto}
        className={onlineUsers?.includes(otherUser._id) ? 'active' : ''}
      />
      <div className="messageList__item-details">
        <h5>{otherUser.fullName}</h5>
        <p><TrimText item={conversation?.lastMessage?.text} maxLength={16} /></p>
        <small><TimeAgo date={conversation?.updatedAt} /></small>
      </div>
    </Link>
  )
}

export default MessageListItem