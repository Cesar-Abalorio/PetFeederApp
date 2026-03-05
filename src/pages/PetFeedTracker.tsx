import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/User.css";

export default function PetFeedTracker() {
  const navigate = useNavigate();
  const user = localStorage.getItem("currentUser");

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      navigate("/");
    }
  }, [user, navigate]);

  // Don't render if not authenticated
  if (!user) {
    return null;
  }

  const [feedLogs, setFeedLogs] = useState<any[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<number | null>(null);

  useEffect(() => {
    const loadLogs = () => {
      const allLogs = JSON.parse(localStorage.getItem("feedingLogs") || "[]");
      const userLogs = allLogs.filter((log: any) => log.user === user);
      setFeedLogs(userLogs.reverse()); // Most recent first
    };

    loadLogs(); // Load immediately

    // Refresh logs every 5 seconds to catch new feeding events
    const interval = setInterval(loadLogs, 5000);

    // Also refresh when window gains focus
    const handleFocus = () => loadLogs();
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [user]);

  const getDeviceName = (deviceId: number) => {
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const userData = users.find((u: any) => u.email === user);
    const petNames = userData?.petNames || [];
    return petNames[deviceId - 1] || `Device ${deviceId}`;
  };

  const filteredLogs = selectedDevice
    ? feedLogs.filter(log => log.deviceId === selectedDevice)
    : feedLogs;

  const getStatusColor = (status: string) => {
    return status === "Success" ? "#10b981" : "#ef4444";
  };

  return (
    <div className="dashboardWrapper">
      <div className="mainContent">
        <div className="userHeader">
          <div className="headerLeft">
            <h1>Pet Feed Tracker</h1>
            <p>Feeding History & Analytics</p>
          </div>

          <div className="headerRight">
            <button
              className="profileButton"
              onClick={() => navigate("/user")}
              style={{ background: "#2aa8a1", color: "white" }}
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>

        {/* Device Filter */}
        <div className="userCard">
          <h3>Filter by Device</h3>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button
              className={`profileButton ${selectedDevice === null ? "active" : ""}`}
              onClick={() => setSelectedDevice(null)}
              style={{
                background: selectedDevice === null ? "#2aa8a1" : "#f0f9f8",
                color: selectedDevice === null ? "white" : "#2aa8a1",
                border: "2px solid #2aa8a1"
              }}
            >
              All Devices
            </button>

            {(() => {
              const users = JSON.parse(localStorage.getItem("users") || "[]");
              const userData = users.find((u: any) => u.email === user);
              const deviceCount = Math.max(userData?.deviceCount || 1, 1); // Ensure at least 1 device

              return Array.from({ length: deviceCount }, (_, i) => (
                <button
                  key={i + 1}
                  className={`profileButton ${selectedDevice === i + 1 ? "active" : ""}`}
                  onClick={() => setSelectedDevice(i + 1)}
                  style={{
                    background: selectedDevice === i + 1 ? "#2aa8a1" : "#f0f9f8",
                    color: selectedDevice === i + 1 ? "white" : "#2aa8a1",
                    border: "2px solid #2aa8a1"
                  }}
                >
                  {getDeviceName(i + 1)}
                </button>
              ));
            })()}
          </div>
        </div>

        {/* Feed History */}
        <div className="userCard">
          <h3>Feeding History</h3>

          {filteredLogs.length === 0 ? (
            <p style={{ textAlign: "center", color: "#666", padding: "20px" }}>
              No feeding records found.
            </p>
          ) : (
            <div style={{ maxHeight: "500px", overflowY: "auto" }}>
              {filteredLogs.map((log, index) => (
                <div
                  key={index}
                  style={{
                    padding: "15px",
                    marginBottom: "10px",
                    borderRadius: "8px",
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderLeft: `4px solid ${getStatusColor(log.status)}`
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <strong style={{ color: "#2e2e2e" }}>
                      {getDeviceName(log.deviceId || 1)}
                    </strong>
                    <span
                      style={{
                        color: getStatusColor(log.status),
                        fontWeight: "600",
                        fontSize: "14px"
                      }}
                    >
                      {log.status}
                    </span>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ color: "#666" }}>
                      {log.type} • {log.time}
                    </span>
                    <span style={{ color: "#666", fontSize: "14px" }}>
                      Food Level: {log.foodAfter}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mainFooter">
        <p>© {new Date().getFullYear()} Smart Pet Feeder System</p>
        <p>Developed by BSIT Students</p>
      </div>
    </div>
  );
}