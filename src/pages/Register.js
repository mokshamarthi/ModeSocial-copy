import { useState } from "react";
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import "./Login.css"; // ✅ reuse SAME CSS
import Popup from "../components/Popup";

function Register({ setPage }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [age, setAge] = useState("");
  const [popup, setPopup] = useState(null);

  const handleRegister = async () => {
    if (!name || !email || !password || !age) {
      setPopup({ message: "Please fill all fields ⚠️", type: "error" });
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

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
        createdAt: new Date()
      });

      localStorage.setItem("username", name.trim());
      localStorage.setItem("age", numericAge);
      localStorage.setItem("uid", user.uid);

      setPopup({ message: "User registered successfully ✅", type: "success" });

      setName("");
      setEmail("");
      setPassword("");
      setAge("");

      //setPage("login");

    } catch (error) {
      setPopup({ message: error.message, type: "error" });
    }
  };

  return (
    <div className="login-container d-flex justify-content-center align-items-center vh-100">
      <div className="login-card p-5 shadow-lg animate-fade-in">

        <h1 className="login-logo">
          <span className="logo-mode">Mode</span>
          <span className="logo-social">Social</span>
        </h1>

        <p className="login-subtitle">Create your account</p>

        <div className="mb-3">
          <input
            type="text"
            className="form-control rounded-pill px-3 py-2 input-field"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <input
            type="email"
            className="form-control rounded-pill px-3 py-2 input-field"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <input
            type="password"
            className="form-control rounded-pill px-3 py-2 input-field"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <input
            type="number"
            className="form-control rounded-pill px-3 py-2 input-field"
            placeholder="Age"
            value={age}
            onChange={(e) => setAge(e.target.value)}
          />
        </div>

        <button
          className="btn w-100 mb-3 rounded-pill btn-login animate-button"
          onClick={handleRegister}
        >
          Register
        </button>

        <button
          className="btn w-100 rounded-pill btn-register"
          onClick={() => setPage("login")}
        >
          Already have an account? Login
        </button>

      </div>
      {popup && (
  <Popup
    message={popup.message}
    type={popup.type}
    onClose={() => {
      setPopup(null);
      if (popup.type === "success") {
        setPage("login");
      }
    }}
  />
)}
    </div>
  );
}

export default Register;