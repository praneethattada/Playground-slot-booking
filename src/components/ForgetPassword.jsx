import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import './ForgotPassword.css';

// This component now accepts a 'userType' prop ('user' or 'admin')
const ForgotPassword = ({ userType = 'user' }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Determine the correct API endpoint based on the userType prop
    const apiUrl = userType === 'admin' 
      ? 'http://localhost:3003/admin/forgot-password' 
      : 'http://localhost:3003/forgot-password';

    try {
      const response = await axios.post(apiUrl, { email });
      Swal.fire({
        title: 'Check Your Email',
        text: response.data.message,
        icon: 'success'
      });
    } catch (error) {
      Swal.fire('Error', 'An unexpected error occurred. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        <img 
          src="https://media.istockphoto.com/id/1355687112/photo/various-sport-equipment-gear.jpg?b=1&s=170667a&w=0&k=20&c=hEADFXL4HG9mF94yC5g3JA8lMHn8OZg7hRLoiel_L48=" 
          alt="Sports equipment" 
          className="card-img"
        />
        <div className="card-content">
          {/* The title changes based on the user type */}
          <h2>{userType === 'admin' ? 'Admin' : 'User'} Password Reset</h2>
          <p>Enter your email address below and we'll send you a link to reset your password.</p>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input 
                type="email" 
                id="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="you@example.com"
                required 
              />
            </div>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;