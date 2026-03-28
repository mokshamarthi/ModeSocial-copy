import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import {
  FaHeart,
  FaRegHeart,
  FaComment,
  FaPaperPlane,
  FaTimes,
  FaUserCircle,
  FaSearch,
  FaTimesCircle
} from "react-icons/fa";

import "./ReelPage.css";

function ReelsPage({ setPage, setSelectedUserUid /*, currentUserUid */ }) {
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [usersMap, setUsersMap] = useState({});
  const [search, setSearch] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);

  const [activePost, setActivePost] = useState(null);
  const [liked, setLiked] = useState(false);
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");

  const [recentSearches, setRecentSearches] = useState([]);
  const [searchFocused, setSearchFocused] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const postSnap = await getDocs(collection(db, "posts"));
      const userSnap = await getDocs(collection(db, "users"));

      const postsData = postSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      const usersData = userSnap.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      }));

      const map = {};
      usersData.forEach(u => {
        map[u.uid] = u;
      });

      setPosts(postsData);
      setUsers(usersData);
      setUsersMap(map);
    };

    fetchData();

    const saved = localStorage.getItem("recentSearches");
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch {
        setRecentSearches([]);
      }
    }
  }, []);

  useEffect(() => {
    if (!search.trim()) {
      setFilteredUsers([]);
      return;
    }

    setFilteredUsers(
  users.filter(user =>
    user.username?.toLowerCase().includes(search.toLowerCase()) &&
    user.username !== "Admin"   // 🔥 hides admin
  )
);
  }, [search, users]);

  const saveRecentSearch = username => {
    if (!username) return;
    setRecentSearches(prev => {
      const exists = prev.find(item => item === username);
      if (exists) return prev;
      const updated = [username, ...prev].slice(0, 10);
      localStorage.setItem("recentSearches", JSON.stringify(updated));
      return updated;
    });
  };

  const removeRecentSearch = username => {
    setRecentSearches(prev => {
      const updated = prev.filter(item => item !== username);
      localStorage.setItem("recentSearches", JSON.stringify(updated));
      return updated;
    });
  };

  // 🔹 When opening, initialize liked + comments from the post
  const openPostModal = post => {
    setActivePost(post);

    // if you store likes as array of userIds, you can use that:
    // const alreadyLiked = Array.isArray(post.likes)
    //   ? post.likes.includes(currentUserUid)
    //   : false;
    // setLiked(alreadyLiked);

    // for now, just use a boolean on the post if present; otherwise default false
    setLiked(Boolean(post.isLiked));

    setComments(
      Array.isArray(post.comments)
        ? post.comments
        : []
    );
    setText("");
  };

  // 🔹 Don’t reset liked/comments here – only close modal
  const closePostModal = () => {
    setActivePost(null);
  };

  const addComment = () => {
    if (!text.trim()) return;
    setComments(prev => [...prev, { user: "You", text }]);
    setText("");
  };

  const activeUser = activePost ? usersMap[activePost.uid] : null;

  return (
    <div className="explore-container">
      {/* SEARCH */}
      <div
        className="search-box"
        onFocus={() => setSearchFocused(true)}
        onBlur={() => setTimeout(() => setSearchFocused(false), 150)}
      >
        <FaSearch className="search-icon" />
        <input
          type="text"
          placeholder="Search users"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* RECENT SEARCHES */}
      {searchFocused && !search.trim() && recentSearches.length > 0 && (
        <div className="search-results">
          <div className="search-results-header">
            <span>Recent</span>
          </div>
          {recentSearches.map(name => (
            <div key={name} className="search-user">
              <span
                className="search-recent-name"
                onClick={() => {
                  setSearch(name);
                }}
              >
                {name}
              </span>
              <FaTimesCircle
                className="search-recent-remove"
                onClick={e => {
                  e.stopPropagation();
                  removeRecentSearch(name);
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* SEARCH RESULTS (LIVE) */}
      {search.trim() && filteredUsers.length > 0 && (
        <div className="search-results">
          {filteredUsers.map((user, i) => (
            <div
              key={i}
              className="search-user"
              onClick={() => {
                saveRecentSearch(user.username);
                setSelectedUserUid(user.uid);
                setPage("profile");
              }}
            >
              {user.profilePic ? (
  <img
    src={user.profilePic}
    alt=""
    className="search-avatar"
  />
) : (
  <FaUserCircle className="search-avatar-icon" />
)}
              <span>{user.username}</span>
            </div>
          ))}
        </div>
      )}

      {/* GRID */}
      <div className="explore-grid">
        {posts.map(post => (
          <div
            key={post.id}
            className="explore-item"
            onClick={() => openPostModal(post)}
          >
            <video src={post.videoUrl} muted />
          </div>
        ))}
      </div>

      {/* OVERLAY CARD FOR SELECTED POST */}
      {activePost && (
        <div className="reel-overlay" onClick={closePostModal}>
          <div
            className="reel-card"
            onClick={e => e.stopPropagation()}
          >
            {/* HEADER */}
            <div className="reel-card-header">
              <div className="reel-card-user">
                {activeUser?.profilePic ? (
                  <img
                    src={activeUser.profilePic}
                    alt=""
                    className="reel-card-avatar"
                  />
                ) : (
                  <FaUserCircle className="reel-card-avatar-icon" />
                )}
                <span
                  className="reel-card-username"
                  onClick={() => {
                    setSelectedUserUid(activeUser?.uid);
                    setPage("profile");
                  }}
                >
                  {activeUser?.username || "User"}
                </span>
              </div>

              <button
                className="reel-card-close"
                onClick={closePostModal}
              >
                <FaTimes />
              </button>
            </div>

            {/* MAIN */}
            <div className="reel-card-main">
              {/* VIDEO */}
              <div className="reel-card-video-wrap">
                <video
                  src={activePost.videoUrl}
                  autoPlay
                  loop
                  controls
                  className="reel-card-video"
                />
              </div>

              {/* INFO SIDE */}
              <div className="reel-card-info">
                {/* ACTIONS */}
                <div className="reel-card-actions">
                  <button
                    className="reel-card-action-btn"
                    onClick={() => setLiked(prev => !prev)}
                  >
                    {liked ? (
                      <FaHeart className="reel-card-action-icon liked" />
                    ) : (
                      <FaRegHeart className="reel-card-action-icon" />
                    )}
                  </button>

                  <button className="reel-card-action-btn">
                    <FaComment className="reel-card-action-icon" />
                  </button>

                  <button className="reel-card-action-btn">
                    <FaPaperPlane className="reel-card-action-icon" />
                  </button>
                </div>

                <p className="reel-card-likes">
                  {(activePost.likes?.length || 0) + (liked ? 1 : 0)} likes
                </p>

                {/* CAPTION */}
                <p className="reel-card-caption">
                  <span className="reel-card-caption-user">
                    {activeUser?.username || "User"}
                  </span>{" "}
                  {activePost.caption}
                </p>

                {/* COMMENTS */}
                <div className="reel-card-comments">
                  {comments.map((c, i) => (
                    <p key={i} className="reel-card-comment-line">
                      <span className="reel-card-comment-user">
                        {c.user}
                      </span>{" "}
                      {c.text}
                    </p>
                  ))}
                </div>

                {/* COMMENT INPUT */}
                <div className="reel-card-comment-row">
                  <input
                    placeholder="Add a comment..."
                    value={text}
                    onChange={e => setText(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && addComment()}
                    className="reel-card-comment-input"
                  />
                  <button
                    className="reel-card-comment-post"
                    onClick={addComment}
                  >
                    Post
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReelsPage;