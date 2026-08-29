import { Box, Button, Typography } from '@mui/material';
import React from 'react';

type EmptyCellCtaProps = {
    description: string;
    cta: string;
    ctaIcon: React.ReactNode
    ctaAction: () => void
}

const EmptyCellCta: React.FC<EmptyCellCtaProps> = ({ description, cta, ctaIcon, ctaAction }) => {
    return <Box
        display={'flex'}
        gap={2}
        flexDirection={'column'}
        minHeight={'100px'}
        alignItems={'center'}
        justifyContent={'center'}
        my={2}
        mx={1}>
        <Typography variant="body2" color="textSecondary" textAlign={'center'}>
            {description}
        </Typography>
        <Button variant='contained' startIcon={ctaIcon} onClick={ctaAction}>
            {cta}
        </Button>
    </Box>
}

export default EmptyCellCta;