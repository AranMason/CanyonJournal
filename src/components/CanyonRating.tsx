import React from 'react';

interface CanyonRatingProps {
  aquaticRating?: number;
  verticalRating?: number;
  commitmentRating?: number;
  starRating?: number;
}

const ratings = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];

const CanyonRating: React.FC<CanyonRatingProps> = ({ aquaticRating, verticalRating, commitmentRating, starRating }) => {
  return (
    <>
        V{verticalRating ?? "?"} A{aquaticRating ?? "?"} {commitmentRating && ratings[commitmentRating-1]} {'★'.repeat(starRating ?? 0)}
    </>
  );
};

export default CanyonRating;
