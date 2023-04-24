import { LogsAppProps } from './app';

import { createProducts } from '../actions';
import { fld } from '../constants';
import { forHTMLDatetime } from '../helpers';
import { getCellValueAsNumber } from '../helpers';
import { getCellValueForHTMLDatetime } from '../helpers';
import { getLinkCellId } from '../helpers';
import { updateRecord } from '../actions';

import { Box } from '@airtable/blocks/ui';
import { Button } from '@airtable/blocks/ui';
import { CellRenderer } from '@airtable/blocks/ui';
import { ConfirmationDialog } from '@airtable/blocks/ui';
import { FormField } from '@airtable/blocks/ui';
import { Heading } from '@airtable/blocks/ui';
import { Input } from '@airtable/blocks/ui';
import { Loader } from '@airtable/blocks/ui';

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
    date: forHTMLDatetime(new Date()),
    dateClamped: false,
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
    (stageId === data.stageBySymbol['PRE_MILL'] ||
      stageId === data.stageBySymbol['MILLED']);

  // 👇 can't set a date before the last staged date
  if (enabled && !form.dateClamped) {
    const dateStaged = getCellValueForHTMLDatetime(data.log, fld.DATE_STAGED);
    if (form.date < dateStaged)
      setForm({ ...form, date: dateStaged, dateClamped: true });
  }
  // 👇 when OK is clicked
  const ok = async (): Promise<void> => {
    setForm({ ...form, isDialogOpen: false, working: true });
    await updateRecord({
      date: form.date,
      history: ctx.HISTORY,
      logId: data.log.getCellValueAsString(fld.LOG_ID),
      productId: '',
      record: data.log,
      stageId: data.stageBySymbol['MILLED'],
      table: ctx.LOGS,
      tree: data.tree
    });
    await createProducts({
      counts: form.counts,
      date: form.date,
      history: ctx.HISTORY,
      log: data.log,
      logId: data.log.getCellValueAsString(fld.LOG_ID),
      maxWidths: form.maxWidths,
      minWidths: form.minWidths,
      products: ctx.PRODUCTS,
      stageId: data.stageBySymbol['POST_MILL'],
      thicknesses: form.thicknesses,
      tree: data.tree,
      type: productType,
      widths: form.widths
    });
    expandRecord(data.log);
    setForm({ ...form, isDialogOpen: false, working: false });
  };
  // 👇 YUCK! the tag we'll use in the ConfirmationDialog
  let tag;
  if (productType === 'Board') tag = 'boards';
  else if (productType === 'Slab') tag = 'slabs';
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
          Mill {tag} from {data.log.getCellValue(fld.NAME)}
        </Heading>
      ) : (
        <Heading textColor={colors.GRAY}>Mill log into {tag}</Heading>
      )}

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
              />
            )}
          </FormField>
          <FormField label="When milled" width="auto">
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
              disabled={
                !enabled ||
                (productType === 'Board' &&
                  (!form.counts[0] ||
                    !form.thicknesses[0] ||
                    !form.widths[0])) ||
                (productType === 'Slab' &&
                  (!form.maxWidths[0] ||
                    !form.minWidths[0] ||
                    !form.thicknesses[0]))
              }
              onClick={(): void => setForm({ ...form, isDialogOpen: true })}
              variant="primary"
            >
              OK
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );
}
