import { CanyonModalFormValues } from '../components/AddCanyonModal';

export interface CanyonApiBody {
  Name: string;
  Url: string | null;
  RegionId: number | null;
  CanyonType: number;
  AquaticRating: number;
  VerticalRating: number;
  CommitmentRating: number;
  StarRating: number;
  IsUnrated: boolean;
  Notes: string;
}

export function mapCanyonFormToApiBody(values: CanyonModalFormValues): CanyonApiBody {
  return {
    Name: values.name,
    Url: values.url || null,
    RegionId: values.canyonRegionId,
    CanyonType: values.canyonType,
    AquaticRating: Number(values.aquaticRating),
    VerticalRating: Number(values.verticalRating),
    CommitmentRating: Number(values.commitmentRating),
    StarRating: Number(values.starRating),
    IsUnrated: values.isUnrated,
    Notes: values.notes,
  };
}
