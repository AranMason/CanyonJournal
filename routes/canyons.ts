import express from 'express';
import { Canyon } from '../src/types/Canyon';   
const router = express.Router();

const canyons: Canyon[] = [
  {
      id: 1,
      name: 'Tummel',
      url: 'https://canyonlog.org/map/tummel/',
      aquaticRating: 2,
      verticalRating: 3,
      starRating: 2,
      commitmentRating: 1
  },
  {
      id: 2,
      name: 'Falls of Bruar',
      url: 'https://canyonlog.org/map/falls-of-bruar/',
      aquaticRating: 4,
      verticalRating: 3,
      starRating: 3,
      commitmentRating: 2
  },
  {
      id: 3,
      name: 'Birks of Aberfeldy',
      url: 'https://canyonlog.org/map/birks-of-aberfeldy/',
      aquaticRating: 3,
      verticalRating: 3,
      starRating: 2,
      commitmentRating: 2
  },
  {
      id: 4,
      name: 'Alva Glen',
      url: 'https://canyonlog.org/map/alva-glen-canyon/',
      aquaticRating: 3,
      verticalRating: 3,
      starRating: 3,
      commitmentRating: 3
  },
{
      id: 5,
      name: 'Dollar',
      url: 'https://canyonlog.org/map/dollar-canyon/',
      aquaticRating: 3,
      verticalRating: 3,
      starRating: 3,
      commitmentRating: 2
  }
];

// GET /api/canyons - return the list of canyons
router.get('/', (req, res) => {
  res.json(canyons);
});

export default router;
