import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import './Checkout.css';

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { bookingDetails } = location.state || {};

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!bookingDetails) {
      console.log("No booking details found, redirecting.");
      navigate('/check');
    }
  }, [bookingDetails, navigate]);

  if (!bookingDetails) {
    return null;
  }

  const handlePayment = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('authToken');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const response = await axios.post('http://localhost:3003/postslots', bookingDetails, config);
      
      const availabilityRes = await axios.get(`http://localhost:3003/slots`, config);
      const slotDocToUpdate = availabilityRes.data.data.find(
        doc => doc.name === bookingDetails.name && doc.date === bookingDetails.date
      );

      if (slotDocToUpdate) {
        // --- FIX: This logic now correctly handles an array of time strings ---
        const updatedSlots = slotDocToUpdate.slots.filter(
          slotTime => !bookingDetails.slots.includes(slotTime)
        );
          
        await axios.put(`http://localhost:3003/slots/${slotDocToUpdate._id}`, { slots: updatedSlots }, config);
      }

      Swal.fire({
        title: 'Payment Successful!',
        text: 'Your booking has been confirmed.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      }).then(() => {
        navigate(`/bookingdetails/${response.data.bookingId}`);
      });

    } catch (error) {
      Swal.fire('Error', error.response?.data?.message || 'Failed to complete booking.', 'error');
      setLoading(false);
    }
  };

  return (
    <div className="checkout-container">
      <div className="checkout-card">
        <div className="order-summary">
          <h2>Order Summary</h2>
          <div className="summary-item">
            <span>Playground:</span>
            <span>{bookingDetails.name}</span>
          </div>
          <div className="summary-item">
            <span>Date:</span>
            <span>{bookingDetails.date}</span>
          </div>
          <div className="summary-item">
            <span>Time Slots:</span>
            <span>{bookingDetails.slots.join(', ')}</span>
          </div>
          <div className="summary-total">
            <span>Total Price:</span>
            <span>${bookingDetails.price.toFixed(2)}</span>
          </div>
        </div>

        <div className="payment-form">
          <h2>Secure Payment</h2>
          <p>This is a simulated payment form. No real card details are required.</p>
          <form onSubmit={handlePayment}>
            <div className="form-group">
              <label>Card Number</label>
              <input type="text" defaultValue="4242 4242 4242 4242" readOnly />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Expiry Date</label>
                <input type="text" defaultValue="12 / 25" readOnly />
              </div>
              <div className="form-group">
                <label>CVC</label>
                <input type="text" defaultValue="123" readOnly />
              </div>
            </div>
            <button type="submit" className="btn-pay" disabled={loading}>
              {loading ? 'Processing...' : `Pay $${bookingDetails.price.toFixed(2)}`}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
