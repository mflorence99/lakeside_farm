import { Warning } from './components';

import TreesApp from './trees';

import { Box } from '@airtable/blocks/ui';

import { useBase } from '@airtable/blocks/ui';
import { useCursor } from '@airtable/blocks/ui';
import { useLoadable } from '@airtable/blocks/ui';

import React from 'react';

export default function LakesideFarmApp(): JSX.Element {
  const base = useBase();
  const cursor = useCursor();
  useLoadable(cursor);
  // 👇 dispatch according to table
  let jsx;
  const table = base.getTableByIdIfExists(cursor.activeTableId);
  switch (table?.name) {
    case 'Trees':
      jsx = <TreesApp />;
      break;
    default:
      jsx = <Warning text="Switch to Trees, Logs, or Finished Wood table" />;
  }
  return <Box padding={2}>{jsx}</Box>;
}
