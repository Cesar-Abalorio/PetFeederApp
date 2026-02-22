import { useState } from "react";
import Navbar from "../components/Navbar";
import "../styles/Schedule.css";

interface ScheduleItem {
  id: number;
  time: string;
  portion: string;
}

export default function Schedule() {
  const [time, setTime] = useState("");
  const [portion, setPortion] = useState("");
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);

  const handleAdd = () => {
    if (!time || !portion) {
      alert("Please fill all fields");
      return;
    }

    const newSchedule: ScheduleItem = {
      id: Date.now(),
      time,
      portion,
    };

    setSchedules([...schedules, newSchedule]);
    setTime("");
    setPortion("");
  };

  const handleDelete = (id: number) => {
    setSchedules(schedules.filter(item => item.id !== id));
  };

  return (
    <>
      <Navbar />

      <div className="scheduleContainer">
        <h2 className="scheduleTitle">Feeding Schedule Management</h2>

        <div className="scheduleForm">
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />

          <input
            type="number"
            placeholder="Portion (grams)"
            value={portion}
            onChange={(e) => setPortion(e.target.value)}
          />

          <button onClick={handleAdd}>Add Schedule</button>
        </div>

        <div className="scheduleList">
          {schedules.length === 0 && (
            <p className="emptyText">No schedules added yet.</p>
          )}

          {schedules.map((item) => (
            <div key={item.id} className="scheduleCard">
              <div>
                <strong>{item.time}</strong> — {item.portion}g
              </div>
              <button
                className="deleteBtn"
                onClick={() => handleDelete(item.id)}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}