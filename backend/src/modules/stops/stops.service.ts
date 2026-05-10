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

const validationError = (field: string, message: string): AppError =>
  new AppError(message, 'VALIDATION_ERROR', 400, { [field]: [message] });

const assertStopDateRange = (arrivalDate: Date, departureDate: Date): void => {
  if (departureDate < arrivalDate) {
    throw validationError('departureDate', 'departureDate must be on or after arrivalDate');
  }
};

export class StopsService {
  public async list(userId: string, tripId: string): Promise<Stop[]> {
    await this.assertTripOwnership(userId, tripId);
    const stops = await stopsRepository.findByTripId(tripId);
    return stops.map(mapStop);
  }

  public async create(userId: string, tripId: string, dto: CreateStopDto): Promise<Stop> {
    const trip = await this.assertTripOwnership(userId, tripId);
    const arrivalDate = new Date(dto.arrivalDate);
    const departureDate = new Date(dto.departureDate);
    assertStopDateRange(arrivalDate, departureDate);
    this.assertStopWithinTrip(trip.startDate, trip.endDate, arrivalDate, departureDate);

    const data: Prisma.StopUncheckedCreateInput = {
      tripId,
      cityId: dto.cityId,
      orderIndex: dto.orderIndex,
      arrivalDate,
      departureDate
    };
    if (dto.notes !== undefined) data.notes = dto.notes;
    if (dto.accommodationName !== undefined) data.accommodationName = dto.accommodationName;
    if (dto.accommodationCost !== undefined) data.accommodationCost = dto.accommodationCost;

    const stop = await stopsRepository.create(data);

    return mapStop(stop);
  }

  public async update(userId: string, tripId: string, stopId: string, dto: UpdateStopDto): Promise<Stop> {
    const { trip, stop: existingStop } = await this.assertStopOwnership(userId, tripId, stopId);
    const arrivalDate = dto.arrivalDate ? new Date(dto.arrivalDate) : existingStop.arrivalDate;
    const departureDate = dto.departureDate ? new Date(dto.departureDate) : existingStop.departureDate;
    assertStopDateRange(arrivalDate, departureDate);
    this.assertStopWithinTrip(trip.startDate, trip.endDate, arrivalDate, departureDate);

    const data: Prisma.StopUncheckedUpdateInput = {};
    if (dto.cityId !== undefined) data.cityId = dto.cityId;
    if (dto.orderIndex !== undefined) data.orderIndex = dto.orderIndex;
    if (dto.arrivalDate !== undefined) data.arrivalDate = arrivalDate;
    if (dto.departureDate !== undefined) data.departureDate = departureDate;
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

  private async assertTripOwnership(userId: string, tripId: string) {
    const trip = await tripsRepository.findOwnedById(tripId, userId);
    if (!trip) {
      throw new AppError('Trip not found', 'NOT_FOUND', 404);
    }
    return trip;
  }

  private async assertStopOwnership(userId: string, tripId: string, stopId: string) {
    const trip = await this.assertTripOwnership(userId, tripId);
    const stop = await stopsRepository.findById(stopId);
    if (!stop || stop.tripId !== tripId) {
      throw new AppError('Stop not found', 'NOT_FOUND', 404);
    }
    return { trip, stop };
  }

  private assertStopWithinTrip(
    tripStartDate: Date,
    tripEndDate: Date,
    arrivalDate: Date,
    departureDate: Date
  ): void {
    if (arrivalDate < tripStartDate || departureDate > tripEndDate) {
      throw validationError('arrivalDate', 'Stop dates must stay within the trip date range');
    }
  }
}

export const stopsService = new StopsService();
