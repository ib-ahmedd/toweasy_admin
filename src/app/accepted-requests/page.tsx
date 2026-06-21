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
    | "driver_enroute"
    | "with_customer"
    | "towing_vehicle"
    | "at_destination"
    | "completed"
    | "cancelled"
    | "waiting_confirmation"
    | "disputed";
  driverId?: Driver;
  createdAt: string;
}

export default function AcceptedRequestsPage() {
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
      const data: TowRequest[] = await res.json();
      // Filter for all active status types
      const activeStatuses = [
        "accepted",
        "driver_enroute",
        "with_customer",
        "towing_vehicle",
        "at_destination",
        "waiting_confirmation",
        "disputed",
      ];
      const active = data.filter((req) => activeStatuses.includes(req.status));
      setRequests(active);
    } catch (err) {
      console.error("Failed to fetch requests", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(fetchRequests, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "accepted":
        return "Accepted";
      case "driver_enroute":
        return "Driver En-route";
      case "with_customer":
        return "With Customer";
      case "towing_vehicle":
        return "Towing Vehicle";
      case "at_destination":
        return "At Destination";
      case "waiting_confirmation":
        return "Waiting Confirmation";
      case "disputed":
        return "Disputed";
      case "completed":
        return "Completed";
      case "cancelled":
        return "Cancelled";
      default:
        return status.toUpperCase();
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "accepted":
        return "status-accepted";
      case "driver_enroute":
        return "status-enroute";
      case "with_customer":
        return "status-with-customer";
      case "towing_vehicle":
        return "status-towing";
      case "at_destination":
        return "status-destination";
      case "waiting_confirmation":
        return "status-waiting";
      case "disputed":
        return "status-disputed";
      default:
        return "";
    }
  };

  return (
    <>
      <header>
        <h1>Accepted Requests</h1>
      </header>

      <div className="card">
        <h3>Ongoing Assignments</h3>
        <div className="responsive-list">
          {loading ? (
            <p style={{ padding: "20px", color: "#666" }}>Loading...</p>
          ) : requests.length === 0 ? (
            <p style={{ textAlign: "center", padding: "20px", color: "#666" }}>
              No accepted requests found
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
                        <span className="info-label">Assigned Driver</span>
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
                        <span className="info-label">Request Status</span>
                        <span
                          className={`status-badge ${getStatusClass(
                            req.status
                          )}`}
                          style={{
                            display: "inline-block",
                            width: "fit-content",
                          }}
                        >
                          {getStatusLabel(req.status)}
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
                        <span className="details-label">Driver Status</span>
                        <span className="details-value">
                          {req.driverId ? (
                            <span
                              className={`status-badge ${
                                req.driverId.isOnline
                                  ? "status-online"
                                  : "status-offline"
                              }`}
                            >
                              {req.driverId.isOnline ? "Online" : "Offline"}{" "}
                              (ID: {req.driverId.id})
                            </span>
                          ) : (
                            "-"
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
                        <span className="details-label">Accepted At</span>
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
      <style jsx>{`
        .status-online {
          background-color: #dcfce7;
          color: #166534;
        }
        .status-offline {
          background-color: #f3f4f6;
          color: #374151;
        }
        .status-waiting {
          background-color: #e0f2fe;
          color: #0369a1;
        }
        .status-accepted {
          background-color: #fef9c3;
          color: #854d0e;
        }
        .status-enroute {
          background-color: #dbeafe;
          color: #1e40af;
        }
        .status-with-customer {
          background-color: #f3e8ff;
          color: #6b21a8;
        }
        .status-towing {
          background-color: #ffedd5;
          color: #9a3412;
        }
        .status-destination {
          background-color: #dcfce7;
          color: #166534;
        }
        .status-disputed {
          background-color: #fee2e2;
          color: #991b1b;
        }
      `}</style>
    </>
  );
}
