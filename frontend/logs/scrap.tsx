import { LogsAppProps } from './app';

import { getLinkCellId } from '../helpers';
import { toISOString } from '../helpers';
import { updateRecord } from '../actions';

import { Box } from '@airtable/blocks/ui';
import { Button } from '@airtable/blocks/ui';
import { CellRenderer } from '@airtable/blocks/ui';
import { FormField } from '@airtable/blocks/ui';
import { Heading } from '@airtable/blocks/ui';
import { Loader } from '@airtable/blocks/ui';

import { colors } from '@airtable/blocks/ui';
import { expandRecord } from '@airtable/blocks/ui';
import { useState } from 'react';

import React from 'react';

export default function ScrapLog({ ctx }: LogsAppProps): JSX.Element {
  // 👇 prepare the form
  const [form, setForm] = useState({
    date: toISOString(new Date()),
    working: false
  });
  const stageId = getLinkCellId(ctx.log, 'Stage');
  const enabled = ctx.log && stageId !== ctx.stageBySymbol['SCRAPPED'];
  // 👇 when OK is clicked
  const ok = async (): Promise<void> => {
    setForm({ ...form, working: true });
    await updateRecord({
      date: form.date,
      history: ctx.history,
      logId: ctx.log.id,
      record: ctx.log,
      stageId: ctx.stageBySymbol['SCRAPPED'],
      table: ctx.logs,
      treeId: getLinkCellId(ctx.log, 'Tree ID')
    });
    expandRecord(ctx.log);
    setForm({ ...form, working: false });
  };
  // 👇 build the form
  return (
    <Box>
      {enabled ? (
        <Heading>Scrap {ctx.log.getCellValue('Name')}</Heading>
      ) : (
        <Heading textColor={colors.GRAY}>Scrap a log</Heading>
      )}

      <Box display="flex" justifyContent="space-between">
        <FormField label="Log to scrap" width="auto">
          <CellRenderer
            field={ctx.logs.getFieldByName('Name')}
            record={ctx.log}
          />
        </FormField>
        <FormField label="When scrapped" width="auto">
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
            disabled={!enabled}
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
