
import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";
import Signup from "./pages/Signup";
import Signin from "./pages/Signin";
import Dashboard from "./pages/Dashboard";
import "./App.css";

const API = "http://localhost:5000/api/auth";

function AppRoutes() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    axios
      .get(`${API}/me`, { withCredentials: true })
      .then((res) => setUser(res.data.user))
      .catch(() => setUser(null))
      .finally(() => setChecking(false));
  }, []);

  if (checking) {
    return (
      <main className="auth-page">
        <section className="form-panel">
          <h2>Loading your account...</h2>
        </section>
      </main>
    );
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          <Navigate
            to={user ? "/dashboard" : "/signup"}
            replace
          />
        }
      />

      <Route path="/signup" element={<Signup />} />

      <Route path="/login" element={<Signin />} />

      <Route path="/dashboard" element={<Dashboard />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return <AppRoutes />;
}
