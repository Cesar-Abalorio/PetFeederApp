import { useState } from "react";
import "./login.css";
import logo from "./assets/logo.jpg";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);

  const handleLogin = () => {
    console.log(username, password, remember);
  };

  return (
    <div className="container">
      <img src={logo} alt="Logo" className="logo" />

      <h3 className="title">Log in to your Account</h3>

      <input
        className="input"
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <input
        className="input"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <div className="row">
        <div className="rememberRow">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
          />
          <span className="rememberText">Remember</span>
        </div>

        <span className="forgot">Forgot Password?</span>
      </div>

      <button className="button" onClick={handleLogin}>
        Sign in
      </button>

      <p className="create">Create Account</p>
    </div>
  );
}