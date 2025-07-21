import React from 'react';
import './Footer.css';
import logo from '../../../images/logo.png';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="site-footer">
            <div className="container">
                <div className="footer-grid">
                    <div className="footer-brand">
                        <img src={logo} alt="Sport&Pulse" className="footer-logo"/>
                        <p className="footer-description">Sport&Pulse is your premier destination for sports facility bookings.</p>
                        <div className="social-links">
                            <Link to="#"><i className="fab fa-facebook-f"></i></Link>
                            <Link to="#"><i className="fab fa-twitter"></i></Link>
                            <Link to="#"><i className="fab fa-instagram"></i></Link>
                        </div>
                    </div>

                    <div className="footer-links">
                        <h4>Quick Links</h4>
                        <Link to="/">Home</Link>
                        <Link to="/about">About Us</Link>
                        <Link to="/facilities">Our Facilities</Link>
                        <Link to="/pricing">Pricing</Link>
                        <Link to="/contact">Contact</Link>
                    </div>

                    <div className="footer-links">
                        <h4>Legal</h4>
                        <Link to="/terms">Terms of Service</Link>
                        <Link to="/privacy">Privacy Policy</Link>
                        <Link to="/cookies">Cookie Policy</Link>
                        <Link to="/faq">FAQs</Link>
                        <Link to="/support">Support</Link>
                    </div>

                    <div className="footer-hours">
                        <h4>Opening Hours</h4>
                        <div className="hours-grid">
                            <span>Monday</span><span>6:00 AM - 10:00 PM</span>
                            <span>Tuesday</span><span>6:00 AM - 10:00 PM</span>
                            <span>Wednesday</span><span>6:00 AM - 10:00 PM</span>
                            <span>Thursday</span><span>6:00 AM - 10:00 PM</span>
                            <span>Friday</span><span>6:00 AM - 10:00 PM</span>
                            <span>Saturday</span><span>7:00 AM - 11:00 PM</span>
                            <span>Sunday</span><span>7:00 AM - 9:00 PM</span>
                        </div>
                    </div>
                </div>

                <div className="footer-bottom">
                    <span>&copy; {new Date().getFullYear()} Sport&Pulse. All rights reserved.</span>
                    <div className="footer-legal-links">
                        <Link to="/sitemap">Sitemap</Link>
                        <Link to="/accessibility">Accessibility</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;