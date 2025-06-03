import express from 'express';
import CategoryController from '../controllers/CategoryController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router()

router.get('/', protect , CategoryController.getCategoryList);
router.get('/:id', protect , CategoryController.getCategory);
router.get('/task/:id', protect , CategoryController.getTasks);
router.post('/', protect , CategoryController.setCategory);
router.patch('/:id', protect , CategoryController.updateCategory);
router.delete('/:id', protect , CategoryController.unsetCategory);

export default router