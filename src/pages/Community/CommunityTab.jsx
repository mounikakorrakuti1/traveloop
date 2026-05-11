import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle, Flame, Globe, Heart, MapPin, MessageCircle, Rocket, Share2, Sparkles, Star } from "lucide-react";
import { addCommunityComment, createCommunityPost, listCommunityFeed, toggleCommunityLike } from "@/api/community.api";
import { QUERY_KEYS } from "@/lib/constants";
import { COMMUNITY_POSTS } from "@/lib/communityData";
import { useAuthStore } from "@/store/authStore";
import { SkeletonCard, SkeletonText } from "@/components/shared/Skeleton";
import { SmartImage } from "@/components/shared/SmartImage";
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
    staleTime: 10 * 60 * 1000,
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.communityFeed(1) });
  const createMutation = useMutation({ mutationFn: createCommunityPost, onSuccess: refresh });
  const likeMutation = useMutation({ mutationFn: toggleCommunityLike, onSuccess: refresh });
  const commentMutation = useMutation({
    mutationFn: ({ postId, body }) => addCommunityComment(postId, { body }),
    onSuccess: refresh,
  });

  const feedPosts = useMemo(() => {
    const livePosts = data?.posts ?? [];
    if (livePosts.length >= 5) return livePosts;

    const demoPosts = COMMUNITY_POSTS.map((post) => ({
      id: post.id,
      title: post.location,
      content: post.caption,
      author: post.author,
      heroImageUrl: post.image,
      createdAt: post.createdAt,
      likesCount: post.likes,
      commentsCount: post.comments,
      tags: post.tags,
      isDemo: true,
    }));

    return [...livePosts, ...demoPosts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [data?.posts]);

  const publishPost = () => {
    if (!content.trim() || !title.trim()) return;
    createMutation.mutate({
      title: title.trim(),
      content: content.trim(),
      destinationName: "India",
      heroImageUrl: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200&q=80",
    });
    setTitle("");
    setContent("");
  };

  const likePost = (id) => {
    if (id.startsWith("post_")) return;
    likeMutation.mutate(id);
  };

  const addComment = (id) => {
    if (id.startsWith("post_")) return;
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

  const activityStats = [
    { label: "Posts Created", value: data?.posts?.filter((p) => (p.author?.name || p.author) === user?.name).length || 0 },
    { label: "Saved Itineraries", value: 3 },
    { label: "Community Rank", value: "Explorer" },
  ];

  return (
    <div className="community-root">
      <header className="community-heading">
        <div>
          <h1 className="community-title">
            Community <Globe size={28} />
          </h1>
          <p className="community-subtitle">Discover real travel stories, field notes, and city tips from travellers.</p>
        </div>
        <span className="community-live-badge">
          <Sparkles size={16} /> Live feed
        </span>
      </header>

      <section className="community-insights" aria-label="Community insights">
        <div className="card community-panel community-panel-tags">
          <div className="community-panel-title">
            <Flame size={20} /> Trending Tags
          </div>
          <div className="community-tag-list">
            {trending.map((tag) => (
              <span key={tag} className="trending-tag">{tag}</span>
            ))}
          </div>
        </div>

        <div className="card community-panel">
          <div className="community-panel-title">
            <Star size={20} /> Your Activity
          </div>
          <div className="activity-list">
            {activityStats.map((stat) => (
              <div key={stat.label} className="activity-row">
                <span>{stat.label}</span>
                <strong>{stat.value}</strong>
              </div>
            ))}
          </div>
        </div>

        <div className="card community-panel community-pro-card">
          <div>
            <h3>Traveloop Pro</h3>
            <p>Get personalized itineraries and budget planning with AI.</p>
          </div>
          <button>Upgrade Now</button>
        </div>
      </section>

      <main className="community-feed">
        <div className="card community-compose">
          <div className="compose-row">
            <div className="avatar compose-avatar">{initials}</div>
            <div className="compose-fields">
              <input
                className="input compose-title-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Where did you go? e.g., Weekend in Kashmir"
              />
              <textarea
                className="compose-textarea"
                placeholder="Share your travel story, tips, or itinerary details..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <div className="compose-actions">
            <button className="btn btn-secondary btn-sm" onClick={() => { setContent(""); setTitle(""); }}>Clear</button>
            <button className="btn btn-primary btn-sm" onClick={publishPost} disabled={!content.trim() || !title.trim() || createMutation.isPending}>
              <span className="button-icon-label">
                {createMutation.isPending ? "Posting..." : "Publish"} <Rocket size={14} />
              </span>
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="community-post-grid">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="card community-loading-card">
                <div className="loading-author-row">
                  <div className="loading-avatar" />
                  <SkeletonText lines={2} w="38%" />
                </div>
                <SkeletonCard imageHeight="240px" />
                <div className="loading-copy">
                  <SkeletonText lines={3} />
                </div>
              </div>
            ))}
          </div>
        ) : feedPosts.length === 0 ? (
          <div className="empty-state community-empty">
            <Globe size={48} color="var(--cl-text-muted)" />
            <h3>No posts yet</h3>
            <p>Be the first to share your travel story!</p>
          </div>
        ) : (
          <div className="community-post-grid">
            {feedPosts.map((post) => {
              const authorName = post.author?.name || post.author || "Traveller";
              const authorAvatar = post.author?.avatar;
              const isVerified = post.author?.verified;

              return (
                <article key={post.id} className="card post-card">
                  <div className="post-header">
                    {authorAvatar ? (
                      <img className="post-author-avatar" src={authorAvatar} alt={authorName} />
                    ) : (
                      <div className="avatar post-author-avatar">{authorName[0]}</div>
                    )}
                    <div className="post-author-meta">
                      <div className="post-author-name">
                        <span>{authorName}</span>
                        {isVerified && <CheckCircle size={14} color="var(--cl-accent)" />}
                      </div>
                      <div className="post-author-bio">
                        {post.author?.bio && <span>{post.author.bio}</span>}
                        <span>{new Date(post.createdAt || Date.now()).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}</span>
                      </div>
                    </div>
                  </div>

                  <div className="post-content-wrap">
                    <h3 className="post-location">
                      {post.title} {post.isDemo && <MapPin size={16} color="var(--cl-text-muted)" />}
                    </h3>
                    <p className="post-copy">{post.content || post.body}</p>

                    {post.tags && (
                      <div className="post-tags">
                        {post.tags.map((tag) => <span key={tag}>{tag}</span>)}
                      </div>
                    )}
                  </div>

                  {post.heroImageUrl && (
                    <div className="post-image-frame">
                      <SmartImage src={post.heroImageUrl} alt={post.title} />
                    </div>
                  )}

                  <div className="post-actions">
                    <button className="post-action-btn" onClick={() => likePost(post.id)}>
                      <Heart size={18} /> {post.likesCount || 0}
                    </button>
                    <button className="post-action-btn">
                      <MessageCircle size={18} /> {post.commentsCount || 0}
                    </button>
                    <button className="post-action-btn post-share-btn" onClick={() => sharePost(post)}>
                      <Share2 size={18} /> Share
                    </button>
                  </div>

                  <div className="post-comment-area">
                    {(post.comments || post.commentList || []).length > 0 && (
                      <div className="post-comments">
                        {(post.comments || post.commentList || []).map((comment) => (
                          <div key={comment.id} className="post-comment">
                            <strong>{comment.author?.name || comment.author}</strong>
                            <span>{comment.body}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {!post.isDemo && (
                      <div className="post-comment-form">
                        <div className="avatar comment-avatar">{initials}</div>
                        <input
                          value={commentDrafts[post.id] || ""}
                          onChange={(e) => setCommentDrafts((cur) => ({ ...cur, [post.id]: e.target.value }))}
                          placeholder="Add a comment..."
                          onKeyDown={(e) => { if (e.key === "Enter") addComment(post.id); }}
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
    </div>
  );
}
