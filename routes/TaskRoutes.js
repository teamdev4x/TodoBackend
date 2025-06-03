import express from 'express';
import TaskController from '../controllers/TaskController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router()

router.get('/', protect , TaskController.getTaskList);
router.get('/:id', protect , TaskController.getTask);
router.post('/', protect , TaskController.setTask);
router.patch('/:id', protect , TaskController.updateTask);
router.delete('/:id', protect , TaskController.unsetTask);

export default router