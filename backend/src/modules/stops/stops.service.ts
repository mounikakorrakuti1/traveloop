import type { Prisma, Stop as PrismaStop } from '@prisma/client';
import type { Stop } from '../../../shared/types';
import { AppError } from '../../middleware/error-handler';
import { tripsRepository } from '../trips/trips.repository';
import { stopsRepository } from './stops.repository';
import type { CreateStopDto, ReorderStopsDto, UpdateStopDto } from './stops.dto';

const mapStop = (stop: PrismaStop): Stop => ({
  id: stop.id,
  tripId: stop.tripId,
  cityId: stop.cityId,
  orderIndex: stop.orderIndex,
  arrivalDate: stop.arrivalDate.toISOString().slice(0, 10),
  departureDate: stop.departureDate.toISOString().slice(0, 10),
  notes: stop.notes,
  accommodationName: stop.accommodationName,
  accommodationCost: stop.accommodationCost ? Number(stop.accommodationCost) : null
});

export class StopsService {
  public async list(userId: string, tripId: string): Promise<Stop[]> {
    await this.assertTripOwnership(userId, tripId);
    const stops = await stopsRepository.findByTripId(tripId);
    return stops.map(mapStop);
  }

  public async create(userId: string, tripId: string, dto: CreateStopDto): Promise<Stop> {
    await this.assertTripOwnership(userId, tripId);
    const data: Prisma.StopUncheckedCreateInput = {
      tripId,
      cityId: dto.cityId,
      orderIndex: dto.orderIndex,
      arrivalDate: new Date(dto.arrivalDate),
      departureDate: new Date(dto.departureDate)
    };
    if (dto.notes !== undefined) data.notes = dto.notes;
    if (dto.accommodationName !== undefined) data.accommodationName = dto.accommodationName;
    if (dto.accommodationCost !== undefined) data.accommodationCost = dto.accommodationCost;

    const stop = await stopsRepository.create(data);

    return mapStop(stop);
  }

  public async update(userId: string, tripId: string, stopId: string, dto: UpdateStopDto): Promise<Stop> {
    await this.assertStopOwnership(userId, tripId, stopId);
    const data: Prisma.StopUncheckedUpdateInput = {};
    if (dto.cityId !== undefined) data.cityId = dto.cityId;
    if (dto.orderIndex !== undefined) data.orderIndex = dto.orderIndex;
    if (dto.arrivalDate !== undefined) data.arrivalDate = new Date(dto.arrivalDate);
    if (dto.departureDate !== undefined) data.departureDate = new Date(dto.departureDate);
    if (dto.notes !== undefined) data.notes = dto.notes;
    if (dto.accommodationName !== undefined) data.accommodationName = dto.accommodationName;
    if (dto.accommodationCost !== undefined) data.accommodationCost = dto.accommodationCost;

    const stop = await stopsRepository.update(stopId, data);

    return mapStop(stop);
  }

  public async delete(userId: string, tripId: string, stopId: string): Promise<void> {
    await this.assertStopOwnership(userId, tripId, stopId);
    await stopsRepository.delete(stopId);
  }

  public async reorder(userId: string, tripId: string, dto: ReorderStopsDto): Promise<Stop[]> {
    await this.assertTripOwnership(userId, tripId);
    const existingStops = await stopsRepository.findByTripId(tripId);
    const ownedStopIds = new Set(existingStops.map((stop) => stop.id));
    const allOwned = dto.stopOrders.every((stop) => ownedStopIds.has(stop.id));

    if (!allOwned) {
      throw new AppError('One or more stops were not found', 'NOT_FOUND', 404);
    }

    const stops = await stopsRepository.reorder(dto.stopOrders);
    return stops.map(mapStop);
  }

  private async assertTripOwnership(userId: string, tripId: string): Promise<void> {
    const trip = await tripsRepository.findOwnedById(tripId, userId);
    if (!trip) {
      throw new AppError('Trip not found', 'NOT_FOUND', 404);
    }
  }

  private async assertStopOwnership(userId: string, tripId: string, stopId: string): Promise<void> {
    await this.assertTripOwnership(userId, tripId);
    const stop = await stopsRepository.findById(stopId);
    if (!stop || stop.tripId !== tripId) {
      throw new AppError('Stop not found', 'NOT_FOUND', 404);
    }
  }
}

export const stopsService = new StopsService();
