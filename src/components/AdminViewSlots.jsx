import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { format } from "date-fns";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import TextField from "@mui/material/TextField";
import "./adminviewslot.css";

const AdminViewSlots = () => {
  // --- State and Hooks ---
  // FIX 1: Get parameters from the URL, not Redux
  const { cityId, groundName } = useParams();

  const [groundImage, setGroundImage] = useState('');
  const [allBookings, setAllBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Data Fetching ---
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('adminAuthToken');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        
        // Fetch both cities and bookings at the same time
        const [citiesRes, bookingsRes] = await Promise.all([
          axios.get("http://localhost:3003/cities", config),
          axios.get("http://localhost:3003/postslots", config)
        ]);
        
        // Find the specific city and playground to get the image
        const city = citiesRes.data.data.find(c => c._id === cityId);
        const playgroundIndex = city?.playground.grounds.findIndex(g => g === groundName);

        if (city && playgroundIndex !== -1) {
          setGroundImage(city.playground.img[playgroundIndex]);
        } else {
          throw new Error("Playground data not found.");
        }

        // Set bookings data
        if (bookingsRes.data?.success) {
          setAllBookings(bookingsRes.data.data);
        } else {
          throw new Error("Failed to fetch bookings.");
        }

      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Could not load required data for this page.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchInitialData();
  }, [cityId, groundName]);

  // --- Filtering Logic ---
  useEffect(() => {
    if (selectedDate && allBookings.length > 0) {
      const formattedDate = format(selectedDate, "yyyy-MM-dd");
      const bookingsForDate = allBookings.filter(
        (booking) => booking.name === groundName && booking.date === formattedDate
      );
      setFilteredBookings(bookingsForDate);
    } else {
      setFilteredBookings([]);
    }
  }, [selectedDate, allBookings, groundName]);

  // --- Handlers for Deleting (No changes needed here) ---
  const handleDeleteRecord = async (bookingId) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const token = localStorage.getItem('adminAuthToken');
          const config = { headers: { Authorization: `Bearer ${token}` } };
          await axios.delete(`http://localhost:3003/postslots/${bookingId}`, config);
          Swal.fire('Deleted!', 'The booking has been deleted.', 'success');
          // Refresh the list by re-fetching
          const response = await axios.get("http://localhost:3003/postslots", config);
          setAllBookings(response.data.data);
        } catch (err) {
          Swal.fire('Error!', 'Could not delete the booking.', 'error');
        }
      }
    });
  };

  const handleDeleteSlot = async (booking, slotToDelete) => {
    const updatedSlots = booking.slots.filter(slot => slot !== slotToDelete);
    if (updatedSlots.length === 0) {
      handleDeleteRecord(booking._id);
      return;
    }
    try {
      const token = localStorage.getItem('adminAuthToken');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.put(`http://localhost:3003/postslots/${booking._id}`, { slots: updatedSlots }, config);
      Swal.fire('Success!', 'The time slot has been removed.', 'success');
      // Refresh the list by re-fetching
      const response = await axios.get("http://localhost:3003/postslots", config);
      setAllBookings(response.data.data);
    } catch (err) {
      Swal.fire('Error!', 'Could not remove the time slot.', 'error');
    }
  };

  // --- Render Logic ---
  if (loading) {
    return <div className="admin-view-slots-container"><h2>Loading Bookings...</h2></div>;
  }

  if (error) {
    return (
      <div className="admin-view-slots-container error-page">
        <h2>Oops! Something went wrong.</h2>
        <p>{error}</p>
        <Link to="/adminview" className="btn-back">Go Back to Admin Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="admin-view-slots-container">
      <div className="header-info">
        <h2>{groundName}</h2>
        <img src={groundImage} alt={groundName} className="header-image" />
      </div>

      <div className="date-picker-wrapper">
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            label="View Bookings For Date"
            value={selectedDate}
            onChange={(date) => setSelectedDate(date)}
            slots={{ textField: (params) => <TextField {...params} /> }}
          />
        </LocalizationProvider>
      </div>

      {!loading && (
        filteredBookings.length > 0 ? (
          <div className="bookings-table-container">
            <table className="bookings-table">
              <thead>
                <tr>
                  <th>Booked By</th>
                  <th>Booked Slots</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking) => (
                  <tr key={booking._id}>
                    <td>{booking.username}</td>
                    <td>
                      <div className="slots-list-cell">
                        {booking.slots.map((slot, i) => (
                          <div key={i} className="slot-item">
                            <span>{slot}</span>
                            <button
                              className="btn-delete-slot"
                              onClick={() => handleDeleteSlot(booking, slot)}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <Link to={`/adminedit/${booking._id}`} className="btn-edit-record">
                          Edit
                        </Link>
                        <button
                          className="btn-delete-record"
                          onClick={() => handleDeleteRecord(booking._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="no-bookings-message">
            <p>No bookings found for {selectedDate ? format(selectedDate, "MMMM d, yyyy") : 'the selected date'}.</p>
          </div>
        )
      )}
    </div>
  );
};

export default AdminViewSlots;