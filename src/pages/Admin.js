import { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  query,
  where
} from "firebase/firestore";
import "./Admin.css";

function Admin() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReported();
  }, []);

  // ✅ Fetch ONLY reported posts
  const fetchReported = async () => {
  setLoading(true);
  try {
    const q = query(
      collection(db, "posts"),
      where("reported", "==", true)
    );
    const snapshot = await getDocs(q);
    const reportedPosts = snapshot.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .filter(post => post.reportedBy?.length > 0); // 👈 only posts with actual reports
    setPosts(reportedPosts);
  } catch (err) {
    console.error(err);
  }
  setLoading(false);
};

  // ✅ Delete with confirmation
  const deletePost = async (id) => {
    const confirmDelete = window.confirm("Delete this reel permanently?");
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "posts", id));
      fetchReported();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="admin-container">

      {/* Header */}
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <p>Manage reported reels</p>
      </div>

      {/* Stats */}
      <div className="stats">
        <div className="stat-card">
          <h2>{posts.length}</h2>
          <p>Reported Reels</p>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <p className="loading">Loading...</p>
      ) : posts.length === 0 ? (
        <p className="no-posts">No reported reels</p>
      ) : (
        <div className="posts-grid">
          {posts.map(post => (
            <div key={post.id} className="post-card">

              <video
                src={post.videoUrl}
                controls
                className="post-video"
              />

              <div className="post-content">
                <div className="top-row">
                  <h3>@{post.username}</h3>
                  <span className="badge">
                    🚨 {post.reportedBy?.length || 0}
                  </span>
                </div>

                <p className="caption">{post.caption}</p>

                <button
                  className="delete-btn"
                  onClick={() => deletePost(post.id)}
                >
                  Delete Reel
                </button>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Admin;