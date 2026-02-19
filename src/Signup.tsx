import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Signup.css";
import logo from "./assets/logo.jpg";

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

  const handleSignup = () => {
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

    setError("");
    alert("Account Created Successfully!");
    navigate("/");
  };

  return (
    <div className="container">
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
  );
}
