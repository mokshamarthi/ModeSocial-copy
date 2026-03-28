import { useState } from "react";
import { auth, db } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import "./Login.css";
import Popup from "../components/Popup";

function Login({ setPage }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [popup, setPopup] = useState(null);

  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userDoc = await getDoc(doc(db, "users", user.uid));

      if (userDoc.exists()) {
        const data = userDoc.data();
        localStorage.setItem("username", data.username);
        localStorage.setItem("uid", user.uid);
        localStorage.setItem("age", data.age);
      }

      // Admin check
      if (email === "admin@gmail.com") {
        localStorage.setItem("isAdmin", "true");
      } else {
        localStorage.removeItem("isAdmin");
      }

      // Reset mode on login
      localStorage.setItem("mode", "all");

      setPopup({ message: "Login successful ✅", type: "success" });

    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="login-container d-flex justify-content-center align-items-center vh-100">
      <div className="login-card p-5 shadow-lg">

        <h1 className="login-logo">
          <span className="logo-mode">Mode</span>
          <span className="logo-social">Social</span>
        </h1>

        <p className="login-subtitle">Welcome to ModeSocial</p>

        <div className="mb-3">
          <input
            type="email"
            className="form-control rounded-pill px-3 py-2"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <input
            type="password"
            className="form-control rounded-pill px-3 py-2"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button
          className="btn w-100 mb-3 rounded-pill btn-login"
          onClick={handleLogin}
        >
          Login
        </button>

        {/* ✅ FIXED: go to register properly */}
        <button
          className="btn w-100 rounded-pill btn-register"
          onClick={() => setPage("register")}
        >
          New user? Register
        </button>

      </div>
      {popup && (
  <Popup
    message={popup.message}
    type={popup.type}
    onClose={() => {
      setPopup(null);
      if (popup.type === "success") {
        setPage("dashboard");
      }
    }}
  />
)}
    </div>
  );
}

export default Login;