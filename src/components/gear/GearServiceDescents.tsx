import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import CanyonRecordAccordion from '../CanyonRecordAccordion/CanyonRecordAccordion';
import * as EquipmentDataStore from '../../helpers/EquipmentDataStore';
import { useCanyonRecords } from '../../hooks/useCanyonRecords';
import { useTranslation } from 'react-i18next';
import Loader from '../Loader';

interface GearServiceDescentsProps {
  gearId: number;
}

const GearServiceDescents: React.FC<GearServiceDescentsProps> = ({ gearId }) => {
  const { t } = useTranslation();
  const [sectionOpen, setSectionOpen] = useState<number | null>(null);

  const { canyonsById, userCanyonsById, isLoading, records } = useCanyonRecords(
    () => EquipmentDataStore.loadGearDescents(gearId),
    true
  );

  function handleAccordionToggle(id: number | null) {
    setSectionOpen(prev => prev === id ? null : id);
  }

  return (
    <Loader isLoading={isLoading} >
    <Box>
      {records.length > 0 ? records.map(rec => (
        <CanyonRecordAccordion
          key={rec.Id ?? rec.Timestamp ?? `${rec.Name}-${rec.Date}`}
          isOpen={sectionOpen === rec.Id}
          onChange={() => handleAccordionToggle(rec.Id ?? null)}
          record={rec}
          canyon={
            rec.CanyonId
              ? canyonsById[rec.CanyonId]
              : rec.UserCanyonId
              ? userCanyonsById[rec.UserCanyonId]
              : undefined
          }
        />
      )): <Typography sx={{ p: 2, fontStyle: 'italic' }}>
        {t('journal.noRecords')}
      </Typography>}
    </Box>
    </Loader>
  );
};

export default GearServiceDescents;
