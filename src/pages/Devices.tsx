import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { logoutAndRedirect, verifyAuthToken } from "../utils/auth";
import "../styles/User.css";

interface Device {
  id?: number;
  name: string;
  location: string;
  status: string;
  ip_address?: string;
  mac_address?: string;
}

export default function Devices() {
  const navigate = useNavigate();
  const token = localStorage.getItem("authToken");

  const [devices, setDevices] = useState<Device[]>([]);
  const [discoveredDevices, setDiscoveredDevices] = useState<Device[]>([]);
  const [scanning, setScanning] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDevice, setNewDevice] = useState({ name: "", location: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initialize = async () => {
      if (!(await verifyAuthToken(navigate))) return;
      await fetchDevices();
    };
    initialize();
  }, [navigate]);

  const fetchDevices = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/devices/", {
        headers: { Authorization: `Token ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setDevices(data);
      } else {
        logoutAndRedirect(navigate, "Session expired or backend unavailable. Please login again.");
        return;
      }
    } catch (error) {
      console.error("Error fetching devices:", error);
      logoutAndRedirect(navigate, "Unable to connect to server. Please login again once the backend is available.");
      return;
    }
    setLoading(false);
  };

  const scanForDevices = async () => {
    setScanning(true);
    try {
      const response = await fetch("/api/devices/scan/", {
        headers: { Authorization: `Token ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setDiscoveredDevices(data);
      } else {
        alert("Failed to scan for devices");
      }
    } catch (error) {
      console.error("Error scanning devices:", error);
      alert("Unable to connect to server. Please check your connection.");
    }
    setScanning(false);
  };

  const addDevice = async (device: Device) => {
    try {
      const response = await fetch("/api/devices/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`
        },
        body: JSON.stringify(device)
      });
      if (response.ok) {
        const newDevice = await response.json();
        setDevices(prev => [...prev, newDevice]);
        setDiscoveredDevices(prev => prev.filter(d => d.name !== device.name));
        alert("Device added successfully!");
      } else {
        alert("Failed to add device");
      }
    } catch (error) {
      console.error("Error adding device:", error);
      alert("Unable to connect to server. Please check your connection.");
    }
  };

  const addManualDevice = async () => {
    if (!newDevice.name || !newDevice.location) {
      alert("Please fill in all fields");
      return;
    }
    await addDevice({ ...newDevice, status: "active" });
    setNewDevice({ name: "", location: "" });
    setShowAddForm(false);
  };

  return (
    <div className="dashboardWrapper">
      <div className="dashboardContainer">
      <div className="dashboardHeader">
        <h1>My Devices</h1>
        <div className="headerButtons">
          <button className="actionButton" onClick={scanForDevices} disabled={scanning}>
            {scanning ? "Scanning..." : "Scan WiFi Network"}
          </button>
          <button className="actionButton" onClick={() => setShowAddForm(!showAddForm)}>
            Add Device Manually
          </button>
          <button className="backButton" onClick={() => navigate("/user")}>
            Back to Dashboard
          </button>
        </div>
      </div>

      {loading && (
        <div className="loadingMessage">
          <p>Loading devices...</p>
        </div>
      )}

      {showAddForm && (
        <div className="addDeviceForm">
          <h3>Add New Device</h3>
          <input
            type="text"
            placeholder="Device Name"
            value={newDevice.name}
            onChange={(e) => setNewDevice(prev => ({ ...prev, name: e.target.value }))}
          />
          <input
            type="text"
            placeholder="Location"
            value={newDevice.location}
            onChange={(e) => setNewDevice(prev => ({ ...prev, location: e.target.value }))}
          />
          <button onClick={addManualDevice}>Add Device</button>
          <button onClick={() => setShowAddForm(false)}>Cancel</button>
        </div>
      )}

      <div className="devicesSection">
        <h2>Your Devices</h2>
        {devices.length === 0 ? (
          <p>No devices added yet.</p>
        ) : (
          <div className="devicesGrid">
            {devices.map((device) => (
              <div key={device.id} className="deviceCard">
                <h3>{device.name}</h3>
                <p>Location: {device.location}</p>
                <p>Status: {device.status}</p>
                {device.ip_address && <p>IP: {device.ip_address}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      {discoveredDevices.length > 0 && (
        <div className="devicesSection">
          <h2>Discovered Devices</h2>
          <div className="devicesGrid">
            {discoveredDevices.map((device) => (
              <div key={device.name} className="deviceCard discovered">
                <h3>{device.name}</h3>
                <p>Location: {device.location}</p>
                <p>IP: {device.ip_address}</p>
                <p>MAC: {device.mac_address}</p>
                <button onClick={() => addDevice({ ...device, status: "active" })}>
                  Add This Device
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  </div>
  );
}