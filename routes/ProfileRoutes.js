import express from 'express';
import ProfileController from '../controllers/ProfileController.js';
import protect from '../middleware/authMiddleware.js';
import { storage } from '../helpers/storage.js';
const router = express.Router()


router.get('/', protect, ProfileController.get_profile);
router.patch('/', protect, storage, ProfileController.update_profile);
router.patch('/password' , protect , ProfileController.change_password);

export default router