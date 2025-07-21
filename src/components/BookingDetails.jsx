import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import './BookingDetails.css';

const BookingDetails = () => {
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Gets the booking ID from the URL
  const { idr: bookingId } = useParams();

  useEffect(() => {
    if (!bookingId) {
        setLoading(false);
        setError("No booking ID provided.");
        return;
    }

    const fetchBookingDetails = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setLoading(false);
        setError('You must be logged in to view this page.');
        return;
      }
      
      const config = { headers: { Authorization: `Bearer ${token}` } };

      try {
        const response = await axios.get(`http://localhost:3003/postslots/${bookingId}`, config);
        
        if (!response.data?.success) {
          throw new Error(response.data?.message || 'Booking not found');
        }
        
        setBooking(response.data.data);
      } catch (err) {
        const errorMessage = err.response?.data?.message || err.message || 'Failed to load booking details';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [bookingId]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading booking details...</p>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="error-container">
        <div className="error-message">
          <h3>Oops! Something went wrong</h3>
          <p>{error || 'Booking could not be found.'}</p>
          <Link to="/" className="btn home-button">Back to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-details-container">
      <div className="booking-card">
        <div className="card-header">
          <h2>Booking Confirmation</h2>
          <p className="booking-reference">Reference: #{booking._id}</p>
        </div>
        
        <div className="card-body">
          <div className="booking-image-container">
            {/* This now uses the URL from the database */}
            <img 
              src={booking.imageUrl} 
              alt={booking.name} 
              className="booking-image"
            />
          </div>
          
          <div className="booking-info">
            <h3>{booking.name}</h3>
            
            <div className="info-row">
              <span className="info-label">Booked by:</span>
              <span className="info-value">{booking.username}</span>
            </div>
            
            <div className="info-row">
              <span className="info-label">Date:</span>
              <span className="info-value">{new Date(booking.date).toLocaleDateString()}</span>
            </div>
            
            <div className="time-slots">
              <h4>Your Time Slots:</h4>
              <ul>
                {booking.slots?.map((time, idx) => (
                  <li key={idx}>{time}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        
        <div className="card-footer">
          <Link to="/" className="btn primary-btn">Back to Home</Link>
          <button className="btn secondary-btn" onClick={() => window.print()}>
            Print Confirmation
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingDetails;