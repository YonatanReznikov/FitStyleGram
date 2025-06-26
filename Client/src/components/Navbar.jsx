import React, { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { CiSearch } from "react-icons/ci";
import ProfileImage from './ProfileImage'
import { useSelector } from 'react-redux'
import axios from 'axios';


const Navbar = () => {

  const [user, setUser] = useState({})
  const userId=useSelector(state => state?.user?.currentUser?.id);
  const token=useSelector(state => state?.user?.currentUser?.token);
  const navigate= useNavigate()

  const getUser = async ()=> {
    try{
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/users/${userId}`,{withCredentials: true, headers: {Authorization: `Bearer ${token}`}})
      setUser(response?.data)
    }catch(error){
      console.log(error);
    }
  }
  useEffect(()=>{
    getUser()
       // eslint-disable-next-line react-hooks/exhaustive-deps
  },[])


  useEffect(()=>{
    if(!token){
      navigate("/login")
    }
       // eslint-disable-next-line react-hooks/exhaustive-deps
  },[])

  useEffect(()=>{
    setTimeout(()=>{
      navigate("/logout")
    }, 1000*60*60)
      // eslint-disable-next-line react-hooks/exhaustive-deps
  },[])


  return (
    <nav className="navbar">
      <div className='container navbar__container'>
        <Link to = "/" className='navbar__logo'>FitStyleGram</Link>
        <button type="button" className="btn search-btn" onClick={() => navigate('/search')}>Advanced Search</button>
        <div className="navbar__right">
          <Link to={`/users/${userId}`} className='navbar__profile'>
          <ProfileImage image={user?.profilePhoto} />
          </Link>
          {token ? <Link to="/logout">Logout</Link> :<Link to="/login">Login</Link>}
        </div>
      </div>
    </nav>
    )
}

export default Navbar