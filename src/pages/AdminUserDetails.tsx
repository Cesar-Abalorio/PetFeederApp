import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "../styles/AdminUsers.css";

export default function AdminUserDetails() {
  const { email } = useParams();
  const navigate = useNavigate();

  const users = JSON.parse(localStorage.getItem("users") || "[]");
  const user = users.find((u: any) => u.email === email);

  if (!user) {
    return (
      <>
        <Navbar />
        <div className="adminUsersContainer">
          <h2>User Not Found</h2>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="adminUsersContainer">
        <h2>User Profile Details</h2>

        <button
          className="backButton"
          onClick={() => navigate("/admin-users")}
        >
          ← Back to Users List
        </button>

        <div className="userDetailCard">
          <p><strong>Name:</strong> {user.name || "Not Set"}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Number of Devices:</strong> {user.deviceCount || 1}</p>

          {user.petNames && user.petNames.length > 0 && (
            <div style={{ marginTop: "15px" }}>
              <strong>Device Pet Names:</strong>
              <ul style={{ marginTop: "5px", paddingLeft: "20px" }}>
                {user.petNames.map((petName: string, index: number) => (
                  <li key={index}>
                    Device {index + 1}: {petName || "Not Set"}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </>
  );
}