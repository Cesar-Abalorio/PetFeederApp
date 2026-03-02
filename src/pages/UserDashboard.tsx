import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/User.css";

export default function UserDashboard() {
  const navigate = useNavigate();
  const user = localStorage.getItem("currentUser");

  const [foodLevel, setFoodLevel] = useState(100);
  const [lastFed, setLastFed] = useState("Not yet");
  const [deviceStatus, setDeviceStatus] = useState<"Online" | "Offline">("Online");
  const [lastOnlineTime, setLastOnlineTime] = useState<string | null>(null);  const [notifications, setNotifications] = useState<string[]>([]);
  const [scheduleTime, setScheduleTime] = useState("");
  const [lastTriggeredMinute, setLastTriggeredMinute] = useState("");
  const [schedules, setSchedules] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  

  useEffect(() => {
  const interval = setInterval(() => {
    const random = Math.random();

    if (random < 0.1) { 
      setDeviceStatus("Offline");
      setLastOnlineTime(new Date().toLocaleString());
    } else {
      setDeviceStatus("Online");
    }
  }, 15000);

  return () => clearInterval(interval);
}, []);

  const addFeedLog = (
  type: "Manual" | "Scheduled",
  status: "Success" | "Failed",
  foodAfter: number
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
  };

  const updatedLogs = [newLog, ...existingLogs];

  localStorage.setItem("feedingLogs", JSON.stringify(updatedLogs));
};

  const handleAddSchedule = () => {
  if (!scheduleTime) return;

  if (schedules.includes(scheduleTime)) {
    addNotification("⚠️ Schedule already exists.");
    return;
  }

  setSchedules([...schedules, scheduleTime]);
  setScheduleTime("");
  addNotification("⏰ Schedule added successfully.");
};


  const handleRemoveSchedule = (time: string) => {
  setSchedules(schedules.filter((t) => t !== time));
  addNotification("🗑 Schedule removed.");
    };

  //  Add Notification
  const addNotification = (message: string) => {
    setNotifications((prev) => [message, ...prev]);
  };
  
  //  Manual Feed
  const handleManualFeed = () => {
    if (foodLevel > 0) {
      addFeedLog("Manual", "Success", foodLevel - 5);
    }else {
      addFeedLog("Manual", "Failed", foodLevel);
      return;
    }

    const now = new Date().toLocaleTimeString();
    setLastFed(now);
    setFoodLevel((prev) => Math.max(prev - 5, 0));

    addNotification("✅ Manual feeding successful at " + now);
  };

  //  Scheduled Feed Checker (runs every second)
  useEffect(() => {
  const interval = setInterval(() => {
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5);
    const currentMinute = now.toISOString().slice(0, 16);

    schedules.forEach((time) => {
      if (
        time === currentTime &&
        currentMinute !== lastTriggeredMinute
      ) {
        if (foodLevel > 0) {
          const newFoodLevel = Math.max(foodLevel - 5, 0);

          setLastFed(now.toLocaleTimeString());
          setFoodLevel(newFoodLevel);

          addNotification(`⏰ Scheduled feeding at ${time}`);

          addFeedLog("Scheduled", "Success", newFoodLevel);
        } else {
          addNotification("❌ Scheduled feeding failed. No food.");

          addFeedLog("Scheduled", "Failed", foodLevel);
        }

        setLastTriggeredMinute(currentMinute);
      }
    });
  }, 1000);

  return () => clearInterval(interval);
}, [schedules, foodLevel, lastTriggeredMinute]);
   
  useEffect(() => {
  const saved = localStorage.getItem(`schedules_${user}`);
  if (saved) {
    setSchedules(JSON.parse(saved));
  }
}, [user]);

useEffect(() => {
  if (user) {
    localStorage.setItem(
      `schedules_${user}`,
      JSON.stringify(schedules)
    );
  }
}, [schedules, user]);

  //  Low Food Alerts
  useEffect(() => {
    if (foodLevel <= 20 && foodLevel > 0) {
      addNotification("⚠️ Food level is low!");
    }
    if (foodLevel === 0) {
      addNotification("❌ Food container empty!");
    }
  }, [foodLevel]);

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
  <h2>Welcome, {user}</h2>

  <div className="profileWrapper">
    <button
      className="profileButton"
      onClick={() => setShowDropdown(!showDropdown)}
    >
      {user} ⌄
    </button>

    {showDropdown && (
      <div className="dropdownMenu">
        <button onClick={handleLogout}>Logout</button>
      </div>
    )}
    </div>
  </div>

      {/* Live Status */}
      <div className="userCard">
        <h3>Live Feeder Status</h3>
<p>
  <strong>Device Status:</strong>{" "}
  <span className={`statusIndicator ${deviceStatus === "Online" ? "online" : "offline"}`}>
    ● {deviceStatus}
  </span>
</p>

{deviceStatus === "Offline" && lastOnlineTime && (
  <p className="lastOnline">
    Last Online: {lastOnlineTime}
  </p>
)}        <p><strong>Last Feeding:</strong> {lastFed}</p>
        <p><strong>Food Level:</strong></p>

<div className="foodBar">
  <div 
    className={`foodFill ${foodLevel <= 20 ? "low" : ""}`}
    style={{ width: `${foodLevel}%` }}
  ></div>
</div>

<span className="foodPercent">{foodLevel}%</span>
      </div>

      {/* Manual Feed */}
      <div className="userCard manualFeedCard">
        <h3>Manual Feed Control</h3>

        < button onClick={handleManualFeed} className="manualFeedButton">
          Dispense Food Now
        </button>
      </div>

      {/* Schedule */}
      <div className="userCard">
        <h3>Feeding Schedule</h3>

        <div className="scheduleInputRow">
          <input
            type="time"
            value={scheduleTime}
            onChange={(e) => setScheduleTime(e.target.value)}
          />
          <button onClick={handleAddSchedule}>Add</button>
        </div>

        {schedules.map((time, index) => (
          <div key={index} className="scheduleItem">
            <span>{time}</span>
            <button onClick={() => handleRemoveSchedule(time)}>
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>

    {/*  SIDE NOTIFICATION PANEL */}
    <div className="notificationPanel">
      <h3>Notification Alerts</h3>

      {notifications.length === 0 && (
        <p className="noNotification">No alerts yet.</p>
      )}

      {notifications.map((note, index) => (
        <div key={index} className="notificationItem">
          {note}
        </div>
      ))}
    </div>

  </div>
  );
}
