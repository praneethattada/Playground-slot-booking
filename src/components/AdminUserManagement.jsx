import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import './AdminUserManagement.css';

const AdminUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminAuthToken');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get('http://localhost:3003/admin/users', config);
      if (response.data.success) {
        setUsers(response.data.data);
      } else {
        throw new Error("Failed to fetch users.");
      }
    } catch (err) {
      console.error("Failed to fetch users:", err);
      setError("Could not load user data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleStatusChange = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'blocked' : 'active';
    const actionText = newStatus === 'blocked' ? 'block' : 'unblock';

    Swal.fire({
      title: `Are you sure you want to ${actionText} this user?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: `Yes, ${actionText} user!`
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const token = localStorage.getItem('adminAuthToken');
          const config = { headers: { Authorization: `Bearer ${token}` } };
          await axios.put(`http://localhost:3003/admin/users/${userId}/status`, { status: newStatus }, config);
          Swal.fire('Success!', `User has been ${newStatus}.`, 'success');
          fetchUsers(); // Refresh the user list
        } catch (error) {
          Swal.fire('Error!', 'Failed to update user status.', 'error');
        }
      }
    });
  };

  if (loading) return <div className="user-management-status">Loading users...</div>;
  if (error) return <div className="user-management-status error">{error}</div>;

  return (
    <div className="user-management-container">
      <h1>User Management</h1>
      <div className="table-wrapper">
        <table className="users-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Contact</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user._id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.contact || 'N/A'}</td>
                <td>
                  <span className={`status-badge status-${user.status || 'active'}`}>
                    {user.status || 'active'}
                  </span>
                </td>
                <td>
                  <button 
                    className={`btn-status ${user.status === 'blocked' ? 'btn-unblock' : 'btn-block'}`}
                    onClick={() => handleStatusChange(user._id, user.status || 'active')}
                  >
                    {user.status === 'blocked' ? 'Unblock' : 'Block'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUserManagement;
