import { prisma } from '../../config/prisma';
import type { Prisma } from '@prisma/client';
import { AppError } from '../../middleware/error-handler';
import { paginate } from '../../utils/paginate';
import type {
  AddCommunityCommentDto,
  CreateCommunityPostDto,
  ListCommunityQueryDto
} from './community.dto';

const postInclude = {
  user: { select: { id: true, name: true, username: true, avatarUrl: true, bio: true } },
  trip: { select: { id: true, title: true, coverPhotoUrl: true, publicSlug: true } },
  likes: { select: { id: true, userId: true } },
  bookmarks: { select: { id: true, userId: true } },
  comments: {
    take: 3,
    orderBy: { createdAt: 'desc' as const },
    include: { user: { select: { id: true, name: true, avatarUrl: true } } }
  }
};

type CommunityPostRecord = Prisma.CommunityPostGetPayload<{
  include: {
    user: { select: { id: true; name: true; username: true; avatarUrl: true; bio: true } };
    trip: { select: { id: true; title: true; coverPhotoUrl: true; publicSlug: true } };
    likes: { select: { id: true; userId: true } };
    bookmarks: { select: { id: true; userId: true } };
    comments: {
      include: { user: { select: { id: true; name: true; avatarUrl: true } } };
    };
    _count: { select: { comments: true } };
  };
}>;

const mapPost = (post: CommunityPostRecord, viewerId?: string) => ({
  id: post.id,
  title: post.title,
  content: post.content,
  heroImageUrl: post.heroImageUrl,
  destinationName: post.destinationName,
  budgetInr: post.budgetInr ? Number(post.budgetInr) : null,
  createdAt: post.createdAt.toISOString(),
  author: post.user,
  trip: post.trip,
  likesCount: post.likes.length,
  commentsCount: post._count?.comments ?? post.comments?.length ?? 0,
  bookmarksCount: post.bookmarks.length,
  isLiked: viewerId ? post.likes.some((like: { userId: string }) => like.userId === viewerId) : false,
  isBookmarked: viewerId
    ? post.bookmarks.some((bookmark: { userId: string }) => bookmark.userId === viewerId)
    : false,
  comments: post.comments.map((comment) => ({
    id: comment.id,
    body: comment.body,
    createdAt: comment.createdAt.toISOString(),
    author: comment.user
  }))
});

export class CommunityService {
  public async list(query: ListCommunityQueryDto, viewerId?: string) {
    const pagination = paginate(query);
    const [posts, total] = await Promise.all([
      prisma.communityPost.findMany({
        where: { isPublished: true },
        include: { ...postInclude, _count: { select: { comments: true } } },
        orderBy: { createdAt: 'desc' },
        skip: pagination.skip,
        take: pagination.take
      }),
      prisma.communityPost.count({ where: { isPublished: true } })
    ]);

    return {
      data: posts.map((post) => mapPost(post, viewerId)),
      meta: { total, page: pagination.page, limit: pagination.limit }
    };
  }

  public async create(userId: string, dto: CreateCommunityPostDto) {
    if (dto.tripId) {
      const trip = await prisma.trip.findFirst({ where: { id: dto.tripId, userId } });
      if (!trip) throw new AppError('Trip not found for this user', 'NOT_FOUND', 404);
    }

    const post = await prisma.communityPost.create({
      data: {
        userId,
        tripId: dto.tripId ?? null,
        title: dto.title,
        content: dto.content,
        heroImageUrl: dto.heroImageUrl ?? null,
        destinationName: dto.destinationName ?? null,
        budgetInr: dto.budgetInr ?? null
      },
      include: { ...postInclude, _count: { select: { comments: true } } }
    });

    return mapPost(post, userId);
  }

  public async toggleLike(postId: string, userId: string) {
    const existing = await prisma.communityLike.findUnique({
      where: { postId_userId: { postId, userId } }
    });
    if (existing) {
      await prisma.communityLike.delete({ where: { id: existing.id } });
    } else {
      await prisma.communityLike.create({ data: { postId, userId } });
    }
    return this.getPost(postId, userId);
  }

  public async toggleBookmark(postId: string, userId: string) {
    const existing = await prisma.communityBookmark.findUnique({
      where: { postId_userId: { postId, userId } }
    });
    if (existing) {
      await prisma.communityBookmark.delete({ where: { id: existing.id } });
    } else {
      await prisma.communityBookmark.create({ data: { postId, userId } });
    }
    return this.getPost(postId, userId);
  }

  public async addComment(postId: string, userId: string, dto: AddCommunityCommentDto) {
    await prisma.communityComment.create({
      data: {
        postId,
        userId,
        body: dto.body
      }
    });
    return this.getPost(postId, userId);
  }

  public async getPost(postId: string, viewerId?: string) {
    const post = await prisma.communityPost.findUnique({
      where: { id: postId },
      include: { ...postInclude, _count: { select: { comments: true } } }
    });
    if (!post || !post.isPublished) throw new AppError('Community post not found', 'NOT_FOUND', 404);
    return mapPost(post, viewerId);
  }
}

export const communityService = new CommunityService();
