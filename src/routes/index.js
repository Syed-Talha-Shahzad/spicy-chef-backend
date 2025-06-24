import express, { Router } from "express";
import branchRoutes from './branchRoutes.js';
import categoryRoutes from './categoryRoutes.js';
import authRoutes from './authRoutes.js';
import orderRoutes from './orderRoutes.js'


const router = express.Router();


router.use('/branch', branchRoutes)
router.use('/auth', authRoutes)
router.use('/order', orderRoutes)
router.use('/admin/category',categoryRoutes)


export default router;