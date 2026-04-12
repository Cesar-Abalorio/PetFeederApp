import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Profile.css";

export default function Profile() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [petNames, setPetNames] = useState<string[]>([]);
  const [email, setEmail] = useState("");
  const [deviceCount, setDeviceCount] = useState(1);
  const token = localStorage.getItem("authToken");

  // ✅ FETCH PROFILE FROM DJANGO API
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/api/profile/", {
          method: "GET",
          headers: {
            "Authorization": `Token ${token}`,
            "Content-Type": "application/json"
          }
        });

        const data = await response.json();

        if (response.ok) {
          console.log("TOKEN:", data.token);
          setName(data.first_name || "");
          setEmail(data.email || "");
        } else {
          alert("Failed to load profile");
        }
      } catch (error) {
        console.error(error);
        alert("Error fetching profile");
      }
    };

    fetchProfile();
  }, [token]);

  // ✅ UPDATE PROFILE TO DJANGO API
  const handleSave = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/profile/", {
        method: "PUT",
        headers: {
          "Authorization": `Token ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          first_name: name,
          last_name: "User"
        })
      });

      if (response.ok) {
        alert("Profile Updated Successfully!");
        navigate("/user");
      } else {
        alert("Update failed");
      }
    } catch (error) {
      console.error(error);
      alert("Error updating profile");
    }
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
          disabled
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