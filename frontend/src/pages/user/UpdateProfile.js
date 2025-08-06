import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

const UpdateProfile = () => {
  const [formData, setFormData] = useState({
    name: '',
    password: '',
    contactNumber: '',
    address: '',
  });
  const [profileImage, setProfileImage] = useState(null);
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('User');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setEmail(user.email);
      fetch(`https://brownson-backend.onrender.com/api/auth/user/${user.email}`)
        .then(res => res.json())
        .then(data => {
          if (data.user) {
            setFormData({
              name: data.user.name || '',
              password: '',
              contactNumber: data.user.contactNumber || '',
              address: data.user.address || '',
            });
          }
        });
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    setProfileImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = new FormData();
    payload.append('name', formData.name);
    payload.append('password', formData.password);
    payload.append('contactNumber', formData.contactNumber);
    payload.append('address', formData.address);
    if (profileImage) payload.append('ProfileImg', profileImage); // ✅ Match backend

    try {
      const res = await fetch(`https://brownson-backend.onrender.com/api/auth/user/update/${email}`, {
        method: 'PUT',
        body: payload,
      });

      const data = await res.json();
      if (res.ok) {
        alert('Profile updated successfully');
        navigate('/userProfile');
      } else {
        alert(data.error || 'Update failed');
      }
    } catch (err) {
      console.error('Update error:', err);
      alert('Server error');
    }
  };

  return (
    <div className="update-page">
      <div className="update-profile-container">
        <h2 className="profile-title">Update Profile</h2>
        <form className="update-form" onSubmit={handleSubmit}>
          <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Name" required />
          <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="New Password" />
          <input type="text" name="contactNumber" value={formData.contactNumber} onChange={handleChange} placeholder="Contact Number" required />
          <textarea name="address" value={formData.address} onChange={handleChange} placeholder="Address" required></textarea>
          
          {/* ✅ Image upload: name must match multer: ProfileImg */}
          <input type="file" name="ProfileImg" accept="image/*" onChange={handleImageChange} />
          
          <button type="submit" className="btn-update">Update</button>
        </form>
      </div>
    </div>
  );
};

export default UpdateProfile;
