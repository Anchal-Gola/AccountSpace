
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { UserRound, Mail, LockKeyhole, Eye, EyeOff, ArrowRight } from "lucide-react";

const API = "http://localhost:5000/api/auth";

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setNotice("");

    try {
      await axios.post(`${API}/register`, form, {
        withCredentials: true,
      });
      navigate("/login", { replace: true });
    } catch (error) {
      setNotice(
        error.response?.data?.message || "Unable to create account. Please try again."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="welcome-panel">
        <Link to="/signup" className="brand">
          Account<span className="brand-blue">Space</span>
        </Link>
        <div className="welcome-content">
          <span className="eyebrow">GET STARTED</span>
          <h1>A fresh start.<br /><span>Your own space.</span></h1>
          <p>Create your account and keep your personal information organized in one place.</p>
        </div>
        <p className="panel-caption">Simple. Secure. Yours.</p>
      </section>

      <section className="form-panel">
        <div className="form-container">
          <div className="form-heading">
            <span className="form-eyebrow">CREATE YOUR ACCOUNT</span>
            <h2>Join AccountSpace</h2>
            <p>A few details and you're good to go.</p>
          </div>

          {notice && <p role="alert" className="account-notice">{notice}</p>}

          <form onSubmit={handleSubmit}>
            <label className="form-field">
              <span>Full name</span>
              <div className="input-box">
                <UserRound size={18} />
                <input
                  type="text"
                  placeholder="Enter your full name"
                  autoComplete="name"
                  maxLength={60}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
            </label>

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
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                  minLength={8}
                  maxLength={128}
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
              {busy ? "Creating account..." : "Create my account"}
              <ArrowRight size={18} />
            </button>
          </form>

          <div className="switch-text">
            Already have an account? <Link to="/login">Sign in</Link>
          </div>
        </div>
        <p className="bottom-caption">Made for a better account experience.</p>
      </section>
    </main>
  );
}
