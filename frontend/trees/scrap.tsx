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

import { expandRecord } from '@airtable/blocks/ui';
import { useState } from 'react';

import React from 'react';

export default function ScrapTree({ ctx, data }: AppProps): JSX.Element {
  // 👇 prepare the form
  const [form, setForm] = useState({
    date: forHTMLDatetime(new Date()),
    working: false
  });
  const numLogs = getCellValueAsNumber(data.tree, fld.NUM_LOGS);
  const stageId = getLinkCellId(data.tree, fld.STAGE);
  const enabled =
    numLogs === 0 &&
    data.tree &&
    (stageId === data.stageIdBySymbol.STANDING ||
      stageId === data.stageIdBySymbol.HARVESTED);
  // 👇 when OK is clicked
  const ok = async (): Promise<void> => {
    setForm({ ...form, working: true });
    await updateRecord(
      { ctx, data },
      {
        date: form.date,
        logId: '',
        productId: '',
        record: data.tree,
        stageId: data.stageIdBySymbol.SCRAPPED,
        table: ctx.TREES
      }
    );
    expandRecord(data.tree);
    setForm({ ...form, working: false });
  };
  // 👇 build the form
  if (enabled)
    return (
      <Box>
        <Heading>Scrap {data.tree.getCellValue(fld.NAME)}</Heading>

        <Box display="flex" justifyContent="space-between">
          <FormField label="Tree to scrap" width="33%">
            {enabled && (
              <CellRenderer
                field={ctx.TREES.getFieldByName(fld.NAME)}
                record={data.tree}
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
  else return null;
}
