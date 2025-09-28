import React from 'react';
import { Box, Typography } from '@mui/material';

interface CanyonRatingProps {
  aquaticRating?: number;
  verticalRating?: number;
  commitmentRating?: number;
  starRating?: number;
}

const CanyonRating: React.FC<CanyonRatingProps> = ({ aquaticRating, verticalRating, commitmentRating, starRating }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'row', gap: 0.5 }}><Typography variant="body1">
        V{verticalRating} A{aquaticRating} {'I'.repeat(commitmentRating ?? 0)} {'★'.repeat(starRating ?? 0)}
        </Typography>
  
    </Box>
  );
};

export default CanyonRating;
