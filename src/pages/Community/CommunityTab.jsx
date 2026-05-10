import { useState, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addCommunityComment, createCommunityPost, listCommunityFeed, toggleCommunityLike } from "@/api/community.api";
import { useAuthStore } from "@/store/authStore";
import { QUERY_KEYS } from "@/lib/constants";
import { SmartImage } from "@/components/shared/SmartImage";
import { SkeletonCard, SkeletonText } from "@/components/shared/Skeleton";
import { COMMUNITY_POSTS } from "@/lib/communityData";
import { Globe, Rocket, Heart, MessageCircle, Share2, Flame, Star, MapPin, CheckCircle } from "lucide-react";
import "@/styles/components/community.css";
import "@/styles/components/ui.css";

const trending = ["#KashmirDiaries", "#Backpacking", "#WeekendGetaways", "#HiddenGems", "#Traveloop", "#IncredibleIndia"];

export default function CommunityTabPage() {
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [commentDrafts, setCommentDrafts] = useState({});

  const initials = user?.name
    ? user.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  const { data, isLoading } = useQuery({ 
    queryKey: QUERY_KEYS.communityFeed(1), 
    queryFn: () => listCommunityFeed({ page: 1, limit: 16 }),
    staleTime: 10 * 60 * 1000
  });
  
  const refresh = () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.communityFeed(1) });
  const createMutation = useMutation({ mutationFn: createCommunityPost, onSuccess: refresh });
  const likeMutation = useMutation({ mutationFn: toggleCommunityLike, onSuccess: refresh });
  const commentMutation = useMutation({ mutationFn: ({ postId, body }) => addCommunityComment(postId, { body }), onSuccess: refresh });

  // Merge offline dummy data with live data
  const feedPosts = useMemo(() => {
    const livePosts = data?.posts ?? [];
    // Only show demo posts if we don't have enough live posts
    if (livePosts.length >= 5) return livePosts;
    
    // Convert offline posts to match the API structure
    const demoPosts = COMMUNITY_POSTS.map(post => ({
      id: post.id,
      title: post.location,
      content: post.caption,
      author: post.author,
      heroImageUrl: post.image,
      createdAt: post.createdAt,
      likesCount: post.likes,
      commentsCount: post.comments,
      tags: post.tags,
      isDemo: true
    }));
    
    return [...livePosts, ...demoPosts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [data?.posts]);

  const publishPost = () => {
    if (!content.trim() || !title.trim()) return;
    createMutation.mutate({
      title: title.trim(),
      content: content.trim(),
      destinationName: "India",
      heroImageUrl: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200&q=80"
    });
    setTitle("");
    setContent("");
  };

  const likePost = (id) => {
    if (id.startsWith("post_")) return; // Cannot like static demo posts
    likeMutation.mutate(id);
  };

  const addComment = (id) => {
    if (id.startsWith("post_")) return; // Cannot comment on demo posts
    const draft = commentDrafts[id]?.trim();
    if (!draft) return;
    commentMutation.mutate({ postId: id, body: draft });
    setCommentDrafts((cur) => ({ ...cur, [id]: "" }));
  };

  const sharePost = async (post) => {
    const authorName = post.author?.name || post.author || "Traveller";
    const text = `${authorName} on Traveloop: ${post.content || post.body}`;
    if (navigator.share) {
      await navigator.share({ title: "Traveloop community post", text }).catch(() => {});
      return;
    }
    await navigator.clipboard?.writeText(text).catch(() => {});
  };

  return (
    <div className="community-root" style={{ maxWidth: "1200px", margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 320px", gap: "var(--sp-2xl)", alignItems: "start", paddingBottom: "var(--sp-4xl)" }}>
      
      {/* Main Feed Column */}
      <main style={{ display: "flex", flexDirection: "column", gap: "var(--sp-xl)" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "var(--sp-sm)" }}>
          <h1 className="community-title" style={{ fontSize: "var(--fs-3xl)", display: "flex", alignItems: "center", gap: "var(--sp-sm)", margin: 0 }}>
            Community <Globe size={28} color="var(--cl-accent)" />
          </h1>
          <span style={{ color: "var(--cl-text-muted)", fontSize: "var(--fs-sm)" }}>Discover real travel stories</span>
        </div>

        {/* Compose Box */}
        <div className="card community-compose" style={{ padding: "var(--sp-xl)", borderRadius: "var(--br-xl)", border: "1px solid var(--cl-border)", boxShadow: "var(--shadow-sm)" }}>
          <div className="compose-row" style={{ display: "flex", gap: "var(--sp-md)" }}>
            <div className="avatar" style={{ width: "40px", height: "40px", flexShrink: 0, fontSize: "var(--fs-sm)" }}>{initials}</div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "var(--sp-sm)" }}>
              <input 
                className="input" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                placeholder="Where did you go? e.g., Weekend in Kashmir" 
                style={{ background: "transparent", border: "none", borderBottom: "1px solid var(--cl-border)", borderRadius: 0, padding: "var(--sp-xs) 0", fontSize: "var(--fs-lg)", fontWeight: "var(--fw-medium)" }}
              />
              <textarea
                className="compose-textarea"
                placeholder="Share your travel story, tips, or itinerary details..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={3}
                style={{ background: "transparent", border: "none", resize: "none", padding: "var(--sp-xs) 0", fontSize: "var(--fs-md)" }}
              />
            </div>
          </div>
          <div className="compose-actions" style={{ display: "flex", justifyContent: "flex-end", gap: "var(--sp-sm)", marginTop: "var(--sp-md)", paddingTop: "var(--sp-md)", borderTop: "1px solid var(--cl-bg-subtle)" }}>
            <button className="btn btn-secondary btn-sm" onClick={() => { setContent(""); setTitle(""); }}>Clear</button>
            <button className="btn btn-primary btn-sm" onClick={publishPost} disabled={!content.trim() || !title.trim() || createMutation.isPending}>
              <span style={{ display: "flex", alignItems: "center", gap: "var(--sp-xs)" }}>
                {createMutation.isPending ? "Posting..." : "Publish"} <Rocket size={14} />
              </span>
            </button>
          </div>
        </div>

        {/* Feed Posts */}
        {isLoading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-xl)" }}>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="card" style={{ padding: "var(--sp-xl)" }}>
                <div style={{ display: "flex", gap: "var(--sp-md)", marginBottom: "var(--sp-md)" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "var(--cl-bg-subtle)" }} />
                  <SkeletonText lines={2} w="30%" />
                </div>
                <SkeletonCard imageHeight="300px" />
                <div style={{ marginTop: "var(--sp-md)" }}><SkeletonText lines={3} /></div>
              </div>
            ))}
          </div>
        ) : feedPosts.length === 0 ? (
          <div className="empty-state" style={{ padding: "var(--sp-4xl) var(--sp-xl)", background: "var(--cl-surface)", borderRadius: "var(--br-xl)" }}>
            <Globe size={48} color="var(--cl-text-muted)" style={{ marginBottom: "var(--sp-md)" }} />
            <h3 style={{ fontSize: "var(--fs-xl)", marginBottom: "var(--sp-xs)" }}>No posts yet</h3>
            <p style={{ color: "var(--cl-text-muted)" }}>Be the first to share your travel story!</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-xl)" }}>
            {feedPosts.map((post) => {
              const authorName = post.author?.name || post.author || "Traveller";
              const authorAvatar = post.author?.avatar;
              const isVerified = post.author?.verified;
              
              return (
                <article key={post.id} className="card post-card" style={{ padding: 0, overflow: "hidden", border: "1px solid var(--cl-border)", borderRadius: "var(--br-xl)" }}>
                  {/* Post Header */}
                  <div style={{ padding: "var(--sp-lg)", display: "flex", alignItems: "center", gap: "var(--sp-md)" }}>
                    {authorAvatar ? (
                      <img src={authorAvatar} alt={authorName} style={{ width: "48px", height: "48px", borderRadius: "50%", objectFit: "cover" }} />
                    ) : (
                      <div className="avatar" style={{ width: "48px", height: "48px" }}>{authorName[0]}</div>
                    )}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <span style={{ fontWeight: "var(--fw-bold)", fontSize: "var(--fs-md)" }}>{authorName}</span>
                        {isVerified && <CheckCircle size={14} color="var(--cl-accent)" />}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-xs)", fontSize: "var(--fs-xs)", color: "var(--cl-text-muted)" }}>
                        {post.author?.bio && <span>{post.author.bio} · </span>}
                        {new Date(post.createdAt || Date.now()).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                      </div>
                    </div>
                  </div>

                  {/* Post Content */}
                  <div style={{ padding: "0 var(--sp-lg)" }}>
                    <h3 style={{ fontSize: "var(--fs-lg)", marginBottom: "var(--sp-sm)", display: "flex", alignItems: "center", gap: "var(--sp-xs)" }}>
                      {post.title} {post.isDemo && <MapPin size={16} color="var(--cl-text-muted)" />}
                    </h3>
                    <p style={{ fontSize: "var(--fs-md)", lineHeight: 1.6, marginBottom: "var(--sp-md)", color: "var(--cl-text)" }}>{post.content || post.body}</p>
                    
                    {post.tags && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--sp-xs)", marginBottom: "var(--sp-md)" }}>
                        {post.tags.map(tag => <span key={tag} style={{ color: "var(--cl-accent)", fontSize: "var(--fs-sm)", fontWeight: "var(--fw-medium)" }}>{tag}</span>)}
                      </div>
                    )}
                  </div>

                  {/* Hero Image */}
                  {post.heroImageUrl && (
                    <div style={{ width: "100%", height: "400px", background: "var(--cl-bg-subtle)" }}>
                      <SmartImage src={post.heroImageUrl} alt={post.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                  )}

                  {/* Actions */}
                  <div style={{ padding: "var(--sp-md) var(--sp-lg)", borderTop: "1px solid var(--cl-bg-subtle)", display: "flex", gap: "var(--sp-lg)" }}>
                    <button className="post-action-btn" onClick={() => likePost(post.id)} style={{ display: "flex", alignItems: "center", gap: "var(--sp-xs)", background: "none", border: "none", color: "var(--cl-text-muted)", cursor: "pointer", fontSize: "var(--fs-sm)", fontWeight: "var(--fw-medium)" }}>
                      <Heart size={18} /> {post.likesCount || 0}
                    </button>
                    <button className="post-action-btn" style={{ display: "flex", alignItems: "center", gap: "var(--sp-xs)", background: "none", border: "none", color: "var(--cl-text-muted)", cursor: "pointer", fontSize: "var(--fs-sm)", fontWeight: "var(--fw-medium)" }}>
                      <MessageCircle size={18} /> {post.commentsCount || 0}
                    </button>
                    <button className="post-action-btn" onClick={() => sharePost(post)} style={{ display: "flex", alignItems: "center", gap: "var(--sp-xs)", background: "none", border: "none", color: "var(--cl-text-muted)", cursor: "pointer", fontSize: "var(--fs-sm)", fontWeight: "var(--fw-medium)", marginLeft: "auto" }}>
                      <Share2 size={18} /> Share
                    </button>
                  </div>

                  {/* Comments Section */}
                  <div style={{ background: "var(--cl-bg-subtle)", padding: "var(--sp-md) var(--sp-lg)" }}>
                    {(post.comments || post.commentList || []).length > 0 && (
                      <div className="post-comments" style={{ display: "flex", flexDirection: "column", gap: "var(--sp-sm)", marginBottom: "var(--sp-md)" }}>
                        {(post.comments || post.commentList || []).map((comment) => (
                          <div key={comment.id} style={{ fontSize: "var(--fs-sm)", background: "var(--cl-surface)", padding: "var(--sp-sm) var(--sp-md)", borderRadius: "var(--br-lg)" }}>
                            <strong style={{ marginRight: "var(--sp-xs)" }}>{comment.author?.name || comment.author}</strong> 
                            <span style={{ color: "var(--cl-text-muted)" }}>{comment.body}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {!post.isDemo && (
                      <div style={{ display: "flex", gap: "var(--sp-sm)" }}>
                        <div className="avatar" style={{ width: "32px", height: "32px", fontSize: "10px" }}>{initials}</div>
                        <input 
                          value={commentDrafts[post.id] || ""} 
                          onChange={(e) => setCommentDrafts((cur) => ({ ...cur, [post.id]: e.target.value }))} 
                          placeholder="Add a comment..." 
                          style={{ flex: 1, border: "1px solid var(--cl-border)", borderRadius: "var(--br-full)", padding: "0 var(--sp-md)", fontSize: "var(--fs-sm)" }}
                          onKeyDown={(e) => { if (e.key === 'Enter') addComment(post.id); }}
                        />
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      {/* Sidebar Column */}
      <aside style={{ display: "flex", flexDirection: "column", gap: "var(--sp-xl)", position: "sticky", top: "var(--sp-2xl)" }}>
        <div className="card" style={{ padding: "var(--sp-xl)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-xs)", fontSize: "var(--fs-lg)", fontWeight: "var(--fw-bold)", marginBottom: "var(--sp-md)" }}>
            <Flame size={20} color="var(--cl-warm)" /> Trending Tags
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--sp-xs)" }}>
            {trending.map((tag) => (
              <span key={tag} style={{ background: "var(--cl-bg-subtle)", color: "var(--cl-accent)", padding: "4px 10px", borderRadius: "var(--br-full)", fontSize: "var(--fs-xs)", fontWeight: "var(--fw-semibold)", cursor: "pointer" }}>{tag}</span>
            ))}
          </div>
        </div>

        <div className="card" style={{ padding: "var(--sp-xl)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-xs)", fontSize: "var(--fs-lg)", fontWeight: "var(--fw-bold)", marginBottom: "var(--sp-lg)" }}>
            <Star size={20} color="var(--cl-warm)" /> Your Activity
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-md)" }}>
            {[
              { label: "Posts Created", value: data?.posts?.filter((p) => (p.author?.name || p.author) === user?.name).length || 0 },
              { label: "Saved Itineraries", value: 3 },
              { label: "Community Rank", value: "Explorer" },
            ].map((s) => (
              <div key={s.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "var(--fs-sm)", paddingBottom: "var(--sp-xs)", borderBottom: "1px solid var(--cl-bg-subtle)" }}>
                <span style={{ color: "var(--cl-text-muted)" }}>{s.label}</span>
                <span style={{ fontWeight: "var(--fw-bold)", color: "var(--cl-text)", background: "var(--cl-bg-subtle)", padding: "2px 8px", borderRadius: "var(--br-full)" }}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="card" style={{ padding: "var(--sp-xl)", background: "linear-gradient(135deg, var(--cl-accent) 0%, #D86B50 100%)", color: "white", border: "none" }}>
          <h3 style={{ fontSize: "var(--fs-lg)", marginBottom: "var(--sp-xs)" }}>Traveloop Pro</h3>
          <p style={{ fontSize: "var(--fs-sm)", opacity: 0.9, marginBottom: "var(--sp-md)" }}>Get personalized itineraries and budget planning with AI.</p>
          <button style={{ background: "white", color: "var(--cl-accent)", border: "none", padding: "8px 16px", borderRadius: "var(--br-md)", fontWeight: "var(--fw-bold)", fontSize: "var(--fs-sm)", cursor: "pointer", width: "100%" }}>Upgrade Now</button>
        </div>
      </aside>
    </div>
  );
}
