import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Profile.css";

export default function Profile() {
  const navigate = useNavigate();

  const currentUser = localStorage.getItem("currentUser");

  const [name, setName] = useState("");
  const [petNames, setPetNames] = useState<string[]>([]);
  const [email, setEmail] = useState("");
  const [deviceCount, setDeviceCount] = useState(1);

  useEffect(() => {
    const users = JSON.parse(localStorage.getItem("users") || "[]");

    const userData = users.find(
      (user: any) => user.email === currentUser
    );

    if (userData) {
      setName(userData.name || "");
      setPetNames(userData.petNames || Array(userData.deviceCount || 1).fill(""));
      setEmail(userData.email || "");
      setDeviceCount(userData.deviceCount || 1);
    }
  }, [currentUser]);

  const handleSave = () => {
    const users = JSON.parse(localStorage.getItem("users") || "[]");

    const updatedUsers = users.map((user: any) => {
      if (user.email === currentUser) {
        return {
          ...user,
          name,
          petNames,
          email,
          deviceCount
        };
      }
      return user;
    });

    localStorage.setItem("users", JSON.stringify(updatedUsers));
    localStorage.setItem("currentUser", email);

    alert("Profile Updated Successfully!");
    navigate("/user");
  };

  return (
    <div className="profileContainer">
      <div className="profileCard">
        <h2>Edit Profile</h2>

        <input
          className="profileInput"
          placeholder="Your Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="profileInput"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="profileInput"
          type="number"
          placeholder="Number of Devices"
          value={deviceCount}
          onChange={(e) => {
            const newCount = Math.max(1, parseInt(e.target.value) || 1);
            setDeviceCount(newCount);
            setPetNames(prev => {
              const newPetNames = [...prev];
              while (newPetNames.length < newCount) {
                newPetNames.push("");
              }
              return newPetNames.slice(0, newCount);
            });
          }}
          min="1"
        />

        {Array.from({ length: deviceCount }, (_, i) => (
          <input
            key={i}
            className="profileInput"
            placeholder={`Pet Name for Device ${i + 1}`}
            value={petNames[i] || ""}
            onChange={(e) => {
              const newPetNames = [...petNames];
              newPetNames[i] = e.target.value;
              setPetNames(newPetNames);
            }}
          />
        ))}

        <button className="profileButtonSave" onClick={handleSave}>
          Save Changes
        </button>

        <button
          className="profileBackButton"
          onClick={() => navigate("/user")}
        >
          Back
        </button>
      </div>
    </div>
  );
}