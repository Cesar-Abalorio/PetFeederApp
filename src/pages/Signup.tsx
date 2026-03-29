import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Signup.css";
import logo from "../assets/logo.jpg";

export default function Signup() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [strength, setStrength] = useState("");
  const [error, setError] = useState("");

  const checkStrength = (pass: string) => {
    if (pass.length < 6) return "Weak";
    if (pass.match(/[A-Z]/) && pass.match(/[0-9]/)) return "Strong";
    return "Medium";
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    setStrength(checkStrength(value));
  };

 const handleSignup = async () => {
  if (!email.includes("@")) {
    setError("Please enter a valid email address.");
    return;
  }

  if (password !== confirmPassword) {
    setError("Passwords do not match.");
    return;
  }

  if (strength === "Weak") {
    setError("Password is too weak.");
    return;
  }

  try {
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

    const response = await fetch(`${apiUrl}/register/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: email, password, email }),
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("currentUser", data.username);
      localStorage.setItem("role", "user");
      alert("Account Created Successfully!");
      navigate("/user");
    } else {
      setError(data.error || "Registration failed, please try again.");
    }
  } catch (error) {
    console.error("Signup error:", error);
    setError("Unable to register at the moment. Please try again later.");
  }
};

  return (
    <div className="container">
      <div className="loginCard">
      <img src={logo} alt="Logo" className="logo" />

      <h3 className="title">Create Your Account</h3>

      <input
        className="input"
        type="email"
        placeholder="Email Address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        className="input"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => handlePasswordChange(e.target.value)}
      />

      {password && (
        <p className={`strength ${strength.toLowerCase()}`}>
          Strength: {strength}
        </p>
      )}

      <input
        className="input"
        type="password"
        placeholder="Confirm Password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />

      {error && <p className="error">{error}</p>}

      <button className="button" onClick={handleSignup}>
        Sign Up
      </button>

      <p className="create" onClick={() => navigate("/")}>
        Back to Login
      </p>
    </div>
    </div>
  );
}
