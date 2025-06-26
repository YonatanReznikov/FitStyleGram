import React from 'react'
import { CiUser } from "react-icons/ci";

const ProfileImage = ({ image, className }) => {
  return (
    <div className={`profileImage ${className}`}>
      <img src={image} alt="" />
    </div>
  );
};

export default ProfileImage