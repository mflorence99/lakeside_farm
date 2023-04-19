import { Warning } from './components';

import { createInitialEvent } from './actions';
import { createTree } from './actions';
import { toISOString } from './actions';

import { Box } from '@airtable/blocks/ui';
import { Button } from '@airtable/blocks/ui';
import { FormField } from '@airtable/blocks/ui';
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
  history: Table;
  selectedRecordIds: string[];
  species: Table;
  // 🔥 can't find source for interface SelectOption
  speciesOptions: any[];
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
  context.selectedRecordIds = cursor.selectedRecordIds;
  context.history = base.getTableByName('History');
  context.trees = base.getTableByName('Trees');
  // 👇 load up Species data
  context.species = base.getTableByName('Species');
  context.allSpecies = useRecords(context.species, {
    sorts: [{ field: 'Name' }]
  });
  context.speciesOptions = context.allSpecies.map((record) => ({
    label: record.name,
    value: record.id
  }));
  // 👇 load up Stages data
  context.stages = base.getTableByName('Stages');
  context.allStages = useRecords(context.stages);
  context.stagesByName = context.allStages.reduce((acc, record) => {
    acc[record.getCellValueAsString('Stage')] = record.id;
    return acc;
  }, {});
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
  // 👇 prepare the form
  const [date, setDate] = useState(toISOString(new Date()));
  const [speciesId, setSpeciesId] = useState(null);
  const [working, setWorking] = useState(false);
  const dfltSpecies = { label: 'Pick one', value: null };
  const stageId = context.stagesByName['Standing'];
  // 👇 when OK is clicked
  const ok = async (): Promise<void> => {
    setWorking(true);
    const treeId = await createTree({
      speciesId,
      stageId,
      trees: context.trees
    });
    await createInitialEvent({
      date,
      history: context.history,
      stageId,
      treeId
    });
    setWorking(false);
  };
  // 👇 build the form
  return (
    <Box>
      <Heading>Identify a standing tree</Heading>
      <Box display="flex" justifyContent="space-between">
        <FormField label="Species" width="auto">
          <Select
            onChange={(v: string): void => setSpeciesId(v)}
            options={[dfltSpecies, ...context.speciesOptions]}
            value={speciesId}
          />
        </FormField>
        <FormField label="Date identified" width="auto">
          <input
            onChange={(e): void => setDate(e.target.value)}
            style={{
              border: '1px solid gray',
              height: '30px',
              outline: 'none'
            }}
            type="datetime-local"
            value={date}
          />
        </FormField>
        <Button
          alignSelf="center"
          disabled={!speciesId || working}
          onClick={ok}
          variant="primary"
        >
          OK
        </Button>
      </Box>
    </Box>
  );
}

function DeleteTree(): JSX.Element {
  return (
    <Box>
      <Heading>Delete a tree and ALL its data</Heading>
      {context.selectedRecordIds.length !== 1 ? (
        <Warning text="Select a single tree to delete" />
      ) : (
        <Warning text="Only do this to remove test or incorrect data!" />
      )}
    </Box>
  );
}

function HarvestTree(): JSX.Element {
  return (
    <Box>
      <Heading>Harvest a standing tree</Heading>
      {context.selectedRecordIds.length !== 1 ? (
        <Warning text="Select a single tree to harvest" />
      ) : (
        <form></form>
      )}
    </Box>
  );
}

function LogTree(): JSX.Element {
  return (
    <Box>
      <Heading>Cut a harvested tree into logs</Heading>
      {context.selectedRecordIds.length !== 1 ? (
        <Warning text="Select a single tree to cut into logs" />
      ) : (
        <form></form>
      )}
    </Box>
  );
}
