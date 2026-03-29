import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, doc, getDoc, updateDoc } from "firebase/firestore";
import { FaUserCircle, FaHeart, FaRegHeart, FaComment, FaPaperPlane } from "react-icons/fa";
import "./Profile.css";

function Profile({ selectedUserUid }) {
  const [posts, setPosts] = useState([]);
  const [profilePic, setProfilePic] = useState(null);
  const [username, setUsername] = useState("");
  const [selectedPost, setSelectedPost] = useState(null);
  const [expandedComments, setExpandedComments] = useState(false);
  const [commentText, setCommentText] = useState("");

  const currentUid = selectedUserUid || localStorage.getItem("uid");
  const currentUsername = localStorage.getItem("username");

  useEffect(() => {
    const fetchData = async () => {
      const postSnap = await getDocs(collection(db, "posts"));
      const userDoc = await getDoc(doc(db, "users", currentUid));

      const allPosts = postSnap.docs.map(d => ({
        id: d.id,
        ...d.data()
      }));

      setPosts(allPosts.filter(p => p.uid === currentUid));

      if (userDoc.exists()) {
        const data = userDoc.data();
        setProfilePic(data.profilePic || null);
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

  const handleLike = async (postId) => {
    const post = posts.find(p => p.id === postId);
    let updatedLikes = post.likes || [];

    if (updatedLikes.includes(currentUsername)) {
      updatedLikes = updatedLikes.filter(l => l !== currentUsername);
    } else {
      updatedLikes.push(currentUsername);
    }

    await updateDoc(doc(db, "posts", postId), { likes: updatedLikes });
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: updatedLikes } : p));
    setSelectedPost(prev => ({ ...prev, likes: updatedLikes }));
  };

  const handleComment = async (postId, text) => {
    const post = posts.find(p => p.id === postId);
    const existing = post.comments?.find(c => c.user === currentUsername);
    let newComments;

    if (existing) {
      newComments = post.comments.filter(c => c.user !== currentUsername);
    } else {
      newComments = [...(post.comments || []), { user: currentUsername, text }];
    }

    await updateDoc(doc(db, "posts", postId), { comments: newComments });
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, comments: newComments } : p));
    setSelectedPost(prev => ({ ...prev, comments: newComments }));
    setCommentText("");
  };

  const handleShare = (post) => {
    navigator.clipboard.writeText(post.videoUrl);
    alert("Link copied! 🔗");
  };

  return (
    <div className="profile-container">

      {/* HEADER */}
      <div className="profile-header">
        <label className="profile-pic-wrapper">
          {profilePic ? (
            <img src={profilePic} alt="" className="profile-pic" />
          ) : (
            <FaUserCircle className="profile-pic-default" />
          )}
          {!selectedUserUid && (
            <input type="file" onChange={handleProfilePic} hidden />
          )}
        </label>

        <div className="profile-info">
          <h2>{username}</h2>
          <div className="profile-stats">
            <span><b>{posts.length}</b> posts</span>
          </div>
        </div>
      </div>

      {/* POSTS GRID */}
      <div className="profile-grid">
        {posts.map(post => (
          <div
            key={post.id}
            className="profile-grid-item"
            onClick={() => {
              setSelectedPost(post);
              setExpandedComments(false);
              setCommentText("");
            }}
          >
            <video src={post.videoUrl} muted />
            <div className="play-overlay">▶</div>
          </div>
        ))}
      </div>

      {/* VIDEO MODAL */}
      {selectedPost && (
        <div className="video-modal-overlay" onClick={() => {
          setSelectedPost(null);
          setExpandedComments(false);
        }}>
          <div className="video-modal" onClick={e => e.stopPropagation()}>

            {/* CLOSE */}
            <button className="modal-close" onClick={() => {
              setSelectedPost(null);
              setExpandedComments(false);
            }}>✕</button>

            {/* VIDEO */}
            <video
              src={selectedPost.videoUrl}
              controls
              autoPlay
              className="modal-video"
            />

            {/* CAPTION */}
            <p className="modal-caption">
              <b>{username}</b> {selectedPost.caption}
            </p>

            {/* ACTIONS */}
            <div className="modal-actions">
              <div className="modal-action-btn" onClick={() => handleLike(selectedPost.id)}>
                {selectedPost.likes?.includes(currentUsername) ? (
                  <FaHeart color="red" size={22} />
                ) : (
                  <FaRegHeart size={22} />
                )}
                <span>{selectedPost.likes?.length || 0}</span>
              </div>

              <div className="modal-action-btn" onClick={() => setExpandedComments(prev => !prev)}>
                <FaComment size={22} />
                <span>{selectedPost.comments?.length || 0}</span>
              </div>

              <div className="modal-action-btn" onClick={() => handleShare(selectedPost)}>
                <FaPaperPlane size={22} />
              </div>
            </div>

            {/* COMMENTS */}
            {expandedComments && (
              <div className="modal-comments">
                <div className="modal-comments-list">
                  {selectedPost.comments?.length === 0 && (
                    <p className="no-comments">No comments yet</p>
                  )}
                  {selectedPost.comments?.map((c, i) => (
                    <p key={i} className="modal-comment-item">
                      <b>{c.user}</b> {c.text}
                    </p>
                  ))}
                </div>

                <div className="modal-comment-input">
                  <input
                    placeholder="Add a comment..."
                    value={commentText}
                    onChange={e => setCommentText(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === "Enter" && commentText.trim()) {
                        handleComment(selectedPost.id, commentText.trim());
                      }
                    }}
                  />
                  <button onClick={() => {
                    if (commentText.trim()) handleComment(selectedPost.id, commentText.trim());
                  }}>Post</button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}

export default Profile;