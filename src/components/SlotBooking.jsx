
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { format } from 'date-fns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import TextField from '@mui/material/TextField';
import Checkbox from '@mui/material/Checkbox';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Swal from 'sweetalert2';
import './Slotbooking.css';

const SlotBooking = () => {
  // Date configuration
  const currentDate = new Date();
  const maxDate = new Date();
  maxDate.setDate(currentDate.getDate() + 30);

  // Navigation and Redux state
  const navigate = useNavigate();
  const { index } = useParams();
  const ground = useSelector((state) => state.ground);
  const image = useSelector((state) => state.image);
  const username = useSelector((state) => state.username);

  // Component state
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [hasSlotsForGround, setHasSlotsForGround] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);

  // Load available slots on component mount
  useEffect(() => {
    const fetchAvailableSlots = async () => {
      try {
        const response = await axios.get('http://localhost:3003/slots');
        // FIX 1: Access the 'data' property from the server response
        setAvailableSlots(response.data.data || []);
      } catch (error) {
        console.error('Error fetching slots:', error);
        Swal.fire('Error', 'Failed to load available slots', 'error');
      }
    };
    fetchAvailableSlots();
  }, []);

  // Handle date selection
  const handleDateChange = (date) => {
    if (!date) {
      setSelectedDate(null);
      setTimeSlots([]);
      return;
    }
    const formattedDate = format(date, 'yyyy-MM-dd');
    setSelectedDate(formattedDate);
    
    // Filter slots for selected date and ground
    const matchingSlotDoc = availableSlots.find(
      (slot) => slot.date === formattedDate && slot.name === ground[index]
    );

    if (matchingSlotDoc && matchingSlotDoc.slots.length > 0) {
      setTimeSlots(matchingSlotDoc.slots);
      setHasSlotsForGround(true);
    } else {
      setTimeSlots([]);
      // Check if any slots exist for this ground at all
      const anySlotsForGround = availableSlots.some(slot => slot.name === ground[index]);
      setHasSlotsForGround(anySlotsForGround);
    }
    setSelectedSlots([]); // Reset selections when date changes
  };

  // Handle slot selection
  const handleSlotSelection = (slot) => {
    setSelectedSlots((prev) =>
      prev.includes(slot)
        ? prev.filter((s) => s !== slot)
        : [...prev, slot]
    );
  };

  // Handle booking submission
  const handleBooking = async (e) => {
    e.preventDefault();
    
    if (selectedSlots.length === 0) {
      Swal.fire('Error', 'Please select at least one slot', 'error');
      return;
    }

    // FIX 2: Use the correct key 'authToken' from localStorage
    const token = localStorage.getItem('authToken');
    if (!token) {
      Swal.fire('Error', 'You must be logged in to book slots.', 'error');
      navigate('/login');
      return;
    }
    
    // FIX 3: Add 'Bearer ' prefix to the Authorization header
    const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

    try {
      // 1. Create the booking
      const bookingData = {
  username,
  name: ground[index],
  date: selectedDate,
  slots: selectedSlots,
  imageUrl: image[index] // Add this line
};

      const bookingResponse = await axios.post(
        'http://localhost:3003/postslots',
        bookingData,
        authHeaders // Use correct headers
      );

      // 2. Update the available slots document
      const slotToUpdate = availableSlots.find(
        (slot) => slot.name === ground[index] && slot.date === selectedDate
      );

      if (slotToUpdate) {
        const updatedSlots = slotToUpdate.slots.filter(
          (slot) => !selectedSlots.includes(slot)
        );

        // FIX 4: Use '_id' for MongoDB documents, not 'id'
        await axios.put(
          `http://localhost:3003/slots/${slotToUpdate._id}`,
          { slots: updatedSlots },
          authHeaders // Use correct headers
        );
      }

      Swal.fire('Success', 'Slot booked successfully!', 'success');
      navigate(`/bookingdetails/${bookingResponse.data.bookingId}/${index}`);
    } catch (error) {
      console.error('Booking error:', error.response?.data || error.message);
      Swal.fire(
        'Error',
        error.response?.data?.message || 'Failed to book slot',
        'error'
      );
    }
  };

  return (
    <div className="slot-booking-container">
      <form className="main1" onSubmit={handleBooking}>
        <div className="main">
          <h4 className="gro">{ground[index]}</h4>
          <img
            src={image[index]}
            style={{ height: '50vh', width: '60vh' }}
            className="image6"
            alt={ground[index]}
          />
        </div>

        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <div className="date">
            <DatePicker
              label="Select a Date"
              minDate={currentDate}
              maxDate={maxDate}
              onChange={handleDateChange}
              disablePast
              // FIX 5: Updated DatePicker props for modern MUI
              slots={{
                textField: (params) => <TextField {...params} />
              }}
              sx={{
                '& .MuiSvgIcon-root': { color: '#a3712a', fontSize: 40 },
              }}
              className="myDatePicker"
            />
          </div>
        </LocalizationProvider>

        <div className="slots-list">
          {!hasSlotsForGround ? (
             <div className="no-slots-message">
                <h4>No slots available for this ground.</h4>
             </div>
          ) : timeSlots.length > 0 ? (
            timeSlots.map((slot, idx) => (
              <div key={idx} className="checkb">
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={selectedSlots.includes(slot)}
                        onChange={() => handleSlotSelection(slot)}
                        sx={{ '& .MuiSvgIcon-root': { color: '#a3712a', fontSize: 40 } }}
                      />
                    }
                    label={<span className="slot-time">{slot}</span>}
                  />
                </FormGroup>
              </div>
            ))
          ) : (
            <div className="no-slots-message">
              <h4>
                {selectedDate ? `No slots available for ${selectedDate}` : 'Please select a date to see available slots'}
              </h4>
            </div>
          )}
        </div>

        <div className="booking-button-container">
          <button
            type="submit" // Use type="submit" for form submission
            className="btn-2 btn-primary me-2"
            disabled={selectedSlots.length === 0}
          >
            Book Selected Slots
          </button>
        </div>
      </form>
    </div>
  );
};

export default SlotBooking;