import React, { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import './adminview.css';

const AdminViewCities = () => {
  const [cities, setCities] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const playgroundsRef = useRef(null);

  const fetchData = useCallback(async (selectCityId = null) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminAuthToken');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const [citiesRes, bookingsRes] = await Promise.all([
        axios.get("http://localhost:3003/cities", config),
        axios.get("http://localhost:3003/postslots", config)
      ]);
      
      let fetchedCities = [];
      if (citiesRes.data?.success) {
        fetchedCities = citiesRes.data.data;
        setCities(fetchedCities);
      }
      if (bookingsRes.data?.success) {
        setBookings(bookingsRes.data.data);
      }

      // --- FIX: After fetching, update the selectedCity state ---
      if (selectCityId) {
        const updatedCity = fetchedCities.find(c => c._id === selectCityId);
        setSelectedCity(updatedCity || null);
      }

    } catch (err) {
      console.error("Failed to fetch data:", err);
      setError("Could not load data. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleViewPlayground = (city) => {
    setSelectedCity(city);
    setTimeout(() => {
      playgroundsRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleDeletePlayground = (cityId, playgroundName) => {
    Swal.fire({
      title: `Delete ${playgroundName}?`,
      text: "You can only delete playgrounds with no active bookings.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const token = localStorage.getItem('adminAuthToken');
          const config = { headers: { Authorization: `Bearer ${token}` } };
          const response = await axios.delete(`http://localhost:3003/cities/${cityId}/playgrounds/${playgroundName}`, config);
          Swal.fire('Deleted!', response.data.message, 'success');
          
          // --- FIX: Tell fetchData which city to re-select ---
          fetchData(cityId); 

        } catch (err) {
          Swal.fire('Error!', err.response?.data?.message || 'Failed to delete playground.', 'error');
        }
      }
    });
  };

  if (loading) {
    return <div className="admin-view-status">Loading cities...</div>;
  }

  if (error) {
    return <div className="admin-view-status error">{error}</div>;
  }

  return (
    <div className="admin-view-container">
      <div className="admin-header">
        <h1 className="admin-view-title">Admin Dashboard: Cities</h1>
        <Link to="/adminadd" className="btn-add-city">
          + Add New City
        </Link>
      </div>
      
      <div className="cities-grid">
        {cities.map((city) => (
          <div key={city._id} className="city-card-admin" onClick={() => handleViewPlayground(city)}>
            <img src={city.img} alt={city.city} className="city-image-admin" />
            <div className="city-overlay-admin">
              <span>{city.city}</span>
            </div>
          </div>
        ))}
      </div>

      <div ref={playgroundsRef} className="playgrounds-section-admin">
        {selectedCity && (
          <>
            <h2 className="playgrounds-title">Playgrounds in {selectedCity.city}</h2>
            <div className="playgrounds-list">
              {/* Check if grounds exist before mapping */}
              {selectedCity.playground?.grounds.map((groundName, index) => {
                const hasBookings = bookings.some(booking => booking.name === groundName);
                
                return (
                  <div key={groundName} className="playground-card-admin">
                    <img src={selectedCity.playground.img[index]} alt={groundName} className="playground-image-admin" />
                    <div className="playground-info-admin">
                      <h3>{groundName}</h3>
                      <div className="playground-actions">
                        <Link to={`/adminviewslots/${selectedCity._id}/${groundName}`} className="btn-admin view">View Slots</Link>
                        <Link to={`/adminaddslots/${selectedCity._id}/${groundName}`} className="btn-admin add">Add Slots</Link>
                        <button 
                          className="btn-admin delete"
                          disabled={hasBookings}
                          title={hasBookings ? "Cannot delete: This ground has active bookings." : "Delete this ground"}
                          onClick={() => handleDeletePlayground(selectedCity._id, groundName)}
                        >
                          Delete Ground
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminViewCities;