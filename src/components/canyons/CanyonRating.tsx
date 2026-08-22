import React from 'react';

interface CanyonRatingProps {
  aquaticRating?: number;
  verticalRating?: number;
  commitmentRating?: number;
  starRating?: number;
  isUnrated?: boolean;
  /** When true, omits any segment whose value is undefined rather than showing '?'. */
  hideUnknown?: boolean;
}

export const COMMITMENT_RATINGS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];

const CanyonRating: React.FC<CanyonRatingProps> = ({ aquaticRating, verticalRating, commitmentRating, starRating, isUnrated, hideUnknown }) => {

  if (isUnrated) {
    return "Ungraded";
  }

  const vertical   = verticalRating   != null ? `V${verticalRating}`   : hideUnknown ? null : 'V?';
  const aquatic    = aquaticRating    != null ? `A${aquaticRating}`    : hideUnknown ? null : 'A?';
  const commitment = commitmentRating ? COMMITMENT_RATINGS[commitmentRating - 1] : null;
  const stars      = starRating ? '★'.repeat(starRating) : null;

  const parts = [vertical, aquatic, commitment, stars].filter(Boolean);

  return (
    <span>{parts.join(' ')}</span>
  );
};

export default CanyonRating;
