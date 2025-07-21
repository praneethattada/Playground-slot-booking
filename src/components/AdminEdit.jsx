import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Checkbox, FormGroup, FormControlLabel, CircularProgress } from "@mui/material";
import Swal from "sweetalert2";
import "./adminedit.css";

const AdminEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [state, setState] = useState({
    booking: null,
    availableSlots: [],
    selectedSlots: [],
    loading: true,
    error: null,
    filteredSlots: []
  });

  // Strict MongoDB ObjectId validation
  const isValidObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id);

  useEffect(() => {
    const fetchData = async () => {
      if (!isValidObjectId(id)) {
        setState(prev => ({ ...prev, loading: false, error: 'Invalid booking ID format' }));
        Swal.fire('Error', 'The booking ID in the URL is not valid.', 'error').then(() => navigate('/adminview'));
        return;
      }

      try {
        setState(prev => ({ ...prev, loading: true, error: null }));
        
        // --- FIX 1: All API calls must be authenticated ---
        const token = localStorage.getItem('adminAuthToken');
        if (!token) {
          throw new Error("Admin not authenticated. Please log in again.");
        }
        const config = { headers: { Authorization: `Bearer ${token}` } };
        
        const [bookingRes, slotsRes] = await Promise.all([
          axios.get(`http://localhost:3003/postslots/${id}`, config),
          axios.get("http://localhost:3003/slots", config)
        ]);
        
        // --- FIX 2: Correctly access the nested 'data' property ---
        if (!bookingRes.data?.success || !slotsRes.data?.success) {
          throw new Error('Failed to retrieve necessary data.');
        }
        
        setState(prev => ({
          ...prev,
          booking: bookingRes.data.data,
          availableSlots: slotsRes.data.data,
          loading: false
        }));
        
      } catch (err) {
        console.error("Error:", err);
        const errorMessage = err.response?.data?.message || err.message || 'Failed to load booking details';
        setState(prev => ({ ...prev, loading: false, error: errorMessage }));
        Swal.fire('Error', errorMessage, 'error').then(() => {
          if (errorMessage.includes('not found') || errorMessage.includes('Invalid')) {
            navigate('/adminview');
          }
        });
      }
    };

    fetchData();
  }, [id, navigate]);

  const handleSlotSelection = (slot) => {
    setState(prev => ({
      ...prev,
      selectedSlots: prev.selectedSlots.includes(slot)
        ? prev.selectedSlots.filter(s => s !== slot)
        : [...prev.selectedSlots, slot]
    }));
  };

  const findAvailableSlots = () => {
    if (!state.booking?.name || !state.booking?.date) return;

    const matchingSlot = state.availableSlots.find(
      slot => slot.name === state.booking.name && slot.date === state.booking.date
    );

    if (matchingSlot) {
      const available = matchingSlot.slots.filter(
        slot => !state.booking.slots.includes(slot)
      );
      setState(prev => ({ ...prev, filteredSlots: available, selectedSlots: [] }));
    } else {
      Swal.fire("Info", "No available slots found for this date", "info");
      setState(prev => ({ ...prev, filteredSlots: [] }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (state.selectedSlots.length === 0) {
      Swal.fire("Info", "Please select at least one slot to add", "info");
      return;
    }

    try {
      setState(prev => ({ ...prev, loading: true }));
      
      const token = localStorage.getItem('adminAuthToken');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const updatedSlotsForBooking = [...state.booking.slots, ...state.selectedSlots].sort();
      
      // Update the booking with the new combined list of slots
      await axios.put(
        `http://localhost:3003/postslots/${id}`,
        { slots: updatedSlotsForBooking },
        config
      );

      // Find the master availability document and update it
      const matchingSlotDoc = state.availableSlots.find(
        s => s.name === state.booking.name && s.date === state.booking.date
      );

      if (matchingSlotDoc) {
        const updatedAvailableSlots = matchingSlotDoc.slots.filter(
          s => !state.selectedSlots.includes(s)
        );
        await axios.put(
          `http://localhost:3003/slots/${matchingSlotDoc._id}`,
          { slots: updatedAvailableSlots },
          config
        );
      }

      Swal.fire("Success!", "Booking updated successfully", "success").then(() => navigate("/adminview"));

    } catch (err) {
      console.error("Update error:", err);
      Swal.fire("Error", err.response?.data?.message || "Failed to update booking", "error");
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  if (state.loading) {
    return (
      <div className="loading-container">
        <CircularProgress />
        <p>Loading booking details...</p>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="error-container">
        <h3>Error Loading Booking</h3>
        <p>{state.error}</p>
        <button className="btn btn-back" onClick={() => navigate('/adminview')}>
          Back to Admin View
        </button>
      </div>
    );
  }

  if (!state.booking) {
    return null; // Should not happen if error state is handled
  }

  return (
    <div className="admin-edit-container">
      <div className="edit-form-wrapper">
        <h2 className="form-title">Edit Booking</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Ground Name:</label>
            <input type="text" value={state.booking.name || ''} readOnly className="form-input" />
          </div>
          <div className="form-group">
            <label>Date:</label>
            <input type="text" value={state.booking.date || ''} readOnly className="form-input" />
          </div>
          
          <div className="slots-section">
            <h4>Current Booked Slots:</h4>
            {state.booking.slots?.length > 0 ? (
              <ul className="booked-slots-list">
                {state.booking.slots.map((slot, index) => <li key={index}>{slot}</li>)}
              </ul>
            ) : <p>No slots currently booked.</p>}

            <button type="button" className="btn btn-find-slots" onClick={findAvailableSlots} disabled={state.loading}>
              Find Available Slots
            </button>

            {state.filteredSlots.length > 0 && (
              <div className="available-slots">
                <h4>Available Slots to Add:</h4>
                <FormGroup>
                  {state.filteredSlots.map((slot, index) => (
                    <FormControlLabel
                      key={index}
                      control={
                        <Checkbox
                          checked={state.selectedSlots.includes(slot)}
                          onChange={() => handleSlotSelection(slot)}
                        />
                      }
                      label={slot}
                    />
                  ))}
                </FormGroup>
              </div>
            )}
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-update" disabled={state.loading || state.selectedSlots.length === 0}>
              {state.loading ? "Updating..." : "Update Booking"}
            </button>
            <button type="button" className="btn btn-cancel" onClick={() => navigate('/adminview')} disabled={state.loading}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminEdit;