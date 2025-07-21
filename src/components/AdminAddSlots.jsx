import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { format } from "date-fns";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import TextField from "@mui/material/TextField";
import Checkbox from '@mui/material/Checkbox';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import './adminaddslot.css';

const AdminAddSlots = () => {
  const navigate = useNavigate();
  const { cityId, groundName } = useParams();

  const [groundImage, setGroundImage] = useState('');
  const [allTimeSlots, setAllTimeSlots] = useState([]);
  const [alreadyAddedSlots, setAlreadyAddedSlots] = useState([]);
  const [bookedByUsers, setBookedByUsers] = useState([]); // New state for booked slots
  const [newlySelectedSlots, setNewlySelectedSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allSlotDocs, setAllSlotDocs] = useState([]);
  const [allBookingDocs, setAllBookingDocs] = useState([]);

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('adminAuthToken');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        
        const [citiesRes, timeSlotsRes, slotDocsRes, bookingDocsRes] = await Promise.all([
          axios.get("http://localhost:3003/cities", config),
          axios.get("http://localhost:3003/admintime", config),
          axios.get("http://localhost:3003/slots", config),
          axios.get("http://localhost:3003/postslots", config)
        ]);
        
        const city = citiesRes.data.data.find(c => c._id === cityId);
        const playgroundIndex = city?.playground.grounds.findIndex(g => g === groundName);

        if (city && playgroundIndex !== -1) {
          setGroundImage(city.playground.img[playgroundIndex]);
        } else {
          throw new Error("Playground data not found.");
        }

        setAllTimeSlots(timeSlotsRes.data.data[0]?.slots || []);
        setAllSlotDocs(slotDocsRes.data.data);
        setAllBookingDocs(bookingDocsRes.data.data);

      } catch (err) {
        console.error("Error fetching initial data:", err);
        setError("Could not load required data for this page.");
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, [cityId, groundName]);

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setNewlySelectedSlots([]);
    if (date) {
      const formattedDate = format(date, 'yyyy-MM-dd');
      
      const existingAvailableDoc = allSlotDocs.find(
        doc => doc.name === groundName && doc.date === formattedDate
      );
      const existingBookingDocs = allBookingDocs.filter(
        doc => doc.name === groundName && doc.date === formattedDate
      );

      const available = existingAvailableDoc ? existingAvailableDoc.slots : [];
      const booked = existingBookingDocs.flatMap(doc => doc.slots);

      setAlreadyAddedSlots(available);
      setBookedByUsers(booked);

    } else {
      setAlreadyAddedSlots([]);
      setBookedByUsers([]);
    }
  };

  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;
    setNewlySelectedSlots(prev =>
      checked ? [...prev, value] : prev.filter(item => item !== value)
    );
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDate || newlySelectedSlots.length === 0) {
      Swal.fire("Warning", "Please select a date and at least one new time slot.", "warning");
      return;
    }

    setLoading(true);
    const formattedDate = format(selectedDate, 'yyyy-MM-dd');
    const token = localStorage.getItem('adminAuthToken');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    try {
      const existingDoc = allSlotDocs.find(
        doc => doc.name === groundName && doc.date === formattedDate
      );
      
      if (existingDoc) {
        const updatedSlots = [...new Set([...existingDoc.slots, ...newlySelectedSlots])].sort();
        await axios.put(
          `http://localhost:3003/slots/${existingDoc._id}`,
          { slots: updatedSlots },
          config
        );
        Swal.fire("Success", "Slots updated successfully!", "success");
      } else {
        const newSlotData = { name: groundName, date: formattedDate, slots: newlySelectedSlots };
        await axios.post("http://localhost:3003/slots", newSlotData, config);
        Swal.fire("Success", "Slots added successfully!", "success");
      }
      navigate("/adminview");
    } catch (error) {
      console.error("Error adding/updating slots:", error);
      Swal.fire("Error", error.response?.data?.message || "Operation failed", "error");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="admin-slots-container"><h2>Loading Playground Data...</h2></div>;
  }

  if (error) {
    return (
      <div className="admin-slots-container error-page">
        <h2>Oops! Something went wrong.</h2>
        <p>{error}</p>
        <Link to="/adminview" className="submit-button">Go Back to Admin Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="admin-slots-container">
      <form className="slot-form" onSubmit={handleSubmit}>
        <div className="ground-info">
          <h2 className="ground-name">{groundName}</h2>
          <img src={groundImage} alt={groundName} className="ground-image" />
        </div>

        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <div className="date-picker-container">
            <DatePicker
              disablePast
              label="Select Date"
              value={selectedDate}
              onChange={handleDateChange}
              slots={{ textField: (params) => <TextField {...params} /> }}
            />
          </div>
        </LocalizationProvider>

        <h3 className="slots-header">Select Available Time Slots</h3>
        <div className="time-slots-container">
          {allTimeSlots.map((slot, idx) => {
            const isBooked = bookedByUsers.includes(slot);
            const isAvailable = alreadyAddedSlots.includes(slot);
            const isDisabled = isBooked || isAvailable;

            return (
              // FIX: Add a dynamic class based on whether the slot is booked
              <div key={idx} className={`slot-checkbox ${isBooked ? 'slot-booked' : ''}`}>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Checkbox
                        value={slot}
                        disabled={isDisabled}
                        checked={newlySelectedSlots.includes(slot) || isDisabled}
                        onChange={handleCheckboxChange}
                        sx={{
                          color: '#a3712a',
                          '&.Mui-checked': { color: '#a3712a' },
                          '&.Mui-disabled': { color: isBooked ? '#d32f2f' : '#ccc' } // Red if booked, grey if just available
                        }}
                      />
                    }
                    label={slot}
                  />
                </FormGroup>
              </div>
            );
          })}
        </div>

        <button
          type="submit"
          className="submit-button"
          disabled={loading || !selectedDate || newlySelectedSlots.length === 0}
        >
          {loading ? "Saving..." : "Save Slots"}
        </button>
      </form>
    </div>
  );
};

export default AdminAddSlots;