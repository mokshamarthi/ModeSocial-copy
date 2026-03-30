import { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { collection, addDoc, doc, getDoc } from "firebase/firestore";
import "./CreatePost.css";

function CreatePost({ setPage }) {
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState("");
  const [mode, setMode] = useState("");
  const [name, setName] = useState("");
  const [minAge, setMinAge] = useState("");
  const [maxAge, setMaxAge] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const uid = localStorage.getItem("uid");
      if (!uid) return;

      const userDoc = await getDoc(doc(db, "users", uid));
      if (userDoc.exists()) {
        setName(userDoc.data().username || "");
      }
    };
    fetchUser();
  }, []);

  const handleUpload = async () => {
    if (!file) return alert("Select video ❌");
    if (!file.type.startsWith("video/"))
      return alert("Only videos allowed ❌");
    if (!name.trim()) return alert("Username missing ❌");

    try {
      setLoading(true);

      const user = auth.currentUser;
      if (!user) return alert("Login required ❌");

      const uid = user.uid;

      const userDoc = await getDoc(doc(db, "users", uid));
      const profilePic = userDoc.exists()
        ? userDoc.data().profilePic || ""
        : "";

      const data = new FormData();
      data.append("file", file);
      data.append("upload_preset", "modesocial");

      const res = await fetch(
        "https://api.cloudinary.com/v1_1/drdyvdsze/video/upload",
        {
          method: "POST",
          body: data,
        }
      );

      const result = await res.json();
      if (result.error) throw new Error(result.error.message);

      await addDoc(collection(db, "posts"), {
        videoUrl: result.secure_url,
        type: "video",
        caption,
        mode,
        minAge: minAge ? Number(minAge) : 0,
        maxAge: maxAge ? Number(maxAge) : 100,
        createdAt: new Date(),
        uid,
        username: name.trim(),
        profilePic,
        likes: [],
        comments: [],
        reports: 0,
        reported: false,
      });

      alert("Posted 🎬");
      setPage("dashboard");
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="insta-card horizontal">

        {/* LEFT - VIDEO */}
        <div className="media-section">
          <div className="preview-box">
            {file ? (
              <video src={URL.createObjectURL(file)} controls />
            ) : (
              <span>No video selected</span>
            )}
          </div>
        </div>

        {/* RIGHT - FORM */}
        <div className="form-section">

          {/* FORM FIELDS */}
          <div className="form-fields">
            <textarea
              placeholder="Write a caption..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="caption-box"
            />

            <select
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              className="input"
            >
              <option value="">Select category</option>
              <option value="study">Study</option>
              <option value="devotional">Devotional</option>
              <option value="comedy">Comedy</option>
              <option value="fashion">Fashion</option>
              <option value="food">Food</option>
              <option value="travel">Travel</option>
            </select>

            <div className="age-row">
              <input
                type="number"
                placeholder="Min age"
                value={minAge}
                onChange={(e) => setMinAge(e.target.value)}
              />
              <input
                type="number"
                placeholder="Max age"
                value={maxAge}
                onChange={(e) => setMaxAge(e.target.value)}
              />
            </div>
          </div>

          {/* 🔥 BUTTON ROW (FIXED ALIGNMENT) */}
          <div className="bottom-row">
            <label className="upload-btn">
              Choose Video
              <input
                type="file"
                accept="video/*"
                hidden
                onChange={(e) => setFile(e.target.files[0])}
              />
            </label>

            <button
              onClick={handleUpload}
              disabled={loading}
              className="post-btn"
            >
              {loading ? "Posting..." : "Share"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default CreatePost;