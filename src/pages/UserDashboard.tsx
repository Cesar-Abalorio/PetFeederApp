import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { logoutAndRedirect, verifyAuthToken } from "../utils/auth";
import "../styles/User.css";

interface FeedingSchedule {
  id: number;
  device: number;
  time: string;
  created_at: string;
}

interface Device {
  id: number;
  name: string;
  status: string;
  food_level: number;
  last_feeding: string | null;
  user: number;
}

export default function UserDashboard() {
  const navigate = useNavigate();
  const user = localStorage.getItem("currentUser");
  const token = localStorage.getItem("authToken");
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

  useEffect(() => {
    const validate = async () => {
      if (!token || !(await verifyAuthToken(navigate))) return;
    };
    validate();
  }, [navigate, token]);

  const [devices, setDevices] = useState<Device[]>([]);
  const [schedules, setSchedules] = useState<FeedingSchedule[]>([]);
  const [scheduleInputs, setScheduleInputs] = useState<{[key: number]: string}>({});
  const [notifications, setNotifications] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lastFedTimes, setLastFedTimes] = useState<{[key: number]: number}>({});

  // Fetch devices, schedules, and logs on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch devices
        const devicesResponse = await fetch(`${apiUrl}/devices/`, {
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (devicesResponse.ok) {
          const devicesData = await devicesResponse.json();
          setDevices(devicesData);
        }

        // Fetch schedules from localStorage
        const storedSchedules = JSON.parse(localStorage.getItem("feedingSchedules") || "[]");
        setSchedules(storedSchedules);

        // Fetch feeding logs
        const logsResponse = await fetch(`${apiUrl}/logs/`, {
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (logsResponse.ok) {
          // TODO: Use feedingLogs state if we add logs display to dashboard
        }

      } catch (error) {
        console.error('Error fetching data:', error);
        logoutAndRedirect(navigate, 'Unable to connect to server. Please login again once the backend is available.');
        return;
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchData();
    }
  }, [token, apiUrl]);

  // Auto-feeding based on schedules
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const currentTime = now.toTimeString().slice(0, 5); // HH:MM

      schedules.forEach(schedule => {
        if (schedule.time.slice(0, 5) === currentTime) {
          const lastFed = lastFedTimes[schedule.id];
          if (!lastFed || now.getTime() - lastFed > 60000) { // At least 1 minute ago
            handleManualFeed(schedule.device);
            setLastFedTimes(prev => ({ ...prev, [schedule.id]: now.getTime() }));
          }
        }
      });
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [schedules, lastFedTimes]);

  // Add Notification
  const addNotification = (message: string) => {
    setNotifications((prev) => [message, ...prev]);
  };

  const getDeviceName = (deviceId: number) => {
    const device = devices.find(d => d.id === deviceId);
    return device?.name || `Device ${deviceId}`;
  };

  const handleManualFeed = async (deviceId: number) => {
    try {
      const response = await fetch(`${apiUrl}/devices/feed/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ device_id: deviceId })
      });

      if (response.ok) {
        addNotification(`✅ Manual feeding successful for ${getDeviceName(deviceId)}`);

        // Refresh devices and logs data
        const devicesResponse = await fetch(`${apiUrl}/devices/`, {
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (devicesResponse.ok) {
          const devicesData = await devicesResponse.json();
          setDevices(devicesData);
        }

        const logsResponse = await fetch(`${apiUrl}/logs/`, {
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (logsResponse.ok) {
          // TODO: Use feedingLogs state if we add logs display to dashboard
        }
      } else {
        const error = await response.json();
        addNotification(`❌ Manual feeding failed: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error feeding device:', error);
      addNotification('❌ Failed to feed device');
    }
  };

  const handleAddSchedule = async (deviceId: number) => {
    const scheduleTime = scheduleInputs[deviceId];
    if (!scheduleTime) return;

    // Normalize time to HH:MM:SS for backend TimeField validation
    const normalizedTime = scheduleTime.length === 5 ? `${scheduleTime}:00` : scheduleTime;

    // Check if schedule already exists for this device and time
    const existingSchedule = schedules.find(s => s.device === deviceId && s.time === normalizedTime);
    if (existingSchedule) {
      addNotification(`⚠️ Schedule already exists for ${getDeviceName(deviceId)}.`);
      return;
    }

    try {
      const newSchedule = {
        id: Date.now(), // Simple ID generation
        device: deviceId,
        time: normalizedTime,
        created_at: new Date().toISOString()
      };

      const updatedSchedules = [...schedules, newSchedule];
      localStorage.setItem("feedingSchedules", JSON.stringify(updatedSchedules));
      setSchedules(updatedSchedules);

      const newInputs = { ...scheduleInputs };
      newInputs[deviceId] = "";
      setScheduleInputs(newInputs);

      addNotification(`⏰ Schedule added for ${getDeviceName(deviceId)}.`);
    } catch (error) {
      console.error('Error adding schedule:', error);
      addNotification('❌ Failed to add schedule');
    }
  };

  const handleRemoveSchedule = async (scheduleId: number, deviceId: number) => {
    try {
      const updatedSchedules = schedules.filter(s => s.id !== scheduleId);
      localStorage.setItem("feedingSchedules", JSON.stringify(updatedSchedules));
      setSchedules(updatedSchedules);
      addNotification(`🗑 Schedule removed from ${getDeviceName(deviceId)}.`);
    } catch (error) {
      console.error('Error removing schedule:', error);
      addNotification('❌ Failed to remove schedule');
    }
  };

  // Low Food Alerts
  useEffect(() => {
    devices.forEach((device) => {
      if (device.food_level <= 20 && device.food_level > 0) {
        addNotification(`⚠️ ${device.name} food level is low!`);
      }
      if (device.food_level === 0) {
        addNotification(`❌ ${device.name} food container empty!`);
      }
    });
  }, [devices]);

  const handleLogout = async () => {
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
    const token = localStorage.getItem("authToken");

    try {
      if (token) {
        await fetch(`${apiUrl}/auth/logout/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
        });
      }
    } catch (err) {
      console.warn("Logout API failed", err);
    }

    localStorage.removeItem("currentUser");
    localStorage.removeItem("role");
    localStorage.removeItem("authToken");
    navigate("/");
  };

  return (
  <div className="dashboardWrapper">

    {/* MAIN CONTENT */}
    <div className="mainContent">
    <div className="userHeader">
  <div className="headerLeft">
    <h1>Smart Pet Feeder System</h1>
    <p>Welcome, {user}</p>
  </div>

  <div className="headerRight">

  {/* Notification Dropdown */}
  <div className="notificationWrapper">
    <button
      className="notificationButton"
      onClick={() => setShowNotifications(!showNotifications)}
    >
      🔔 ({notifications.length})
    </button>

    {showNotifications && (
      <div className="notificationDropdown">
        <h4>Notifications</h4>

        {notifications.length === 0 && (
          <p className="noNotification">No alerts yet.</p>
        )}

        {notifications.map((note, index) => (
          <div key={index} className="notificationItem">
            {note}
          </div>
        ))}
      </div>
    )}
  </div>

  {/* Profile Dropdown */}
  <div className="profileWrapper">
    <button
      className="profileButton"
      onClick={() => setShowDropdown(!showDropdown)}
    >
      {user} ⌄
    </button>

    {showDropdown && (
      <div className="dropdownMenu">
        <button onClick={() => navigate("/profile")}>
        Profile
        </button>

        <button onClick={() => navigate("/devices")}>
        My Devices
        </button>

        <button onClick={() => navigate("/pet-tracker")}>
        Pet Feed Tracker
        </button>

        <button onClick={handleLogout}>Logout</button>
      </div>
    )}
  </div>

</div>
</div>

      {/* Live Status */}
      <div className="userCard">
        <h3>Device Status</h3>

        {loading ? (
          <p>Loading devices...</p>
        ) : devices.length === 0 ? (
          <p>No devices found. Add devices in the Devices page.</p>
        ) : (
          devices.map((device) => (
            <div key={device.id} style={{ marginBottom: "15px", padding: "10px", border: "1px solid #e5e7eb", borderRadius: "8px" }}>
              <p>
                <strong>{device.name}:</strong>{" "}
                <span className={`statusIndicator ${
                  device.status === "online" ? "online" :
                  device.status === "offline" ? "offline" : "not-working"
                }`}>
                  ● {device.status.charAt(0).toUpperCase() + device.status.slice(1)}
                </span>
              </p>

              <p><strong>Last Feeding:</strong> {device.last_feeding ? new Date(device.last_feeding).toLocaleString() : "Not yet"}</p>
              <p><strong>Food Level:</strong></p>

              <div className="foodBar">
                <div
                  className={`foodFill ${device.food_level <= 20 ? "low" : ""}`}
                  style={{ width: `${device.food_level}%` }}
                ></div>
              </div>

              <span className="foodPercent">{device.food_level}%</span>

              <div style={{ marginTop: "10px" }}>
                <button
                  onClick={() => handleManualFeed(device.id)}
                  className="manualFeedButton"
                  style={{ fontSize: "12px", padding: "6px 12px" }}
                >
                  Feed {device.name}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Schedule */}
      <div className="userCard">
        <h3>Feeding Schedule</h3>

        {loading ? (
          <p>Loading schedules...</p>
        ) : devices.length === 0 ? (
          <p>No devices found. Add devices in the Devices page.</p>
        ) : (
          devices.map((device) => {
            const deviceSchedules = schedules.filter(s => s.device === device.id);
            return (
              <div key={device.id} style={{ marginBottom: "20px", padding: "10px", border: "1px solid #e5e7eb", borderRadius: "8px" }}>
                <h4>{device.name} Schedule</h4>

                <div className="scheduleInputRow">
                  <input
                    type="time"
                    value={scheduleInputs[device.id] || ""}
                    onChange={(e) => {
                      setScheduleInputs(prev => ({
                        ...prev,
                        [device.id]: e.target.value
                      }));
                    }}
                  />
                  <button onClick={() => handleAddSchedule(device.id)}>Add</button>
                </div>

                {deviceSchedules.map((schedule) => (
                  <div key={schedule.id} className="scheduleItem">
                    <span>{schedule.time}</span>
                    <button onClick={() => handleRemoveSchedule(schedule.id, device.id)}>
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            );
          })
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
