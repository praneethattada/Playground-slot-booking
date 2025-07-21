import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import './ForgotPassword.css'; // Reusing the same CSS

const ResetPassword = ({ userType = 'user' }) => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      Swal.fire('Error', 'Passwords do not match.', 'error');
      return;
    }
    setLoading(true);

    const apiUrl = userType === 'admin'
      ? `http://localhost:3003/admin/reset-password/${token}`
      : `http://localhost:3003/reset-password/${token}`;

    try {
      const response = await axios.post(apiUrl, { password });
      Swal.fire({
        title: 'Success!',
        text: response.data.message,
        icon: 'success'
      }).then(() => {
        // Navigate to the correct login page
        navigate(userType === 'admin' ? '/admin' : '/login');
      });
    } catch (error) {
      Swal.fire('Error', error.response?.data?.message || 'Failed to reset password.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        <div className="card-content">
          <h2>Set a New Password</h2>
          <p>Please enter and confirm your new password below.</p>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="password">New Password</label>
              <input 
                type="password" 
                id="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="Enter new password"
                required 
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <input 
                type="password" 
                id="confirmPassword" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                placeholder="Confirm new password"
                required 
              />
            </div>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;