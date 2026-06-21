"use client";

import { useState, useEffect } from "react";

interface Location {
  latitude: number;
  longitude: number;
}

interface Driver {
  id: string;
  name: string;
  isOnline: boolean;
}

interface TowRequest {
  id: string;
  vehicleType: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  location: Location;
  status:
    | "pending"
    | "accepted"
    | "completed"
    | "cancelled"
    | "waiting_confirmation"
    | "disputed";
  driverId?: Driver;
  createdAt: string;
}

export default function DisputesPage() {
  const [disputes, setDisputes] = useState<TowRequest[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolvingRequest, setResolvingRequest] = useState<TowRequest | null>(
    null
  );
  const [selectedDriverId, setSelectedDriverId] = useState<string>("");
  const [actionLoading, setActionLoading] = useState(false);
  const [expandedDisputes, setExpandedDisputes] = useState<
    Record<string, boolean>
  >({});

  const toggleDispute = (id: string) => {
    setExpandedDisputes((p) => ({ ...p, [id]: !p[id] }));
  };

  const fetchDisputes = async () => {
    try {
      const res = await fetch(
        "https://toweasy-server.onrender.com/api/requests"
      );
      const data: TowRequest[] = await res.json();
      const filtered = data.filter((req) => req.status === "disputed");
      setDisputes(filtered);
    } catch (err) {
      console.error("Failed to fetch disputes", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDrivers = async () => {
    try {
      const res = await fetch(
        "https://toweasy-server.onrender.com/api/drivers"
      );
      const data: Driver[] = await res.json();
      setDrivers(data.filter((d) => d.isOnline));
    } catch (err) {
      console.error("Failed to fetch drivers", err);
    }
  };

  useEffect(() => {
    fetchDisputes();
    fetchDrivers();
    const interval = setInterval(fetchDisputes, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleResolve = async (status: string, driverId?: string) => {
    if (!resolvingRequest) return;
    setActionLoading(true);
    try {
      const body: any = { status };
      if (driverId) body.driverId = driverId;

      const res = await fetch(
        `https://toweasy-server.onrender.com/api/requests/${resolvingRequest.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );

      if (res.ok) {
        setResolvingRequest(null);
        setSelectedDriverId("");
        fetchDisputes();
      }
    } catch (err) {
      console.error("Failed to resolve dispute", err);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <>
      <header>
        <h1>Job Disputes</h1>
      </header>

      <div className="card">
        <h3>Requests Denied by Customers</h3>
        <div className="responsive-list">
          {loading ? (
            <p style={{ padding: "20px", color: "#666" }}>Loading...</p>
          ) : disputes.length === 0 ? (
            <p style={{ textAlign: "center", padding: "20px", color: "#666" }}>
              No active disputes found
            </p>
          ) : (
            disputes.map((req) => {
              const isExpanded = !!expandedDisputes[req.id];
              return (
                <div
                  key={req.id}
                  className={`list-item ${isExpanded ? "expanded" : ""}`}
                >
                  <div
                    className="list-item-summary"
                    onClick={() => toggleDispute(req.id)}
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
                        <span className="info-label">Driver Assigned</span>
                        <span className="info-value">
                          {req.driverId ? (
                            req.driverId.name
                          ) : (
                            <span
                              style={{ color: "#999", fontStyle: "italic" }}
                            >
                              Unknown
                            </span>
                          )}
                        </span>
                      </div>
                      <div className="info-col">
                        <span className="info-label">Status</span>
                        <span
                          className="status-badge status-disputed"
                          style={{
                            display: "inline-block",
                            width: "fit-content",
                          }}
                        >
                          DISPUTED
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
                        <span className="details-label">Vehicle Type</span>
                        <span className="details-value">{req.vehicleType}</span>
                      </div>
                      <div className="details-block">
                        <span className="details-label">Customer Contact</span>
                        <span className="details-value">
                          {req.userPhone} | {req.userEmail}
                        </span>
                      </div>
                      <div className="details-block">
                        <span className="details-label">
                          Driver Assigned Details
                        </span>
                        <span className="details-value">
                          {req.driverId ? (
                            <span>
                              {req.driverId.name} (ID: {req.driverId.id})
                            </span>
                          ) : (
                            <span
                              style={{ color: "#999", fontStyle: "italic" }}
                            >
                              Unknown Driver
                            </span>
                          )}
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
                        <span className="details-label">Requested Date</span>
                        <span className="details-value">
                          🕒 {new Date(req.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="details-actions">
                      <button
                        className="btn btn-primary"
                        style={{ fontSize: "0.85rem", padding: "8px 16px" }}
                        onClick={() => setResolvingRequest(req)}
                      >
                        Resolve Dispute
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {resolvingRequest && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Resolve Dispute</h2>
            <p style={{ margin: "10px 0", color: "#666" }}>
              Resolving request for <strong>{resolvingRequest.userName}</strong>{" "}
              ({resolvingRequest.vehicleType})
            </p>

            <div className="resolution-options">
              <div className="option-group">
                <h4>Option 1: Reassign Driver</h4>
                <div
                  style={{ display: "flex", gap: "10px", marginTop: "10px" }}
                >
                  <select
                    value={selectedDriverId}
                    onChange={(e) => setSelectedDriverId(e.target.value)}
                    style={{
                      flex: 1,
                      padding: "8px",
                      borderRadius: "4px",
                      border: "1px solid #ddd",
                    }}
                  >
                    <option value="">Select an available driver...</option>
                    {drivers.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                  <button
                    className="btn btn-primary"
                    disabled={!selectedDriverId || actionLoading}
                    onClick={() => handleResolve("accepted", selectedDriverId)}
                  >
                    Reassign
                  </button>
                </div>
              </div>

              <div className="option-group" style={{ marginTop: "20px" }}>
                <h4>Option 2: Finalize Status</h4>
                <div
                  style={{ display: "flex", gap: "10px", marginTop: "10px" }}
                >
                  <button
                    className="btn"
                    style={{
                      backgroundColor: "#28a745",
                      color: "white",
                      flex: 1,
                    }}
                    disabled={actionLoading}
                    onClick={() => handleResolve("completed")}
                  >
                    Force Complete
                  </button>
                  <button
                    className="btn btn-danger"
                    style={{ flex: 1 }}
                    disabled={actionLoading}
                    onClick={() => handleResolve("cancelled")}
                  >
                    Force Cancel
                  </button>
                </div>
              </div>
            </div>

            <div style={{ marginTop: "30px", textAlign: "right" }}>
              <button
                className="btn"
                style={{ backgroundColor: "#eee" }}
                onClick={() => setResolvingRequest(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .modal-content {
          background: white;
          padding: 30px;
          border-radius: 8px;
          width: 500px;
          max-width: 90%;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
        }
        .option-group {
          padding: 15px;
          background: #f8f9fa;
          border-radius: 6px;
          border: 1px solid #eee;
        }
        h4 {
          margin-bottom: 5px;
          color: #333;
        }
      `}</style>
    </>
  );
}
