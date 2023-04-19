import { Warning } from '../components';

import { toISOString } from '../helpers';
import { updateTree } from '../actions';

import { Box } from '@airtable/blocks/ui';
import { Button } from '@airtable/blocks/ui';
import { CellRenderer } from '@airtable/blocks/ui';
import { FormField } from '@airtable/blocks/ui';
import { Heading } from '@airtable/blocks/ui';

import { expandRecord } from '@airtable/blocks/ui';
import { useRecordById } from '@airtable/blocks/ui';
import { useState } from 'react';

import React from 'react';

export default function HarvestTree({ ctx }): JSX.Element {
  // 👇 prepare the form
  const [form, setForm] = useState({
    date: toISOString(new Date()),
    working: false
  });
  const record = useRecordById(ctx.trees, ctx.selectedRecordIds[0] ?? '');
  const stageId = record?.getCellValue('Stage')?.[0]?.id;
  // 👇 when OK is clicked
  const ok = async (): Promise<void> => {
    setForm({ ...form, working: true });
    await updateTree({
      date: form.date,
      history: ctx.history,
      stageId: ctx.stageBySymbol['HARVESTED'],
      tree: record,
      trees: ctx.trees
    });
    expandRecord(record);
    setForm({ ...form, working: false });
  };
  // 👇 build the form
  return (
    <Box className="divided-box">
      <Heading>Harvest a standing tree</Heading>
      {ctx.selectedRecordIds.length !== 1 ||
      stageId !== ctx.stageBySymbol['STANDING'] ? (
        <Warning text="Select a standing tree to harvest" />
      ) : (
        <Box display="flex" justifyContent="space-between">
          <FormField label="Tree to harvest" width="auto">
            <CellRenderer
              field={ctx.trees.getFieldByName('Name')}
              record={record}
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
          <Button
            alignSelf="center"
            disabled={form.working}
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
