import type { PackingItem as PrismaPackingItem, Prisma } from '@prisma/client';
import type { PackingItem, PackingList } from '../../../shared/types';
import { AppError } from '../../middleware/error-handler';
import { tripsRepository } from '../trips/trips.repository';
import type { CreatePackingItemDto, UpdatePackingItemDto } from './packing.dto';
import { packingRepository } from './packing.repository';

const mapPackingItem = (item: PrismaPackingItem): PackingItem => ({
  id: item.id,
  tripId: item.tripId,
  name: item.name,
  category: item.category,
  isPacked: item.isPacked,
  aiSuggested: item.aiSuggested
});

export class PackingService {
  public async list(userId: string, tripId: string): Promise<PackingItem[]> {
    await this.assertTripOwnership(userId, tripId);
    const items = await packingRepository.findByTripId(tripId);
    return items.map(mapPackingItem);
  }

  public async create(userId: string, tripId: string, dto: CreatePackingItemDto): Promise<PackingItem> {
    await this.assertTripOwnership(userId, tripId);
    const item = await packingRepository.create({ tripId, ...dto });
    return mapPackingItem(item);
  }

  public async seedSuggested(
    userId: string,
    tripId: string,
    packingLists: PackingList[]
  ): Promise<PackingItem[]> {
    await this.assertTripOwnership(userId, tripId);
    const data = packingLists.flatMap((list) =>
      list.items.map((name) => ({
        tripId,
        name,
        category: list.category,
        aiSuggested: true,
        isPacked: false
      }))
    );
    if (data.length > 0) await packingRepository.createMany(data);
    return this.list(userId, tripId);
  }

  public async update(
    userId: string,
    tripId: string,
    itemId: string,
    dto: UpdatePackingItemDto
  ): Promise<PackingItem> {
    await this.assertItemOwnership(userId, tripId, itemId);
    const data: Prisma.PackingItemUncheckedUpdateInput = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.category !== undefined) data.category = dto.category;
    if (dto.isPacked !== undefined) data.isPacked = dto.isPacked;
    if (dto.aiSuggested !== undefined) data.aiSuggested = dto.aiSuggested;
    const item = await packingRepository.update(itemId, data);
    return mapPackingItem(item);
  }

  public async delete(userId: string, tripId: string, itemId: string): Promise<void> {
    await this.assertItemOwnership(userId, tripId, itemId);
    await packingRepository.delete(itemId);
  }

  private async assertTripOwnership(userId: string, tripId: string): Promise<void> {
    const trip = await tripsRepository.findOwnedById(tripId, userId);
    if (!trip) throw new AppError('Trip not found', 'NOT_FOUND', 404);
  }

  private async assertItemOwnership(userId: string, tripId: string, itemId: string): Promise<void> {
    await this.assertTripOwnership(userId, tripId);
    const item = await packingRepository.findById(itemId);
    if (!item || item.tripId !== tripId) throw new AppError('Packing item not found', 'NOT_FOUND', 404);
  }
}

export const packingService = new PackingService();
