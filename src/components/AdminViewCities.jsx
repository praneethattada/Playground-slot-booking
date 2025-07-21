import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import './adminview.css';

const AdminViewCities = () => {
  // --- State Management ---
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null); // Store the whole city object
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const playgroundsRef = useRef(null);

  // --- Data Fetching ---
  useEffect(() => {
    const fetchCities = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('adminAuthToken');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        
        const response = await axios.get("http://localhost:3003/cities", config);
        
        if (response.data?.success) {
          setCities(response.data.data);
        } else {
          throw new Error("Failed to fetch city data.");
        }
      } catch (err) {
        console.error("Failed to fetch cities:", err);
        setError("Could not load cities. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchCities();
  }, []);

  // --- UI Handlers ---
  const handleViewPlayground = (city) => {
    setSelectedCity(city);
    // Use a short timeout to ensure the state is set before scrolling
    setTimeout(() => {
      playgroundsRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  // --- Render Logic ---
  if (loading) {
    return <div className="admin-view-status">Loading cities...</div>;
  }

  if (error) {
    return <div className="admin-view-status error">{error}</div>;
  }

  return (
    <div className="admin-view-container">
      <h1 className="admin-view-title">Admin Dashboard: Cities</h1>
      
      {/* Cities Section */}
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

      {/* Playgrounds Section */}
      <div ref={playgroundsRef} className="playgrounds-section-admin">
        {selectedCity && (
          <>
            <h2 className="playgrounds-title">Playgrounds in {selectedCity.city}</h2>
            <div className="playgrounds-list">
              {selectedCity.playground.grounds.map((groundName, index) => (
                <div key={groundName} className="playground-card-admin">
                  <img src={selectedCity.playground.img[index]} alt={groundName} className="playground-image-admin" />
                  <div className="playground-info-admin">
                    <h3>{groundName}</h3>
                    <div className="playground-actions">
                      {/* FIX: Pass the city's unique _id and the playground's name in the URL */}
                      <Link 
                        to={`/adminviewslots/${selectedCity._id}/${groundName}`} 
                        className="btn-admin view"
                      >
                        View Slots
                      </Link>
                      <Link 
                        to={`/adminaddslots/${selectedCity._id}/${groundName}`} 
                        className="btn-admin add"
                      >
                        Add Slots
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminViewCities;