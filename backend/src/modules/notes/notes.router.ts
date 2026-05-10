import { Router } from 'express';
import { validate } from '../../middleware/validate.middleware';
import { createNoteDto, tripNoteParamsDto, updateNoteDto } from './notes.dto';
import { notesController } from './notes.controller';

export const notesRouter = Router({ mergeParams: true });

notesRouter.get('/', validate({ params: tripNoteParamsDto }), notesController.list);
notesRouter.post('/', validate({ params: tripNoteParamsDto, body: createNoteDto }), notesController.create);
notesRouter.put(
  '/:noteId',
  validate({ params: tripNoteParamsDto, body: updateNoteDto }),
  notesController.update
);
notesRouter.delete('/:noteId', validate({ params: tripNoteParamsDto }), notesController.delete);
