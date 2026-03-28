import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, doc, getDoc, updateDoc } from "firebase/firestore";
import "./Profile.css";

function Profile({ selectedUserUid }) {
  const [posts, setPosts] = useState([]);
  const [profilePic, setProfilePic] = useState(null);
  const [username, setUsername] = useState("");

  const currentUid = selectedUserUid || localStorage.getItem("uid");

  useEffect(() => {
    const fetchData = async () => {
      const postSnap = await getDocs(collection(db, "posts"));
      const userDoc = await getDoc(doc(db, "users", currentUid));

      const allPosts = postSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setPosts(allPosts.filter(p => p.uid === currentUid));

      if (userDoc.exists()) {
        const data = userDoc.data();
        setProfilePic(data.profilePic);
        setUsername(data.username);
      }
    };

    fetchData();
  }, [currentUid]);

  const handleProfilePic = async (e) => {
    if (selectedUserUid) return;

    const file = e.target.files[0];
    if (!file) return;

    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", "profile");

    const res = await fetch(
      "https://api.cloudinary.com/v1_1/drdyvdsze/image/upload",
      { method: "POST", body: data }
    );

    const result = await res.json();

    await updateDoc(doc(db, "users", currentUid), {
      profilePic: result.secure_url
    });

    setProfilePic(result.secure_url);
  };

  return (
    <div className="profile-container">

      {/* HEADER */}
      <div className="profile-header">
        <label className="profile-pic-wrapper">
          <img
            src={profilePic || "/placeholder-avatar.png"}
            alt=""
            className="profile-pic"
          />
          {!selectedUserUid && (
            <input type="file" onChange={handleProfilePic} hidden />
          )}
        </label>

        <div className="profile-info">
          <h2>{username}</h2>
          <div className="profile-stats">
            <span><b>{posts.length}</b> posts</span>
            <span><b>0</b> followers</span>
            <span><b>0</b> following</span>
          </div>
        </div>
      </div>

      {/* POSTS */}
      <div className="profile-grid">
        {posts.map(post => (
          <video
            key={post.id}
            src={post.videoUrl}
            muted
          />
        ))}
      </div>
    </div>
  );
}

export default Profile;