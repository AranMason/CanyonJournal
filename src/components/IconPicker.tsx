import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { SvgIconProps } from '@mui/material/SvgIcon';

type IconPickerProps = {
  value: number;
  onChange: (value: number) => void;
  icon: React.ComponentType<SvgIconProps>;
  count?: number;
  activeColor?: SvgIconProps['color'];
  label?: string;
}

/**
 * A row of clickable icons for selecting an integer value 1–count.
 * value=0 means nothing selected. Clicking the active value clears it back to 0.
 * Hovering previews the selection.
 */
const IconPicker: React.FC<IconPickerProps> = ({
  value,
  onChange,
  icon: Icon,
  count = 5,
  activeColor = 'info',
  label,
}) => {
  const [hovered, setHovered] = useState<number | null>(null);

  const displayValue = hovered ?? value;

  const handleClick = (i: number) => {
    onChange(value === i ? 0 : i);
  };

  return (
    <Box display={'flex'} flexDirection={'row'} justifyContent={'space-between'} alignItems={'center'}>
      {label && (
        <Typography variant="body2" color="text.secondary">{label}</Typography>
      )}
      <Box display="flex" gap={0.5} onMouseLeave={() => setHovered(null)}>
        {Array.from({ length: count }, (_, i) => i + 1).map(i => (
          <Icon
            key={i}
            sx={{ cursor: 'pointer', height: '2rem', width: '2rem', transition: 'color 0.1s' }}
            color={displayValue >= i ? activeColor : 'disabled'}
            onMouseEnter={() => setHovered(i)}
            onClick={() => handleClick(i)}
          />
        ))}
      </Box>
      
    </Box>
  );
};

export default IconPicker;
