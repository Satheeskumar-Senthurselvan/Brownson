import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaEye, FaTrash } from 'react-icons/fa';
import Sidebar from './Sidebar';
import './adminDashboard.css';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import API_BASE_URL from '../config';

const AdminAllUsersPage = () => {
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/admin/users`, {
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) {
        setUsers(data.users);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
      toast.error('Failed to fetch users.');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (userId) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this user?');
    if (!confirmDelete) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/admin/user/${userId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const contentType = res.headers.get('content-type');
      let data = {};

      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        throw new Error(text || 'Unexpected server response');
      }

      if (data.success) {
        setUsers(users.filter((user) => user._id !== userId));
        toast.success('User deleted successfully');
      } else {
        toast.error(data.error || 'Failed to delete user');
      }
    } catch (err) {
      console.error('Error deleting user:', err);
      toast.error('Server error: ' + err.message);
    }
  };

  return (
    <div className="admin-container">
      <div className="sidebar">
        <Sidebar />
      </div>

      <div className="main-content">
        <h2 className="admin-title">All Users</h2>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Address</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>{user.address || 'N/A'}</td>
                <td>
                  <div className="action-buttons">
                    <Link to={`/admin/user/${user.email}`} className="view-btn">
                      <FaEye />
                    </Link>
                    <button onClick={() => handleDelete(user._id)} className="delete-btn">
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminAllUsersPage;
