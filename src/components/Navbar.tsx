import { NavLink } from "react-router-dom";
import "../styles/Admin.css";

export default function Navbar() {
  return (
    <div className="navbar">
      <NavLink to="/dashboard">Dashboard</NavLink>
      <NavLink to="/devices">Devices</NavLink>
      <NavLink to="/schedule">Schedule</NavLink>
      <NavLink to="/logs">Logs</NavLink>
    </div>
  );
}