import type { Prisma, TripNote } from '@prisma/client';
import { prisma } from '../../config/prisma';

export class NotesRepository {
  public findByTripId(tripId: string): Promise<TripNote[]> {
    return prisma.tripNote.findMany({ where: { tripId }, orderBy: { createdAt: 'desc' } });
  }

  public findById(id: string): Promise<TripNote | null> {
    return prisma.tripNote.findUnique({ where: { id } });
  }

  public create(data: Prisma.TripNoteUncheckedCreateInput): Promise<TripNote> {
    return prisma.tripNote.create({ data });
  }

  public update(id: string, data: Prisma.TripNoteUncheckedUpdateInput): Promise<TripNote> {
    return prisma.tripNote.update({ where: { id }, data });
  }

  public delete(id: string): Promise<TripNote> {
    return prisma.tripNote.delete({ where: { id } });
  }
}

export const notesRepository = new NotesRepository();
