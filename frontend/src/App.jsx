
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  Fingerprint,
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  UserRound,
  LogOut,
  Save,
  Pencil,
  X,
} from "lucide-react";
import "./App.css";

const API = "http://localhost:5000/api/auth";

export default function App() {
  const [isSignup, setIsSignup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [profile, setProfile] = useState({ name: "", phone: "", bio: "" });

  useEffect(() => {
    axios
      .get(`${API}/me`, { withCredentials: true })
      .then((res) => setUser(res.data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  function updateProfileForm(currentUser) {
    setProfile({
      name: currentUser.name || "",
      phone: currentUser.phone || "",
      bio: currentUser.bio || "",
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setNotice("");
    setBusy(true);

    try {
      const endpoint = isSignup ? "/register" : "/login";
      const response = await axios.post(
        `${API}${endpoint}`,
        {
          ...(isSignup && { name: form.name }),
          email: form.email,
          password: form.password,
        },
        { withCredentials: true }
      );

      setUser(response.data.user);
      updateProfileForm(response.data.user);
      setNotice(response.data.message || "Success!");
      setForm({ name: "", email: "", password: "" });
    } catch (error) {
      setNotice(
        error.response?.data?.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setBusy(false);
    }
  }

  async function saveProfile(e) {
    e.preventDefault();
    setBusy(true);
    setNotice("");

    try {
      const response = await axios.patch(`${API}/profile`, profile, {
        withCredentials: true,
      });
      setUser(response.data.user);
      updateProfileForm(response.data.user);
      setEditing(false);
      setNotice(response.data.message || "Profile updated successfully.");
    } catch (error) {
      setNotice(error.response?.data?.message || "Could not update profile.");
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    setBusy(true);
    try {
      await axios.post(`${API}/logout`, {}, { withCredentials: true });
      setUser(null);
      setEditing(false);
      setNotice("You have logged out successfully.");
    } catch (error) {
      setNotice(error.response?.data?.message || "Logout failed.");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return <main className="auth-page"><section className="form-panel"><div className="form-container"><h2>Loading your account...</h2></div></section></main>;
  }

  if (user) {
    return (
      <main className="auth-page">
        <section className="welcome-panel">
          <Link to="/" className="brand">
            <span className="brand-logo"><Fingerprint size={24} /></span>
            <span>Account<span className="brand-blue">Space</span></span>
          </Link>
          <div className="welcome-content">
            <span className="eyebrow"><Sparkles size={15} /> YOUR SPACE, YOUR CONTROL</span>
            <h1>Your account.<br /><span>Your way.</span></h1>
            <p>Manage your personal details in one simple, secure place.</p>
            <div className="security-card">
              <span className="security-icon"><ShieldCheck size={22} /></span>
              <div><strong>Privacy comes first</strong><p>Your password is never shown here.</p></div>
            </div>
          </div>
          <p className="panel-caption">Simple. Secure. Yours.</p>
          <div className="decor-circle circle-one" />
          <div className="decor-circle circle-two" />
        </section>

        <section className="form-panel">
          <div className="form-container dashboard-container">
            <div className="mobile-brand">
              <Fingerprint size={25} />
              <strong>Account<span className="brand-blue">Space</span></strong>
            </div>

            <div className="form-heading">
              <span className="form-icon"><UserRound size={24} /></span>
              <span className="form-eyebrow">YOUR DASHBOARD</span>
              <h2>Hello, {user.name}!</h2>
              <p>You are currently signed in.</p>
            </div>

            {notice && <p role="status" className="account-notice">{notice}</p>}

            {!editing ? (
              <div className="profile-details">
                <div className="profile-avatar">{(user.name || "U").charAt(0).toUpperCase()}</div>
                <div className="profile-row"><span>Full name</span><strong>{user.name}</strong></div>
                <div className="profile-row"><span>Email address</span><strong>{user.email}</strong></div>
                <div className="profile-row"><span>Phone number</span><strong>{user.phone || "Not added"}</strong></div>
                <div className="profile-row"><span>Bio</span><strong>{user.bio || "No bio added yet"}</strong></div>
                <button className="submit-button" type="button" onClick={() => { updateProfileForm(user); setEditing(true); }}>
                  <Pencil size={17} /> Edit profile
                </button>
              </div>
            ) : (
              <form onSubmit={saveProfile}>
                <label className="form-field">
                  <span>Full name</span>
                  <div className="input-box"><UserRound size={18} /><input required maxLength={60} value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} /></div>
                </label>
                <label className="form-field">
                  <span>Phone number</span>
                  <div className="input-box"><Mail size={18} /><input maxLength={20} value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} placeholder="Enter phone number" /></div>
                </label>
                <label className="form-field">
                  <span>Bio</span>
                  <div className="input-box"><UserRound size={18} /><input maxLength={200} value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} placeholder="A little about you" /></div>
                </label>
                <button className="submit-button" type="submit" disabled={busy}>
                  <Save size={17} /> {busy ? "Saving..." : "Save changes"}
                </button>
                <button className="secondary-button" type="button" onClick={() => { setEditing(false); setNotice(""); }}>
                  <X size={17} /> Cancel
                </button>
              </form>
            )}

            <button className="secondary-button" type="button" onClick={logout} disabled={busy}>
              <LogOut size={17} /> {busy ? "Please wait..." : "Log out"}
            </button>

            <p className="secure-caption"><LockKeyhole size={13} /> Your information deserves to stay private.</p>
          </div>
          <p className="bottom-caption">Made for a better account experience.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="auth-page">
      <section className="welcome-panel">
        <Link to="/" className="brand">
          <span className="brand-logo"><Fingerprint size={24} /></span>
          <span>Account<span className="brand-blue">Space</span></span>
        </Link>
        <div className="welcome-content">
          <span className="eyebrow"><Sparkles size={15} /> YOUR SPACE, YOUR CONTROL</span>
          <h1>Your account.<br /><span>Your way.</span></h1>
          <p>A simpler way to manage your account, protect your information, and keep everything up to date.</p>
          <div className="security-card">
            <span className="security-icon"><ShieldCheck size={22} /></span>
            <div><strong>Privacy comes first</strong><p>Your space. Your information. Your control.</p></div>
          </div>
        </div>
        <p className="panel-caption">Simple. Secure. Yours.</p>
        <div className="decor-circle circle-one" />
        <div className="decor-circle circle-two" />
      </section>

      <section className="form-panel">
        <div className="form-container">
          <div className="mobile-brand"><Fingerprint size={25} /><strong>Account<span className="brand-blue">Space</span></strong></div>
          <div className="form-heading">
            <span className="form-icon">{isSignup ? <UserRound size={24} /> : <LockKeyhole size={24} />}</span>
            <span className="form-eyebrow">{isSignup ? "GET STARTED" : "WELCOME BACK"}</span>
            <h2>{isSignup ? "Create your account" : "Sign in to continue"}</h2>
            <p>{isSignup ? "A few details and you're good to go." : "Enter your details to access your account."}</p>
          </div>

          {notice && <p role="status" className="account-notice">{notice}</p>}

          <form onSubmit={handleSubmit}>
            {isSignup && (
              <label className="form-field">
                <span>Full name</span>
                <div className="input-box"><UserRound size={18} /><input type="text" placeholder="Enter your full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoComplete="name" maxLength={60} required /></div>
              </label>
            )}
            <label className="form-field">
              <span>Email address</span>
              <div className="input-box"><Mail size={18} /><input type="email" placeholder="you@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} autoComplete="email" required /></div>
            </label>
            <label className="form-field">
              <span>Password</span>
              <div className="input-box">
                <LockKeyhole size={18} />
                <input type={showPassword ? "text" : "password"} placeholder="Enter your password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} autoComplete={isSignup ? "new-password" : "current-password"} minLength={8} maxLength={128} required />
                <button type="button" className="eye-button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
              </div>
            </label>
            {!isSignup && <div className="forgot-row"><span>Keep your account secure</span><ShieldCheck size={15} /></div>}
            <button type="submit" className="submit-button" disabled={busy}>
              {busy ? "Please wait..." : isSignup ? "Create my account" : "Sign in to my account"} <ArrowRight size={18} />
            </button>
          </form>

          <div className="switch-text">
            {isSignup ? "Already have an account?" : "New here?"}
            <button type="button" onClick={() => { setIsSignup(!isSignup); setShowPassword(false); setNotice(""); }}>
              {isSignup ? "Sign in" : "Create an account"}
            </button>
          </div>
          <p className="secure-caption"><LockKeyhole size={13} /> Your information deserves to stay private.</p>
        </div>
        <p className="bottom-caption">Made for a better account experience.</p>
      </section>
    </main>
  );
}
