
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Mail, LockKeyhole, Eye, EyeOff, ArrowRight } from "lucide-react";

const API = "http://localhost:5000/api/auth";

export default function Signin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setNotice("");

    try {
     const response = await axios.post(`${API}/login`, form, {
  withCredentials: true,
});

if (response.data.user) {
  navigate("/dashboard", { replace: true });
} else {
  setNotice("Login successful, but user information was not returned.");
}
    } catch (error) {
      setNotice(
        error.response?.data?.message || "Unable to sign in. Please try again."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="welcome-panel">
        <Link to="/login" className="brand">
          Account<span className="brand-blue">Space</span>
        </Link>
        <div className="welcome-content">
          <span className="eyebrow">WELCOME BACK</span>
          <h1>Your account.<br /><span>Your way.</span></h1>
          <p>Sign in to manage your personal information in one secure place.</p>
        </div>
        <p className="panel-caption">Simple. Secure. Yours.</p>
      </section>

      <section className="form-panel">
        <div className="form-container">
          <div className="form-heading">
            <span className="form-eyebrow">WELCOME BACK</span>
            <h2>Sign in to continue</h2>
            <p>Enter your details to access your account.</p>
          </div>

          {notice && <p role="alert" className="account-notice">{notice}</p>}

          <form onSubmit={handleSubmit}>
            <label className="form-field">
              <span>Email address</span>
              <div className="input-box">
                <Mail size={18} />
                <input
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
            </label>

            <label className="form-field">
              <span>Password</span>
              <div className="input-box">
                <LockKeyhole size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  className="eye-button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>

            <button className="submit-button" type="submit" disabled={busy}>
              {busy ? "Signing in..." : "Sign in"}
              <ArrowRight size={18} />
            </button>
          </form>

          <div className="switch-text">
            Don't have an account? <Link to="/signup">Create an account</Link>
          </div>
        </div>
        <p className="bottom-caption">Made for a better account experience.</p>
      </section>
    </main>
  );
}
