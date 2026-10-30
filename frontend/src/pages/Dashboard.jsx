
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Fingerprint,
  UserRound,
  Mail,
  Phone,
  FileText,
  Pencil,
  Save,
  X,
  LogOut,
  ShieldCheck,
} from "lucide-react";

const API = "http://localhost:5000/api/auth";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({ name: "", phone: "", bio: "" });
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    axios
      .get(`${API}/me`, { withCredentials: true })
      .then((res) => {
        setUser(res.data.user);
        setProfile({
          name: res.data.user.name || "",
          phone: res.data.user.phone || "",
          bio: res.data.user.bio || "",
        });
      })
      .catch(() => navigate("/login", { replace: true }))
      .finally(() => setLoading(false));
  }, [navigate]);

  async function saveProfile(e) {
    e.preventDefault();
    setBusy(true);
    setNotice("");

    try {
      const res = await axios.patch(`${API}/profile`, profile, {
        withCredentials: true,
      });
      setUser(res.data.user);
      setProfile({
        name: res.data.user.name || "",
        phone: res.data.user.phone || "",
        bio: res.data.user.bio || "",
      });
      setEditing(false);
      setNotice(res.data.message || "Profile updated successfully.");
    } catch (error) {
      setNotice(error.response?.data?.message || "Could not update profile.");
    } finally {
      setBusy(false);
    }
  }

  
async function logout() {
  setBusy(true);
  setNotice("");

  try {
    await axios.post(`${API}/logout`, {}, {
      withCredentials: true,
    });

    navigate("/login", { replace: true });
  } catch (error) {
    setNotice(error.response?.data?.message || "Logout failed.");
  } finally {
    setBusy(false);
  }
}


  if (loading) {
    return <main className="dashboard-page"><p>Loading your account...</p></main>;
  }

  if (!user) return null;

  return (
    <main className="dashboard-page">
      <nav className="dashboard-navbar">
        <Link to="/dashboard" className="brand dashboard-brand">
          <span className="brand-logo"><Fingerprint size={22} /></span>
          <span>Account<span className="brand-blue">Space</span></span>
        </Link>
        <button className="navbar-logout" onClick={logout} disabled={busy}>
          <LogOut size={17} />
          {busy ? "Please wait..." : "Logout"}
        </button>
      </nav>

      <section className="dashboard-content">
        <div className="dashboard-welcome">
          <span className="form-eyebrow">YOUR PERSONAL SPACE</span>
          <h1>Welcome, {user.name}!</h1>
          <p>View and manage your personal account information.</p>
        </div>

        {notice && <p role="status" className="account-notice">{notice}</p>}

        <section className="profile-card">
          <div className="profile-card-header">
            <div className="profile-avatar">
              {(user.name || "U").charAt(0).toUpperCase()}
            </div>
            <div className="profile-identity">
              <h2>{user.name}</h2>
              <p>{user.email}</p>
              <span className="account-status">
                <ShieldCheck size={14} /> Account active
              </span>
            </div>
            {!editing && (
              <button
                className="edit-profile-button"
                onClick={() => {
                  setProfile({
                    name: user.name || "",
                    phone: user.phone || "",
                    bio: user.bio || "",
                  });
                  setEditing(true);
                  setNotice("");
                }}
              >
                <Pencil size={16} /> Edit profile
              </button>
            )}
          </div>

          <div className="profile-card-divider" />

          <h3 className="profile-section-title">Personal information</h3>

          {!editing ? (
            <div className="profile-grid">
              <div className="profile-info-item">
                <span><UserRound size={16} /> Full name</span>
                <strong>{user.name || "Not added"}</strong>
              </div>
              <div className="profile-info-item">
                <span><Mail size={16} /> Email address</span>
                <strong>{user.email}</strong>
              </div>
              <div className="profile-info-item">
                <span><Phone size={16} /> Phone number</span>
                <strong>{user.phone || "Not added"}</strong>
              </div>
              <div className="profile-info-item">
                <span><FileText size={16} /> Bio</span>
                <strong>{user.bio || "No bio added yet"}</strong>
              </div>
            </div>
          ) : (
            <form className="profile-edit-form" onSubmit={saveProfile}>
              <label className="form-field">
                <span>Full name</span>
                <input
                  className="profile-input"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  maxLength={60}
                  required
                />
              </label>
              <label className="form-field">
                <span>Phone number</span>
                <input
                  className="profile-input"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  placeholder="Enter phone number"
                  maxLength={20}
                />
              </label>
              <label className="form-field bio-field">
                <span>Bio</span>
                <textarea
                  className="profile-input profile-textarea"
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  placeholder="A little about you"
                  maxLength={200}
                  rows={3}
                />
              </label>
              <div className="profile-edit-actions">
                <button className="submit-button" type="submit" disabled={busy}>
                  <Save size={17} /> {busy ? "Saving..." : "Save changes"}
                </button>
                <button
                  className="secondary-button"
                  type="button"
                  onClick={() => {
                    setEditing(false);
                    setNotice("");
                  }}
                >
                  <X size={17} /> Cancel
                </button>
              </div>
            </form>
          )}
        </section>

        <p className="dashboard-footer">
          <ShieldCheck size={15} /> Your information deserves to stay private.
        </p>
      </section>
    </main>
  );
}
