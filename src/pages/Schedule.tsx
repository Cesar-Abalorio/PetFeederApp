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
}

export default function Schedule() {
  const [logs, setLogs] = useState<FeedingLog[]>([]);

  useEffect(() => {
    const storedLogs =
      JSON.parse(localStorage.getItem("feedingLogs") || "[]");

    setLogs(storedLogs);
  }, []);

  return (
    <>
      <Navbar />

      <div className="scheduleContainer">
        <h2 className="scheduleTitle">Feeding History</h2>

        <div className="historyTable">
          {logs.length === 0 && (
            <p className="emptyText">No feeding history available.</p>
          )}

          {logs.map((log) => (
            <div key={log.id} className="historyRow">
              <div>{log.time}</div>
              <div>{log.user}</div>
              <div>{log.type}</div>
              <div>{log.foodAfter}%</div>
              <div
                className={
                  log.status === "Success"
                    ? "statusSuccess"
                    : "statusFailed"
                }
              >
                {log.status}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}