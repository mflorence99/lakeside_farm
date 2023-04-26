import { AppProps } from '../app';

import { fld } from '../constants';
import { forHTMLDatetime } from '../helpers';
import { getCellValueAsNumber } from '../helpers';
import { getLinkCellId } from '../helpers';
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

export default function ScrapLog({ ctx, data }: AppProps): JSX.Element {
  // 👇 prepare the form
  const [form, setForm] = useState({
    date: forHTMLDatetime(new Date()),
    working: false
  });
  const numBoards = getCellValueAsNumber(data.log, fld.NUM_BOARDS);
  const numSlabs = getCellValueAsNumber(data.log, fld.NUM_SLABS);
  const stageId = getLinkCellId(data.log, fld.STAGE);
  const enabled =
    numBoards === 0 &&
    numSlabs === 0 &&
    data.log &&
    stageId === data.stageIdBySymbol.PRE_MILL;
  // 👇 when OK is clicked
  const ok = async (): Promise<void> => {
    setForm({ ...form, working: true });
    await updateRecord({
      date: form.date,
      history: ctx.HISTORY,
      logId: data.log.getCellValueAsString(fld.LOG_ID),
      productId: '',
      record: data.log,
      stageId: data.stageIdBySymbol.SCRAPPED,
      table: ctx.LOGS,
      tree: data.tree
    });
    expandRecord(data.log);
    setForm({ ...form, working: false });
  };
  // 👇 build the form
  return (
    <Box>
      {enabled ? (
        <Heading>Scrap {data.log.getCellValue(fld.NAME)}</Heading>
      ) : (
        <Heading textColor={colors.GRAY}>Scrap log</Heading>
      )}

      <Box display="flex" justifyContent="space-between">
        <FormField label="Log to scrap" width="33%">
          {enabled && (
            <CellRenderer
              field={ctx.LOGS.getFieldByName(fld.NAME)}
              record={data.log}
              shouldWrap={false}
            />
          )}
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
            variant="danger"
          >
            OK
          </Button>
        )}
      </Box>
    </Box>
  );
}
