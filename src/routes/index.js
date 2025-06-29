import express, { Router } from "express";
import branchRoutes from './branchRoutes.js';
import categoryRoutes from './categoryRoutes.js';
import authRoutes from './authRoutes.js';
import orderRoutes from './orderRoutes.js'
import uploadRoutes from './uploadFile.js';
import modifierRoutes from './modiferRoutes.js';


const router = express.Router();


router.use('/branch', branchRoutes)
router.use('/', uploadRoutes)
router.use('/auth', authRoutes)
router.use('/order', orderRoutes)
router.use('/admin/category',categoryRoutes)
router.use('/admin/modifier',modifierRoutes)


export default router;