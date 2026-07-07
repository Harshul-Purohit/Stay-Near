import React from 'react';

const ProfileCard = ({ user }) => {
  return <div className='profile-card card'>Profile: {user?.name}</div>;
};

export default ProfileCard;
