import express from 'express';
import {DashboardWidget} from "../src/types/Widgets"
import {getRecentCanyonCount, getTotalDescentsCount, getUniqueCanyonsDescendedCount} from './helpers/dashboard.helper';
import { getUserIdByRequest } from './helpers/user.helper';

const router = express.Router();

router.get('/:widget', async (req, res) => {

    const userId = await getUserIdByRequest(req);

    if(!userId) {
        res.status(401).json({ error: `Could not validate user` });
        return;
    }

    switch(req.params.widget as DashboardWidget) {
        case DashboardWidget.RecentDescents:
            res.status(201).json(await getRecentCanyonCount(userId));
            return;
        case DashboardWidget.TotalDescents:
            res.status(201).json(await getTotalDescentsCount(userId));
            return;
        case DashboardWidget.UniqueDescents:
            res.status(201).json(await getUniqueCanyonsDescendedCount(userId));
            return;
    }

    res.status(400).json({ error: `[${req.params.widget}] is not a valid widget` });
});

export default router;