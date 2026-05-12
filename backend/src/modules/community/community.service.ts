import { prisma } from '../../config/prisma';
import type { Prisma } from '@prisma/client';
import { createHash } from 'crypto';
import { AppError } from '../../middleware/error-handler';
import { paginate } from '../../utils/paginate';
import type {
  AddCommunityCommentDto,
  CreateCommunityPostDto,
  ListCommunityQueryDto,
  PlaceChatQueryDto,
  SendPlaceChatMessageDto
} from './community.dto';

const postInclude = {
  user: { select: { id: true, name: true, username: true, avatarUrl: true, bio: true } },
  trip: { select: { id: true, title: true, coverPhotoUrl: true, publicSlug: true } },
  likes: { select: { id: true, userId: true } },
  bookmarks: { select: { id: true, userId: true } },
  comments: {
    take: 20,
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
  aiSummary: summarizePost(post.content),
  autoTags: tagPost(post),
  comments: post.comments.map((comment) => ({
    id: comment.id,
    body: comment.body,
    createdAt: comment.createdAt.toISOString(),
    author: comment.user
  }))
});

const summarizePost = (content: string): string => {
  const compact = content.replace(/\s+/g, ' ').trim();
  if (compact.length <= 180) return compact;
  return `${compact.slice(0, 177).trim()}...`;
};

const tagPost = (post: CommunityPostRecord): string[] => {
  const haystack = `${post.title} ${post.content} ${post.destinationName ?? ''}`.toLowerCase();
  const tags = new Set<string>();
  if (post.destinationName) tags.add(post.destinationName);
  if (haystack.includes('food') || haystack.includes('cafe') || haystack.includes('restaurant')) tags.add('food');
  if (haystack.includes('budget') || haystack.includes('cheap')) tags.add('budget');
  if (haystack.includes('trek') || haystack.includes('hike') || haystack.includes('adventure')) tags.add('adventure');
  if (haystack.includes('temple') || haystack.includes('museum') || haystack.includes('heritage')) tags.add('culture');
  if (haystack.includes('solo')) tags.add('solo');
  if (haystack.includes('family')) tags.add('family');
  return Array.from(tags).slice(0, 6);
};

type PlaceMessageRow = {
  id: string;
  userId: string | null;
  cityId: string | null;
  destinationName: string;
  authorAlias: string | null;
  isSystem: boolean;
  body: string;
  createdAt: Date;
};

const travelerAlias = (userId: string): string => {
  const code = createHash('sha256').update(userId).digest('hex').slice(0, 6).toUpperCase();
  return `Traveler ${code}`;
};

const mapPlaceMessage = (message: PlaceMessageRow, viewerId?: string) => ({
  id: message.id,
  cityId: message.cityId,
  destinationName: message.destinationName,
  body: message.body,
  createdAt: message.createdAt.toISOString(),
  authorAlias: message.authorAlias ?? (message.userId ? travelerAlias(message.userId) : 'Traveler'),
  isOwn: Boolean(viewerId && message.userId === viewerId),
  isSystem: message.isSystem
});

