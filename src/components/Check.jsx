import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./check.css";

// A small, reusable component to display stars
const StarRating = ({ rating, count }) => {
  if (rating === undefined || rating === null) {
    return <div className="rating-display">No reviews yet</div>;
  }
  const fullStars = Math.round(rating);
  return (
    <div className="rating-display">
      {[...Array(5)].map((_, i) => (
        <span key={i} className={i < fullStars ? 'star-filled' : 'star-empty'}>★</span>
      ))}
      <span className="review-count">({count} {count === 1 ? 'review' : 'reviews'})</span>
    </div>
  );
};

const Check = () => {
  const [cities, setCities] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null); // Store the full city object
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const playgroundsRef = useRef(null);

  // Load cities and reviews data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [citiesRes, ratingsRes] = await Promise.all([
          axios.get("http://localhost:3003/cities"),
          axios.get("http://localhost:3003/reviews")
        ]);

        if (citiesRes.data.success) {
          setCities(citiesRes.data.data);
        }
        if (ratingsRes.data.success) {
          setRatings(ratingsRes.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setError("Failed to load page data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // View playground for a specific city
  const viewPlayground = (city) => {
    setSelectedCity(city);
    setTimeout(() => {
        playgroundsRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
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
        {cities.map((city) => (
          <div key={city._id} className="city-card" onClick={() => viewPlayground(city)}>
            <div className="city-image-container">
              <img
                src={city.img}
                alt={city.city}
                className="city-image"
              />
              <div className="city-overlay">
                <div className="box-3">
                  <div className="btn btn-three">
                    <span>{city.city}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Playgrounds Section */}
      <div ref={playgroundsRef} className="playgrounds-section">
        {selectedCity ? (
          <div className="playgrounds-container">
            <h2>Playgrounds in {selectedCity.city}</h2>
            {selectedCity.playground.grounds.map((groundName, index) => {
              const groundRating = ratings.find(r => r._id === groundName);
              return (
                <div key={index} className="playground-card">
                  <div className="playground-image-container">
                    <img
                      src={selectedCity.playground.img[index]}
                      alt={groundName}
                      className="playground-image"
                    />
                  </div>
                  <div className="playground-info">
                    <h3 className="playground-name">{groundName}</h3>
                    <StarRating rating={groundRating?.averageRating} count={groundRating?.reviewCount} />
                    <Link
                      to={`/slotbooking/${selectedCity._id}/${groundName}`}
                      className="slot-button"
                    >
                      View Available Slots
                    </Link>
                  </div>
                </div>
              );
            })}
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