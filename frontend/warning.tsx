import { Box } from '@airtable/blocks/ui';
import { Icon } from '@airtable/blocks/ui';
import { Text } from '@airtable/blocks/ui';

import { colors } from '@airtable/blocks/ui';

import React from 'react';

export default function Warning({ text }): JSX.Element {
  return (
    <Box alignItems="center" display="flex">
      <Icon fillColor={colors.RED} name="warning" size={16} />
      &nbsp;
      <Text>{text}</Text>
    </Box>
  );
}
