import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { format, isPast, parseISO } from 'date-fns';
import { motion } from 'framer-motion';
import './MyBookings.css';

// Animation variants for the container and cards
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
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
  const [reviewedBookingIds, setReviewedBookingIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const [bookingsRes, reviewsRes] = await Promise.all([
        axios.get('http://localhost:3003/my-bookings', config),
        axios.get('http://localhost:3003/my-reviews', config)
      ]);

      if (bookingsRes.data.success) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const upcoming = [];
        const past = [];
        bookingsRes.data.data.forEach(booking => {
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
      
      if (reviewsRes.data.success) {
        const reviewedIds = reviewsRes.data.data.map(review => review.bookingId);
        setReviewedBookingIds(reviewedIds);
      }

    } catch (err) {
      setError("Could not load your bookings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleLeaveReview = async (booking) => {
    let currentRating = 0;

    const { value: formValues } = await Swal.fire({
      title: `Review for ${booking.name}`,
      html: `
        <div id="star-rating" class="rating-interactive">
          <span class="star" data-value="5">★</span>
          <span class="star" data-value="4">★</span>
          <span class="star" data-value="3">★</span>
          <span class="star" data-value="2">★</span>
          <span class="star" data-value="1">★</span>
        </div>
        <textarea id="swal-comment" class="swal2-textarea" placeholder="Write your review here..."></textarea>
      `,
      focusConfirm: false,
      showCancelButton: true,
      didOpen: () => {
        const ratingContainer = document.getElementById('star-rating');
        const stars = ratingContainer.querySelectorAll('.star');

        const updateStars = (rating) => {
          stars.forEach(star => {
            star.classList.toggle('hovered', star.getAttribute('data-value') <= rating);
          });
        };

        ratingContainer.addEventListener('mouseover', (e) => {
          if (e.target.classList.contains('star')) {
            updateStars(e.target.getAttribute('data-value'));
          }
        });

        ratingContainer.addEventListener('mouseout', () => {
          updateStars(currentRating); // Revert to the selected rating
        });

        stars.forEach(star => {
          star.addEventListener('click', () => {
            currentRating = star.getAttribute('data-value');
            // Update visual state permanently on click
            stars.forEach(s => {
              s.classList.toggle('selected', s.getAttribute('data-value') <= currentRating);
            });
          });
        });
      },
      preConfirm: () => {
        const comment = document.getElementById('swal-comment').value;
        if (currentRating === 0 || !comment) {
          Swal.showValidationMessage(`Please provide a rating and a comment.`);
        }
        return { rating: currentRating, comment };
      }
    });

    if (formValues) {
      try {
        const token = localStorage.getItem('authToken');
        const user = JSON.parse(localStorage.getItem('user'));
        const payload = {
          bookingId: booking._id,
          playgroundName: booking.name,
          rating: formValues.rating,
          comment: formValues.comment,
          username: user.name
        };
        const config = { headers: { Authorization: `Bearer ${token}` } };
        await axios.post('http://localhost:3003/reviews', payload, config);
        Swal.fire('Thank You!', 'Your review has been submitted.', 'success');
        fetchData();
      } catch (err) {
        Swal.fire('Error', err.response?.data?.message || 'Failed to submit your review.', 'error');
      }
    }
  };
  
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
          const config = { 
            headers: { Authorization: `Bearer ${token}` },
            data: { slotTime } 
          };
          await axios.delete(`http://localhost:3003/my-bookings/${bookingId}/slots`, config);
          Swal.fire('Cancelled!', 'The slot has been cancelled.', 'success');
          fetchData();
        } catch (err) {
          Swal.fire('Error!', 'Failed to cancel the slot.', 'error');
        }
      }
    });
  };

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
          await axios.delete(`http://localhost:3003/my-bookings/${bookingId}`, config);
          Swal.fire('Cancelled!', 'Your booking has been cancelled.', 'success');
          fetchData();
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
            {pastBookings.map(booking => {
              const hasReviewed = reviewedBookingIds.includes(booking._id);
              return (
                <motion.div key={booking._id} variants={cardVariants} className="booking-card-awesome past">
                  <img src={booking.imageUrl} alt={booking.name} className="booking-card-img-awesome" />
                  <div className="booking-card-body-awesome">
                    <h3>{booking.name}</h3>
                    <p className="booking-date">{format(parseISO(booking.date), 'EEEE, MMMM do, yyyy')}</p>
                    <div className="slots-list-awesome">
                      {booking.slots.map(slot => <span key={slot} className="slot-tag-awesome">{slot}</span>)}
                    </div>
                    <div className="booking-card-footer">
                      <button 
                        className="btn-review" 
                        onClick={() => handleLeaveReview(booking)}
                        disabled={hasReviewed}
                      >
                        {hasReviewed ? 'Reviewed' : 'Leave a Review'}
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        ) : <p className="no-bookings-message">You have no past bookings yet.</p>}
      </div>
    </div>
  );
};

export default MyBookings;