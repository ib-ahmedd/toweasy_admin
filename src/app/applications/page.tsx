"use client";

import { useState, useEffect } from "react";

interface DriverApplication {
  id: string;
  applicationId: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  licenseNumber: string;
  licenseImage?: string;
  vehicleInfo: string;
  experience: number;
  status: "pending" | "approved" | "rejected" | "registered";
  createdAt: string;
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<DriverApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewingApp, setReviewingApp] = useState<DriverApplication | null>(
    null
  );
  const [actionLoading, setActionLoading] = useState(false);

  const fetchApplications = async () => {
    try {
      const res = await fetch(
        "https://toweasy-server.onrender.com/api/applications"
      );
      const data = await res.json();
      setApplications(data);
    } catch (err) {
      console.error("Failed to fetch applications", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(
        `https://toweasy-server.onrender.com/api/applications/${id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        }
      );
      if (res.ok) {
        setReviewingApp(null);
        fetchApplications();
      }
    } catch (err) {
      alert("Failed to update status");
    } finally {
      setActionLoading(false);
    }
  };
  const [expandedApps, setExpandedApps] = useState<Record<string, boolean>>({});
  const toggleApp = (id: string) =>
    setExpandedApps((p) => ({ ...p, [id]: !p[id] }));

  return (
    <>
      <header>
        <h1>Driver Applications</h1>
      </header>

      <div className="card">
        <h3>Incoming Applications</h3>
        <div className="responsive-list">
          {loading ? (
            <p style={{ padding: "20px", color: "#666" }}>Loading...</p>
          ) : applications.length === 0 ? (
            <p style={{ textAlign: "center", padding: "20px", color: "#666" }}>
              No applications received yet
            </p>
          ) : (
            applications.map((app) => {
              const isExpanded = !!expandedApps[app.id];
              return (
                <div
                  key={app.id}
                  className={`list-item ${isExpanded ? "expanded" : ""}`}
                >
                  <div
                    className="list-item-summary"
                    onClick={() => toggleApp(app.id)}
                  >
                    <div className="list-item-info">
                      <div className="info-col">
                        <span className="info-label">Applicant</span>
                        <span className="info-value">{app.fullName}</span>
                      </div>
                      <div className="info-col">
                        <span className="info-label">Tracking ID</span>
                        <span
                          className="info-value"
                          style={{
                            fontFamily: "monospace",
                            fontSize: "0.8rem",
                          }}
                        >
                          {app.applicationId}
                        </span>
                      </div>
                      <div className="info-col">
                        <span className="info-label">Experience</span>
                        <span className="info-value">{app.experience} yrs</span>
                      </div>
                      <div className="info-col">
                        <span className="info-label">Status</span>
                        <span
                          className={`status-badge status-${app.status}`}
                          style={{
                            display: "inline-block",
                            width: "fit-content",
                          }}
                        >
                          {app.status}
                        </span>
                      </div>
                    </div>
                    <div className="list-item-chevron">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2.5}
                        stroke="currentColor"
                        style={{ width: "16px", height: "16px" }}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="list-item-details">
                    <div className="details-grid">
                      <div className="details-block">
                        <span className="details-label">Email</span>
                        <span className="details-value">{app.email}</span>
                      </div>
                      <div className="details-block">
                        <span className="details-label">Phone</span>
                        <span className="details-value">{app.phoneNumber}</span>
                      </div>
                      <div className="details-block">
                        <span className="details-label">License Number</span>
                        <span className="details-value">
                          {app.licenseNumber}
                        </span>
                      </div>
                      <div className="details-block">
                        <span className="details-label">Vehicle Info</span>
                        <span className="details-value">{app.vehicleInfo}</span>
                      </div>
                    </div>
                    <div className="details-actions">
                      <button
                        className="btn btn-primary"
                        style={{ fontSize: "0.85rem", padding: "8px 16px" }}
                        onClick={() => setReviewingApp(app)}
                      >
                        Review Application
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Review Modal */}
      {reviewingApp && (
        <div
          className="modal-overlay"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            className="card"
            style={{ width: "600px", maxHeight: "90vh", overflowY: "auto" }}
          >
            <h2>Review Application</h2>
            <p style={{ margin: "10px 0", color: "#666" }}>
              ID: {reviewingApp.applicationId}
            </p>

            <div className="grid-2-col" style={{ marginTop: "20px" }}>
              <div>
                <h4>Applicant Details</h4>
                <p>
                  <strong>Name:</strong> {reviewingApp.fullName}
                </p>
                <p>
                  <strong>Email:</strong> {reviewingApp.email}
                </p>
                <p>
                  <strong>Phone:</strong> {reviewingApp.phoneNumber}
                </p>
                <p>
                  <strong>Experience:</strong> {reviewingApp.experience} Years
                </p>
                <p>
                  <strong>Vehicle:</strong> {reviewingApp.vehicleInfo}
                </p>
              </div>
              <div>
                <h4>License Info</h4>
                <p>
                  <strong>Number:</strong> {reviewingApp.licenseNumber}
                </p>
                {reviewingApp.licenseImage ? (
                  <div style={{ marginTop: "10px" }}>
                    <p style={{ fontSize: "0.8rem", color: "#666" }}>
                      License Image:
                    </p>
                    <img
                      src={reviewingApp.licenseImage}
                      alt="License"
                      style={{
                        width: "100%",
                        borderRadius: "4px",
                        border: "1px solid #ddd",
                        marginTop: "5px",
                      }}
                    />
                  </div>
                ) : (
                  <p
                    style={{
                      color: "#999",
                      fontStyle: "italic",
                      marginTop: "10px",
                    }}
                  >
                    No image uploaded
                  </p>
                )}
              </div>
            </div>

            <div
              style={{
                marginTop: "30px",
                display: "flex",
                gap: "10px",
                justifyContent: "flex-end",
              }}
            >
              <button
                className="btn"
                style={{ backgroundColor: "#eee" }}
                onClick={() => setReviewingApp(null)}
              >
                Close
              </button>

              {reviewingApp.status === "pending" && (
                <>
                  <button
                    className="btn"
                    style={{ backgroundColor: "#dc3545", color: "white" }}
                    disabled={actionLoading}
                    onClick={() =>
                      handleUpdateStatus(reviewingApp.id, "rejected")
                    }
                  >
                    Reject
                  </button>
                  <button
                    className="btn"
                    style={{ backgroundColor: "#28a745", color: "white" }}
                    disabled={actionLoading}
                    onClick={() =>
                      handleUpdateStatus(reviewingApp.id, "approved")
                    }
                  >
                    Approve
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
