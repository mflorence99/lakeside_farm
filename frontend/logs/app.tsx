import MillLog from './slabs';
import ScrapLog from './scrap';

import { Box } from '@airtable/blocks/ui';
import { Record } from '@airtable/blocks/models';
import { Table } from '@airtable/blocks/models';

import { useBase } from '@airtable/blocks/ui';
import { useCursor } from '@airtable/blocks/ui';
import { useLoadable } from '@airtable/blocks/ui';
import { useRecordById } from '@airtable/blocks/ui';
import { useRecords } from '@airtable/blocks/ui';
import { useWatchable } from '@airtable/blocks/ui';

import React from 'react';

export type LogsAppContext = {
  allStages: Record[];
  history: Table;
  log: Record;
  logs: Table;
  products: Table;
  stageBySymbol: { [symbol: string]: string };
  stages: Table;
};

export type LogsAppProps = {
  ctx: LogsAppContext;
  productType?: string;
};

export default function TreesApp(): JSX.Element {
  const base = useBase();
  const cursor = useCursor();
  useLoadable(cursor);
  useWatchable(cursor, ['selectedRecordIds']);
  // 👇 build the context
  const ctx: LogsAppContext = {
    allStages: null,
    history: base.getTableByName('History'),
    log: null,
    logs: base.getTableByName('Logs'),
    products: base.getTableByName('Products'),
    stageBySymbol: null,
    stages: base.getTableByName('Stages')
  };
  // 👇 load up Stages data
  ctx.allStages = useRecords(ctx.stages);
  ctx.stageBySymbol = ctx.allStages.reduce((acc, record) => {
    acc[record.getCellValueAsString('SYMBOL')] = record.id;
    return acc;
  }, {});
  // 👇 load up the current Log
  ctx.log = useRecordById(
    ctx.logs,
    cursor.selectedRecordIds.length === 1 ? cursor.selectedRecordIds[0] : ''
  );
  // 👇 now the context is readonly!
  Object.freeze(ctx);
  // 👇 build the app
  return (
    <Box>
      <MillLog ctx={ctx} productType="Slab" />
      <MillLog ctx={ctx} productType="Board" />
      <ScrapLog ctx={ctx} />
    </Box>
  );
}
