import express from 'express';
import NotesController from '../controllers/NotesController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router()

router.get('/', protect , NotesController.getNotesList);
router.get('/:id', protect , NotesController.getNotes);
router.post('/', protect , NotesController.setNotes);
router.patch('/:id', protect , NotesController.updateNotes);
router.delete('/:id', protect , NotesController.unsetNotes);

export default router