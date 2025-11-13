import { Card, CardContent, Grid } from '@mui/material';
import type { FC } from 'react';

interface Props {
  node?: React.ReactNode;
}

export const Content: FC<Props> = ({ node }) => {
  return (
    <Grid size={{ xs: 12, md: 8 }} component="div">
      <Card sx={{ height: '100%' }}>
        <CardContent sx={{ height: '100%' }}>{node}</CardContent>
      </Card>
    </Grid>
  );
};
