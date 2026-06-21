'use client';

import { useState, useEffect } from 'react';

interface Location {
  latitude: number;
  longitude: number;
}

interface TowRequest {
  id: string;
  vehicleType: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  location: Location;
  status: 'pending' | 'accepted' | 'completed' | 'cancelled' | 'waiting_confirmation' | 'disputed';
  createdAt: string;
}

interface DriverApplication {
  fullName: string;
  email: string;
  phoneNumber: string;
  licenseNumber: string;
  vehicleInfo: string;
  experience: number;
  status: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const [requests, setRequests] = useState<TowRequest[]>([]);
  const [applications, setApplications] = useState<DriverApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedReqs, setExpandedReqs] = useState<Record<string, boolean>>({});
  const [expandedApps, setExpandedApps] = useState<Record<number, boolean>>({});

  const toggleReq = (id: string) => {
    setExpandedReqs(p => ({ ...p, [id]: !p[id] }));
  };

  const toggleApp = (idx: number) => {
    setExpandedApps(p => ({ ...p, [idx]: !p[idx] }));
  };

  const fetchData = async () => {
    try {
      const [reqRes, appRes] = await Promise.all([
        fetch('http://localhost:5000/api/requests'),
        fetch('http://localhost:5000/api/applications')
      ]);
      const reqData = await reqRes.json();
      const appData = await appRes.json();
      setRequests(reqData);
      setApplications(appData);
    } catch (err) {
      console.error('Failed to fetch data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    active: requests.filter(r => r.status === 'accepted' || r.status === 'waiting_confirmation').length,
    completed: requests.filter(r => r.status === 'completed').length,
    disputed: requests.filter(r => r.status === 'disputed').length,
  };

  return (
    <>
      <header>
        <h1>System Overview</h1>
        <div className="user-info">Admin User</div>
      </header>

      <div className="stats-grid">
        <div className="stat-card">
          <h4>Total Requests</h4>
          <p>{stats.total}</p>
        </div>
        <div className="stat-card" style={{ borderTopColor: 'var(--pending-orange)' }}>
          <h4>Pending</h4>
          <p>{stats.pending}</p>
        </div>
        <div className="stat-card" style={{ borderTopColor: 'var(--admin-primary)' }}>
          <h4>Active</h4>
          <p>{stats.active}</p>
        </div>
        <div className="stat-card" style={{ borderTopColor: 'var(--danger-red)' }}>
          <h4>Disputed</h4>
          <p>{stats.disputed}</p>
        </div>
        <div className="stat-card" style={{ borderTopColor: 'var(--success-green)' }}>
          <h4>Completed</h4>
          <p>{stats.completed}</p>
        </div>
      </div>

      <div className="grid-2-col">
        <div className="card">
          <h3>Recent Requests</h3>
          <div className="responsive-list">
            {loading ? <p style={{ padding: '20px', color: '#666' }}>Loading...</p> : (
              requests.slice(0, 5).map((req) => {
                const isExpanded = !!expandedReqs[req.id];
                return (
                  <div key={req.id} className={`list-item ${isExpanded ? 'expanded' : ''}`}>
                    <div className="list-item-summary" onClick={() => toggleReq(req.id)}>
                      <div className="list-item-info">
                        <div className="info-col">
                          <span className="info-label">Customer</span>
                          <span className="info-value">{req.userName}</span>
                        </div>
                        <div className="info-col">
                          <span className="info-label">Vehicle</span>
                          <span className="info-value">{req.vehicleType}</span>
                        </div>
                        <div className="info-col">
                          <span className="info-label">Status</span>
                          <span className={`status-badge status-${req.status}`} style={{ display: 'inline-block', width: 'fit-content' }}>
                            {req.status}
                          </span>
                        </div>
                      </div>
                      <div className="list-item-chevron">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" style={{ width: '16px', height: '16px' }}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                        </svg>
                      </div>
                    </div>
                    <div className="list-item-details">
                      <div className="details-grid">
                        <div className="details-block">
                          <span className="details-label">Request ID</span>
                          <span className="details-value">{req.id}</span>
                        </div>
                        <div className="details-block">
                          <span className="details-label">Contact Details</span>
                          <span className="details-value">{req.userPhone} | {req.userEmail}</span>
                        </div>
                        <div className="details-block">
                          <span className="details-label">Location Coordinates</span>
                          <span className="details-value">{req.location.latitude.toFixed(5)}, {req.location.longitude.toFixed(5)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          <a href="/requests" style={{ display: 'block', marginTop: '15px', color: 'var(--admin-primary)', textDecoration: 'none' }}>View all requests →</a>
        </div>

        <div className="card">
          <h3>Recent Applications</h3>
          <div className="responsive-list">
            {loading ? <p style={{ padding: '20px', color: '#666' }}>Loading...</p> : (
              applications.slice(0, 5).map((app, idx) => {
                const isExpanded = !!expandedApps[idx];
                return (
                  <div key={idx} className={`list-item ${isExpanded ? 'expanded' : ''}`}>
                    <div className="list-item-summary" onClick={() => toggleApp(idx)}>
                      <div className="list-item-info">
                        <div className="info-col">
                          <span className="info-label">Applicant Name</span>
                          <span className="info-value">{app.fullName}</span>
                        </div>
                        <div className="info-col">
                          <span className="info-label">Experience</span>
                          <span className="info-value">{app.experience} yrs</span>
                        </div>
                        <div className="info-col">
                          <span className="info-label">Status</span>
                          <span className={`status-badge status-${app.status}`} style={{ display: 'inline-block', width: 'fit-content' }}>
                            {app.status}
                          </span>
                        </div>
                      </div>
                      <div className="list-item-chevron">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" style={{ width: '16px', height: '16px' }}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                        </svg>
                      </div>
                    </div>
                    <div className="list-item-details">
                      <div className="details-grid">
                        <div className="details-block">
                          <span className="details-label">Contact Details</span>
                          <span className="details-value">{app.phoneNumber} | {app.email}</span>
                        </div>
                        <div className="details-block">
                          <span className="details-label">License Number</span>
                          <span className="details-value">{app.licenseNumber}</span>
                        </div>
                        <div className="details-block">
                          <span className="details-label">Vehicle Info</span>
                          <span className="details-value">{app.vehicleInfo}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          <a href="/applications" style={{ display: 'block', marginTop: '15px', color: 'var(--admin-primary)', textDecoration: 'none' }}>View all applications →</a>
        </div>
      </div>
    </>
  );
}
