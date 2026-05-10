import type { MediaUpload, Prisma } from '@prisma/client';
import { prisma } from '../../config/prisma';

export class MediaRepository {
  public findByTripId(tripId: string): Promise<MediaUpload[]> {
    return prisma.mediaUpload.findMany({ where: { tripId }, orderBy: { createdAt: 'desc' } });
  }

  public findById(id: string): Promise<MediaUpload | null> {
    return prisma.mediaUpload.findUnique({ where: { id } });
  }

  public create(data: Prisma.MediaUploadUncheckedCreateInput): Promise<MediaUpload> {
    return prisma.mediaUpload.create({ data });
  }

  public delete(id: string): Promise<MediaUpload> {
    return prisma.mediaUpload.delete({ where: { id } });
  }
}

export const mediaRepository = new MediaRepository();
