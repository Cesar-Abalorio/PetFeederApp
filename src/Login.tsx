import { useState } from "react";
import "./Login.css";
import logo from "./assets/logo.jpg";
import InputField from "../components/InputField";
import Button from "../components/Button";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false); 

  const handleLogin = () => {
    if (!username || !password) {
      alert("Please fill in all fields.");
      return;
    }

    alert("Login Successful!");
  };

  return (
    <div className="container">
      <img src={logo} alt="Logo" className="logo" />

      <h3 className="title">Log in to your Account</h3>
      
      <div className="usernameWrapper">
        <InputField
          placeholder="Username"
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

      <p className="create">Create Account</p>
    </div>
  );
}