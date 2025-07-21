import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import './AdminDashboard.css'; // We'll use the new awesome CSS

// Animation variants for the container and cards
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2, delayChildren: 0.3 }
  }
};

const cardVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { type: 'spring', stiffness: 100 }
  }
};

const AdminDashboard = () => {
  const currentDate = format(new Date(), "eeee, MMMM do, yyyy");

  return (
    <div className="admin-dashboard-awesome">
      <div className="dashboard-header-awesome">
        <h1>Admin Dashboard</h1>
        <p>Welcome, Admin! Today is {currentDate}.</p>
      </div>

      <motion.div 
        className="dashboard-grid-awesome"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={cardVariants}>
          <Link to="/admin/manage-cities" className="dashboard-card-awesome">
            <div className="card-icon-awesome icon-cities">🏙️</div>
            <div className="card-body-awesome">
              <h3>Manage Content</h3>
              <p>Add, edit, or delete cities and playgrounds.</p>
            </div>
          </Link>
        </motion.div>

        <motion.div variants={cardVariants}>
          <Link to="/admin/analytics" className="dashboard-card-awesome">
            <div className="card-icon-awesome icon-analytics">📊</div>
            <div className="card-body-awesome">
              <h3>View Analytics</h3>
              <p>Check booking statistics and user data.</p>
            </div>
          </Link>
        </motion.div>

        <motion.div variants={cardVariants}>
          <Link to="/admin/users" className="dashboard-card-awesome">
            <div className="card-icon-awesome icon-users">👥</div>
            <div className="card-body-awesome">
              <h3>Manage Users</h3>
              <p>View all users and manage their status.</p>
            </div>
          </Link>
        </motion.div>

        {/* --- NEW CARD ADDED --- */}
        <motion.div variants={cardVariants}>
          <Link to="/admin/manual-booking" className="dashboard-card-awesome">
            <div className="card-icon-awesome icon-manual">📝</div>
            <div className="card-body-awesome">
              <h3>Manual Booking</h3>
              <p>Create a new booking on behalf of a user.</p>
            </div>
          </Link>
        </motion.div>

        <motion.div variants={cardVariants}>
            <Link to="/admin/approvals" className="dashboard-card-awesome">
                <div className="card-icon-awesome icon-approval">✅</div>
                <div className="card-body-awesome">
                    <h3>Admin Approvals</h3>
                    <p>Review and approve new admin registration requests.</p>
                    </div>
                    </Link>
        </motion.div>

      </motion.div>
    </div>
  );
};

export default AdminDashboard;
