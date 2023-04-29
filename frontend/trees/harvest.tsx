import { AppProps } from '../app';

import { findHistoryFor } from '../helpers';
import { fld } from '../constants';
import { forHTMLDate } from '../helpers';
import { getCellValueAsNumber } from '../helpers';
import { getLinkCellId } from '../helpers';
import { updateRecord } from '../actions';

import Datetime from '../datetime';
import History from '../history';
import OKButton from '../ok-button';

import { Box } from '@airtable/blocks/ui';
import { CellRenderer } from '@airtable/blocks/ui';
import { FormField } from '@airtable/blocks/ui';
import { Heading } from '@airtable/blocks/ui';

import { colors } from '@airtable/blocks/ui';
import { expandRecord } from '@airtable/blocks/ui';
import { useState } from 'react';

import React from 'react';

export default function HarvestTree({ ctx, data }: AppProps): JSX.Element {
  // 👇 prepare the form
  const [form, setForm] = useState({
    date: forHTMLDate(new Date()),
    working: false
  });
  const numLogs = getCellValueAsNumber(data.tree, fld.NUM_LOGS);
  const stageId = getLinkCellId(data.tree, fld.STAGE);
  const enabled =
    numLogs === 0 && data.tree && stageId === data.stageIdBySymbol.STANDING;
  // 👇 already been processed at the desired stage?
  const alreadyProcessed = findHistoryFor(
    data.histories,
    [data.stageBySymbol.HARVESTED, data.stageBySymbol.SCRAPPED],
    data.tree?.getCellValueAsString(fld.TREE_ID)
  );
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
        stageId: data.stageIdBySymbol.HARVESTED,
        table: ctx.TREES
      }
    );
    expandRecord(data.tree);
    setForm({ ...form, working: false });
  };
  // 👇 build the form
  return (
    <Box className="divided-box">
      {enabled ? (
        <Heading>2. Harvest {data.tree.getCellValue(fld.NAME)}</Heading>
      ) : (
        <Heading textColor={colors.GRAY}>2. Harvest standing tree</Heading>
      )}

      {alreadyProcessed ? (
        <History ctx={ctx} history={alreadyProcessed} />
      ) : (
        <Box display="flex" justifyContent="space-between">
          <FormField label="Tree to harvest" width="33%">
            {enabled && (
              <CellRenderer
                field={ctx.TREES.getFieldByName(fld.NAME)}
                record={data.tree}
                shouldWrap={false}
              />
            )}
          </FormField>
          <FormField label="When harvested" width="auto">
            <Datetime
              date={form.date}
              disabled={!enabled}
              onChange={(date): void => setForm({ ...form, date })}
            />
          </FormField>
          <OKButton disabled={!enabled} onClick={ok} working={form.working} />
        </Box>
      )}
    </Box>
  );
}
