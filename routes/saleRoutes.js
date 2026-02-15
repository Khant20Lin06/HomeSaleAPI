import express from 'express';
import { createSale, getSales, getSaleById, getStats, deleteSale } from '../controllers/saleController.js';

const router = express.Router();

router.get('/stats', getStats); // Must be before /:id to avoid conflict
router.post('/', createSale);
router.get('/', getSales);
router.get('/:id', getSaleById);
router.delete('/:id', deleteSale);

export default router;
