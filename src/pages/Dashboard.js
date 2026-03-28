import { useEffect, useState, useRef, useCallback } from "react";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  arrayUnion,
  setDoc,
  deleteDoc
} from "firebase/firestore";

import {
  FaHeart,
  FaRegHeart,
  FaComment,
  FaPaperPlane,
  FaEllipsisH,
  FaUserCircle,
  FaPlus,
  FaTimes
} from "react-icons/fa";

import "./Dashboard.css";

function Dashboard({ setPage, setSelectedUserUid, mode }) {
  const [posts, setPosts] = useState([]);
  const [usersMap, setUsersMap] = useState({});
  const [stories, setStories] = useState([]);
  const [viewStoryIndex, setViewStoryIndex] = useState(null);
  const [currentUserViewedStories, setCurrentUserViewedStories] = useState([]);
  const [copiedPostId, setCopiedPostId] = useState(null);

  const videoRefs = useRef([]);

  const username = localStorage.getItem("username");
  const uid = localStorage.getItem("uid");

  const [expandedComments, setExpandedComments] = useState({});
  const [showReportMenu, setShowReportMenu] = useState({});

  // 🔥 FETCH USERS + current user's viewed stories
  useEffect(() => {
    const fetchUsers = async () => {
      const snap = await getDocs(collection(db, "users"));
      const map = {};
      snap.docs.forEach(d => (map[d.id] = d.data()));
      setUsersMap(map);

      if (uid && map[uid]?.viewedStories) {
        setCurrentUserViewedStories(map[uid].viewedStories);
      }
    };
    fetchUsers();
  }, [uid]);

  // 🔥 FETCH POSTS (HIDE REPORTED BY USER + FILTER BY MODE)
  useEffect(() => {
    const fetchPosts = async () => {
      const snap = await getDocs(collection(db, "posts"));
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));

      const visible = data.filter(post => {
        return !(post.hiddenFor?.includes(uid));
      });

      const filteredByMode =
        mode === "all"
          ? visible
          : visible.filter(post => {
              if (!post.mode) return true;
              return post.mode === mode;
            });

      setPosts(filteredByMode);
    };
    fetchPosts();
  }, [uid, mode]);

  // 🔥 FETCH STORIES (24h)
  useEffect(() => {
    const fetchStories = async () => {
      const snap = await getDocs(collection(db, "stories"));
      const now = Date.now();

      const validStories = [];

      for (let d of snap.docs) {
        const story = d.data();
        if (now - story.createdAt > 24 * 60 * 60 * 1000) {
          await deleteDoc(doc(db, "stories", d.id));
        } else {
          validStories.push({ id: d.id, ...story });
        }
      }

      validStories.sort((a, b) => a.createdAt - b.createdAt);
      setStories(validStories);
    };

    fetchStories();
  }, []);

  // 🎬 AUTO PLAY for feed videos
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(e => {
          const v = e.target;
          e.isIntersecting ? v.play().catch(() => {}) : v.pause();
        });
      },
      { threshold: 0.7 }
    );

    videoRefs.current.forEach(v => v && observer.observe(v));
    return () => observer.disconnect();
  }, [posts]);

  // ❤️ LIKE / UNLIKE
  const handleLike = async postId => {
    const post = posts.find(p => p.id === postId);
    let updatedLikes = post.likes || [];

    if (updatedLikes.includes(username)) {
      updatedLikes = updatedLikes.filter(l => l !== username);
    } else {
      updatedLikes.push(username);
    }

    setPosts(prev =>
      prev.map(p => (p.id === postId ? { ...p, likes: updatedLikes } : p))
    );

    await updateDoc(doc(db, "posts", postId), {
      likes: updatedLikes
    });
  };

  // 💬 COMMENT (ONE PER USER)
  const handleComment = async (postId, text) => {
    const post = posts.find(p => p.id === postId);

    const existing = post.comments?.find(c => c.user === username);
    let newComments;

    if (existing) {
      newComments = post.comments.filter(c => c.user !== username);
    } else {
      newComments = [...(post.comments || []), { user: username, text }];
    }

    await updateDoc(doc(db, "posts", postId), {
      comments: newComments
    });

    setPosts(prev =>
      prev.map(p => (p.id === postId ? { ...p, comments: newComments } : p))
    );
  };

  // 🚨 REPORT (HIDE POST FOR USER)
  const handleReport = async postId => {
    await updateDoc(doc(db, "posts", postId), {
      hiddenFor: arrayUnion(uid)
    });

    setPosts(prev => prev.filter(p => p.id !== postId));
  };

  // 🔗 SHARE — copies Cloudinary videoUrl + shows centered popup
  const handleShare = postId => {
    const post = posts.find(p => p.id === postId);
    const link = post?.videoUrl;
    if (!link) return;

    navigator.clipboard.writeText(link).then(() => {
      setCopiedPostId(postId);
      setTimeout(() => setCopiedPostId(null), 2500);
    });
  };

  // 📸 ADD STORY
  const handleAddStory = async e => {
    const file = e.target.files[0];
    if (!file) return;

    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", "profile");

    const res = await fetch(
      "https://api.cloudinary.com/v1_1/drdyvdsze/upload",
      {
        method: "POST",
        body: data
      }
    );

    const result = await res.json();

    await setDoc(doc(db, "stories", uid), {
      uid,
      username,
      url: result.secure_url,
      createdAt: Date.now()
    });

    alert("Story added ✅");
  };

  // ❌ DELETE STORY (from viewer)
  const handleDeleteStory = async () => {
    if (!uid) return;
    await deleteDoc(doc(db, "stories", uid));
    setStories(prev => prev.filter(s => s.uid !== uid));
    setViewStoryIndex(null);
  };

  // mark a story as viewed for current user
  const markStoryViewed = useCallback(async (storyOwnerUid) => {
  if (!uid || !storyOwnerUid) return;
  if (currentUserViewedStories.includes(storyOwnerUid)) return;

  setCurrentUserViewedStories(prev => [...prev, storyOwnerUid]);

  try {
    await updateDoc(doc(db, "users", uid), {
      viewedStories: arrayUnion(storyOwnerUid)
    });
  } catch (e) {
    // ignore
  }
}, [uid, currentUserViewedStories]);

  // open story viewer on avatar click
  const openStoryViewer = idx => {
    setViewStoryIndex(idx);
    const story = stories[idx];
    if (story) {
      markStoryViewed(story.uid);
    }
  };

  // auto-advance story
  const goToNextStory = useCallback(() => {
  if (viewStoryIndex == null) return;

  const nextIndex = viewStoryIndex + 1;

  if (nextIndex < stories.length) {
    setViewStoryIndex(nextIndex);
    const story = stories[nextIndex];
    if (story) markStoryViewed(story.uid);
  } else {
    setViewStoryIndex(null);
  }
}, [viewStoryIndex, stories, markStoryViewed]);

  const closeStoryViewer = () => {
    setViewStoryIndex(null);
  };

  // auto-advance after 5s
  useEffect(() => {
  if (viewStoryIndex == null) return;

  const timer = setTimeout(() => {
    goToNextStory();
  }, 5000);

  return () => clearTimeout(timer);
}, [viewStoryIndex, goToNextStory]);

  const currentStory =
    viewStoryIndex != null ? stories[viewStoryIndex] : null;

  return (
    <div className="dashboard-container">

      {/* CENTERED COPY POPUP */}
      {copiedPostId && (
        <div className="copy-popup-overlay">
          <div className="copy-popup">
            <span className="copy-popup-icon">🔗</span>
            <p className="copy-popup-title">Link Copied!</p>
            <p className="copy-popup-sub">Video link copied to clipboard</p>
          </div>
        </div>
      )}

      {/* STORIES */}
      <div className="stories-bar">
        {/* YOUR STORY */}
        <div className="story-card">
          <div
            className="story-profile-wrapper"
            onClick={() => {
              const myIndex = stories.findIndex(s => s.uid === uid);
              if (myIndex !== -1) openStoryViewer(myIndex);
            }}
          >
            <div className="story-profile-ring story-own-ring">
              <div className="story-profile-inner">
                {usersMap[uid]?.profilePic ? (
                  <img
                    src={usersMap[uid].profilePic}
                    alt=""
                    className="story-img"
                  />
                ) : (
                  <FaUserCircle className="story-default-icon" />
                )}
              </div>
            </div>

            {/* SMALL + BUTTON */}
            <label className="add-story-badge">
              <FaPlus />
              <input type="file" hidden onChange={handleAddStory} />
            </label>
          </div>

          <p className="story-username">Your story</p>
        </div>

        {/* OTHER STORIES */}
        {stories
          .filter(s => s.uid !== uid)
          .map(s => {
            const globalIndex = stories.findIndex(st => st.id === s.id);
            const isViewed = currentUserViewedStories.includes(s.uid);
            const ownerProfile = usersMap[s.uid];

            return (
              <div
                key={s.id}
                className="story-card"
                onClick={() => openStoryViewer(globalIndex)}
              >
                <div
                  className={
                    "story-profile-ring " +
                    (isViewed
                      ? "story-ring-viewed"
                      : "story-ring-unviewed")
                  }
                >
                  <div className="story-profile-inner">
                    {ownerProfile?.profilePic ? (
                      <img
                        src={ownerProfile.profilePic}
                        alt=""
                        className="story-img"
                      />
                    ) : (
                      <FaUserCircle className="story-default-icon" />
                    )}
                  </div>
                </div>

                <p className="story-username">{s.username}</p>
              </div>
            );
          })}
      </div>

      {/* POSTS */}
      {posts.map((post, i) => (
        <div className="post-card" key={post.id}>
          {/* HEADER */}
          <div className="post-header">
            <div className="header-left">
              <div className="post-header-profile">
                {usersMap[post.uid]?.profilePic ? (
                  <img
                    src={usersMap[post.uid]?.profilePic}
                    alt=""
                    className="post-profile-pic"
                  />
                ) : (
                  <FaUserCircle className="post-profile-icon" />
                )}
              </div>
              <span className="post-username">
                {usersMap[post.uid]?.username}
              </span>
            </div>

            <div className="post-header-right">
              <FaEllipsisH
                className="dots"
                onClick={() =>
                  setShowReportMenu(prev => ({
                    ...prev,
                    [post.id]: !prev[post.id]
                  }))
                }
              />

              {showReportMenu[post.id] && (
                <div className="report-menu">
                  <button onClick={() => handleReport(post.id)}>
                    Report
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* VIDEO */}
          <video
            ref={el => (videoRefs.current[i] = el)}
            src={post.videoUrl}
            className="post-video"
            muted
            loop
            controls
          />

          {/* ACTIONS */}
          <div className="post-actions">
            {post.likes?.includes(username) ? (
              <FaHeart
                className="action-icon liked"
                onClick={() => handleLike(post.id)}
              />
            ) : (
              <FaRegHeart
                className="action-icon"
                onClick={() => handleLike(post.id)}
              />
            )}

            <FaComment
              className="action-icon"
              onClick={() =>
                setExpandedComments(prev => ({
                  ...prev,
                  [post.id]: !prev[post.id]
                }))
              }
            />

            <FaPaperPlane
              className="action-icon"
              onClick={() => handleShare(post.id)}
            />
          </div>

          <p className="likes-text">{post.likes?.length || 0} likes</p>

          <p className="caption">
            <span className="caption-username">
              {usersMap[post.uid]?.username}
            </span>{" "}
            {post.caption}
          </p>

          {expandedComments[post.id] && (
            <div className="comments">
              {post.comments?.map((c, i) => (
                <p key={i}>
                  <span className="comment-username">{c.user}</span>{" "}
                  {c.text}
                </p>
              ))}

              <div className="comment-input-wrapper">
                <input
                  className="comment-input"
                  placeholder="Add a comment..."
                  onKeyDown={e => {
                    if (e.key === "Enter" && e.target.value.trim()) {
                      handleComment(post.id, e.target.value.trim());
                      e.target.value = "";
                    }
                  }}
                />
              </div>
            </div>
          )}
        </div>
      ))}

      {/* FULLSCREEN STORY VIEWER */}
      {currentStory && (
        <div className="story-view">
          <div className="story-view-topbar">
            <div className="story-view-user">
              {usersMap[currentStory.uid]?.profilePic ? (
                <img
                  src={usersMap[currentStory.uid].profilePic}
                  alt=""
                  className="story-view-profile"
                />
              ) : (
                <FaUserCircle className="story-view-icon" />
              )}
              <span className="story-view-username">
                {currentStory.username}
              </span>
            </div>

            <div className="story-view-actions">
              {currentStory.uid === uid && (
                <button
                  className="story-delete-btn"
                  onClick={handleDeleteStory}
                >
                  Delete
                </button>
              )}
              <button
                className="story-close-btn"
                onClick={closeStoryViewer}
                aria-label="Close story"
              >
                <FaTimes />
              </button>
            </div>
          </div>

          <div className="story-view-content" onClick={goToNextStory}>
            <img
              src={currentStory.url}
              alt=""
              className="story-view-img"
            />
          </div>

          {/* simple progress bar */}
          <div className="story-progress-wrapper">
            <div className="story-progress-bar" />
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;