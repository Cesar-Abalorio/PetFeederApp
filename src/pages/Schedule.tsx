import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import "../styles/Schedule.css";

interface FeedingLog {
  id: number;
  time: string;
  user: string;
  type: string;
  foodAfter: number;
  status: string;
  deviceId?: number;
}

interface User {
  email: string;
  name: string;
  petNames?: string[];
}

export default function Schedule() {
  const [logs, setLogs] = useState<FeedingLog[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const storedLogs = JSON.parse(localStorage.getItem("feedingLogs") || "[]");
    const storedUsers = JSON.parse(localStorage.getItem("users") || "[]");
    
    setLogs(storedLogs);
    setUsers(storedUsers);
  }, []);

  const getUserName = (email: string) => {
    const user = users.find((u) => u.email === email);
    return user?.name || "Unknown";
  };

  const getDeviceName = (email: string, deviceId: number = 1) => {
    const user = users.find((u) => u.email === email);
    const petNames = user?.petNames || [];
    return petNames[deviceId - 1] || `Device ${deviceId}`;
  };

  const getStatusColor = (status: string) => {
    return status === "Success" ? "success" : "failed";
  };

  return (
    <>
      <Navbar />

      <div className="scheduleContainer">
        <div className="scheduleHeader">
          <div>
            <h2 className="scheduleTitle">Feeding History</h2>
            <p className="scheduleSubtitle">Complete Record of All Feeding Events</p>
          </div>
          <div className="feedingCount">
            <span className="countLabel">Total Events:</span>
            <span className="countValue">{logs.length}</span>
          </div>
        </div>

        <div className="tableWrapper">
          {logs.length === 0 && (
            <div className="emptyState">
              <p className="emptyText">No feeding history available.</p>
            </div>
          )}

          {logs.length > 0 && (
            <>
              <div className="tableHeader">
                <div className="headerCell timeCell">Time</div>
                <div className="headerCell emailCell">Email</div>
                <div className="headerCell nameCell">User Name</div>
                <div className="headerCell deviceCell">Pet/Device</div>
                <div className="headerCell actionCell">Action</div>
                <div className="headerCell foodCell">Food Level</div>
                <div className="headerCell statusCell">Status</div>
              </div>

              {logs.map((log, index) => (
                <div key={log.id || index} className="tableRow">
                  <div className="tableCell timeCell">
                    <span className="timeValue">{new Date(log.time).toLocaleTimeString()}</span>
                    <span className="dateValue">{new Date(log.time).toLocaleDateString()}</span>
                  </div>
                  <div className="tableCell emailCell">{log.user}</div>
                  <div className="tableCell nameCell">
                    <span className="nameTag">{getUserName(log.user)}</span>
                  </div>
                  <div className="tableCell deviceCell">
                    {getDeviceName(log.user, log.deviceId)}
                  </div>
                  <div className="tableCell actionCell">
                    <span className={`actionBadge ${log.type.toLowerCase()}`}>
                      {log.type}
                    </span>
                  </div>
                  <div className="tableCell foodCell">
                    <div className="foodLevelContainer">
                      <div className="foodBar">
                        <div
                          className={`foodFill ${log.foodAfter <= 20 ? "low" : ""}`}
                          style={{ width: `${log.foodAfter}%` }}
                        ></div>
                      </div>
                      <span className="foodPercent">{log.foodAfter}%</span>
                    </div>
                  </div>
                  <div className="tableCell statusCell">
                    <span className={`statusBadge ${getStatusColor(log.status)}`}>
                      {log.status === "Success" ? "✓ Success" : "✗ Failed"}
                    </span>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </>
  );
}