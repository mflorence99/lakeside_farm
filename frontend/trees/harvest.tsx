import { TreesAppProps } from './app';

import { toISOString } from '../helpers';
import { updateTree } from '../actions';

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
  const stageId = ctx.tree?.getCellValue('Stage')?.[0]?.id;
  const disabled = stageId !== ctx.stageBySymbol['STANDING'];
  // 👇 when OK is clicked
  const ok = async (): Promise<void> => {
    setForm({ ...form, working: true });
    await updateTree({
      date: form.date,
      history: ctx.history,
      stageId: ctx.stageBySymbol['HARVESTED'],
      tree: ctx.tree,
      trees: ctx.trees
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
          <Loader alignSelf="center" scale={0.8} />
        ) : (
          <Button
            alignSelf="center"
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
