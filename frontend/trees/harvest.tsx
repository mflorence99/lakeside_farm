import { TreesAppProps } from './app';

import { getLinkCellId } from '../helpers';
import { toISOString } from '../helpers';
import { updateRecord } from '../actions';

import { Box } from '@airtable/blocks/ui';
import { Button } from '@airtable/blocks/ui';
import { CellRenderer } from '@airtable/blocks/ui';
import { FormField } from '@airtable/blocks/ui';
import { Heading } from '@airtable/blocks/ui';
import { Loader } from '@airtable/blocks/ui';

import { expandRecord } from '@airtable/blocks/ui';
import { useState } from 'react';

import React from 'react';

export default function HarvestTree({ ctx }: TreesAppProps): JSX.Element {
  // 👇 prepare the form
  const [form, setForm] = useState({
    date: toISOString(new Date()),
    working: false
  });
  const stageId = getLinkCellId(ctx.tree, 'Stage');
  const disabled = stageId !== ctx.stageBySymbol['STANDING'];
  // 👇 when OK is clicked
  const ok = async (): Promise<void> => {
    setForm({ ...form, working: true });
    await updateRecord({
      date: form.date,
      history: ctx.history,
      logId: null,
      record: ctx.tree,
      stageId: ctx.stageBySymbol['HARVESTED'],
      table: ctx.trees,
      treeId: ctx.tree.id
    });
    expandRecord(ctx.tree);
    setForm({ ...form, working: false });
  };
  // 👇 build the form
  return (
    <Box className="divided-box">
      <Heading>Harvest a standing tree</Heading>

      <Box display="flex" justifyContent="space-between">
        <FormField label="Tree to harvest" width="auto">
          <CellRenderer
            field={ctx.trees.getFieldByName('Name')}
            record={ctx.tree}
          />
        </FormField>
        <FormField label="When harvested" width="auto">
          <input
            className="datetime-input"
            onChange={(e): void => setForm({ ...form, date: e.target.value })}
            type="datetime-local"
            value={form.date}
          />
        </FormField>
        {form.working ? (
          <Loader alignSelf="center" className="spinner" scale={0.3} />
        ) : (
          <Button
            alignSelf="center"
            className="ok-button"
            disabled={disabled}
            onClick={ok}
            variant="primary"
          >
            OK
          </Button>
        )}
      </Box>
    </Box>
  );
}
