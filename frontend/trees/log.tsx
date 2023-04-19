import { Warning } from '../components';

import { toISOString } from '../helpers';

import { Box } from '@airtable/blocks/ui';
import { Button } from '@airtable/blocks/ui';
import { CellRenderer } from '@airtable/blocks/ui';
import { FormField } from '@airtable/blocks/ui';
import { Heading } from '@airtable/blocks/ui';

import { expandRecord } from '@airtable/blocks/ui';
import { useRecordById } from '@airtable/blocks/ui';
import { useState } from 'react';

import React from 'react';

export default function LogTree({ ctx }): JSX.Element {
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
    expandRecord(record);
    setForm({ ...form, working: false });
  };
  // 👇 build the form
  return (
    <Box borderBottom="1px dotted gray">
      <Heading>Cut a harvested tree into logs</Heading>
      {ctx.selectedRecordIds.length !== 1 ||
      stageId !== ctx.stageBySymbol['HARVESTED'] ? (
        <Warning text="Select a harvested tree to cut into logs" />
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
              onChange={(e): void => setForm({ ...form, date: e.target.value })}
              style={{
                border: '1px dotted gray',
                height: '30px',
                outline: 'none'
              }}
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
