import { Warning } from './components';

import { createInitialEvent } from './actions';
import { createTree } from './actions';

import { Box } from '@airtable/blocks/ui';
import { Button } from '@airtable/blocks/ui';
import { Heading } from '@airtable/blocks/ui';
import { Record } from '@airtable/blocks/models';
import { Select } from '@airtable/blocks/ui';
import { Table } from '@airtable/blocks/models';

import { useBase } from '@airtable/blocks/ui';
import { useCursor } from '@airtable/blocks/ui';
import { useLoadable } from '@airtable/blocks/ui';
import { useRecords } from '@airtable/blocks/ui';
import { useState } from 'react';
import { useWatchable } from '@airtable/blocks/ui';

import React from 'react';

type Context = {
  allSpecies: Record[];
  allStages: Record[];
  events: Table;
  selectedRecordIds: string[];
  species: Table;
  stages: Table;
  stagesByName: { [name: string]: string };
  trees: Table;
};

const context: Partial<Context> = {};

// /////////////////////////////////////////////////////////////////////////////
// COMPONENTS
// /////////////////////////////////////////////////////////////////////////////

export default function TreesApp(): JSX.Element {
  // 👇 build the context
  const base = useBase();
  const cursor = useCursor();
  useLoadable(cursor);
  useWatchable(cursor, ['selectedRecordIds']);
  context.species = base.getTableByName('Species');
  context.allSpecies = useRecords(context.species);
  context.stages = base.getTableByName('Stages');
  context.allStages = useRecords(context.stages);
  context.stagesByName = context.allStages.reduce((acc, record) => {
    acc[record.getCellValueAsString('Stage')] = record.id;
    return acc;
  }, {});
  context.selectedRecordIds = cursor.selectedRecordIds;
  context.events = base.getTableByName('Events');
  context.trees = base.getTableByName('Trees');
  // 👇 build the app
  return (
    <Box>
      <CreateTree />
      <HarvestTree />
      <LogTree />
      <DeleteTree />
    </Box>
  );
}

function CreateTree(): JSX.Element {
  // 👇 convert the species to a dropdown list
  const options = context.allSpecies.map((record) => ({
    label: record.name,
    value: record.id
  }));
  // 👇 prepare the form
  const [date, setDate] = useState(new Date().toISOString().substring(0, 16));
  const [speciesId, setSpeciesId] = useState(options[0].value);
  const [working, setWorking] = useState(false);
  const stageId = context.stagesByName['Standing'];
  // 👇 when OK is clicked
  const ok = async (): Promise<void> => {
    setWorking(true);
    const treeId = await createTree({
      speciesId,
      stageId,
      trees: context.trees
    });
    await createInitialEvent({ date, events: context.events, stageId, treeId });
    setWorking(false);
  };
  // 👇 build the form
  const form = (
    <Box display="flex" justifyContent="space-between">
      <Select
        onChange={(v: string): void => setSpeciesId(v)}
        options={options}
        value={speciesId}
        width="auto"
      />
      <input
        onChange={(e): void => setDate(e.target.value)}
        style={{ alignSelf: 'center', border: 'none', outline: 'none' }}
        type="datetime-local"
        value={date}
      />
      <Button disabled={!speciesId || working} onClick={ok} variant="primary">
        OK
      </Button>
    </Box>
  );
  return (
    <Box marginBottom={3}>
      <Heading>Identify a standing tree</Heading>
      {form}
    </Box>
  );
}

function DeleteTree(): JSX.Element {
  let form;
  if (context.selectedRecordIds.length !== 1)
    form = <Warning text="Select a single tree to delete" />;
  else form = <Warning text="Only do this to remove test or incorrect data!" />;
  return (
    <Box marginBottom={3}>
      <Heading>Delete a tree and ALL its data</Heading>
      {form}
    </Box>
  );
}

function HarvestTree(): JSX.Element {
  let form;
  if (context.selectedRecordIds.length !== 1)
    form = <Warning text="Select a single tree to harvest" />;
  else form = <form></form>;
  return (
    <Box marginBottom={3}>
      <Heading>Harvest a standing tree</Heading>
      {form}
    </Box>
  );
}

function LogTree(): JSX.Element {
  let form;
  if (context.selectedRecordIds.length !== 1)
    form = <Warning text="Select a single tree to cut into logs" />;
  else form = <form></form>;
  return (
    <Box marginBottom={3}>
      <Heading>Cut a harvested tree into logs</Heading>
      {form}
    </Box>
  );
}
