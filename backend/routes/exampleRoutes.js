import { Router } from 'express';
const router = Router();
import { getExample } from '../controllers/exampleController.js';

router.route('/').get(getExample);

export default router;
