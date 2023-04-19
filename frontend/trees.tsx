import { Warning } from './components';

import { createTree } from './actions';
import { deleteTree } from './actions';
import { getRecordById } from './actions';
import { toISOString } from './helpers';
import { updateTree } from './actions';

import { Box } from '@airtable/blocks/ui';
import { Button } from '@airtable/blocks/ui';
import { CellRenderer } from '@airtable/blocks/ui';
import { ConfirmationDialog } from '@airtable/blocks/ui';
import { FormField } from '@airtable/blocks/ui';
import { Heading } from '@airtable/blocks/ui';
import { Record } from '@airtable/blocks/models';
import { Select } from '@airtable/blocks/ui';
import { Table } from '@airtable/blocks/models';

import { expandRecord } from '@airtable/blocks/ui';
import { useBase } from '@airtable/blocks/ui';
import { useCursor } from '@airtable/blocks/ui';
import { useLoadable } from '@airtable/blocks/ui';
import { useRecordById } from '@airtable/blocks/ui';
import { useRecords } from '@airtable/blocks/ui';
import { useState } from 'react';
import { useWatchable } from '@airtable/blocks/ui';

import React from 'react';

type Context = {
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
  context.logs = base.getTableByName('Logs');
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
  context.stageBySymbol = context.allStages.reduce((acc, record) => {
    acc[record.getCellValueAsString('SYMBOL')] = record.id;
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
  const stageId = context.stageBySymbol['STANDING'];
  // 👇 when OK is clicked
  const ok = async (): Promise<void> => {
    setWorking(true);
    const treeId = await createTree({
      date,
      history: context.history,
      speciesId,
      stageId,
      trees: context.trees
    });
    expandRecord(
      await getRecordById({
        recordId: treeId,
        table: context.trees
      })
    );
    setWorking(false);
  };
  // 👇 build the form
  return (
    <Box borderBottom="1px dotted gray">
      <Heading>Identify a standing tree</Heading>
      <Box display="flex" justifyContent="space-between">
        <FormField label="Species" width="auto">
          <Select
            onChange={(v: string): void => setSpeciesId(v)}
            options={[dfltSpecies, ...context.speciesOptions]}
            value={speciesId}
          />
        </FormField>
        <FormField label="When identified" width="auto">
          <input
            onChange={(e): void => setDate(e.target.value)}
            style={{
              border: '1px dotted gray',
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
  // 👇 prepare the form
  const record = useRecordById(
    context.trees,
    context.selectedRecordIds[0] ?? ''
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [working, setWorking] = useState(false);
  // 👇 when OK is clicked
  const ok = async (): Promise<void> => {
    setWorking(true);
    await deleteTree({
      history: context.history,
      logs: context.logs,
      tree: record,
      trees: context.trees
    });
    setWorking(false);
    setIsDialogOpen(false);
  };
  // 👇 build the form
  return (
    <Box borderBottom="1px dotted gray">
      {isDialogOpen && record && (
        <ConfirmationDialog
          body={`Tree ${record.getCellValueAsString(
            'Name'
          )} and ALL its associated data will be permanently deleted. Only perform this action in order to clean up test data etc.`}
          isConfirmActionDangerous={true}
          onCancel={(): void => setIsDialogOpen(false)}
          onConfirm={ok}
          title="Are you sure?"
        />
      )}
      <Heading>Delete a tree and ALL its data</Heading>
      {context.selectedRecordIds.length !== 1 || !record ? (
        <Warning text="Select a single tree to delete" />
      ) : (
        <Box display="flex" justifyContent="space-between">
          <FormField label="Tree to delete" width="auto">
            <CellRenderer
              field={context.trees.getFieldByName('Name')}
              record={record}
            />
          </FormField>
          <Button
            alignSelf="center"
            disabled={working}
            onClick={(): void => setIsDialogOpen(true)}
            variant="primary"
          >
            OK
          </Button>
        </Box>
      )}
    </Box>
  );
}

function HarvestTree(): JSX.Element {
  // 👇 prepare the form
  const record = useRecordById(
    context.trees,
    context.selectedRecordIds[0] ?? ''
  );
  const stageId = record?.getCellValue('Stage')?.[0]?.id;
  const [date, setDate] = useState(toISOString(new Date()));
  const [working, setWorking] = useState(false);
  // 👇 when OK is clicked
  const ok = async (): Promise<void> => {
    setWorking(true);
    await updateTree({
      date,
      history: context.history,
      stageId: context.stageBySymbol['HARVESTED'],
      tree: record,
      trees: context.trees
    });
    expandRecord(record);
    setWorking(false);
  };
  // 👇 build the form
  return (
    <Box borderBottom="1px dotted gray">
      <Heading>Harvest a standing tree</Heading>
      {context.selectedRecordIds.length !== 1 ||
      stageId !== context.stageBySymbol['STANDING'] ? (
        <Warning text="Select a standing tree to harvest" />
      ) : (
        <Box display="flex" justifyContent="space-between">
          <FormField label="Tree to harvest" width="auto">
            <CellRenderer
              field={context.trees.getFieldByName('Name')}
              record={record}
            />
          </FormField>
          <FormField label="When harvested" width="auto">
            <input
              onChange={(e): void => setDate(e.target.value)}
              style={{
                border: '1px dotted gray',
                height: '30px',
                outline: 'none'
              }}
              type="datetime-local"
              value={date}
            />
          </FormField>
          <Button
            alignSelf="center"
            disabled={working}
            onClick={ok}
            variant="primary"
          >
            OK
          </Button>
        </Box>
      )}
    </Box>
  );
}

function LogTree(): JSX.Element {
  return (
    <Box borderBottom="1px dotted gray">
      <Heading>Cut a harvested tree into logs</Heading>
      {context.selectedRecordIds.length !== 1 ? (
        <Warning text="Select a harvested tree to cut into logs" />
      ) : (
        <form></form>
      )}
    </Box>
  );
}
