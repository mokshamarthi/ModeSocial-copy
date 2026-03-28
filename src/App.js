import { useState } from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ModeSelect from "./pages/ModeSelect";
import Dashboard from "./pages/Dashboard";
import CreatePost from "./pages/CreatePost";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import ReelsPage from "./pages/ReelsPage";

import "./App.css";

function App() {
  const [page, setPage] = useState("login");

  const [mode, setMode] = useState(
    localStorage.getItem("mode") || "all"
  );

  const [selectedUserUid, setSelectedUserUid] = useState(null);

  const isAdmin = localStorage.getItem("isAdmin") === "true";

  return (
    <div className="app-container">

      {/* Navbar */}
      {page !== "login" && page !== "register" && (
        <div className="navbar">
          <div className="navbar-left">
            <h2 className="logo">ModeSocial</h2>
          </div>

          <div className="navbar-center">
            <button
              onClick={() => {
                setMode("all");
                localStorage.setItem("mode", "all");
                setSelectedUserUid(null);
                setPage("dashboard");
              }}
            >
              Home
            </button>

            <button
              onClick={() => {
                setSelectedUserUid(null);
                setPage("reels");
              }}
            >
              Reels
            </button>

            <button onClick={() => setPage("mode")}>
              Select Mode
            </button>

            <button onClick={() => setPage("create")}>
              Create Post
            </button>

            <button
              onClick={() => {
                setSelectedUserUid(null);
                setPage("profile");
              }}
            >
              Profile
            </button>

            {isAdmin && (
              <button onClick={() => setPage("admin")}>
                Admin
              </button>
            )}
          </div>

          <div className="navbar-right">
            <button
              className="logout-btn"
              onClick={() => {
                localStorage.clear();
                setSelectedUserUid(null);
                setPage("login");
                setMode("all");
              }}
            >
              Logout
            </button>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="main-content">

        {/* ✅ FIXED: pass setPage directly */}
        {page === "login" && (
          <Login setPage={setPage} />
        )}

        {page === "register" && (
          <div className="auth-container">
            <Register setPage={setPage} />
            <button
              className="switch-btn"
              onClick={() => setPage("login")}
            >
              Already have an account? Login
            </button>
          </div>
        )}

        {page === "mode" && (
          <ModeSelect setMode={setMode} setPage={setPage} />
        )}

        {page === "dashboard" && (
          <Dashboard
            mode={mode}
            setPage={setPage}
            setSelectedUserUid={setSelectedUserUid}
          />
        )}

        {page === "reels" && (
          <ReelsPage
            mode={mode}
            setPage={setPage}
            setSelectedUserUid={setSelectedUserUid}
          />
        )}

        {page === "create" && (
          <div className="auth-container">
            <CreatePost setPage={setPage} />
          </div>
        )}

        {page === "profile" && (
          <Profile selectedUserUid={selectedUserUid} />
        )}

        {page === "admin" && <Admin />}

      </div>
    </div>
  );
}

export default App;