import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ authType = 'user' }) => {
  // Check for the appropriate token based on the route type
  const token = authType === 'admin' 
    ? localStorage.getItem('adminAuthToken') 
    : localStorage.getItem('authToken');

  // If the token exists, allow access to the page.
  // Otherwise, redirect to the appropriate login page.
  if (token) {
    return <Outlet />;
  } else {
    const redirectTo = authType === 'admin' ? '/admin' : '/login';
    return <Navigate to={redirectTo} />;
  }
};

export default ProtectedRoute;
