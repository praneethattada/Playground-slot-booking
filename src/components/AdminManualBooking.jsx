import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { format } from 'date-fns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import TextField from '@mui/material/TextField';
import './AdminManualBooking.css';

const AdminManualBooking = () => {
  const navigate = useNavigate();

  // State for each step of the form
  const [allUsers, setAllUsers] = useState([]);
  const [allCities, setAllCities] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedCityId, setSelectedCityId] = useState('');
  const [selectedPlayground, setSelectedPlayground] = useState({ name: '', img: '' });
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch initial data (all users, cities, and available slots)
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const token = localStorage.getItem('adminAuthToken');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        
        const [usersRes, citiesRes, slotsRes] = await Promise.all([
          axios.get('http://localhost:3003/admin/users', config),
          axios.get('http://localhost:3003/cities', config),
          axios.get('http://localhost:3003/slots', config)
        ]);

        setAllUsers(usersRes.data.data);
        setAllCities(citiesRes.data.data);
        setAvailableSlots(slotsRes.data.data);

      } catch (err) {
        setError("Failed to load necessary data.");
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  // Filter playgrounds when a city is selected
  const playgrounds = allCities.find(c => c._id === selectedCityId)?.playground.grounds || [];

  // Filter available slots when playground and date are selected
  const timeSlotsForSelection = selectedDate 
    ? availableSlots.find(s => 
        s.name === selectedPlayground.name && 
        s.date === format(selectedDate, 'yyyy-MM-dd')
      )?.slots || []
    : [];

  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;
    setSelectedTimeSlots(prev => 
      checked ? [...prev, value] : prev.filter(item => item !== value)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUserId || !selectedPlayground.name || !selectedDate || selectedTimeSlots.length === 0) {
      Swal.fire('Error', 'Please complete all steps before submitting.', 'error');
      return;
    }

    const selectedUser = allUsers.find(u => u._id === selectedUserId);

    const payload = {
      userId: selectedUser._id,
      username: selectedUser.name,
      name: selectedPlayground.name,
      date: format(selectedDate, 'yyyy-MM-dd'),
      slots: selectedTimeSlots,
      imageUrl: selectedPlayground.img,
      price: 15 // Example price, you can add an input for this
    };

    try {
      const token = localStorage.getItem('adminAuthToken');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.post('http://localhost:3003/admin/manual-booking', payload, config);
      Swal.fire('Success!', `Booking created for ${selectedUser.name}.`, 'success');
      navigate('/adminview');
    } catch (err) {
      Swal.fire('Error', err.response?.data?.message || 'Failed to create booking.', 'error');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="manual-booking-container">
      <form className="manual-booking-form" onSubmit={handleSubmit}>
        <h1>Create a Manual Booking</h1>
        
        {/* Step 1: Select User */}
        <div className="form-step">
          <h2>Step 1: Select a User</h2>
          <select value={selectedUserId} onChange={e => setSelectedUserId(e.target.value)} required>
            <option value="" disabled>-- Choose a user --</option>
            {allUsers.map(user => <option key={user._id} value={user._id}>{user.name} ({user.email})</option>)}
          </select>
        </div>

        {/* Step 2: Select Playground */}
        {selectedUserId && (
          <div className="form-step">
            <h2>Step 2: Select a Playground</h2>
            <select value={selectedCityId} onChange={e => setSelectedCityId(e.target.value)}>
              <option value="" disabled>-- Choose a city --</option>
              {allCities.map(city => <option key={city._id} value={city._id}>{city.city}</option>)}
            </select>

            {selectedCityId && (
              <select 
                value={selectedPlayground.name} 
                onChange={e => {
                  const city = allCities.find(c => c._id === selectedCityId);
                  const pgIndex = city.playground.grounds.indexOf(e.target.value);
                  setSelectedPlayground({ name: e.target.value, img: city.playground.img[pgIndex] });
                }} 
                required
              >
                <option value="" disabled>-- Choose a playground --</option>
                {playgrounds.map(pg => <option key={pg} value={pg}>{pg}</option>)}
              </select>
            )}
          </div>
        )}

        {/* Step 3: Select Date & Slots */}
        {selectedPlayground.name && (
          <div className="form-step">
            <h2>Step 3: Select Date and Time Slots</h2>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Select Date"
                value={selectedDate}
                onChange={(date) => setSelectedDate(date)}
                slots={{ textField: (params) => <TextField {...params} /> }}
              />
            </LocalizationProvider>

            {selectedDate && (
              <div className="time-slots-selection">
                {timeSlotsForSelection.length > 0 ? timeSlotsForSelection.map(slot => (
                  <div key={slot}>
                    <input type="checkbox" id={slot} value={slot} onChange={handleCheckboxChange} />
                    <label htmlFor={slot}>{slot}</label>
                  </div>
                )) : <p>No available slots for this day.</p>}
              </div>
            )}
          </div>
        )}

        <button type="submit" className="btn-submit-booking">Create Booking</button>
      </form>
    </div>
  );
};

export default AdminManualBooking;
