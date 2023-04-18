import { Box } from '@airtable/blocks/ui';
import { Icon } from '@airtable/blocks/ui';
import { Text } from '@airtable/blocks/ui';

import React from 'react';

export function Warning({ text }): JSX.Element {
  return (
    <Box alignItems="center" display="flex">
      <Icon fillColor="red" name="warning" size={16} />
      &nbsp;
      <Text>{text}</Text>
    </Box>
  );
}
