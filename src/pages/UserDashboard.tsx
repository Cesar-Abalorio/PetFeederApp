import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/User.css";

export default function UserDashboard() {
  const navigate = useNavigate();
  const user = localStorage.getItem("currentUser");

  const [foodLevels, setFoodLevels] = useState<number[]>([100]);
  const [lastFeds, setLastFeds] = useState<string[]>(["Not yet"]);
  const [deviceStatuses, setDeviceStatuses] = useState<Array<{id: number, status: "Online" | "Offline" | "Not Working", lastOnline: string | null}>>([]);
  const [deviceSchedules, setDeviceSchedules] = useState<string[][]>([[]]);
  const [scheduleInputs, setScheduleInputs] = useState<string[]>([""]);  const [notifications, setNotifications] = useState<string[]>([]);
  const [lastTriggeredMinute, setLastTriggeredMinute] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    // Get user device count
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const userData = users.find((u: any) => u.email === user);
    const deviceCount = userData?.deviceCount || 1;

    // Initialize device statuses
    const initialStatuses = Array.from({ length: deviceCount }, (_, i) => ({
      id: i + 1,
      status: "Online" as const,
      lastOnline: null
    }));
    setDeviceStatuses(initialStatuses);

    // Initialize food levels and last feeds
    setFoodLevels(Array(deviceCount).fill(100));
    setLastFeds(Array(deviceCount).fill("Not yet"));

    // Initialize schedules
    const initialSchedules = Array.from({ length: deviceCount }, () => []);
    setDeviceSchedules(initialSchedules);
    setScheduleInputs(Array(deviceCount).fill(""));

    const interval = setInterval(() => {
      setDeviceStatuses(prevStatuses =>
        prevStatuses.map(device => {
          const random = Math.random();
          let newStatus: "Online" | "Offline" | "Not Working" = "Online";
          let lastOnline = device.lastOnline;

          if (random < 0.1) {
            newStatus = "Offline";
            lastOnline = new Date().toLocaleString();
          } else if (random < 0.15) {
            newStatus = "Not Working";
            lastOnline = new Date().toLocaleString();
          }

          return {
            ...device,
            status: newStatus,
            lastOnline
          };
        })
      );
    }, 15000);

    return () => clearInterval(interval);
  }, [user]);

  const addFeedLog = (
    type: "Manual" | "Scheduled",
    status: "Success" | "Failed",
    foodAfter: number,
    deviceId: number = 1
  ) => {
    const existingLogs =
      JSON.parse(localStorage.getItem("feedingLogs") || "[]");

    const newLog = {
      id: Date.now(),
      time: new Date().toLocaleString(),
      user: user,
      type,
      foodAfter,
      status,
      deviceId
    };

    const updatedLogs = [newLog, ...existingLogs];

    localStorage.setItem("feedingLogs", JSON.stringify(updatedLogs));
  };

  const handleAddSchedule = (deviceId: number) => {
    const scheduleTime = scheduleInputs[deviceId - 1];
    if (!scheduleTime) return;

    const currentSchedules = deviceSchedules[deviceId - 1] || [];
    if (currentSchedules.includes(scheduleTime)) {
      addNotification(`⚠️ Schedule already exists for ${getDeviceName(deviceId)}.`);
      return;
    }

    const newSchedules = [...deviceSchedules];
    newSchedules[deviceId - 1] = [...currentSchedules, scheduleTime];
    setDeviceSchedules(newSchedules);

    const newInputs = [...scheduleInputs];
    newInputs[deviceId - 1] = "";
    setScheduleInputs(newInputs);

    addNotification(`⏰ Schedule added for ${getDeviceName(deviceId)}.`);
  };


  const handleRemoveSchedule = (deviceId: number, time: string) => {
    const newSchedules = [...deviceSchedules];
    const currentSchedules = newSchedules[deviceId - 1] || [];
    newSchedules[deviceId - 1] = currentSchedules.filter((t) => t !== time);
    setDeviceSchedules(newSchedules);
    addNotification(`🗑 Schedule removed from ${getDeviceName(deviceId)}.`);
  };

  //  Add Notification
  const addNotification = (message: string) => {
    setNotifications((prev) => [message, ...prev]);
  };
  
  const getDeviceName = (deviceId: number) => {
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const userData = users.find((u: any) => u.email === user);
    const petNames = userData?.petNames || [];
    return petNames[deviceId - 1] || `Device ${deviceId}`;
  };

  const handleManualFeed = (deviceId: number) => {
    const deviceIndex = deviceId - 1;
    const currentFoodLevel = foodLevels[deviceIndex];

    if (currentFoodLevel > 0) {
      const newFoodLevel = Math.max(currentFoodLevel - 5, 0);
      const newFoodLevels = [...foodLevels];
      newFoodLevels[deviceIndex] = newFoodLevel;
      setFoodLevels(newFoodLevels);

      const now = new Date().toLocaleTimeString();
      const newLastFeds = [...lastFeds];
      newLastFeds[deviceIndex] = now;
      setLastFeds(newLastFeds);

      addFeedLog("Manual", "Success", newFoodLevel, deviceId);
      addNotification(`✅ Manual feeding successful for ${getDeviceName(deviceId)} at ${now}`);
    } else {
      addFeedLog("Manual", "Failed", currentFoodLevel, deviceId);
      addNotification(`❌ Manual feeding failed for ${getDeviceName(deviceId)}. No food.`);
    }
  };

  //  Scheduled Feed Checker (runs every second)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const currentTime = now.toTimeString().slice(0, 5);
      const currentMinute = now.toISOString().slice(0, 16);

      deviceSchedules.forEach((schedules, deviceIndex) => {
        const deviceId = deviceIndex + 1;
        schedules.forEach((time) => {
          if (
            time === currentTime &&
            currentMinute !== lastTriggeredMinute
          ) {
            const currentFoodLevel = foodLevels[deviceIndex];
            if (currentFoodLevel > 0) {
              const newFoodLevel = Math.max(currentFoodLevel - 5, 0);
              const newFoodLevels = [...foodLevels];
              newFoodLevels[deviceIndex] = newFoodLevel;
              setFoodLevels(newFoodLevels);

              const newLastFeds = [...lastFeds];
              newLastFeds[deviceIndex] = now.toLocaleTimeString();
              setLastFeds(newLastFeds);

              addNotification(`⏰ Scheduled feeding for ${getDeviceName(deviceId)} at ${time}`);
              addFeedLog("Scheduled", "Success", newFoodLevel, deviceId);
            } else {
              addNotification(`❌ Scheduled feeding failed for ${getDeviceName(deviceId)}. No food.`);
              addFeedLog("Scheduled", "Failed", currentFoodLevel, deviceId);
            }

            setLastTriggeredMinute(currentMinute);
          }
        });
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [deviceSchedules, foodLevels, lastTriggeredMinute, user]);
   
    useEffect(() => {
    // Get user device count
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const userData = users.find((u: any) => u.email === user);
    const deviceCount = userData?.deviceCount || 1;

    const savedSchedules = localStorage.getItem(`deviceSchedules_${user}`);
    if (savedSchedules) {
      const parsed = JSON.parse(savedSchedules);
      // Ensure all devices have schedule arrays
      const schedules = Array.from({ length: deviceCount }, (_, i) => parsed[i] || []);
      setDeviceSchedules(schedules);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(
        `deviceSchedules_${user}`,
        JSON.stringify(deviceSchedules)
      );
    }
  }, [deviceSchedules, user]);

  //  Low Food Alerts
  useEffect(() => {
    foodLevels.forEach((level, index) => {
      const deviceId = index + 1;
      if (level <= 20 && level > 0) {
        addNotification(`⚠️ ${getDeviceName(deviceId)} food level is low!`);
      }
      if (level === 0) {
        addNotification(`❌ ${getDeviceName(deviceId)} food container empty!`);
      }
    });
  }, [foodLevels, user]);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("role");
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

        {deviceStatuses.map((device) => (
          <div key={device.id} style={{ marginBottom: "15px", padding: "10px", border: "1px solid #e5e7eb", borderRadius: "8px" }}>
            <p>
              <strong>{getDeviceName(device.id)}:</strong>{" "}
              <span className={`statusIndicator ${
                device.status === "Online" ? "online" :
                device.status === "Offline" ? "offline" : "not-working"
              }`}>
                ● {device.status}
              </span>
            </p>

            {(device.status === "Offline" || device.status === "Not Working") && device.lastOnline && (
              <p className="lastOnline">
                Last Online: {device.lastOnline}
              </p>
            )}

            <p><strong>Last Feeding:</strong> {lastFeds[device.id - 1]}</p>
            <p><strong>Food Level:</strong></p>

            <div className="foodBar">
              <div
                className={`foodFill ${foodLevels[device.id - 1] <= 20 ? "low" : ""}`}
                style={{ width: `${foodLevels[device.id - 1]}%` }}
              ></div>
            </div>

            <span className="foodPercent">{foodLevels[device.id - 1]}%</span>

            <div style={{ marginTop: "10px" }}>
              <button
                onClick={() => handleManualFeed(device.id)}
                className="manualFeedButton"
                style={{ fontSize: "12px", padding: "6px 12px" }}
              >
                Feed {getDeviceName(device.id)}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Schedule */}
      <div className="userCard">
        <h3>Feeding Schedule</h3>

        {deviceStatuses.map((device) => (
          <div key={device.id} style={{ marginBottom: "20px", padding: "10px", border: "1px solid #e5e7eb", borderRadius: "8px" }}>
            <h4>{getDeviceName(device.id)} Schedule</h4>

            <div className="scheduleInputRow">
              <input
                type="time"
                value={scheduleInputs[device.id - 1]}
                onChange={(e) => {
                  const newInputs = [...scheduleInputs];
                  newInputs[device.id - 1] = e.target.value;
                  setScheduleInputs(newInputs);
                }}
              />
              <button onClick={() => handleAddSchedule(device.id)}>Add</button>
            </div>

            {(deviceSchedules[device.id - 1] || []).map((time, index) => (
              <div key={index} className="scheduleItem">
                <span>{time}</span>
                <button onClick={() => handleRemoveSchedule(device.id, time)}>
                  Remove
                </button>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>

      <div className="mainFooter">
  <p>© {new Date().getFullYear()} Smart Pet Feeder System</p>
  <p>Developed by BSIT Students</p>
</div>
  </div>
  );
}
