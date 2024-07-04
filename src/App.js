import logo from './logo.svg';
import './App.css';
import {
  BrowserRouter as Router,
  Route,
  Link,
  BrowserRouter,
  Routes
} from "react-router-dom";
// import Switch from "react-switch";
import Home from './components/Home/Home/Home';

import NotFound from './components/NotFound/NotFound';
import { useState } from 'react';
import { AccountBox } from './components/Login_Signup';
import styled from 'styled-components';
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
// import LS from './components/Login_Signup/LS';

function App({children}) {

  
    const [isloggedin, setIsLoggedin] = useState(localStorage.getItem('token') ? true : false);
    
  
    const loggedin = () => {
      setIsLoggedin(true);
  }

  const AppContainer = styled.div`
  width: 100%;
  height: 900px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  // background-color:blue;
  background: linear-gradient(to top, #ffffff 0%, #454545 100%);
  // background: linear-gradient(to top, #ffffff 0%, #ccccff 100%);
  // margin-bottom:2%;
`;

const AppCon = styled.div`
  background: linear-gradient(to top, #ffffff 0%, #454545 100%);
  // position:relative;
`;

  return (
   

<>
<BrowserRouter>
<Navbar/>
<Routes>
  <Route path="/" element={<Home />}/>
  <Route path="/Home" element={<Home />}/>
  <Route path="*" element={<NotFound/>}/>
  <Route path="/login" element={<AppContainer><AccountBox/></AppContainer>}/>
  <Route path="/admin" element={<AppContainer><Account1/></AppContainer>}/>
  <Route path="/check" element={<AppCon><Check/></AppCon>}></Route>
  <Route path="/slotbooking/:index" element={<AppCon><SlotBooking/></AppCon>}></Route>
  <Route path="/bookingdetails/:idr/:index" element={<AppCon><BookingDetails/></AppCon>}></Route>
  <Route path="/forgotpassword" element={<AppCon><ForgetPassword/></AppCon>}></Route>
  <Route path="/adminadd" element={<AppCon><AdminAddCities/></AppCon>}></Route>
  <Route path="/adminedit/:id" element={<AppCon><AdminEdit/></AppCon>}></Route>
  <Route path="/adminview" element={<AppCon><AdminViewCities/></AppCon>}></Route>
  <Route path="/adminviewslots/:index" element={<AppCon><AdminViewSlots/></AppCon>}></Route>
  <Route path="/adminaddslots/:index" element={<AppCon><AdminAddSlots/></AppCon>}></Route>
 
  
  {/* <Route path="/mainhome" element={<Mainhome/>}/> */}
  {/* <Route path="/signin" element={<SignIn />}/> */}
  {/* <Route path="/Login" element={<Login/>}/> */}
  {/* <Route path="/Mainhome" element={<Mainhome/>}/> */}
  {/* <Route path="/Signup" element={<Signup/>}/> */}
  {/* <Route path="/Admin" element={<Admin/>}/> */}
  {/* <Route path="/Time" element={<Time/>}/> */}
  {/* <Route path="/Slot" element={<Slot/>}/> */}
</Routes>
<Footer/>
</BrowserRouter>
</>



  );
}

export default App;
