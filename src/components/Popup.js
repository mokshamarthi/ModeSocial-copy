import "./Popup.css";

function Popup({ message, type, onClose }) {
  return (
    <div className="popup-overlay">
      <div className={`popup-box ${type}`}>
        <p>{message}</p>
        <button onClick={onClose}>OK</button>
      </div>
    </div>
  );
}

export default Popup;