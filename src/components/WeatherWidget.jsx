import React from 'react';
import './WeatherWidget.css';

const WeatherWidget = ({ weatherData, loading }) => {
  if (loading) {
    return (
      <div className="weather-widget loading">
        <p>Fetching forecast...</p>
      </div>
    );
  }

  if (!weatherData) {
    return null; // Don't show anything if there's no data
  }

  // OpenWeatherMap provides an icon code, which we use to build the image URL
  const iconUrl = `https://openweathermap.org/img/wn/${weatherData.icon}@2x.png`;

  return (
    <div className="weather-widget">
      <h4>Weather Forecast for the Selected Day</h4>
      <div className="weather-content">
        <img src={iconUrl} alt={weatherData.description} className="weather-icon" />
        <div className="weather-details">
          <p className="temperature">{Math.round(weatherData.temp)}°C</p>
          <p className="description">{weatherData.description}</p>
        </div>
      </div>
    </div>
  );
};

export default WeatherWidget;
