"use client";

import { useState, useEffect } from "react";

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
  status: "pending" | "accepted" | "completed" | "cancelled";
  createdAt: string;
}

export default function RequestsPage() {
  const [requests, setRequests] = useState<TowRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedReqs, setExpandedReqs] = useState<Record<string, boolean>>({});

  const toggleReq = (id: string) => {
    setExpandedReqs((p) => ({ ...p, [id]: !p[id] }));
  };

  const fetchRequests = async () => {
    try {
      const res = await fetch(
        "https://toweasy-server.onrender.com/api/requests"
      );
      const data = await res.json();
      setRequests(data);
    } catch (err) {
      console.error("Failed to fetch requests", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(fetchRequests, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <header>
        <h1>All Towing Requests</h1>
      </header>

      <div className="card">
        <h3>Request History</h3>
        <div className="responsive-list">
          {loading ? (
            <p style={{ padding: "20px", color: "#666" }}>Loading...</p>
          ) : requests.length === 0 ? (
            <p style={{ textAlign: "center", padding: "20px", color: "#666" }}>
              No requests found
            </p>
          ) : (
            requests.map((req) => {
              const isExpanded = !!expandedReqs[req.id];
              return (
                <div
                  key={req.id}
                  className={`list-item ${isExpanded ? "expanded" : ""}`}
                >
                  <div
                    className="list-item-summary"
                    onClick={() => toggleReq(req.id)}
                  >
                    <div className="list-item-info">
                      <div className="info-col">
                        <span className="info-label">Request ID</span>
                        <span
                          className="info-value"
                          style={{ fontFamily: "monospace" }}
                        >
                          {req.id.substring(0, 8)}...
                        </span>
                      </div>
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
                        <span
                          className={`status-badge status-${req.status}`}
                          style={{
                            display: "inline-block",
                            width: "fit-content",
                          }}
                        >
                          {req.status}
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
                        <span className="details-label">Full Request ID</span>
                        <span
                          className="details-value"
                          style={{ fontFamily: "monospace" }}
                        >
                          {req.id}
                        </span>
                      </div>
                      <div className="details-block">
                        <span className="details-label">Contact Details</span>
                        <span className="details-value">
                          {req.userPhone} | {req.userEmail}
                        </span>
                      </div>
                      <div className="details-block">
                        <span className="details-label">
                          Location Coordinates
                        </span>
                        <span className="details-value">
                          📍 {req.location.latitude.toFixed(5)},{" "}
                          {req.location.longitude.toFixed(5)}
                        </span>
                      </div>
                      <div className="details-block">
                        <span className="details-label">Requested At</span>
                        <span className="details-value">
                          🕒 {new Date(req.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}
