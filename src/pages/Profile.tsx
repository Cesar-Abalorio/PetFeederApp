import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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

  // ✅ FETCH DATA FROM DJANGO API
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/profile/", {
      headers: {
        Authorization: "Token 4bcf8b5139ae23ee396cd2c2e372309bde078bea"
      }
    })
      .then(res => res.json())
      .then(data => {
        setName(data.first_name || "");
        setEmail(data.email || "");
      })
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/pets/", {
      headers: {
        Authorization: "Token 4bcf8b5139ae23ee396cd2c2e372309bde078bea"
      }
    })
      .then(res => res.json())
      .then(data => {
        console.log("Pets:", data);
        setPets(data);
      })
      .catch(err => console.error(err));
  }, []);

  // ✅ UPDATE DATA TO DJANGO API
  const handleSave = () => { 
    
    fetch("http://127.0.0.1:8000/api/profile/", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Token 4bcf8b5139ae23ee396cd2c2e372309bde078bea"
      },
      body: JSON.stringify({
        first_name: name,
        last_name: "Updated"
      })
    })
      .then(res => res.json())
      .then(data => {
        alert("Profile Updated Successfully!");
        console.log(data);
      })
      .catch(err => console.error(err));
  };

  // ✅ ADD PET
  const handleAddPet = () => {
    fetch("http://127.0.0.1:8000/api/pets/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Token 4bcf8b5139ae23ee396cd2c2e372309bde078bea"
      },
      body: JSON.stringify({
        name: newPetName,
        breed: newPetBreed,
        age: 1,
        weight: 1
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.id) {
          alert("Pet added successfully!");
          setPets(prev => [...prev, data]);
          setNewPetName("");
          setNewPetBreed("");
        } else {
          alert("Error adding pet.");
        }
      })
      .catch(err => console.error(err));
  };

  // ✅ DELETE PET
  const handleDeletePet = (id: number) => {
    fetch(`http://127.0.0.1:8000/api/pets/${id}/`, {
      method: "DELETE",
      headers: {
        Authorization: "Token 4bcf8b5139ae23ee396cd2c2e372309bde078bea"
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