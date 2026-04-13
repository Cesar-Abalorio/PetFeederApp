import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { logoutAndRedirect, verifyAuthToken } from "../utils/auth";
import "../styles/Profile.css";

export default function Profile() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [deviceCount, setDeviceCount] = useState(1);
  const [petNames, setPetNames] = useState<string[]>([]);
  const [pets, setPets] = useState<any[]>([]);
  const [newPetName, setNewPetName] = useState("");
  const [newPetBreed, setNewPetBreed] = useState("");

  const token = localStorage.getItem("authToken");

  const [loading, setLoading] = useState(true);

  // ✅ FETCH DATA FROM DJANGO API
  useEffect(() => {
    const initialize = async () => {
      if (!(await verifyAuthToken(navigate))) return;
      fetchProfile();
    };
    initialize();
  }, [navigate]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/profile/", {
        headers: {
          Authorization: `Token ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setName(data.first_name || "");
        setEmail(data.email || "");
      } else {
        logoutAndRedirect(navigate, "Session expired or backend unavailable. Please login again.");
        return;
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      logoutAndRedirect(navigate, "Unable to connect to server. Please login again once the backend is available.");
      return;
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!token) return;
    fetchPets();
  }, [token]);

  const fetchPets = async () => {
    try {
      const response = await fetch("/api/pets/", {
        headers: {
          Authorization: `Token ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setPets(data);
      } else {
        logoutAndRedirect(navigate, "Session expired or backend unavailable. Please login again.");
        return;
      }
    } catch (error) {
      console.error("Error fetching pets:", error);
      logoutAndRedirect(navigate, "Unable to connect to server. Please login again once the backend is available.");
      return;
    }
  };

  // ✅ UPDATE DATA TO DJANGO API
  const handleSave = async () => {
    
    try {
      const response = await fetch("/api/profile/", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`
        },
        body: JSON.stringify({
          first_name: name,
          last_name: "Updated"
        })
      });
      if (response.ok) {
        alert("Profile Updated Successfully!");
      } else {
        alert("Update failed");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Unable to connect to server. Please check your connection.");
    }
  };

  // ✅ ADD PET
  const handleAddPet = async () => {
    try {
      const response = await fetch("/api/pets/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`
        },
        body: JSON.stringify({
          name: newPetName,
          breed: newPetBreed,
          age: 1,
          weight: 1
        })
      });
      const data = await response.json();
      if (data.id) {
        setPets(prev => [...prev, data]);
        setNewPetName("");
        setNewPetBreed("");
        alert("Pet added successfully!");
      } else {
        alert("Error adding pet.");
      }
    } catch (error) {
      console.error("Error adding pet:", error);
      alert("Unable to connect to server. Please check your connection.");
    }
  };

  // ✅ DELETE PET
  const handleDeletePet = (id: number) => {
    fetch(`/api/pets/${id}/`, {
      method: "DELETE",
      headers: {
        Authorization: `Token ${token}`
      }
    })
      .then(() => {
        setPets(prev => prev.filter(pet => pet.id !== id));
      })
      .catch(err => console.error(err));
  };

  return (
    <div className="profileContainer">
      <div className="profileCard">
        <h2>Edit Profile</h2>

        {loading && (
          <div className="loadingMessage">
            <p>Loading profile...</p>
          </div>
        )}

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

        {/* ✅ ADD PET UI */}
        <h3>Add New Pet</h3>

        <input
          className="profileInput"
          placeholder="Pet Name"
          value={newPetName}
          onChange={(e) => setNewPetName(e.target.value)}
        />

        <input
          className="profileInput"
          placeholder="Breed"
          value={newPetBreed}
          onChange={(e) => setNewPetBreed(e.target.value)}
        />

        <button className="profileButtonSave" onClick={handleAddPet}>
          Add Pet
        </button>

        {/* ✅ ADD THIS (display pets) */}
        <h3>Your Pets</h3>
        <ul>
          {pets.map((pet) => (
            <li key={pet.id}>
              {pet.name} - {pet.breed}
              <button onClick={() => handleDeletePet(pet.id)}>Delete</button>
            </li>
          ))}
        </ul>

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