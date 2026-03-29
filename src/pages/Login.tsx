import { useState } from "react";
import "../styles/Login.css";
import logo from "../assets/Logo.png";
import InputField from "../components/InputField";
import Button from "../components/Button";
import { useNavigate } from "react-router-dom";


export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false); 
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!username || !password) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
      const response = await fetch(`${apiUrl}/auth/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("authToken", data.token);
        localStorage.setItem("currentUser", data.username);
        localStorage.setItem("role", data.username === "admin" ? "admin" : "user");
        navigate(data.username === "admin" ? "/dashboard" : "/user");
      } else {
        alert(data.error || "Invalid credentials, please try again.");
      }
    } catch (error) {
      console.error("Login failed", error);
      alert("Unable to login at the moment. Please try again later.");
    }
  };

  return (
  <div className="container">
    <div className="loginCard">

      <img src={logo} alt="Logo" className="logo" />

      <h3 className="title">Log in to your Account</h3>

      <div className="usernameWrapper">
        <InputField
          placeholder="Email Address"
          value={username}
          onChange={setUsername}
        />
      </div>

      <div className="passwordWrapper">
        <InputField
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          value={password}
          onChange={setPassword}
        />
        <span
          className="toggle"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? "Hide" : "Show"}
        </span>
      </div>

      <div className="row">
        <div className="rememberRow">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
          />
          <span>Remember</span>
        </div>

        <span className="forgot">Forgot Password?</span>
      </div>

      <Button text="Sign in" onClick={handleLogin} />

      <p className="create" onClick={() => navigate("/signup")}>
        Create Account
      </p>

    </div>
  </div>
);
}