import { Router } from 'express';
import { FoodController } from './food.controller.js';

const router = Router();

router.get('/foods', FoodController.search);
router.get('/foods/:id', FoodController.getById);
router.get('/food-categories', FoodController.getCategories);

export default router;
