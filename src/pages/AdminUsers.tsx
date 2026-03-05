import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "../styles/AdminUsers.css";

function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUsers = JSON.parse(localStorage.getItem("users") || "[]");
    setUsers(storedUsers);
  }, []);

  return (
    <>
      <Navbar />
      <div className="adminUsersContainer">
        <h2>User Profiles</h2>

        {users.length === 0 && <p>No users found.</p>}

        {users.map((user, index) => (
          <div
            key={index}
            className="userListItem"
            onClick={() => navigate(`/admin-users/${user.email}`)}
          >
            {user.name || "Unnamed User"} ({user.email})
          </div>
        ))}
      </div>
    </>
  );
}

export default AdminUsers;