import { AppProps } from '../app';

import { createLogs } from '../actions';
import { findHistoryFor } from '../helpers';
import { fld } from '../constants';
import { forHTMLDatetime } from '../helpers';
import { getCellValueAsNumber } from '../helpers';
import { getLinkCellId } from '../helpers';
import { updateRecord } from '../actions';

import Datetime from '../datetime';
import History from '../history';
import OKButton from '../ok-button';

import { Box } from '@airtable/blocks/ui';
import { CellRenderer } from '@airtable/blocks/ui';
import { ConfirmationDialog } from '@airtable/blocks/ui';
import { FormField } from '@airtable/blocks/ui';
import { Heading } from '@airtable/blocks/ui';
import { Input } from '@airtable/blocks/ui';

import { colors } from '@airtable/blocks/ui';
import { expandRecord } from '@airtable/blocks/ui';
import { useState } from 'react';

import React from 'react';

export default function LogTree({ ctx, data }: AppProps): JSX.Element {
  // 👇 prepare the form
  const logIndex = [0, 1, 2, 3, 4];
  const [form, setForm] = useState({
    date: forHTMLDatetime(new Date()),
    diameters: new Array(logIndex.length).fill(''),
    isDialogOpen: false,
    lengths: new Array(logIndex.length).fill(''),
    working: false
  });
  const numLogs = getCellValueAsNumber(data.tree, fld.NUM_LOGS);
  const stageId = getLinkCellId(data.tree, fld.STAGE);
  const enabled =
    numLogs === 0 && data.tree && stageId === data.stageIdBySymbol.HARVESTED;
  // 👇 already been processed at the desired stage?
  const alreadyProcessed = findHistoryFor(
    data.histories,
    [data.stageBySymbol.LOGGED, data.stageBySymbol.SCRAPPED],
    data.tree?.getCellValueAsString(fld.TREE_ID)
  );
  // 👇 when OK is clicked
  const ok = async (): Promise<void> => {
    setForm({ ...form, isDialogOpen: false, working: true });
    await updateRecord(
      { ctx, data },
      {
        date: form.date,
        logId: '',
        productId: '',
        record: data.tree,
        stageId: data.stageIdBySymbol.LOGGED,
        table: ctx.TREES
      }
    );
    await createLogs(
      { ctx, data },
      {
        date: form.date,
        diameters: form.diameters,
        lengths: form.lengths,
        stageId: data.stageIdBySymbol.PRE_MILL
      }
    );
    expandRecord(data.tree);
    setForm({ ...form, isDialogOpen: false, working: false });
  };
  // 👇 is the form disabled?
  const disabled = !enabled || !form.diameters[0] || !form.lengths[0];
  // 👇 build the form
  return (
    <Box className="divided-box">
      {form.isDialogOpen && data.tree && (
        <ConfirmationDialog
          body={`Make sure that the number of logs has been entered correctly. Their dimensions can be changed later, but new logs can't be added.`}
          onCancel={(): void => setForm({ ...form, isDialogOpen: false })}
          onConfirm={ok}
          title="Are you sure?"
        />
      )}

      {enabled ? (
        <Heading>3. Cut {data.tree.getCellValue(fld.NAME)} into logs</Heading>
      ) : (
        <Heading textColor={colors.GRAY}>
          3. Cut harvested tree into logs
        </Heading>
      )}

      {alreadyProcessed ? (
        <History ctx={ctx} history={alreadyProcessed} />
      ) : (
        <Box>
          <table width="100%">
            <thead>
              <tr>
                <th></th>
                {logIndex.map((index) => (
                  <th key={`${index}`}>{`#${index + 1}`}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Length (ft)</td>
                {logIndex.map((index) => (
                  <td
                    key={`${index}`}
                    width={`${100 / (logIndex.length + 1)}%`}
                  >
                    <Input
                      onChange={(e): void => {
                        const lengths = [...form.lengths];
                        lengths[index] = e.target.valueAsNumber;
                        setForm({ ...form, lengths });
                      }}
                      type="number"
                      value={form.lengths[index]}
                    />
                  </td>
                ))}
              </tr>
              <tr>
                <td>Diam (in)</td>
                {logIndex.map((index) => (
                  <td
                    key={`${index}`}
                    width={`${100 / (logIndex.length + 1)}%`}
                  >
                    <Input
                      onChange={(e): void => {
                        const diameters = [...form.diameters];
                        diameters[index] = e.target.valueAsNumber;
                        setForm({ ...form, diameters });
                      }}
                      type="number"
                      value={form.diameters[index]}
                    />
                  </td>
                ))}
              </tr>
            </tbody>
          </table>

          <br />

          <Box display="flex" justifyContent="space-between">
            <FormField label="Tree to log" width="33%">
              {enabled && (
                <CellRenderer
                  field={ctx.TREES.getFieldByName(fld.NAME)}
                  record={data.tree}
                  shouldWrap={false}
                />
              )}
            </FormField>
            <FormField label="When logged" width="auto">
              <Datetime
                date={form.date}
                disabled={disabled}
                onChange={(date): void => setForm({ ...form, date })}
              />
            </FormField>
            <OKButton
              disabled={disabled}
              onClick={(): void => setForm({ ...form, isDialogOpen: true })}
              working={form.working}
            />
          </Box>
        </Box>
      )}
    </Box>
  );
}
