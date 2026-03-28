import { useRef, useEffect, useState } from "react";
import {
  FaHeart,
  FaRegHeart,
  FaComment,
  FaPaperPlane,
  FaTimes,
  FaUserCircle
} from "react-icons/fa";

import "./Reel.css";

function Reel({ post, usersMap }) {
  const videoRef = useRef();
  const [liked, setLiked] = useState(false);
  const [comments, setComments] = useState(post.comments || []);
  const [text, setText] = useState("");
  const [openModal, setOpenModal] = useState(false);

  // 🎬 Auto play when visible in the list
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!videoRef.current) return;
        entry.isIntersecting
          ? videoRef.current.play().catch(() => {})
          : videoRef.current.pause();
      },
      { threshold: 0.6 }
    );

    if (videoRef.current) observer.observe(videoRef.current);
    return () => observer.disconnect();
  }, []);

  const addComment = () => {
    if (!text.trim()) return;
    setComments(prev => [...prev, { user: "You", text }]);
    setText("");
  };

  const user = usersMap?.[post.uid];

  return (
    <>
      {/* SMALL REEL TILE */}
      <div className="reel-tile" onClick={() => setOpenModal(true)}>
        <video
          ref={videoRef}
          src={post.videoUrl}
          muted
          loop
          className="reel-tile-video"
        />

        <div className="reel-tile-overlay" />

        <div className="reel-tile-bottom">
          <div className="reel-tile-user">
            {user?.profilePic ? (
              <img src={user.profilePic} alt="" />
            ) : (
              <FaUserCircle />
            )}
            <span>{user?.username}</span>
          </div>
          <p className="reel-tile-caption">{post.caption}</p>
        </div>
      </div>

      {/* FULLSCREEN OVERLAY CARD */}
      {openModal && (
        <div className="reel-overlay" onClick={() => setOpenModal(false)}>
          <div
            className="reel-card"
            onClick={e => e.stopPropagation()}
          >
            {/* HEADER */}
            <div className="reel-card-header">
              <div className="reel-card-user">
                {user?.profilePic ? (
                  <img
                    src={user.profilePic}
                    alt=""
                    className="reel-card-avatar"
                  />
                ) : (
                  <FaUserCircle className="reel-card-avatar-icon" />
                )}
                <span className="reel-card-username">
                  {user?.username || "User"}
                </span>
              </div>

              <button
                className="reel-card-close"
                onClick={() => setOpenModal(false)}
              >
                <FaTimes />
              </button>
            </div>

            {/* MAIN: VIDEO + INFO */}
            <div className="reel-card-main">
              <div className="reel-card-video-wrap">
                <video
                  src={post.videoUrl}
                  autoPlay
                  loop
                  controls
                  className="reel-card-video"
                />
              </div>

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
                  {(post.likes?.length || 0) + (liked ? 1 : 0)} likes
                </p>

                {/* CAPTION */}
                <p className="reel-card-caption">
                  <span className="reel-card-caption-user">
                    {user?.username || "User"}
                  </span>{" "}
                  {post.caption}
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
    </>
  );
}

export default Reel;