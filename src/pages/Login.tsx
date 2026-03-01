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

  const handleLogin = () => {
  if (!username || !password) {
    alert("Please fill in all fields.");
    return;
    
  }

  // Admin login
  if (username === "admin" && password === "1234") {
    localStorage.setItem("currentUser", "admin");
    localStorage.setItem("role", "admin");
    navigate("/dashboard");
    return;
  }

  const users = JSON.parse(localStorage.getItem("users") || "[]");

  const validUser = users.find(
    (user: any) =>
      user.email.trim() === username.trim() &&
      user.password === password
  );

  if (validUser) {
    localStorage.setItem("currentUser", validUser.email);
    localStorage.setItem("role", "user");
    navigate("/user");
  } else {
    alert("Invalid credentials");
  }
};

  return (
    <div className="container">
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
  );
}