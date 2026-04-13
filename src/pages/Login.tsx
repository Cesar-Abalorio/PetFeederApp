import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css";
import logo from "../assets/logo.jpg";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

      const response = await fetch(`${apiUrl}/auth/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("authToken", data.token);
        localStorage.setItem("currentUser", data.username);
        localStorage.setItem("role", data.role || "user");
        navigate("/user");
      } else {
        setError(data.error || "Login failed, please try again.");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Unable to connect to server. Please check your connection and try again.");
    }
  };

  return (
    <div className="container">
      <div className="loginCard">
        <img src={logo} alt="Logo" className="logo" />

        <h3 className="title">Login to Your Account</h3>

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
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p className="error">{error}</p>}

        <button className="button" onClick={handleLogin}>
          Login
        </button>

        <p className="link" onClick={() => navigate("/signup")}>
          Don't have an account? Sign up
        </p>
      </div>
    </div>
  );
}