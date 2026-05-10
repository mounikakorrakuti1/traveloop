import { useState } from "react";
import { makeId, useLocalState } from "@/lib/localStore";
import { useAuthStore } from "@/store/authStore";
import "@/styles/components/community.css";
import "@/styles/components/ui.css";
import { Globe, Rocket, Heart, MessageCircle, Share2, Flame, Star } from "lucide-react";

const trending = ["#Goa2025", "#BudgetTravel", "#SoloIndia", "#HillStations", "#Monsoon", "#Photography"];

export default function CommunityTabPage() {
  const user     = useAuthStore((s) => s.user);
  const [localState, setLocalState] = useLocalState();
  const [content, setContent]       = useState("");

  const initials = user?.name
    ? user.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  const posts = localState.communityPosts;

  const publishPost = () => {
    if (!content.trim()) return;
    setLocalState((cur) => ({
      ...cur,
      communityPosts: [
        {
          id:        makeId("post"),
          author:    user?.name || "Traveller",
          content:   content.trim(),
          timestamp: new Date().toLocaleDateString("en-IN"),
          likes:     0,
          comments:  0,
        },
        ...cur.communityPosts,
      ],
    }));
    setContent("");
  };

  const likePost = (id) =>
    setLocalState((cur) => ({
      ...cur,
      communityPosts: cur.communityPosts.map((p) =>
        p.id === id ? { ...p, likes: (p.likes || 0) + 1 } : p
      ),
    }));

  return (
    <div className="community-root">
      {/* Main feed */}
      <main>
        <h1 className="community-title" style={{ display: "flex", alignItems: "center", gap: "var(--sp-xs)" }}>Community <Globe size={28} /></h1>

        {/* Compose */}
        <div className="community-compose">
          <div className="compose-row">
            <div className="avatar avatar-md">{initials}</div>
            <textarea
              className="compose-textarea"
              placeholder="Share your travel story, tip, or discovery…"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={3}
            />
          </div>
          <div className="compose-actions">
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setContent("")}
            >
              Clear
            </button>
            <button
              className="btn btn-primary btn-sm"
              onClick={publishPost}
              disabled={!content.trim()}
            >
              <span style={{ display: "flex", alignItems: "center", gap: "var(--sp-xs)" }}>Publish <Rocket size={14} /></span>
            </button>
          </div>
        </div>

        {/* Posts */}
        {posts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><Globe size={48} /></div>
            <div className="empty-state-title">No posts yet</div>
            <p style={{ color: "var(--cl-text-muted)", fontSize: "var(--fs-sm)" }}>
              Be the first to share your travel story!
            </p>
          </div>
        ) : (
          posts.map((post, i) => (
            <div key={post.id} className="post-card" style={{ animationDelay: `${i * 0.05}s` }}>
              <div className="post-avatar">{post.author?.[0] || "?"}</div>
              <div>
                <div className="post-body-author">
                  {post.author}
                  <span className="post-timestamp">{post.timestamp}</span>
                </div>
                <p className="post-content">{post.content || post.body}</p>
                <div className="post-actions">
                  <button className="post-action-btn" onClick={() => likePost(post.id)} style={{ display: "flex", alignItems: "center", gap: "var(--sp-xs)" }}>
                    <Heart size={14} /> {post.likes || 0}
                  </button>
                  <button className="post-action-btn" style={{ display: "flex", alignItems: "center", gap: "var(--sp-xs)" }}>
                    <MessageCircle size={14} /> {post.comments || 0}
                  </button>
                  <button className="post-action-btn" style={{ display: "flex", alignItems: "center", gap: "var(--sp-xs)" }}>
                    <Share2 size={14} /> Share
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </main>

      {/* Sidebar */}
      <aside className="community-sidebar">
        <div className="community-sidebar-card">
          <div className="sidebar-card-title" style={{ display: "flex", alignItems: "center", gap: "var(--sp-xs)" }}><Flame size={16} color="var(--cl-warm)" /> Trending Tags</div>
          <div>
            {trending.map((tag) => (
              <span key={tag} className="trending-tag">{tag}</span>
            ))}
          </div>
        </div>

        <div className="community-sidebar-card">
          <div className="sidebar-card-title" style={{ display: "flex", alignItems: "center", gap: "var(--sp-xs)" }}><Star size={16} color="var(--cl-warm)" /> Community Stats</div>
          {[
            { label: "Total Posts",   value: posts.length },
            { label: "Your Posts",    value: posts.filter((p) => p.author === user?.name).length },
            { label: "Total Likes",   value: posts.reduce((s, p) => s + (p.likes || 0), 0) },
          ].map((s) => (
            <div key={s.label} style={{ display: "flex", justifyContent: "space-between", marginBottom: "var(--sp-xs)", fontSize: "var(--fs-sm)" }}>
              <span style={{ color: "var(--cl-text-muted)" }}>{s.label}</span>
              <span style={{ fontWeight: "var(--fw-bold)", color: "var(--cl-text)" }}>{s.value}</span>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}