const starterMessages = (destinationName: string): Array<{ alias: string; body: string }> => [
  {
    alias: 'Traveler A17F',
    body: `I am checking ${destinationName} plans this week. Early morning starts seem best for the main sights.`
  },
  {
    alias: 'Traveler C92D',
    body: 'Anyone comparing stays near the center versus quieter neighborhoods? Commute time matters a lot.'
  },
  {
    alias: 'Traveler K40B',
    body: 'Local food walks after sunset are usually easier if transport back to the stay is already sorted.'
  }
];

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
      try {
        await prisma.communityLike.create({ data: { postId, userId } });
      } catch {
        // Handles race condition where duplicate like is created in parallel.
      }
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

  public async similarTravelers(userId: string) {
    const viewer = await prisma.user.findFirst({
      where: { id: userId, isDeleted: false, deletedAt: null },
      select: { travelerProfile: true, travelStyles: true }
    });
    const styles = Array.isArray(viewer?.travelStyles) ? viewer.travelStyles.map(String) : [];
    const styleFilters: Prisma.UserWhereInput[] = [];
    if (viewer?.travelerProfile) styleFilters.push({ travelerProfile: viewer.travelerProfile });
    if (styles.length > 0) styleFilters.push({ travelStyles: { array_contains: styles } });
    const travelers = await prisma.user.findMany({
      where: {
        id: { not: userId },
        isDeleted: false,
        deletedAt: null,
        ...(styleFilters.length > 0 ? { OR: styleFilters } : {})
      },
      take: 6,
      select: { id: true, name: true, username: true, avatarUrl: true, travelerProfile: true, travelStyles: true }
    });
    return travelers.map((traveler) => ({
      ...traveler,
      matchReason:
        traveler.travelerProfile && traveler.travelerProfile === viewer?.travelerProfile
          ? `Also travels as ${traveler.travelerProfile}`
          : 'Overlapping travel interests'
      }));
  }

  public async listPlaceMessages(query: PlaceChatQueryDto, viewerId?: string) {
    const limit = query.limit;
    const destination = query.destinationName?.trim() ?? '';
    await this.ensurePlaceChatStarters(query.cityId ?? null, destination);
    const rows = query.cityId
      ? await prisma.$queryRaw<PlaceMessageRow[]>`
          SELECT
            id::text AS "id",
            user_id::text AS "userId",
            city_id::text AS "cityId",
            destination_name AS "destinationName",
            author_alias AS "authorAlias",
            is_system AS "isSystem",
            body,
            created_at AS "createdAt"
          FROM community_place_messages
          WHERE city_id = ${query.cityId}::uuid
          ORDER BY created_at DESC
          LIMIT ${limit}
        `
      : await prisma.$queryRaw<PlaceMessageRow[]>`
          SELECT
            id::text AS "id",
            user_id::text AS "userId",
            city_id::text AS "cityId",
            destination_name AS "destinationName",
            author_alias AS "authorAlias",
            is_system AS "isSystem",
            body,
            created_at AS "createdAt"
          FROM community_place_messages
          WHERE lower(destination_name) = lower(${destination})
          ORDER BY created_at DESC
          LIMIT ${limit}
        `;

    return rows.reverse().map((message) => mapPlaceMessage(message, viewerId));
  }

  public async sendPlaceMessage(userId: string, dto: SendPlaceChatMessageDto) {
    const destinationName = dto.destinationName.trim();
    const [message] = await prisma.$queryRaw<PlaceMessageRow[]>`
      INSERT INTO community_place_messages (user_id, city_id, destination_name, author_alias, body)
      VALUES (
        ${userId}::uuid,
        ${dto.cityId ?? null}::uuid,
        ${destinationName},
        ${travelerAlias(userId)},
        ${dto.body.trim()}
      )
      RETURNING
        id::text AS "id",
        user_id::text AS "userId",
        city_id::text AS "cityId",
        destination_name AS "destinationName",
        author_alias AS "authorAlias",
        is_system AS "isSystem",
        body,
        created_at AS "createdAt"
    `;
    if (!message) throw new AppError('Unable to send place chat message', 'CHAT_MESSAGE_FAILED', 500);
    return mapPlaceMessage(message, userId);
  }

  private async ensurePlaceChatStarters(cityId: string | null, destinationName: string) {
    const normalizedDestination = destinationName || 'this destination';
    const existing = cityId
      ? await prisma.$queryRaw<Array<{ count: bigint }>>`
          SELECT COUNT(*)::bigint AS count
          FROM community_place_messages
          WHERE city_id = ${cityId}::uuid
        `
      : await prisma.$queryRaw<Array<{ count: bigint }>>`
          SELECT COUNT(*)::bigint AS count
          FROM community_place_messages
          WHERE lower(destination_name) = lower(${normalizedDestination})
        `;
    if (Number(existing[0]?.count ?? 0) > 0) return;

    for (const [index, starter] of starterMessages(normalizedDestination).entries()) {
      await prisma.$executeRaw`
        INSERT INTO community_place_messages (
          user_id,
          city_id,
          destination_name,
          author_alias,
          is_system,
          body,
          created_at
        )
        VALUES (
          NULL,
          ${cityId}::uuid,
          ${normalizedDestination},
          ${starter.alias},
          TRUE,
          ${starter.body},
          NOW() - (${starterMessages(normalizedDestination).length - index} * INTERVAL '4 minutes')
        )
      `;
    }
  }
}

export const communityService = new CommunityService();
