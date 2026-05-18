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
  const [notifications, setNotifications] = useState<any[]>([]);
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

        // Fetch notifications
        try {
          const notesResp = await fetch("/api/notifications/", {
            headers: {
              'Authorization': `Token ${token}`,
              'Content-Type': 'application/json'
            }
          });
          if (notesResp.ok) {
            const notes = await notesResp.json();
            setNotifications(notes || []);
          }
        } catch (e) {
          // ignore notification fetch errors
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

    const [showNotifications, setShowNotifications] = useState(false);

  const markNotificationRead = async (id: number) => {
    try {
      const resp = await fetch(`/api/notifications/${id}/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ read: true })
      });
      if (resp.ok) setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (e) {
      console.error('Failed to mark notification read', e);
    }
  };

  const deleteNotification = async (id: number) => {
    try {
      const resp = await fetch(`/api/notifications/${id}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Token ${token}`, 'Content-Type': 'application/json' }
      });
      if (resp.ok || resp.status === 204) setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (e) {
      console.error('Failed to delete notification', e);
    }
  };

  const clearAllNotifications = async () => {
    try {
      await Promise.all(notifications.map((n) => fetch(`/api/notifications/${n.id}/`, { method: 'DELETE', headers: { 'Authorization': `Token ${token}`, 'Content-Type': 'application/json' } })));
    } catch (e) {
      console.error('Failed to clear notifications', e);
    } finally {
      setNotifications([]);
    }
  };

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
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <div style={{ position: 'relative' }}>
                <button
                  className="profileButton"
                  onClick={() => setShowNotifications(!showNotifications)}
                  style={{ background: '#fff', color: '#2aa8a1', border: '1px solid #2aa8a1' }}
                >
                  🔔 ({notifications.length})
                </button>

                {showNotifications && (
                  <div style={{ position: 'absolute', right: 0, top: '36px', background: '#fff', border: '1px solid #e5e7eb', padding: 10, width: 320, zIndex: 50 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h4 style={{ margin: 0 }}>Notifications</h4>
                      <div>
                        <button onClick={clearAllNotifications} style={{ marginLeft: 8 }}>Clear All</button>
                      </div>
                    </div>
                    {notifications.length === 0 && <div style={{ color: '#666' }}>No notifications</div>}
                    {notifications.map((n: any) => (
                      <div key={n.id} style={{ padding: '6px 0', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: n.read ? 400 : 700 }}>{n.message}</div>
                          <div style={{ fontSize: 12, color: '#666' }}>{new Date(n.timestamp).toLocaleString()}</div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {!n.read && <button onClick={() => markNotificationRead(n.id)} style={{ fontSize: 12 }}>Mark read</button>}
                          <button onClick={() => deleteNotification(n.id)} style={{ fontSize: 12 }}>Delete</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                className="profileButton"
                onClick={() => navigate("/user")}
                style={{ background: "#2aa8a1", color: "white" }}
              >
                ← Back to Dashboard
              </button>
            </div>
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