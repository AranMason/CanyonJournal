import express, { Router } from "express";

const router: Router = express.Router()


router.use('/', require('./user').default);
router.use('/record', require('./record').default);
router.use('/equipment', require('./gear').default);

export default router;