import express, { Router } from "express";
import user from './user'
import record from './record'
import gear from './gear'
import canyons from './canyons'
import dashboard from './dashboard';

const router: Router = express.Router()

router.use('/', user);
router.use('/dashboard', dashboard);
router.use('/record', record);
router.use('/equipment', gear);
router.use('/canyons', canyons);

export default router;