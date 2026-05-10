import type { Prisma, TripNote as PrismaTripNote } from '@prisma/client';
import type { TripNote } from '../../../shared/types';
import { AppError } from '../../middleware/error-handler';
import { stopsRepository } from '../stops/stops.repository';
import { tripsRepository } from '../trips/trips.repository';
import type { CreateNoteDto, UpdateNoteDto } from './notes.dto';
import { notesRepository } from './notes.repository';

const mapNote = (note: PrismaTripNote): TripNote => ({
  id: note.id,
  tripId: note.tripId,
  stopId: note.stopId,
  title: note.title,
  content: note.content,
  noteType: note.noteType,
  isImportant: note.isImportant,
  createdAt: note.createdAt.toISOString()
});

export class NotesService {
  public async list(userId: string, tripId: string): Promise<TripNote[]> {
    await this.assertTripOwnership(userId, tripId);
    const notes = await notesRepository.findByTripId(tripId);
    return notes.map(mapNote);
  }

  public async create(userId: string, tripId: string, dto: CreateNoteDto): Promise<TripNote> {
    await this.assertTripOwnership(userId, tripId);
    if (dto.stopId) await this.assertStopBelongsToTrip(tripId, dto.stopId);

    const data: Prisma.TripNoteUncheckedCreateInput = {
      tripId,
      title: dto.title,
      content: dto.content,
      noteType: dto.noteType,
      isImportant: dto.isImportant
    };
    if (dto.stopId !== undefined) data.stopId = dto.stopId;

    const note = await notesRepository.create(data);
    return mapNote(note);
  }

  public async update(
    userId: string,
    tripId: string,
    noteId: string,
    dto: UpdateNoteDto
  ): Promise<TripNote> {
    await this.assertNoteOwnership(userId, tripId, noteId);
    if (dto.stopId) await this.assertStopBelongsToTrip(tripId, dto.stopId);

    const data: Prisma.TripNoteUncheckedUpdateInput = {};
    if (dto.stopId !== undefined) data.stopId = dto.stopId;
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.content !== undefined) data.content = dto.content;
    if (dto.noteType !== undefined) data.noteType = dto.noteType;
    if (dto.isImportant !== undefined) data.isImportant = dto.isImportant;

    const note = await notesRepository.update(noteId, data);
    return mapNote(note);
  }

  public async delete(userId: string, tripId: string, noteId: string): Promise<void> {
    await this.assertNoteOwnership(userId, tripId, noteId);
    await notesRepository.delete(noteId);
  }

  private async assertTripOwnership(userId: string, tripId: string): Promise<void> {
    const trip = await tripsRepository.findOwnedById(tripId, userId);
    if (!trip) throw new AppError('Trip not found', 'NOT_FOUND', 404);
  }

  private async assertStopBelongsToTrip(tripId: string, stopId: string): Promise<void> {
    const stop = await stopsRepository.findById(stopId);
    if (!stop || stop.tripId !== tripId) throw new AppError('Stop not found', 'NOT_FOUND', 404);
  }

  private async assertNoteOwnership(userId: string, tripId: string, noteId: string): Promise<void> {
    await this.assertTripOwnership(userId, tripId);
    const note = await notesRepository.findById(noteId);
    if (!note || note.tripId !== tripId) throw new AppError('Note not found', 'NOT_FOUND', 404);
  }
}

export const notesService = new NotesService();
