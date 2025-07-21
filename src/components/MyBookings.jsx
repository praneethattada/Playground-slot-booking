import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { format, isPast, parseISO } from 'date-fns';
import { motion } from 'framer-motion';
import './MyBookings.css';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

const cardVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 100 }
  }
};

const MyBookings = () => {
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [pastBookings, setPastBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get('http://localhost:3003/my-bookings', config);

      if (response.data.success) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const upcoming = [];
        const past = [];

        response.data.data.forEach(booking => {
          const bookingDate = parseISO(booking.date);
          if (bookingDate >= today) {
            upcoming.push(booking);
          } else {
            past.push(booking);
          }
        });

        setUpcomingBookings(upcoming.sort((a, b) => new Date(a.date) - new Date(b.date)));
        setPastBookings(past.sort((a, b) => new Date(b.date) - new Date(a.date)));
      }
    } catch (err) {
      setError("Could not load your bookings. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleCancelSingleSlot = (bookingId, slotTime) => {
    Swal.fire({
      title: 'Cancel this slot?',
      text: `Are you sure you want to cancel the ${slotTime} slot?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Yes, cancel it!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const token = localStorage.getItem('authToken');
          const data = { slotTime };
          const config = {
            headers: { Authorization: `Bearer ${token}` },
            data: data
          };
          await axios.delete(`http://localhost:3003/my-bookings/${bookingId}/slots`, config);
          Swal.fire('Cancelled!', 'The slot has been cancelled.', 'success');
          fetchBookings();
        } catch (err) {
          Swal.fire('Error!', 'Failed to cancel the slot.', 'error');
        }
      }
    });
  };
  
  // NEW: Handler for cancelling the entire booking
  const handleCancelEntireBooking = (bookingId, groundName) => {
    Swal.fire({
      title: 'Cancel Entire Booking?',
      text: `Are you sure you want to cancel all slots for ${groundName} on this day?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Yes, cancel all!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const token = localStorage.getItem('authToken');
          const config = { headers: { Authorization: `Bearer ${token}` } };
          // This endpoint deletes the entire booking document
          await axios.delete(`http://localhost:3003/my-bookings/${bookingId}`, config);
          Swal.fire('Cancelled!', 'Your booking has been cancelled.', 'success');
          fetchBookings(); // Refresh the list
        } catch (err) {
          Swal.fire('Error!', 'Failed to cancel the booking.', 'error');
        }
      }
    });
  };

  if (loading) return <div className="bookings-status">Loading your bookings...</div>;
  if (error) return <div className="bookings-status error">{error}</div>;

  return (
    <div className="my-bookings-container-awesome">
      <div className="bookings-header-awesome">
        <h1>My Bookings</h1>
        <p>Here's a history of your playground reservations.</p>
      </div>

      <div className="bookings-section-awesome">
        <h2>Upcoming</h2>
        {upcomingBookings.length > 0 ? (
          <motion.div
            className="bookings-grid-awesome"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {upcomingBookings.map(booking => (
              <motion.div key={booking._id} variants={cardVariants} className="booking-card-awesome">
                <img src={booking.imageUrl} alt={booking.name} className="booking-card-img-awesome" />
                <div className="booking-card-body-awesome">
                  <h3>{booking.name}</h3>
                  <p className="booking-date">{format(parseISO(booking.date), 'EEEE, MMMM do, yyyy')}</p>
                  <div className="slots-list-awesome">
                    {booking.slots.map(slot => (
                      <span key={slot} className="slot-tag-awesome">
                        {slot}
                        <button
                          className="slot-cancel-btn"
                          title={`Cancel ${slot} slot`}
                          onClick={() => handleCancelSingleSlot(booking._id, slot)}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  {booking.price > 0 && <p className="booking-price">Total: ${booking.price.toFixed(2)}</p>}
                  
                  {/* NEW: Button to cancel the entire booking */}
                  <button className="btn-cancel-booking-awesome" onClick={() => handleCancelEntireBooking(booking._id, booking.name)}>
                    Cancel Entire Booking
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : <p className="no-bookings-message">You have no upcoming bookings. Time to play!</p>}
      </div>

      <div className="bookings-section-awesome">
        <h2>History</h2>
        {pastBookings.length > 0 ? (
          <motion.div
            className="bookings-grid-awesome"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {pastBookings.map(booking => (
              <motion.div key={booking._id} variants={cardVariants} className="booking-card-awesome past">
                <img src={booking.imageUrl} alt={booking.name} className="booking-card-img-awesome" />
                <div className="booking-card-body-awesome">
                  <h3>{booking.name}</h3>
                  <p className="booking-date">{format(parseISO(booking.date), 'EEEE, MMMM do, yyyy')}</p>
                  <div className="slots-list-awesome">
                    {booking.slots.map(slot => <span key={slot} className="slot-tag-awesome">{slot}</span>)}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : <p className="no-bookings-message">You have no past bookings yet.</p>}
      </div>
    </div>
  );
};

export default MyBookings;