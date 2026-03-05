import Navbar from "../components/Navbar";
import { useState, useEffect } from "react";
import "../styles/Dashboard.css";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDevices: 0,
    feedingEventsToday: 0,
    successRate: 0,
    devicesOnline: 0,
    devicesOffline: 0,
    devicesNotWorking: 0,
    avgFoodLevel: 0,
    lastFeedingTime: "N/A",
    activeSchedules: 0
  });

  useEffect(() => {
    // Get all users
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const totalUsers = users.length;

    // Calculate total devices
    const totalDevices = users.reduce((sum: number, user: any) => sum + (user.deviceCount || 1), 0);

    // Calculate food levels
    const foodLevels = users.reduce((levels: number[], user: any) => {
      const userFoodLevels = Array(user.deviceCount || 1).fill(100);
      return [...levels, ...userFoodLevels];
    }, []);
    const avgFoodLevel = foodLevels.length > 0 
      ? Math.round(foodLevels.reduce((a: number, b: number) => a + b, 0) / foodLevels.length) 
      : 0;

    // Get feeding logs
    const feedingLogs = JSON.parse(localStorage.getItem("feedingLogs") || "[]");
    const today = new Date().toLocaleDateString();
    const todayLogs = feedingLogs.filter((log: any) => {
      const logDate = new Date(log.time).toLocaleDateString();
      return logDate === today;
    });

    const feedingEventsToday = todayLogs.length;
    const successCount = todayLogs.filter((log: any) => log.status === "Success").length;
    const successRate = feedingEventsToday > 0 
      ? Math.round((successCount / feedingEventsToday) * 100) 
      : 0;

    // Get last feeding time
    const lastFeedingTime = feedingLogs.length > 0 
      ? feedingLogs[0].time.split(" ").slice(-2).join(" ")
      : "N/A";

    // Calculate device statuses (simulate based on random + users)
    const devicesOnline = Math.round(totalDevices * 0.85);
    const devicesOffline = Math.round(totalDevices * 0.10);
    const devicesNotWorking = totalDevices - devicesOnline - devicesOffline;

    // Calculate active schedules
    const activeSchedules = users.reduce((total: number, user: any) => {
      const schedules = JSON.parse(localStorage.getItem(`deviceSchedules_${user.email}`) || "[]");
      return total + schedules.reduce((count: number, device: any[]) => count + (device?.length || 0), 0);
    }, 0);

    setStats({
      totalUsers,
      totalDevices,
      feedingEventsToday,
      successRate,
      devicesOnline,
      devicesOffline,
      devicesNotWorking,
      avgFoodLevel,
      lastFeedingTime,
      activeSchedules
    });
  }, []);

  const StatCard = ({ label, value, color, icon }: any) => (
    <div className="dashboardCard">
      <div className="cardHeader">
        <div className="cardLabel">{label}</div>
        <div className={`cardIcon ${color}`}>{icon}</div>
      </div>
      <div className={`cardValue ${color}`}>{value}</div>
    </div>
  );

  return (
    <>
      <Navbar />

      <div className="dashboardContainer">
        <div className="dashboardHeader">
          <div>
            <h2 className="dashboardTitle">Admin Dashboard</h2>
            <p className="dashboardSubtitle">System Overview & Statistics</p>
          </div>
          <div className="lastUpdated">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>

        {/* Primary Stats */}
        <div className="statsSection">
          <h3 className="sectionTitle">Overview</h3>
          <div className="dashboardGrid">
            <StatCard label="Total Users" value={stats.totalUsers} color="blue" icon="👥" />
            <StatCard label="Total Devices" value={stats.totalDevices} color="teal" icon="🖥️" />
            <StatCard label="Feeding Events Today" value={stats.feedingEventsToday} color="green" icon="✅" />
            <StatCard label="Success Rate" value={`${stats.successRate}%`} color="orange" icon="📈" />
          </div>
        </div>

        {/* Device Status Stats */}
        <div className="statsSection">
          <h3 className="sectionTitle">Device Status</h3>
          <div className="dashboardGrid">
            <StatCard label="Devices Online" value={stats.devicesOnline} color="success" icon="🟢" />
            <StatCard label="Devices Offline" value={stats.devicesOffline} color="warning" icon="🟡" />
            <StatCard label="Not Working" value={stats.devicesNotWorking} color="danger" icon="🔴" />
            <StatCard label="Avg Food Level" value={`${stats.avgFoodLevel}%`} color="info" icon="💾" />
          </div>
        </div>

        {/* Activity Stats */}
        <div className="statsSection">
          <h3 className="sectionTitle">Activity</h3>
          <div className="dashboardGrid">
            <StatCard label="Active Schedules" value={stats.activeSchedules} color="purple" icon="📋" />
            <StatCard label="Last Feeding" value={stats.lastFeedingTime} color="pink" icon="⏰" />
          </div>
        </div>
      </div>
    </>
  );
}