import { useState } from "react";
import "./ModeSelect.css";

function ModeSelect({ setMode, setPage }) {
  const [selectedMode, setSelectedMode] = useState("all");

  const handleSelect = () => {
    setMode(selectedMode);
    localStorage.setItem("mode", selectedMode);
    setPage("dashboard");
  };

  return (
    <div className="mode-page">
      <div className="mode-card">
        <h2 className="mode-title">Choose your vibe</h2>
        <p className="mode-subtitle">
          Pick a mode to tune your feed.
        </p>

        <div className="mode-select-wrapper">
          <label className="mode-label" htmlFor="mode-select">
            Mode
          </label>
          <select
            id="mode-select"
            className="mode-select"
            value={selectedMode}
            onChange={e => setSelectedMode(e.target.value)}
          >
            <option value="all">All</option>
            <option value="study">Study</option>
            <option value="devotional">Devotional</option>
            <option value="kids">Kids</option>
            <option value="comedy">Comedy</option>
            <option value="fashion">Fashion</option>
            <option value="food">Food</option>
            <option value="travel">Travel</option>
          </select>
        </div>

        <button className="mode-button" onClick={handleSelect}>
          Continue
        </button>

        <p className="mode-hint">
          You can change this anytime from the Select Mode screen.
        </p>
      </div>
    </div>
  );
}

export default ModeSelect;