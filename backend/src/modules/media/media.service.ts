import crypto from 'crypto';
import type { MediaUpload as PrismaMediaUpload, Prisma } from '@prisma/client';
import type { MediaType, MediaUpload } from '../../../shared/types';
import { env } from '../../config/env';
import { AppError } from '../../middleware/error-handler';
import { stopsRepository } from '../stops/stops.repository';
import { tripsRepository } from '../trips/trips.repository';
import type { CreateMediaDto, SignUploadDto } from './media.dto';
import { mediaRepository } from './media.repository';

interface UploadSignature {
  signature: string;
  timestamp: number;
  cloudName: string;
  apiKey: string;
  folder: string;
  resourceType: string;
}

const mapMedia = (media: PrismaMediaUpload): MediaUpload => ({
  id: media.id,
  tripId: media.tripId,
  stopId: media.stopId,
  mediaType: media.mediaType as MediaType,
  cloudinaryUrl: media.cloudinaryUrl,
  cloudinaryId: media.cloudinaryId,
  caption: media.caption,
  documentType: media.documentType,
  fileName: media.fileName,
  fileSizeBytes: media.fileSizeBytes,
  mimeType: media.mimeType,
  expiresAt: media.expiresAt?.toISOString().slice(0, 10) ?? null,
  createdAt: media.createdAt.toISOString()
});

export class MediaService {
  public signUpload(dto: SignUploadDto): UploadSignature {
    if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) {
      throw new AppError('Cloudinary is not configured', 'SERVICE_UNAVAILABLE', 503);
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const paramsToSign = `folder=${dto.folder}&timestamp=${timestamp}${env.CLOUDINARY_API_SECRET}`;
    const signature = crypto.createHash('sha1').update(paramsToSign).digest('hex');

    return {
      signature,
      timestamp,
      cloudName: env.CLOUDINARY_CLOUD_NAME,
      apiKey: env.CLOUDINARY_API_KEY,
      folder: dto.folder,
      resourceType: dto.resourceType
    };
  }

  public async list(userId: string, tripId: string): Promise<MediaUpload[]> {
    await this.assertTripOwnership(userId, tripId);
    const media = await mediaRepository.findByTripId(tripId);
    return media.map(mapMedia);
  }

  public async create(userId: string, tripId: string, dto: CreateMediaDto): Promise<MediaUpload> {
    await this.assertTripOwnership(userId, tripId);
    if (dto.stopId) await this.assertStopBelongsToTrip(tripId, dto.stopId);

    const data: Prisma.MediaUploadUncheckedCreateInput = {
      tripId,
      userId,
      mediaType: dto.mediaType,
      cloudinaryUrl: dto.cloudinaryUrl,
      cloudinaryId: dto.cloudinaryId
    };
    if (dto.stopId !== undefined) data.stopId = dto.stopId;
    if (dto.caption !== undefined) data.caption = dto.caption;
    if (dto.documentType !== undefined) data.documentType = dto.documentType;
    if (dto.fileName !== undefined) data.fileName = dto.fileName;
    if (dto.fileSizeBytes !== undefined) data.fileSizeBytes = dto.fileSizeBytes;
    if (dto.mimeType !== undefined) data.mimeType = dto.mimeType;
    if (dto.expiresAt !== undefined) data.expiresAt = new Date(dto.expiresAt);

    const media = await mediaRepository.create(data);
    return mapMedia(media);
  }

  public async delete(userId: string, tripId: string, mediaId: string): Promise<void> {
    await this.assertTripOwnership(userId, tripId);
    const media = await mediaRepository.findById(mediaId);
    if (!media || media.tripId !== tripId) throw new AppError('Media not found', 'NOT_FOUND', 404);
    await mediaRepository.delete(mediaId);
  }

  private async assertTripOwnership(userId: string, tripId: string): Promise<void> {
    const trip = await tripsRepository.findOwnedById(tripId, userId);
    if (!trip) throw new AppError('Trip not found', 'NOT_FOUND', 404);
  }

  private async assertStopBelongsToTrip(tripId: string, stopId: string): Promise<void> {
    const stop = await stopsRepository.findById(stopId);
    if (!stop || stop.tripId !== tripId) throw new AppError('Stop not found', 'NOT_FOUND', 404);
  }
}

export const mediaService = new MediaService();
