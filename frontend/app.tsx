import './styles.css';

import { SelectOption } from './airtable';
import { Warning } from './components';

import { fld } from './constants';
import { tbl } from './constants';

import LogsApp from './logs/app';
import TreesApp from './trees/app';

import { Box } from '@airtable/blocks/ui';
import { Record } from '@airtable/blocks/models';
import { Table } from '@airtable/blocks/models';

import { useBase } from '@airtable/blocks/ui';
import { useCursor } from '@airtable/blocks/ui';
import { useLoadable } from '@airtable/blocks/ui';
import { useRecords } from '@airtable/blocks/ui';
import { useWatchable } from '@airtable/blocks/ui';

import React from 'react';

export type AppContext = {
  [name in keyof typeof tbl]?: Table;
};

export type AppData = {
  log?: Record;
  product?: Record;
  selectedRecordId?: string;
  speciesOptions?: SelectOption[];
  stageBySymbol?: { [symbol: string]: string };
  tree?: Record;
};

export type AppProps = {
  ctx: AppContext;
  data: AppData;
};

export default function LakesideFarmApp(): JSX.Element {
  // 👇 prepare the app
  const base = useBase();
  // 👇 perform sanity check
  const errors = Object.keys(tbl).reduce((acc, key) => {
    const table = base.getTableByNameIfExists(tbl[key]);
    if (!table) acc.push(`Table ${tbl[key]} does not exist`);
    return acc;
  }, []);
  if (errors.length > 0) return <Insane errors={errors} />;
  else return <Sane />;
}

function Insane({ errors }): JSX.Element {
  return (
    <Box padding={2}>
      {errors.map((error) => (
        <Warning key={error} text={error} />
      ))}
    </Box>
  );
}

function Sane(): JSX.Element {
  // 👇 prepare the app
  const base = useBase();
  const cursor = useCursor();
  useLoadable(cursor);
  useWatchable(cursor, ['selectedRecordIds']);
  // 👇 build the app context
  const ctx: AppContext = Object.keys(tbl).reduce((acc, key) => {
    acc[key] = base.getTableByName(tbl[key]);
    return acc;
  }, {});
  // 👇 load up Species data
  const data: AppData = {};
  const allSpecies = useRecords(ctx.SPECIES, {
    sorts: [{ field: 'Name' }]
  });
  data.speciesOptions = allSpecies.map((record) => ({
    label: record.name,
    value: record.id
  }));
  // 👇 load up Stages data
  const allStages = useRecords(ctx.STAGES);
  data.stageBySymbol = allStages.reduce((acc, record) => {
    acc[record.getCellValueAsString(fld.SYMBOL)] = record.id;
    return acc;
  }, {});
  // 👇 extract the selectedRecordId
  data.selectedRecordId =
    cursor.selectedRecordIds.length === 1 ? cursor.selectedRecordIds[0] : '';
  // 👇 dispatch according to table
  let jsx;
  const table = base.getTableByIdIfExists(cursor.activeTableId);
  switch (table?.name) {
    case tbl.LOGS:
      jsx = <LogsApp ctx={ctx} data={data} />;
      break;
    case tbl.TREES:
      jsx = <TreesApp ctx={ctx} data={data} />;
      break;
    default:
      jsx = (
        <Warning
          text={`Switch to ${tbl.TREES}, ${tbl.LOGS}, or ${tbl.PRODUCTS} table`}
        />
      );
  }
  // 👇 all in a wrapper
  return <Box padding={2}>{jsx}</Box>;
}
