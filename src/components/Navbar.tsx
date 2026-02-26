import { NavLink, useNavigate } from "react-router-dom";
import "../styles/Admin.css";

export default function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("role");
    navigate("/");
  };

  return (
    <div className="navbar">
      <div className="navLinks">
        <NavLink to="/dashboard">Dashboard</NavLink>
        <NavLink to="/devices">Devices</NavLink>
        <NavLink to="/schedule">Schedule</NavLink>
        <NavLink to="/logs">Logs</NavLink>
      </div>

      <button className="logoutBtn" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
}