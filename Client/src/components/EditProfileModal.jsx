import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useDispatch, useSelector } from 'react-redux'
import { uiSliceActions } from '../store/ui-slice'

const EditProfileModal = () => {

  const token = useSelector(state => state?.user?.currentUser?.token)
  const id = useSelector(state => state?.user?.currentUser?.id)
  const dispatch = useDispatch()
  const [userData, setUserData] = useState({ fullName: "", bio: "" })

  const getUser = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/users/${id}`, { withCredentials: true, headers: { Authorization: `Bearer ${token}` } })
      setUserData(response?.data)
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    getUser()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const closeModal = (e) => {
    if (e.target.classList.contains('editProfile')) {
      dispatch(uiSliceActions?.closeEditProfileModal())
    }
  }

  const updateUser = async (e) => {
    e.preventDefault()
    try {
      await axios.patch(`${import.meta.env.VITE_API_URL}/users/edit`, userData, { withCredentials: true, headers: { Authorization: `Bearer ${token}` } })
      dispatch(uiSliceActions?.toggleProfileUpdated())
      dispatch(uiSliceActions?.closeEditProfileModal())

    } catch (error) {
      console.log(error)
    }
  }

  const changeUserData = (e) => {
    setUserData(prevState => {
      return { ...prevState, [e.target.name]: e.target.value }
    })
  }

  return (
    <section className="editProfile" onClick={e => closeModal(e)}>
      <div className="editProfile__container">
        <h3>Edit Profile</h3>
        <form onSubmit={updateUser}>
          <input type="text" name='fullName' value={userData?.fullName} onChange={changeUserData} placeholder='Full Name' />
          <textarea name="bio" value={userData?.bio} onChange={changeUserData} placeholder='bio'></textarea>
          <button type='submit' className='btn primary'>Update</button>
        </form>
      </div>
    </section>
  )
}

export default EditProfileModal
