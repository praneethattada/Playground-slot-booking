import React from 'react';
import './App.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import styled from 'styled-components';

// Import Components
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
import AdminViewCities from './components/AdminViewCities';
import AdminViewSlots from './components/AdminViewSlots';
import AdminAddSlots from './components/AdminAddSlots';

const AppContainer = styled.div`
  width: 100%;
  min-height: 90vh; /* Use min-height to be more flexible */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(to top, #ffffff 0%, #454545 100%);
`;

const AppCon = styled.div`
  background: linear-gradient(to top, #ffffff 0%, #454545 100%);
`;

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Home" element={<Home />} />
        
        {/* User Routes */}
        <Route path="/login" element={<AppContainer><AccountBox /></AppContainer>} />
        <Route path="/check" element={<AppCon><Check /></AppCon>} />
        <Route path="/slotbooking/:index" element={<AppCon><SlotBooking /></AppCon>} />
        <Route path="/bookingdetails/:idr/:index" element={<AppCon><BookingDetails /></AppCon>} />
        <Route path="/forgotpassword" element={<AppCon><ForgetPassword /></AppCon>} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AppContainer><Account1 /></AppContainer>} />
        <Route path="/adminadd" element={<AppCon><AdminAddCities /></AppCon>} />
        <Route path="/adminedit/:id" element={<AppCon><AdminEdit /></AppCon>} />
        <Route path="/adminview" element={<AppCon><AdminViewCities /></AppCon>} />
        
        {/* --- CORRECTED ROUTES --- */}
        <Route path="/adminviewslots/:cityId/:groundName" element={<AppCon><AdminViewSlots /></AppCon>} />
        <Route path="/adminaddslots/:cityId/:groundName" element={<AppCon><AdminAddSlots /></AppCon>} />
        
        {/* Catch-all Not Found Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;