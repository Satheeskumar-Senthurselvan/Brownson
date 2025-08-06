import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Profile.css'; 

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const fetchUserData = async (email) => {
    try {
      const res = await fetch(`https://brownson-frontend.onrender.com/api/auth/user/${email}`);
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
      } else {
        console.error(data.error || 'User not found');
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('User');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        fetchUserData(parsedUser.email);
      } catch (err) {
        console.error('Failed to parse user:', err);
      }
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handleUpdate = () => {
    navigate('/update-profile'); 
  };

  return (
    <div className="profile-page">
      <div className="profile-card">
        <h2 className="profile-title">User Profile</h2>

        {user ? (
          <>
            <div className="profile-info">
              <img
                src={user.ProfileImg || "/img/image/user.jpg"}
                alt="User"
                className="profile-img"
              />
              <div className="profile-details">
                <p><strong>Name:</strong> {user.name}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Contact Number:</strong> {user.contactNumber}</p>
                <p><strong>Address:</strong> {user.address}</p>
                <button className="update-btn" onClick={handleUpdate}>
                  Update Profile
                </button>
              </div>
            </div>
          </>
        ) : (
          <p>Loading user data...</p>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
