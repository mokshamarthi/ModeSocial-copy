import { useState } from "react";
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import "./Login.css";
import Popup from "../components/Popup";

function Register({ setPage }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [age, setAge] = useState("");
  const [popup, setPopup] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password || !age) {
      setPopup({ message: "Please fill all fields ⚠️", type: "error" });
      return;
    }
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const numericAge = Number(age);
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        username: name.trim(),
        email,
        age: numericAge,
        role: numericAge < 13 ? "child" : "user",
        preferredMode: "study",
        profilePic: "",
        createdAt: new Date(),
      });
      localStorage.setItem("username", name.trim());
      localStorage.setItem("age", numericAge);
      localStorage.setItem("uid", user.uid);
      setPopup({ message: "User registered successfully ✅", type: "success" });
      setName("");
      setEmail("");
      setPassword("");
      setAge("");
    } catch (error) {
      setPopup({ message: error.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleRegister();
  };

  return (
    <div className="login-page">
      {/* Left Panel */}
      <div className="login-left">
        <div className="left-content">
          <div className="brand-mark">MS</div>
          <h2 className="left-headline">Join the<br />community.</h2>
          <p className="left-sub">
            Create your free account and start connecting with creators, trendsetters, and friends around the world.
          </p>
        </div>
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>

      {/* Right Panel */}
      <div className="login-right">
        <div className="login-card">
          <div className="card-header">
            <h1 className="logo">
              <span className="logo-mode">Mode</span>
              <span className="logo-social">Social</span>
            </h1>
            <p className="card-subtitle">Create your account</p>
          </div>

          <div className="form-group">
            <label className="field-label">Full Name</label>
            <div className="input-wrapper">
              <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <input
                type="text"
                className="field-input"
                placeholder="Your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="field-label">Email Address</label>
            <div className="input-wrapper">
              <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              <input
                type="email"
                className="field-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="field-label">Password</label>
            <div className="input-wrapper">
              <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <input
                type={showPassword ? "text" : "password"}
                className="field-input"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button
                className="eye-toggle"
                onClick={() => setShowPassword(!showPassword)}
                type="button"
                aria-label="Toggle password visibility"
              >
                {showPassword ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="field-label">Age</label>
            <div className="input-wrapper">
              <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <input
                type="number"
                className="field-input"
                placeholder="Your age"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                onKeyDown={handleKeyDown}
                min="1"
                max="120"
              />
            </div>
          </div>

          <button
            className={`btn-primary${loading ? " loading" : ""}`}
            onClick={handleRegister}
            disabled={loading}
            style={{ marginTop: "8px" }}
          >
            {loading ? (
              <span className="spinner" />
            ) : (
              <>
                Create Account
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </>
            )}
          </button>

          <div className="divider">
            <span>or</span>
          </div>

          <button className="btn-secondary" onClick={() => setPage("login")}>
            Already have an account? Sign in
          </button>

          <p className="terms-text">
            By registering, you agree to ModeSocial's{" "}
            <button className="terms-link">Terms of Service</button> and <button className="terms-link">Privacy Policy</button>.
          </p>
        </div>
      </div>

      {popup && (
        <Popup
          message={popup.message}
          type={popup.type}
          onClose={() => {
            setPopup(null);
            if (popup.type === "success") setPage("login");
          }}
        />
      )}
    </div>
  );
}

export default Register;