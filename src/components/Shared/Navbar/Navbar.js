import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
// import { UserContext } from '../../../App';
import logo from '../../../images/logo.png';
import './Navbar.css';
import { useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom';

const Navbar = () => {
    const [navbar, setNavbar] =useState(false);
    var isloggedin= useSelector((state)=>state.isloggedin)
    function loggedout(){
        localStorage.clear();
        window.location.href = "/";
      }
    

    // const [isAdmin, setIsAdmin] = useState(false);
    // const {userInfo} = useContext(UserContext);
    // const [loggedInUser, setLoggedInUser]= userInfo;


    // useEffect( ()=>{
    //     fetch('https://stormy-thicket-33100.herokuapp.com/isAdmin', {
    //         method: 'POST',
    //         headers: {'Content-Type' : 'application/json'},
    //         body:JSON.stringify({email: loggedInUser.email })
    //     })
    //     .then(res => res.json())
    //     .then(data =>  setIsAdmin(data))

    // } ,[])


    const changeBackground = ()=>{
        if(window.scrollY >= 100){
            setNavbar(true);
        }else {
            setNavbar(false);
        }
       
    }

    window.addEventListener('scroll', changeBackground);

    return (
        <div>
            <nav className={navbar ? "navbar navbar-expand-lg navbar-light bg-sm-dark bg-light fixed-top" : "navbar navbar-expand-lg navbar-dark bg-sm-dark fixed-top"}>
                <div className="container">
                <Link to={'/Home'}>  <a class="navbar-brand" href="#">
    <svg id="logo-16" width="109" height="43" viewBox="0 0 109 43" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M64.9315 11.4284C62.1883 8.6852 58.9316 6.5091 55.3475 5.0245C51.7633 3.5399 47.9219 2.7758 44.0424 2.7758C40.1629 2.7758 36.3215 3.5399 32.7373 5.0245C29.1532 6.5091 25.8965 8.6852 23.1533 11.4284L44.0424 32.3174L64.9315 11.4284Z" class="ccompli1" fill="#FFD200"></path> <path d="M44.0686 32.3475C46.8118 35.0907 50.0684 37.2667 53.6526 38.7513C57.2367 40.2359 61.0782 41 64.9577 41C68.837 41 72.679 40.2359 76.263 38.7513C79.847 37.2667 83.104 35.0907 85.847 32.3475L64.9577 11.4584L44.0686 32.3475Z" class="ccompli2" fill="#06E07F"></path> <path d="M44.017 32.3429C41.2738 35.0861 38.0171 37.2621 34.433 38.7467C30.8488 40.2313 27.0074 40.9954 23.1279 40.9954C19.2484 40.9954 15.407 40.2313 11.8228 38.7467C8.2387 37.2621 4.982 35.0861 2.2388 32.3429L23.1279 11.4538L44.017 32.3429Z" class="ccustom" fill="#E3073C"></path> <path d="M64.9831 11.433C67.726 8.6898 70.983 6.5138 74.567 5.0292C78.151 3.5446 81.993 2.7805 85.872 2.7805C89.752 2.7805 93.593 3.5446 97.177 5.0292C100.761 6.5138 104.018 8.6898 106.761 11.433L85.872 32.3221L64.9831 11.433Z" class="ccustom" fill="#1F84EF"></path> </svg>
  </a></Link>
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarSupportedContent">
                        <ul className="navbar-nav ms-auto mb-2 mb-lg-0 mt-5 mt-lg-0">
                            <li className="nav-item">
                                <a className="nav-link me-3 text-center " href='/'>Home</a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link me-3 text-center " href='/#about'>About</a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link me-3 text-center"  href='/#services'>Services</a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link me-3 text-center " href='/#reviews'>Reviews</a>
                            </li>
                            <li className="nav-item text-center">
                                <a className="nav-link me-3 text-center " href='/#contact'>Contact</a>
                            </li>


                            {/* <button className="btn btn-outline-danger btn btn-" type="submit" style={{color:"orange",marginLeft:"180px",width:"50%"}}> Admin</button>&nbsp;

                            <button className="btn btn-outline-info btn btn-" type="submit" style={{color:"orange",width:"50%"}}> Login/Signup</button>&nbsp; */}
                            
                            {/* <button className="" href='' style={{border:"solid 2px black",width:"250%"}}>Login</button>
                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                            
                                <button className="" href='' style={{border:"2px solid black",width:"180%"}}>Admin</button> */}
                            

     
                            <li className="nav-item text-center">
                               
                                   <NavLink className="nav-link me-1 login-btn" to='/admin'  style={{ padding: "1rem",color:"white" }}>Admin</NavLink> 
                                   {/* <Link className="nav-link me-3 login-btn" to='/userDashboard'>Dashboard</Link> */}
                                   {/* <Link className="nav-link me-3 login-btn" to='/login'>Login</Link> */}
                                                       
                            </li>
                            <li className="nav-item text-center">
                               
                                   {/* <Link className="nav-link me-3 login-btn" to='/admin'>Admin</Link>  */}
                                   {/* <Link className="nav-link me-3 login-btn" to='/userDashboard'>Dashboard</Link> */}
                                   {/* <Link className="nav-link me-0 login-btn" to='/login'>Login</Link> */}
                                   {!isloggedin && (
                        <NavLink to="/login" className="nav-link me-0 login-btn" style={{ padding: "1rem",color:"white" }} >
                            Login
                        </NavLink>
                    )}
                    {isloggedin && (
                        <NavLink
                            onClick={loggedout} className="nav-link me-0 login-btn"
                            style={{ padding:"1rem" ,color:"white"}}>
                            Logout
                        </NavLink>
                    )}
                                                       
                            </li>
                            
                        
                        
                        </ul>
                        
                    </div>
                </div>
            </nav>
        </div>
        
    );
};

export default Navbar;