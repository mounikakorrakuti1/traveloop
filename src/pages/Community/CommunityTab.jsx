import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle, Flame, Globe, Heart, MapPin, MessageCircle, Rocket, Share2, Sparkles, Star } from "lucide-react";
import { addCommunityComment, createCommunityPost, getSimilarTravelers, listCommunityFeed, toggleCommunityLike } from "@/api/community.api";
import { QUERY_KEYS, ROUTES } from "@/lib/constants";
import { COMMUNITY_POSTS } from "@/lib/communityData";
import { useAuthStore } from "@/store/authStore";
import { SkeletonCard, SkeletonText } from "@/components/shared/Skeleton";
import { SmartImage } from "@/components/shared/SmartImage";
import { useToast } from "@/components/shared/toast-context";
import "@/styles/components/community.css";
import "@/styles/components/ui.css";

const trending = ["#KashmirDiaries", "#Backpacking", "#WeekendGetaways", "#HiddenGems", "#Traveloop", "#IncredibleIndia"];
const summarizePost = (text) => {
  if (!text) return "";
  if (text.length < 220) return text;
  const firstSentence = text.split(". ").slice(0, 2).join(". ");
  return `${firstSentence.slice(0, 240)}...`;
};
const getTravelBadge = (post) => {
  const likes = post.likesCount || 0;
  if (likes >= 20) return "Trailblazer";
  if (likes >= 10) return "Local Expert";
  return "Explorer";
};

export default function CommunityTabPage() {
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const { showToast } = useToast();
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
  const similarTravelersQuery = useQuery({
    queryKey: ["community", "similar-travelers"],
    queryFn: getSimilarTravelers,
    enabled: Boolean(user),
    staleTime: 10 * 60 * 1000,
  });

  const patchPost = (postId, updater) => {
    queryClient.setQueryData(QUERY_KEYS.communityFeed(1), (current) => {
      if (!current?.posts) return current;
      return {
        ...current,
        posts: current.posts.map((post) => (post.id === postId ? updater(post) : post)),
      };
    });
  };
  const createMutation = useMutation({ mutationFn: createCommunityPost, onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.communityFeed(1) }) });
  const likeMutation = useMutation({
    mutationFn: toggleCommunityLike,
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.communityFeed(1) });
      const previous = queryClient.getQueryData(QUERY_KEYS.communityFeed(1));
      patchPost(postId, (post) => ({
        ...post,
        isLiked: !post.isLiked,
        likesCount: Math.max(0, (post.likesCount || 0) + (post.isLiked ? -1 : 1)),
      }));
      return { previous, postId };
    },
    onSuccess: (nextPost) => patchPost(nextPost.id, () => nextPost),
    onError: (err, _postId, context) => {
      if (context?.previous) queryClient.setQueryData(QUERY_KEYS.communityFeed(1), context.previous);
      showToast(err?.message || "Unable to update like.", "error");
    },
  });
  const commentMutation = useMutation({
    mutationFn: ({ postId, body }) => addCommunityComment(postId, { body }),
    onSuccess: (nextPost) => patchPost(nextPost.id, () => nextPost),
    onError: (err) => showToast(err?.message || "Unable to add comment.", "error"),
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
      destinationName: title.split("in ").at(-1)?.trim()?.slice(0, 120) || "India",
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
    const url = `${window.location.origin}${ROUTES.community}?post=${post.id}`;
    const text = `${authorName} on Traveloop: ${post.content || post.body}\n${url}`;
    if (navigator.share) {
      await navigator.share({ title: "Traveloop community post", text, url }).catch(() => {});
      showToast("Shared successfully.", "success");
      return;
    }
    const copied = await navigator.clipboard?.writeText(text).then(() => true).catch(() => false);
    showToast(copied ? "Share link copied to clipboard." : "Unable to share this post.", copied ? "success" : "error");
  };

  const activityStats = [
    { label: "Posts Created", value: data?.posts?.filter((p) => (p.author?.name || p.author) === user?.name).length || 0 },
    { label: "Saved Itineraries", value: 3 },
    { label: "Community Rank", value: "Explorer" },
  ];
  const localSimilarTravellers = useMemo(() => {
    const byAuthor = new Map();
    (data?.posts || []).forEach((post) => {
      const authorName = post.author?.name || post.author;
      if (!authorName || authorName === user?.name) return;
      const prev = byAuthor.get(authorName) || { name: authorName, score: 0, destination: post.destinationName || "India" };
      prev.score += (post.likesCount || 0) + (post.commentsCount || 0);
      byAuthor.set(authorName, prev);
    });
    return Array.from(byAuthor.values()).sort((a, b) => b.score - a.score).slice(0, 4);
  }, [data?.posts, user?.name]);
  const similarTravellers = similarTravelersQuery.data?.length
    ? similarTravelersQuery.data.map((traveller) => ({
        name: traveller.name,
        destination: traveller.matchReason || traveller.travelerProfile || "Matched traveler",
      }))
    : localSimilarTravellers;

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
        <div className="card community-panel">
          <div className="community-panel-title">
            <Sparkles size={20} /> Similar Travellers
          </div>
          <div className="activity-list">
            {similarTravellers.length === 0 && <div className="profile-help">Post more to unlock matches.</div>}
            {similarTravellers.map((traveller) => (
              <div key={traveller.name} className="activity-row">
                <span>{traveller.name}</span>
                <strong>{traveller.destination}</strong>
              </div>
            ))}
          </div>
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
                    <p className="post-copy">{summarizePost(post.content || post.body)}</p>
                    <div className="post-tags">
                      <span>{getTravelBadge(post)}</span>
                      {post.destinationName && <span>#{post.destinationName.replace(/\s+/g, "")}</span>}
                    </div>

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
