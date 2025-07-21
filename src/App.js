import React from 'react';
import './App.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import styled from 'styled-components';


// Import Components
import ProtectedRoute from './components/ProtectedRoute'; // Import the new component
import Home from './components/Home/Home/Home';
import NotFound from './components/NotFound/NotFound';
import { AccountBox } from './components/Login_Signup';
import Navbar from './components/Shared/Navbar/Navbar';
import Footer from './components/Shared/Footer/Footer';
import { Account1 } from './components/AdminLogin_Signup copy';
import Check from './components/Check';
import SlotBooking from './components/SlotBooking';
import BookingDetails from './components/BookingDetails';
import ForgetPassword from './components/ForgetPassword';
import AdminAddCities from './components/AdminAddCIties';
import AdminEdit from './components/AdminEdit';
import AdminViewSlots from './components/AdminViewSlots';
import AdminAddSlots from './components/AdminAddSlots';
import AdminDashboard from './components/AdminDashboard';
import AdminCityManagement from './components/AdminCityManagement';
import AdminAnalytics from './components/AdminAnalytics';
import AdminUserManagement from './components/AdminUserManagement';
import AdminManualBooking from './components/AdminManualBooking';
import AdminApproval from './components/AdminApproval';
import MyBookings from './components/MyBookings';
import ResetPassword from './components/ResetPassword';



const AppContainer = styled.div`
  width: 100%;
  min-height: 90vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(to top, #ffffff 0%, #454545 100%);
  padding-top: 80px;
`;

const AppCon = styled.div`
  background: linear-gradient(to top, #ffffff 0%, #454545 100%);
  padding-top: 80px;
  min-height: 90vh;
`;

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        {/* --- Public Routes --- */}
        <Route path="/" element={<Home />} />
        <Route path="/Home" element={<Home />} />
        <Route path="/login" element={<AppContainer><AccountBox /></AppContainer>} />
        <Route path="/admin" element={<AppContainer><Account1 /></AppContainer>} />
        <Route path="/forgot-password" element={<AppCon><ForgetPassword /></AppCon>} />
        <Route path="/reset-password/:token" element={<AppCon><ResetPassword /></AppCon>} />
        {/* Admin Password Reset */}
        <Route path="/admin/forgot-password" element={<AppCon><ForgetPassword userType="admin" /></AppCon>} />
        <Route path="/admin/reset-password/:token" element={<AppCon><ResetPassword userType="admin" /></AppCon>} />


        {/* --- Protected User Routes --- */}
        <Route element={<ProtectedRoute authType="user" />}>
          <Route path="/check" element={<AppCon><Check /></AppCon>} />
          <Route path="/slotbooking/:index" element={<AppCon><SlotBooking /></AppCon>} />
          <Route path="/bookingdetails/:idr/:index" element={<AppCon><BookingDetails /></AppCon>} />
          <Route path="/my-bookings" element={<AppCon><MyBookings /></AppCon>} />
        </Route>
        
        {/* --- Protected Admin Routes --- */}
        <Route element={<ProtectedRoute authType="admin" />}>
          <Route path="/adminview" element={<AppCon><AdminDashboard /></AppCon>} />
          <Route path="/admin/manage-cities" element={<AppCon><AdminCityManagement /></AppCon>} />
          <Route path="/admin/analytics" element={<AppCon><AdminAnalytics /></AppCon>} />
          <Route path="/admin/users" element={<AppCon><AdminUserManagement /></AppCon>} />
          <Route path="/admin/manual-booking" element={<AppCon><AdminManualBooking /></AppCon>} />
          <Route path="/adminadd" element={<AppCon><AdminAddCities /></AppCon>} />
          <Route path="/adminedit/:id" element={<AppCon><AdminEdit /></AppCon>} />
          <Route path="/adminviewslots/:cityId/:groundName" element={<AppCon><AdminViewSlots /></AppCon>} />
          <Route path="/adminaddslots/:cityId/:groundName" element={<AppCon><AdminAddSlots /></AppCon>} />
          <Route path="/admin/approvals" element={<AppCon><AdminApproval /></AppCon>} />
        </Route>
        
        {/* Catch-all Not Found Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
