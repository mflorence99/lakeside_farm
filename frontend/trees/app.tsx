import CreateTree from './create';
import DeleteTree from './delete';
import HarvestTree from './harvest';
import LogTree from './log';

import { Box } from '@airtable/blocks/ui';
import { Record } from '@airtable/blocks/models';
import { Table } from '@airtable/blocks/models';

import { useBase } from '@airtable/blocks/ui';
import { useCursor } from '@airtable/blocks/ui';
import { useLoadable } from '@airtable/blocks/ui';
import { useRecords } from '@airtable/blocks/ui';
import { useWatchable } from '@airtable/blocks/ui';

import React from 'react';

type TreesAppContext = {
  allSpecies: Record[];
  allStages: Record[];
  history: Table;
  logs: Table;
  selectedRecordIds: string[];
  species: Table;
  // 🔥 can't find source for interface SelectOption
  speciesOptions: any[];
  stageBySymbol: { [symbol: string]: string };
  stages: Table;
  trees: Table;
};

export default function TreesApp(): JSX.Element {
  const base = useBase();
  const cursor = useCursor();
  useLoadable(cursor);
  useWatchable(cursor, ['selectedRecordIds']);
  // 👇 build the context
  const ctx: TreesAppContext = {
    allSpecies: null,
    allStages: null,
    history: base.getTableByName('History'),
    logs: base.getTableByName('Logs'),
    selectedRecordIds: cursor.selectedRecordIds,
    species: base.getTableByName('Species'),
    speciesOptions: null,
    stageBySymbol: null,
    stages: base.getTableByName('Stages'),
    trees: base.getTableByName('Trees')
  };
  // 👇 load up Species data
  ctx.allSpecies = useRecords(ctx.species, {
    sorts: [{ field: 'Name' }]
  });
  ctx.speciesOptions = ctx.allSpecies.map((record) => ({
    label: record.name,
    value: record.id
  }));
  // 👇 load up Stages data
  ctx.allStages = useRecords(ctx.stages);
  ctx.stageBySymbol = ctx.allStages.reduce((acc, record) => {
    acc[record.getCellValueAsString('SYMBOL')] = record.id;
    return acc;
  }, {});
  // 👇 build the app
  return (
    <Box>
      <CreateTree ctx={ctx} />
      <HarvestTree ctx={ctx} />
      <LogTree ctx={ctx} />
      <DeleteTree ctx={ctx} />
    </Box>
  );
}
