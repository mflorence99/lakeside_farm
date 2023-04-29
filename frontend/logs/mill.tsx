import { LogsAppProps } from './app';

import { createProducts } from '../actions';
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
import { ConfirmationDialog } from '@airtable/blocks/ui';
import { FormField } from '@airtable/blocks/ui';
import { Heading } from '@airtable/blocks/ui';
import { Input } from '@airtable/blocks/ui';

import { colors } from '@airtable/blocks/ui';
import { expandRecord } from '@airtable/blocks/ui';
import { useState } from 'react';

import React from 'react';

export default function MillLog({
  ctx,
  data,
  productType
}: LogsAppProps): JSX.Element {
  // 👇 prepare the form
  const productIndex = [0, 1, 2, 3, 4];
  const [form, setForm] = useState({
    counts: new Array(productIndex.length).fill(''),
    date: forHTMLDate(new Date()),
    isDialogOpen: false,
    maxWidths: new Array(productIndex.length).fill(''),
    minWidths: new Array(productIndex.length).fill(''),
    thicknesses: new Array(productIndex.length).fill(''),
    widths: new Array(productIndex.length).fill(''),
    working: false
  });
  const numBoards = getCellValueAsNumber(data.log, fld.NUM_BOARDS);
  const numSlabs = getCellValueAsNumber(data.log, fld.NUM_SLABS);
  const stageId = getLinkCellId(data.log, fld.STAGE);
  const enabled =
    ((numBoards === 0 && productType === 'Board') ||
      (numSlabs === 0 && productType === 'Slab')) &&
    data.log &&
    (stageId === data.stageIdBySymbol.PRE_MILL ||
      stageId === data.stageIdBySymbol.MILLED);
  // 👇 already been processed at the desired stage?
  const alreadyProcessed = findHistoryFor(
    data.histories,
    [data.stageBySymbol.MILLED],
    data.tree?.getCellValueAsString(fld.TREE_ID),
    data.log?.getCellValueAsString(fld.LOG_ID)
  );
  // 👇 when OK is clicked
  const ok = async (): Promise<void> => {
    setForm({ ...form, isDialogOpen: false, working: true });
    await updateRecord(
      { ctx, data },
      {
        date: form.date,
        logId: data.log.getCellValueAsString(fld.LOG_ID),
        productId: '',
        record: data.log,
        stageId: data.stageIdBySymbol.MILLED,
        table: ctx.LOGS
      }
    );
    await createProducts(
      { ctx, data },
      {
        counts: form.counts,
        date: form.date,
        logId: data.log.getCellValueAsString(fld.LOG_ID),
        maxWidths: form.maxWidths,
        minWidths: form.minWidths,
        stageId: data.stageIdBySymbol.PRE_DRY,
        thicknesses: form.thicknesses,
        type: productType,
        widths: form.widths
      }
    );
    expandRecord(data.log);
    setForm({ ...form, isDialogOpen: false, working: false });
  };
  // 👇 YUCK! the tag we'll use in the ConfirmationDialog
  let tag;
  if (productType === 'Board') tag = 'boards';
  else if (productType === 'Slab') tag = 'slabs';
  // 👇 YUCK! the suffix for the step
  let suffix;
  if (productType === 'Board') suffix = 'a';
  else if (productType === 'Slab') suffix = 'b';
  // 👇 YUCK! is the form disabled?
  const disabled =
    !enabled ||
    (productType === 'Board' &&
      (!form.counts[0] || !form.thicknesses[0] || !form.widths[0])) ||
    (productType === 'Slab' &&
      (!form.maxWidths[0] || !form.minWidths[0] || !form.thicknesses[0]));

  // 👇 build the form
  return (
    <Box className="divided-box">
      {form.isDialogOpen && data.log && (
        <ConfirmationDialog
          body={`Make sure that the number of ${tag} has been entered correctly. Their dimensions can be changed later, but new ${tag} can't be added.`}
          onCancel={(): void => setForm({ ...form, isDialogOpen: false })}
          onConfirm={ok}
          title="Are you sure?"
        />
      )}

      {enabled ? (
        <Heading>
          5{suffix}. Mill {tag} from {data.log.getCellValue(fld.NAME)}
        </Heading>
      ) : (
        <Heading textColor={colors.GRAY}>
          5{suffix}. Mill log into {tag}
        </Heading>
      )}

      {alreadyProcessed && <History ctx={ctx} history={alreadyProcessed} />}

      {(!alreadyProcessed || enabled) && (
        <Box>
          <table width="100%">
            <thead>
              <tr>
                <th></th>
                {productIndex.map((index) => (
                  <th key={`${index}`}>{`#${index + 1}`}</th>
                ))}
              </tr>
            </thead>

            {productType === 'Board' && (
              <tbody>
                <tr>
                  <td>Count</td>
                  {productIndex.map((index) => (
                    <td
                      key={`${index}`}
                      width={`${100 / (productIndex.length + 1)}%`}
                    >
                      <Input
                        onChange={(e): void => {
                          const counts = [...form.counts];
                          counts[index] = e.target.valueAsNumber;
                          setForm({ ...form, counts });
                        }}
                        type="number"
                        value={form.counts[index]}
                      />
                    </td>
                  ))}
                </tr>

                <tr>
                  <td>Thickness (&frac14;&apos;s)</td>
                  {productIndex.map((index) => (
                    <td
                      key={`${index}`}
                      width={`${100 / (productIndex.length + 1)}%`}
                    >
                      <Input
                        onChange={(e): void => {
                          const thicknesses = [...form.thicknesses];
                          thicknesses[index] = e.target.valueAsNumber;
                          setForm({ ...form, thicknesses });
                        }}
                        type="number"
                        value={form.thicknesses[index]}
                      />
                    </td>
                  ))}
                </tr>
                <tr>
                  <td>Width (in)</td>
                  {productIndex.map((index) => (
                    <td
                      key={`${index}`}
                      width={`${100 / (productIndex.length + 1)}%`}
                    >
                      <Input
                        onChange={(e): void => {
                          const widths = [...form.widths];
                          widths[index] = e.target.valueAsNumber;
                          setForm({ ...form, widths });
                        }}
                        type="number"
                        value={form.widths[index]}
                      />
                    </td>
                  ))}
                </tr>
              </tbody>
            )}

            {productType === 'Slab' && (
              <tbody>
                <tr>
                  <td>Thickness (&frac14;&apos;s)</td>
                  {productIndex.map((index) => (
                    <td
                      key={`${index}`}
                      width={`${100 / (productIndex.length + 1)}%`}
                    >
                      <Input
                        onChange={(e): void => {
                          const thicknesses = [...form.thicknesses];
                          thicknesses[index] = e.target.valueAsNumber;
                          setForm({ ...form, thicknesses });
                        }}
                        type="number"
                        value={form.thicknesses[index]}
                      />
                    </td>
                  ))}
                </tr>
                <tr>
                  <td>Min width (in)</td>
                  {productIndex.map((index) => (
                    <td
                      key={`${index}`}
                      width={`${100 / (productIndex.length + 1)}%`}
                    >
                      <Input
                        onChange={(e): void => {
                          const minWidths = [...form.minWidths];
                          minWidths[index] = e.target.valueAsNumber;
                          setForm({ ...form, minWidths });
                        }}
                        type="number"
                        value={form.minWidths[index]}
                      />
                    </td>
                  ))}
                </tr>
                <tr>
                  <td>Max width (in)</td>
                  {productIndex.map((index) => (
                    <td
                      key={`${index}`}
                      width={`${100 / (productIndex.length + 1)}%`}
                    >
                      <Input
                        onChange={(e): void => {
                          const maxWidths = [...form.maxWidths];
                          maxWidths[index] = e.target.valueAsNumber;
                          setForm({ ...form, maxWidths });
                        }}
                        type="number"
                        value={form.maxWidths[index]}
                      />
                    </td>
                  ))}
                </tr>
              </tbody>
            )}
          </table>

          <br />

          <Box display="flex" justifyContent="space-between">
            <FormField label="Log to mill" width="33%">
              {enabled && (
                <CellRenderer
                  field={ctx.LOGS.getFieldByName('Name')}
                  record={data.log}
                  shouldWrap={false}
                />
              )}
            </FormField>
            <FormField label="When milling started" width="auto">
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
