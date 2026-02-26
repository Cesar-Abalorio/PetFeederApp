import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/User.css";

export default function UserDashboard() {
  const navigate = useNavigate();
  const user = localStorage.getItem("currentUser");

  const [foodLevel, setFoodLevel] = useState(100);
  const [lastFed, setLastFed] = useState("Not yet");
  const [deviceStatus] = useState("Online");

  const [notifications, setNotifications] = useState<string[]>([]);
  const [scheduleTime, setScheduleTime] = useState("");
  const [lastTriggeredMinute, setLastTriggeredMinute] = useState("");
  const [schedules, setSchedules] = useState<string[]>([]);


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

  // 🔔 Add Notification
  const addNotification = (message: string) => {
    setNotifications((prev) => [message, ...prev]);
  };

  // 🕒 Manual Feed
  const handleManualFeed = () => {
    if (foodLevel <= 0) {
      addNotification("❌ Cannot feed. No food available.");
      return;
    }

    const now = new Date().toLocaleTimeString();
    setLastFed(now);
    setFoodLevel((prev) => prev - 5);

    addNotification("✅ Manual feeding successful at " + now);
  };

  // 🕒 Scheduled Feed Checker (runs every second)
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
          setLastFed(now.toLocaleTimeString());
          setFoodLevel((prev) => prev - 5);
          addNotification(`⏰ Scheduled feeding at ${time}`);
        } else {
          addNotification("❌ Scheduled feeding failed. No food.");
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

  // ⚠ Low Food Alerts
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
    <div className="userContainer">
      <div className="userHeader">
        <h2>Welcome, {user}</h2>
        <button onClick={handleLogout}>Logout</button>
      </div>

      {/* LIVE STATUS */}
      <div className="userCard">
        <h3>Live Feeder Status</h3>
        <p><strong>Device Status:</strong> {deviceStatus}</p>
        <p><strong>Last Feeding:</strong> {lastFed}</p>
        <p><strong>Food Level:</strong> {foodLevel}%</p>
      </div>

      {/* MANUAL FEED */}
      <div className="userCard">
        <h3>Manual Feed Control</h3>
        <button onClick={handleManualFeed}>
          Dispense Food Now
        </button>
      </div>

      {/* SCHEDULE FEED */}
      <div className="userCard">
  <h3>Feeding Schedule</h3>

  <div className="scheduleInputRow">
    <input
      type="time"
      value={scheduleTime}
      onChange={(e) => setScheduleTime(e.target.value)}
    />
    <button onClick={handleAddSchedule}>
      Add
    </button>
  </div>

  {schedules.length === 0 && (
    <p>No schedules added.</p>
  )}

    {schedules.map((time, index) => (
    <div key={index} className="scheduleItem">
      <span>{time}</span>
      <button onClick={() => handleRemoveSchedule(time)}>
        Remove
      </button>
    </div>
  ))}
    </div>

      {/* NOTIFICATIONS */}
      <div className="userCard">
        <h3>Notification Alerts</h3>

        {notifications.length === 0 && (
          <p>No notifications yet.</p>
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
