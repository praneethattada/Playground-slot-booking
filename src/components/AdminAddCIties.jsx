import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import './adminaddcities.css'; // We'll create this file next

const AdminAddCities = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    city: '',
    img: '', // City image URL
  });
  const [playgrounds, setPlaygrounds] = useState([{ name: '', img: '' }]);
  const [loading, setLoading] = useState(false);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePlaygroundChange = (index, e) => {
    const { name, value } = e.target;
    const list = [...playgrounds];
    list[index][name] = value;
    setPlaygrounds(list);
  };

  const handleAddPlayground = () => {
    setPlaygrounds([...playgrounds, { name: '', img: '' }]);
  };

  const handleRemovePlayground = (index) => {
    const list = [...playgrounds];
    list.splice(index, 1);
    setPlaygrounds(list);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validate that all fields are filled
    if (!formData.city || !formData.img || playgrounds.some(p => !p.name || !p.img)) {
      Swal.fire('Error', 'Please fill out all fields for the city and all playgrounds.', 'error');
      setLoading(false);
      return;
    }

    const payload = {
      city: formData.city,
      img: formData.img,
      playground: {
        grounds: playgrounds.map(p => p.name),
        img: playgrounds.map(p => p.img),
      }
    };

    try {
      const token = localStorage.getItem('adminAuthToken');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.post('http://localhost:3003/cities', payload, config);
      
      Swal.fire('Success!', 'The new city has been added.', 'success');
      navigate('/adminview');
    } catch (error) {
      console.error("Error adding city:", error);
      Swal.fire('Error', error.response?.data?.message || 'Failed to add the city.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-add-cities-container">
      <form className="add-city-form" onSubmit={handleSubmit}>
        <h2>Add a New City and Playgrounds</h2>

        <div className="form-section">
          <h3>City Details</h3>
          <div className="form-group">
            <label htmlFor="city">City Name</label>
            <input type="text" id="city" name="city" value={formData.city} onChange={handleFormChange} placeholder="e.g., Mumbai" />
          </div>
          <div className="form-group">
            <label htmlFor="img">City Image URL</label>
            <input type="text" id="img" name="img" value={formData.img} onChange={handleFormChange} placeholder="https://example.com/image.jpg" />
          </div>
        </div>

        <div className="form-section">
          <h3>Playgrounds</h3>
          {playgrounds.map((pg, index) => (
            <div key={index} className="playground-entry">
              <h4>Playground #{index + 1}</h4>
              <div className="form-group">
                <label>Playground Name</label>
                <input type="text" name="name" value={pg.name} onChange={e => handlePlaygroundChange(index, e)} placeholder="e.g., Wankhede Stadium" />
              </div>
              <div className="form-group">
                <label>Playground Image URL</label>
                <input type="text" name="img" value={pg.img} onChange={e => handlePlaygroundChange(index, e)} placeholder="https://example.com/stadium.jpg" />
              </div>
              {playgrounds.length > 1 && (
                <button type="button" className="btn-remove" onClick={() => handleRemovePlayground(index)}>Remove Playground</button>
              )}
            </div>
          ))}
          <button type="button" className="btn-add" onClick={handleAddPlayground}>+ Add Another Playground</button>
        </div>

        <button type="submit" className="btn-submit" disabled={loading}>
          {loading ? 'Saving...' : 'Save City'}
        </button>
      </form>
    </div>
  );
};

export default AdminAddCities;