import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../../middleware/error-handler';
import type { CreateNoteDto, UpdateNoteDto } from './notes.dto';
import { notesService } from './notes.service';

export class NotesController {
  public list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new AppError('Authentication required', 'UNAUTHORIZED', 401);
      const { id } = req.params as { id: string };
      const notes = await notesService.list(req.user.id, id);
      res.status(200).json({ data: notes, meta: null });
    } catch (error) {
      next(error);
    }
  };

  public create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new AppError('Authentication required', 'UNAUTHORIZED', 401);
      const { id } = req.params as { id: string };
      const note = await notesService.create(req.user.id, id, req.body as CreateNoteDto);
      res.status(201).json({ data: note, meta: null });
    } catch (error) {
      next(error);
    }
  };

  public update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new AppError('Authentication required', 'UNAUTHORIZED', 401);
      const { id, noteId } = req.params as { id: string; noteId: string };
      const note = await notesService.update(req.user.id, id, noteId, req.body as UpdateNoteDto);
      res.status(200).json({ data: note, meta: null });
    } catch (error) {
      next(error);
    }
  };

  public delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new AppError('Authentication required', 'UNAUTHORIZED', 401);
      const { id, noteId } = req.params as { id: string; noteId: string };
      await notesService.delete(req.user.id, id, noteId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}

export const notesController = new NotesController();
