import React from 'react';
import './HeroSection.css';
import { Link } from 'react-router-dom';

const HeroSection = () => {
    return (
        <main className="container">
            <img src="" alt="" />
           <h5>PLAY &amp; GROUND </h5>
           <div className="bottom-line shape-div"> </div>
           
           <h1>Welcome to the <br/> <span className="brand">PLAYGROUND</span></h1>
           <Link to={'/Login'}><button  className="btn-brand"><a style={{color:"white"}} href="#services"> CAPTURE YOUR GROUND NOW</a></button></Link>
            
        </main>
    );
};

export default HeroSection;