import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import './adminDashboard.css';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AdminUserDetailsPage = () => {
  const { email } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [newRole, setNewRole] = useState('user');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`http://localhost:4000/api/auth/user/${email}`);
        const data = await res.json();
        if (data.user) {
          setUser(data.user);
          setNewRole(data.user.role);
        } else {
          toast.error('User not found');
        }
      } catch (err) {
        console.error('Error fetching user:', err);
        toast.error('Failed to fetch user');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [email]);

  const handleRoleUpdate = async () => {
    try {
      const res = await fetch(`http://localhost:4000/api/auth/admin/user/role/${email}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ role: newRole }),
      });

      const data = await res.json();
      if (data.user) {
        setUser(data.user);
        toast.success('User role updated successfully');
      } else {
        toast.error('Failed to update role');
      }
    } catch (err) {
      console.error('Error updating role:', err);
      toast.error('Server error while updating role');
    }
  };

  return (
    <div className="admin-container">
      <div className="sidebar">
        <Sidebar />
      </div>

      <div className="main-content">
        <h2 className="shipping-title">User Details</h2>

        {loading ? (
          <p>Loading user data...</p>
        ) : user ? (
          <div className="user-details-card">
            <img
              src={user.ProfileImg}
              alt="Profile"
              className="user-profile-img"
            />
            <div className="user-info">
              <p><strong>Name:</strong> {user.name}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Contact Number:</strong> {user.contactNumber}</p>
              <p><strong>Address:</strong> {user.address}</p>

              <div className="role-update">
                <label htmlFor="role-select">Change Role:</label>
                <select
                  id="role-select"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="status-dropdown"
                >
                  <option value="user">user</option>
                  <option value="admin">admin</option>
                </select>
                <button className="status-update-btn" onClick={handleRoleUpdate}>
                  Update Role
                </button>
              </div>
            </div>
          </div>
        ) : (
          <p>User not found.</p>
        )}
      </div>
    </div>
  );
};

export default AdminUserDetailsPage;
