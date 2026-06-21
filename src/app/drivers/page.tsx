"use client";

import { useState, useEffect } from "react";

interface Driver {
  id: string;
  name: string;
  isOnline: boolean;
  currentLocation?: {
    latitude: number;
    longitude: number;
  };
  lastUpdated: string;
}

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedDrivers, setExpandedDrivers] = useState<
    Record<string, boolean>
  >({});
  const toggleDriver = (id: string) =>
    setExpandedDrivers((p) => ({ ...p, [id]: !p[id] }));

  const fetchDrivers = async () => {
    try {
      const res = await fetch(
        "https://toweasy-server.onrender.com/api/drivers"
      );
      const data = await res.json();
      setDrivers(data);
    } catch (err) {
      console.error("Failed to fetch drivers", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
    // Auto-refresh every 10 seconds to keep driver statuses updated
    const interval = setInterval(fetchDrivers, 10000);
    return () => clearInterval(interval);
  }, []);

  // Sort drivers: online drivers appear on top
  const sortedDrivers = [...drivers].sort((a, b) => {
    if (a.isOnline === b.isOnline) {
      return a.name.localeCompare(b.name); // Secondary sort alphabetically
    }
    return a.isOnline ? -1 : 1;
  });

  return (
    <>
      <header>
        <h1>Verified Drivers</h1>
        <div className="user-info">Admin User</div>
      </header>

      <div className="card">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <h3>Verified Recovery Team</h3>
          <div style={{ fontSize: "0.9rem", color: "#65676b" }}>
            Total Verified Drivers: <strong>{drivers.length}</strong> (Online:{" "}
            <strong>{drivers.filter((d) => d.isOnline).length}</strong>)
          </div>
        </div>

        <div className="responsive-list">
          {loading ? (
            <p style={{ padding: "20px", color: "#666" }}>Loading drivers...</p>
          ) : sortedDrivers.length === 0 ? (
            <p
              style={{ textAlign: "center", padding: "20px", color: "#65676b" }}
            >
              No verified drivers found. Approved applications will appear here.
            </p>
          ) : (
            sortedDrivers.map((driver) => {
              const isExpanded = !!expandedDrivers[driver.id];
              const onlineBadge = driver.isOnline
                ? { backgroundColor: "#d4edda", color: "#155724" }
                : { backgroundColor: "#e4e6eb", color: "#65676b" };
              return (
                <div
                  key={driver.id}
                  className={`list-item ${isExpanded ? "expanded" : ""}`}
                >
                  <div
                    className="list-item-summary"
                    onClick={() => toggleDriver(driver.id)}
                  >
                    <div className="list-item-info">
                      <div className="info-col">
                        <span className="info-label">Driver Name</span>
                        <span className="info-value">{driver.name}</span>
                      </div>
                      <div className="info-col">
                        <span className="info-label">Status</span>
                        <span
                          className="status-badge"
                          style={{
                            ...onlineBadge,
                            display: "inline-block",
                            width: "fit-content",
                          }}
                        >
                          {driver.isOnline ? "Online" : "Offline"}
                        </span>
                      </div>
                      <div className="info-col">
                        <span className="info-label">Location</span>
                        <span
                          className="info-value"
                          style={{ fontSize: "0.85rem" }}
                        >
                          {driver.currentLocation && driver.isOnline ? (
                            `📍 ${driver.currentLocation.latitude.toFixed(
                              3
                            )}, ${driver.currentLocation.longitude.toFixed(3)}`
                          ) : (
                            <span
                              style={{ color: "#999", fontStyle: "italic" }}
                            >
                              {driver.isOnline ? "Pending" : "—"}
                            </span>
                          )}
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
                        <span className="details-label">Driver ID</span>
                        <span
                          className="details-value"
                          style={{ fontFamily: "monospace" }}
                        >
                          {driver.id}
                        </span>
                      </div>
                      <div className="details-block">
                        <span className="details-label">
                          Full GPS Coordinates
                        </span>
                        <span className="details-value">
                          {driver.currentLocation &&
                          typeof driver.currentLocation.latitude === "number" &&
                          driver.isOnline ? (
                            `📍 ${driver.currentLocation.latitude.toFixed(
                              5
                            )}, ${driver.currentLocation.longitude.toFixed(5)}`
                          ) : (
                            <span
                              style={{ color: "#999", fontStyle: "italic" }}
                            >
                              {driver.isOnline ? "Location pending" : "Offline"}
                            </span>
                          )}
                        </span>
                      </div>
                      <div className="details-block">
                        <span className="details-label">Last Updated</span>
                        <span className="details-value">
                          🕒{" "}
                          {driver.lastUpdated
                            ? new Date(driver.lastUpdated).toLocaleString()
                            : "N/A"}
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
