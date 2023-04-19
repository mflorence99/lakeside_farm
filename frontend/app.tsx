import { Warning } from './components';

import TreesApp from './trees/app';

import { Box } from '@airtable/blocks/ui';

import { colors } from '@airtable/blocks/ui';
import { loadCSSFromString } from '@airtable/blocks/ui';
import { useBase } from '@airtable/blocks/ui';
import { useCursor } from '@airtable/blocks/ui';
import { useLoadable } from '@airtable/blocks/ui';

import React from 'react';

const css = `
  .datetime-input {
    border: 1px dotted ${colors.GRAY};
    height: 30px;
    outline: none;
  }

  .divided-box {
    border-bottom: 1px dotted ${colors.GRAY};
  }
`;

export default function LakesideFarmApp(): JSX.Element {
  const base = useBase();
  const cursor = useCursor();
  useLoadable(cursor);
  loadCSSFromString(css);
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
