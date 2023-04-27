import { Box } from '@airtable/blocks/ui';
import { Button } from '@airtable/blocks/ui';
import { Loader } from '@airtable/blocks/ui';

import React from 'react';

export default function OKButton({
  disabled,
  onClick,
  variant = 'primary',
  working
}): JSX.Element {
  return (
    <Box alignSelf="center">
      {working ? (
        <Loader alignSelf="center" className="spinner" scale={0.3} />
      ) : (
        <Button
          className="ok-button"
          disabled={disabled}
          onClick={onClick}
          variant={variant as any}
        >
          OK
        </Button>
      )}
    </Box>
  );
}
