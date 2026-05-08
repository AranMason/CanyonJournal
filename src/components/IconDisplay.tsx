import React from 'react';
import { SvgIconProps } from '@mui/material/SvgIcon';
import { Box } from '@mui/material';

type IconDisplayProps = {
  value: number;
  icon: React.ComponentType<SvgIconProps>;
  count?: number;
  activeColor?: SvgIconProps['color'];
};

const IconDisplay: React.FC<IconDisplayProps> = ({
  value,
  icon: Icon,
  count = 5,
  activeColor = 'info',
}) => (
  <Box display="flex">
    {[...Array(count)].map((_, i) => (
      <Icon
        key={i}
        sx={{ height: '1rem', width: '1rem' }}
        color={value >= i + 1 ? activeColor : 'disabled'}
      />
    ))}
  </Box>
);

export default IconDisplay;
