import express from 'express';
const router = express.Router()

import AccessController from '../controllers/AccessController.js';

router.get('/', AccessController.validate);
router.get('/validate', AccessController.validate);
router.post('/register', AccessController.register);
router.post('/login', AccessController.login);

export default router