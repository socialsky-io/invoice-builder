import { Card, CardContent, Grid } from '@mui/material';
import type { FC } from 'react';

interface Props {
  node?: React.ReactNode;
  size?: number;
}

export const Content: FC<Props> = ({ node, size = 8 }) => {
  return (
    <Grid size={{ xs: 12, md: size }} component="div">
      <Card sx={{ height: '100%' }}>
        <CardContent sx={{ height: '100%' }}>{node}</CardContent>
      </Card>
    </Grid>
  );
};
