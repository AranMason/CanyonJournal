import express, { Router } from "express";

const router: Router = express.Router()


router.use('/', require('./user').default);
router.use('/record', require('./record').default);
router.use('/equipment', require('./gear').default);
router.use('/canyons', require('./canyons').default);

export default router;