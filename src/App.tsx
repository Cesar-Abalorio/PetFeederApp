import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Schedule from "./pages/Schedule";
import UserDashboard from "./pages/UserDashboard";
import Profile from "./pages/Profile";
import Devices from "./pages/Devices";
import AdminUsers from "./pages/AdminUsers";
import AdminUserDetails from "./pages/AdminUserDetails";
import PetFeedTracker from "./pages/PetFeedTracker";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/user" element={<UserDashboard />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/schedule" element={<Schedule />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/devices" element={<Devices />} />
      <Route path="/admin-users" element={<AdminUsers />} />
      <Route path="/admin-users/:email" element={<AdminUserDetails />} />
      <Route path="/pet-tracker" element={<PetFeedTracker />} />
    </Routes>
  );
}

export default App;