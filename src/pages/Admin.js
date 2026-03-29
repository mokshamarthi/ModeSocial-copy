import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";

function Admin() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetchReported();
  }, []);

  const fetchReported = async () => {
    const snapshot = await getDocs(collection(db, "posts"));
    const reportedPosts = snapshot.docs
      .map(d => ({          // ✅ renamed from doc → d
        id: d.id,
        ...d.data()
      }))
      .filter(post => post.reported === true);
    setPosts(reportedPosts);
  };

  const deletePost = async (id) => {
    try {
      await deleteDoc(doc(db, "posts", id));
      alert("Reel deleted ❌");
      fetchReported();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>🛠 Admin Panel</h2>
      {posts.length === 0 && <p>No reported reels 🎉</p>}
      {posts.map(post => (
        <div
          key={post.id}
          style={{
            marginBottom: "20px",
            border: "1px solid #ccc",
            padding: "10px",
            borderRadius: "8px"
          }}
        >
          <video src={post.videoUrl} width="300" controls />
          <p><b>{post.username}</b></p>
          <p>{post.caption}</p>
          <p>Reported by: {post.reportedBy?.length || 0} user(s)</p>
          <button
            onClick={() => deletePost(post.id)}
            style={{
              background: "red",
              color: "white",
              padding: "8px",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer"
            }}
          >
            ❌ Delete Reel
          </button>
        </div>
      ))}
    </div>
  );
}

export default Admin;