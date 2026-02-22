import Navbar from "../components/Navbar";
import { useState } from "react";
import "../styles/Dashboard.css";

export default function Dashboard() {
  const [feedsToday] = useState(5);
  const [devicesOnline] = useState(3);
  const [alerts] = useState(1);

  return (
    <>
      <Navbar />

      <div className="dashboardContainer">
        <h2 className="dashboardTitle">Admin Dashboard</h2>

        <div className="dashboardGrid">
          <div className="dashboardCard">
            <div className="cardLabel">Feeds Today</div>
            <div className="cardValue">{feedsToday}</div>
          </div>

          <div className="dashboardCard">
            <div className="cardLabel">Devices Online</div>
            <div className="cardValue">{devicesOnline}</div>
          </div>

          <div className="dashboardCard">
            <div className="cardLabel">Active Alerts</div>
            <div className="cardValue">{alerts}</div>
          </div>
        </div>
      </div>
    </>
  );
}