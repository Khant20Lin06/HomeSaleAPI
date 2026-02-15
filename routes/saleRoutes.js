import express from 'express';
import { createSale, getSales, getSaleById, getStats, deleteSale, getSalesTrend, getTopProducts } from '../controllers/saleController.js';

const router = express.Router();

router.get('/stats', getStats);
router.get('/trend', getSalesTrend);
router.get('/top-products', getTopProducts);
router.post('/', createSale);
router.get('/', getSales);
router.get('/:id', getSaleById);
router.delete('/:id', deleteSale);

export default router;
