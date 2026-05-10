import type { Trip } from '../../../shared/types';
import { AppError } from '../../middleware/error-handler';
import { mapTrip } from '../trips/trips.service';
import { tripsRepository } from '../trips/trips.repository';

export class PublicService {
  public async getTripBySlug(slug: string): Promise<Trip> {
    const trip = await tripsRepository.findPublicBySlug(slug);
    if (!trip) {
      throw new AppError('Public trip not found', 'NOT_FOUND', 404);
    }

    return mapTrip(trip);
  }
}

export const publicService = new PublicService();
