import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import TextField from '@mui/material/TextField';
import Checkbox from '@mui/material/Checkbox';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Swal from 'sweetalert2';
import WeatherWidget from './WeatherWidget'; // Make sure you have this component
import './Slotbooking.css';

const SlotBooking = () => {
  const navigate = useNavigate();
  const { cityId, groundName } = useParams(); // Use stable IDs from the URL

  // Component state
  const [cityName, setCityName] = useState('');
  const [groundImage, setGroundImage] = useState('');
  const [username, setUsername] = useState('');
  const [allAvailableSlots, setAllAvailableSlots] = useState([]);
  const [timeSlotsForDate, setTimeSlotsForDate] = useState([]);
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [totalCost, setTotalCost] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // State for weather data
  const [weatherData, setWeatherData] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);

  const FIXED_PRICE_PER_SLOT = 20;

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const config = { headers: { Authorization: `Bearer ${token}` } };

        const [slotsRes, citiesRes] = await Promise.all([
          axios.get('http://localhost:3003/slots', config),
          axios.get('http://localhost:3003/cities', config)
        ]);

        if (slotsRes.data.success) setAllAvailableSlots(slotsRes.data.data);

        const city = citiesRes.data.data.find(c => c._id === cityId);
        const groundIndex = city?.playground.grounds.findIndex(g => g === groundName);

        if (city && groundIndex !== -1) {
          setCityName(city.city); // Set the city name for the weather API
          setGroundImage(city.playground.img[groundIndex]);
        }
        
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser) setUsername(storedUser.name);

      } catch (error) {
        Swal.fire('Error', 'Failed to load booking data', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, [cityId, groundName]);

  const handleDateChange = async (date) => {
    setSelectedDate(date);
    setSelectedSlots([]);
    setTotalCost(0);
    setWeatherData(null);

    if (date) {
      const formattedDate = format(date, 'yyyy-MM-dd');
      const matchingDoc = allAvailableSlots.find(
        (doc) => doc.date === formattedDate && doc.name === groundName
      );
      setTimeSlotsForDate(matchingDoc ? matchingDoc.slots : []);
      
      // Fetch weather when date is selected
      if (cityName) {
        try {
          setWeatherLoading(true);
          const response = await axios.get(`http://localhost:3003/weather?city=${cityName}`);
          if (response.data.success) {
            setWeatherData(response.data.data);
          }
        } catch (error) {
          console.error("Failed to fetch weather:", error);
        } finally {
          setWeatherLoading(false);
        }
      }
    } else {
      setTimeSlotsForDate([]);
    }
  };

  const handleSlotSelection = (slotTime) => {
    const isSelected = selectedSlots.includes(slotTime);
    let newSelectedSlots = isSelected
      ? selectedSlots.filter(s => s !== slotTime)
      : [...selectedSlots, slotTime];
    
    setSelectedSlots(newSelectedSlots);
    setTotalCost(newSelectedSlots.length * FIXED_PRICE_PER_SLOT);
  };

  const handleProceedToCheckout = (e) => {
    e.preventDefault();
    if (selectedSlots.length === 0) {
      Swal.fire('Error', 'Please select at least one slot', 'error');
      return;
    }
    const bookingDetails = {
      username,
      name: groundName,
      date: format(selectedDate, 'yyyy-MM-dd'),
      slots: selectedSlots,
      price: totalCost,
      imageUrl: groundImage
    };
    navigate('/checkout', { state: { bookingDetails } });
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="slot-booking-container">
      <form className="main1" onSubmit={handleProceedToCheckout}>
        <div className="main">
          <h2 className="gro">{groundName}</h2>
          <img src={groundImage} className="image6" alt={groundName} />
        </div>

        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <div className="date-and-weather-container">
            <div className="date-picker-container">
              <DatePicker
                label="Select a Date"
                value={selectedDate}
                onChange={handleDateChange}
                disablePast
                slots={{ textField: (params) => <TextField {...params} /> }}
              />
            </div>
            <WeatherWidget weatherData={weatherData} loading={weatherLoading} />
          </div>
        </LocalizationProvider>

        <div className="slots-list">
          {timeSlotsForDate.length > 0 ? (
            timeSlotsForDate.map((slot, idx) => (
              <div key={idx} className="checkb">
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={selectedSlots.includes(slot)}
                        onChange={() => handleSlotSelection(slot)}
                      />
                    }
                    label={<span className="slot-label">{slot}</span>}
                  />
                </FormGroup>
              </div>
            ))
          ) : (
            <div className="no-slots-message">
              <h4>{selectedDate ? `No slots available for this day` : 'Please select a date'}</h4>
            </div>
          )}
        </div>

        {totalCost > 0 && (
          <div className="total-cost-container">
            <h3>Total Cost: <span className="total-price">${totalCost}</span></h3>
          </div>
        )}

        <div className="booking-button-container">
          <button type="submit" className="btn-book" disabled={selectedSlots.length === 0}>
            Proceed to Checkout
          </button>
        </div>
      </form>
    </div>
  );
};

export default SlotBooking;
