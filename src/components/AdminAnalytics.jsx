import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import './AdminAnalytics.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('adminAuthToken');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await axios.get('http://localhost:3003/analytics', config);
        if (response.data.success) {
          setAnalytics(response.data.data);
        } else {
          throw new Error("Failed to fetch analytics data.");
        }
      } catch (err) {
        console.error("Failed to fetch analytics:", err);
        setError("Could not load analytics data.");
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return <div className="analytics-status">Loading Analytics...</div>;
  }
  
  if (error) {
    return <div className="analytics-status error">{error}</div>;
  }
  
  if (!analytics) {
      return <div className="analytics-status">No analytics data available.</div>
  }

  const mostBookedChartData = {
    labels: analytics.mostBooked.map(item => item._id),
    datasets: [{
      label: 'Number of Bookings',
      data: analytics.mostBooked.map(item => item.count),
      backgroundColor: 'rgba(0, 123, 255, 0.6)',
      borderColor: 'rgba(0, 123, 255, 1)',
      borderWidth: 1,
      borderRadius: 5,
    }],
  };
  
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Top 5 Most Booked Playgrounds',
      },
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  return (
    <div className="analytics-container">
      <h1>Dashboard Analytics</h1>
      <div className="stats-grid">
        <div className="stat-card">
          <h2>Total Users</h2>
          <p>{analytics.totalUsers}</p>
        </div>
        <div className="stat-card">
          <h2>Total Bookings</h2>
          <p>{analytics.totalBookings}</p>
        </div>
        <div className="stat-card">
          <h2>Total Revenue</h2>
          <p>${analytics.totalRevenue.toFixed(2)}</p>
        </div>
      </div>
      <div className="chart-card">
        <Bar data={mostBookedChartData} options={chartOptions} />
      </div>
    </div>
  );
};

export default AdminAnalytics;
