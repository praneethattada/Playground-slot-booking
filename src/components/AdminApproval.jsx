import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import './AdminApproval.css';

const AdminApproval = () => {
  const [pendingAdmins, setPendingAdmins] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPendingAdmins = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminAuthToken');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get('http://localhost:3003/admin/pending', config);
      if (response.data.success) {
        setPendingAdmins(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch pending admins:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPendingAdmins();
  }, [fetchPendingAdmins]);

  const handleApprove = (adminId, adminName) => {
    Swal.fire({
      title: `Approve ${adminName}?`,
      text: "This will grant them full admin privileges.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      confirmButtonText: 'Yes, approve!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const token = localStorage.getItem('adminAuthToken');
          const config = { headers: { Authorization: `Bearer ${token}` } };
          await axios.put(`http://localhost:3003/admin/approve/${adminId}`, {}, config);
          Swal.fire('Approved!', `${adminName} is now an admin.`, 'success');
          fetchPendingAdmins();
        } catch (error) {
          Swal.fire('Error!', 'Failed to approve admin.', 'error');
        }
      }
    });
  };

  const handleReject = (adminId, adminName) => {
    Swal.fire({
      title: `Reject ${adminName}?`,
      text: "This will permanently delete their registration request.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Yes, reject!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const token = localStorage.getItem('adminAuthToken');
          const config = { headers: { Authorization: `Bearer ${token}` } };
          await axios.delete(`http://localhost:3003/admin/reject/${adminId}`, config);
          Swal.fire('Rejected!', `${adminName}'s request has been deleted.`, 'success');
          fetchPendingAdmins();
        } catch (error) {
          Swal.fire('Error!', 'Failed to reject admin.', 'error');
        }
      }
    });
  };

  if (loading) return <div className="approval-status">Loading pending requests...</div>;

  return (
    <div className="admin-approval-container">
      <div className="approval-header">
        <h1>Admin Approval Requests</h1>
        <p>Review and manage new admin sign-up requests.</p>
      </div>
      {pendingAdmins.length > 0 ? (
        <div className="table-wrapper">
          <table className="approval-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Request Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingAdmins.map(admin => (
                <tr key={admin._id}>
                  <td>{admin.name}</td>
                  <td>{admin.email}</td>
                  <td>{new Date(admin.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn-approve" onClick={() => handleApprove(admin._id, admin.name)}>
                        Approve
                      </button>
                      <button className="btn-reject" onClick={() => handleReject(admin._id, admin.name)}>
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="no-requests">
          <p>There are no pending admin requests at this time.</p>
        </div>
      )}
    </div>
  );
};

export default AdminApproval;
