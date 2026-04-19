import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { verifyAuthToken } from "../utils/auth";
import "../styles/User.css";

export default function PetFeedTracker() {
  const navigate = useNavigate();
  const user = localStorage.getItem("currentUser");
  const token = localStorage.getItem("authToken");

  // Redirect to login if not authenticated, and validate token with backend
  useEffect(() => {
    const validate = async () => {
      if (!user || !token) {
        navigate("/");
        return;
      }
      await verifyAuthToken(navigate);
    };
    validate();
  }, [navigate, token, user]);

  // Don't render if not authenticated
  if (!user || !token) {
    return null;
  }

  const [feedLogs, setFeedLogs] = useState<any[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [devices, setDevices] = useState<Device[]>([]);

  interface Device {
    id: number;
    name: string;
    location: string;
    status: string;
  }

  useEffect(() => {
    const loadLogs = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // First fetch devices
        const devicesResponse = await fetch("/api/devices/", {
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (devicesResponse.ok) {
          const devicesData = await devicesResponse.json();
          setDevices(devicesData);
        }

        // Then fetch logs
        const logsResponse = await fetch("/api/logs/", {
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (logsResponse.ok) {
          const data = await logsResponse.json();
          // Handle both array response and paginated response
          const logsArray = Array.isArray(data) ? data : data.results || [];
          
          // Convert snake_case from API to camelCase for consistency
          const normalizedLogs = logsArray.map((log: any) => ({
            id: log.id,
            deviceId: log.device_id || log.deviceId,
            status: log.status || "Success",
            type: log.feeding_type || log.type || "Regular Feeding",
            time: formatDate(log.created_at || log.timestamp || log.time),
            foodAfter: log.food_level_after || log.foodAfter || 0,
            foodBefore: log.food_level_before || log.foodBefore || 0,
            amount: log.amount_dispensed || log.amount || 0
          }));
          
          setFeedLogs(normalizedLogs.reverse()); // Most recent first
        } else {
          setError("Failed to fetch feeding logs");
          console.error("Failed to fetch logs:", logsResponse.status);
        }
      } catch (error) {
        console.error("Error fetching logs:", error);
        setError("Unable to connect to server");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      loadLogs();
    }

    // Refresh logs every 30 seconds
    const interval = setInterval(() => {
      if (token) loadLogs();
    }, 30000);

    return () => clearInterval(interval);
  }, [token]);

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "Unknown";
    try {
      const date = new Date(dateString);
      return date.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      });
    } catch {
      return dateString;
    }
  };

  const getDeviceName = (deviceId: number) => {
    // First try to get from fetched devices
    const device = devices.find(d => d.id === deviceId);
    if (device) return device.name;
    
    // Fallback to localStorage
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const userData = users.find((u: any) => u.email === user);
    const petNames = userData?.petNames || [];
    return petNames[deviceId - 1] || `Device ${deviceId}`;
  };

  const refreshLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const logsResponse = await fetch("/api/logs/", {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (logsResponse.ok) {
        const data = await logsResponse.json();
        const logsArray = Array.isArray(data) ? data : data.results || [];
        
        const normalizedLogs = logsArray.map((log: any) => ({
          id: log.id,
          deviceId: log.device_id || log.deviceId,
          status: log.status || "Success",
          type: log.feeding_type || log.type || "Regular Feeding",
          time: formatDate(log.created_at || log.timestamp || log.time),
          foodAfter: log.food_level_after || log.foodAfter || 0,
          foodBefore: log.food_level_before || log.foodBefore || 0,
          amount: log.amount_dispensed || log.amount || 0
        }));
        
        setFeedLogs(normalizedLogs.reverse());
      } else {
        setError("Failed to refresh logs");
      }
    } catch (error) {
      console.error("Error refreshing logs:", error);
      setError("Failed to connect to server");
    } finally {
      setLoading(false);
    }
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
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
            <h3>Feeding History</h3>
            <button
              onClick={refreshLogs}
              disabled={loading}
              style={{
                padding: "8px 16px",
                background: "#2aa8a1",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.6 : 1
              }}
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          {error && (
            <div style={{
              padding: "12px",
              background: "#fee2e2",
              color: "#991b1b",
              borderRadius: "4px",
              marginBottom: "15px"
            }}>
              ⚠️ {error}
            </div>
          )}

          {loading ? (
            <p style={{ textAlign: "center", color: "#666", padding: "20px" }}>
              Loading feeding records...
            </p>
          ) : filteredLogs.length === 0 ? (
            <p style={{ textAlign: "center", color: "#666", padding: "20px" }}>
              No feeding records found.
            </p>
          ) : (
            <div style={{ maxHeight: "500px", overflowY: "auto" }}>
              {filteredLogs.map((log, index) => (
                <div
                  key={log.id || index}
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

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <span style={{ color: "#666", fontSize: "14px" }}>
                      {log.type}
                    </span>
                    <span style={{ color: "#666", fontSize: "12px" }}>
                      {log.time}
                    </span>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: "#666", fontSize: "13px" }}>
                    <span>Food Level: {log.foodBefore}% → {log.foodAfter}%</span>
                    {log.amount > 0 && <span>Amount: {log.amount}g</span>}
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