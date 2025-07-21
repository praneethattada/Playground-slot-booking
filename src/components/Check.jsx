import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import "./check.css";

const Check = () => {
  const [cities, setCities] = useState([]);
  const [playground, setPlaygrounds] = useState([]);
  const [playgroundImg, setPlaygroundImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();
  const playgroundRef = useRef(null);

  // Load cities data
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await axios.get("http://localhost:3003/cities");
        setCities(response.data.data);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch cities:", err);
        setError("Failed to load cities. Please try again later.");
        setLoading(false);
      }
    };

    fetchCities();
  }, []);

  // Update Redux store when playground data changes
  useEffect(() => {
    dispatch({ type: "PLAYGROUND", payload: playground });
    dispatch({ type: "PLAYGROUNDIMAGES", payload: playgroundImg });
  }, [playground, playgroundImg, dispatch]);

  // View playground for a specific city
  const viewPlayground = (index) => {
    if (cities[index]?.playground) {
      setPlaygrounds(cities[index].playground.grounds || []);
      setPlaygroundImages(cities[index].playground.img || []);
      playgroundRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Send index to Redux store
  const sendIndex = (index) => {
    dispatch({ type: "INDEX", payload: index });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading cities...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <button 
          className="retry-button"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="check-container">
      {/* Cities Section */}
      <div className="cities-grid">
        {cities.map((city, index) => (
          <div key={city._id || index} className="city-card">
            <div 
              className="city-image-container"
              onClick={() => viewPlayground(index)}
            >
              <img
                src={city.img}
                alt={city.city}
                className="city-image"
              />
              <div className="city-overlay">
                <div className="box-3">
                  <div 
                    className="btn btn-three"
                    onClick={(e) => {
                      e.stopPropagation();
                      viewPlayground(index);
                    }}
                  >
                    <span>{city.city}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Playgrounds Section */}
      <div ref={playgroundRef} className="playgrounds-section">
        {playground.length > 0 ? (
          <div className="playgrounds-container">
            {playground.map((ground, index) => (
              <div key={index} className="playground-card">
                <div className="playground-image-container">
                  <img
                    src={playgroundImg[index]}
                    alt={ground}
                    className="playground-image"
                  />
                </div>
                <div className="playground-info">
                  <h3 className="playground-name">{ground}</h3>
                  <Link
                    to={`/slotbooking/${index}`}
                    className="slot-button"
                    onClick={() => sendIndex(index)}
                  >
                    View Available Slots
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-playgrounds">
            <p>Select a city to view available playgrounds</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Check;