import express, { Router } from "express";
import user from './user'
import record from './record'
import gear from './gear'
import canyons from './canyons'
import dashboard from './dashboard';
import userCanyons from './userCanyons';
import favourites from './favourites';
import tags from './tags';
import sources from './sources';
import reports from './reports';

const router: Router = express.Router()

router.use('/', user);
router.use('/dashboard', dashboard);
router.use('/record', record);
router.use('/equipment', gear);
router.use('/canyons', canyons);
router.use('/user-canyons', userCanyons);
router.use('/favourites', favourites);
router.use('/tags', tags);
router.use('/sources', sources);
router.use('/reports', reports);

export default router;