import express, { Router } from "express";
import branchRoutes from './branchRoutes.js';
import categoryRoutes from './categoryRoutes.js';
import authRoutes from './authRoutes.js'


const router = express.Router();


router.use('/branch', branchRoutes)
router.use('/auth', authRoutes)
router.use('/admin/category',categoryRoutes)


export default router;