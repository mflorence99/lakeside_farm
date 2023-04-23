import { LogsAppProps } from './app';

import { createProducts } from '../actions';
import { getCellValueAsNumber } from '../helpers';
import { getLinkCellId } from '../helpers';
import { toISOString } from '../helpers';
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

export default function MillLogIntoSlabs({ ctx }: LogsAppProps): JSX.Element {
  // 👇 prepare the form
  const slabIndex = [0, 1, 2, 3, 4];
  const [form, setForm] = useState({
    date: toISOString(new Date()),
    isDialogOpen: false,
    maxWidths: new Array(slabIndex.length).fill(''),
    minWidths: new Array(slabIndex.length).fill(''),
    thicknesses: new Array(slabIndex.length).fill(''),
    working: false
  });
  const numSlabs = getCellValueAsNumber(ctx.log, '# Slabs');
  const stageId = getLinkCellId(ctx.log, 'Stage');
  const enabled =
    numSlabs === 0 &&
    ctx.log &&
    [ctx.stageBySymbol['PRE_MILL'], ctx.stageBySymbol['MILL']].includes(
      stageId
    );
  // 👇 when OK is clicked
  const ok = async (): Promise<void> => {
    setForm({ ...form, isDialogOpen: false, working: true });
    await updateRecord({
      date: form.date,
      history: ctx.history,
      logId: ctx.log.id,
      productId: null,
      record: ctx.log,
      stageId: ctx.stageBySymbol['MILL'],
      table: ctx.logs,
      treeId: getLinkCellId(ctx.log, 'Tree')
    });
    await createProducts({
      counts: null,
      date: form.date,
      history: ctx.history,
      log: ctx.log,
      maxWidths: form.maxWidths,
      minWidths: form.minWidths,
      products: ctx.products,
      stageId: ctx.stageBySymbol['POST_MILL'],
      thicknesses: form.thicknesses,
      type: 'Slab',
      widths: null
    });
    expandRecord(ctx.log);
    setForm({ ...form, isDialogOpen: false, working: false });
  };
  // 👇 build the form
  return (
    <Box className="divided-box">
      {form.isDialogOpen && ctx.log && (
        <ConfirmationDialog
          body={`Make sure that the number of slabs has been entered correctly. Their dimensions can be changed later, but new slabs can't be added.`}
          onCancel={(): void => setForm({ ...form, isDialogOpen: false })}
          onConfirm={ok}
          title="Are you sure?"
        />
      )}

      {enabled ? (
        <Heading>Mill slabs from {ctx.log.getCellValue('Name')}</Heading>
      ) : (
        <Heading textColor={colors.GRAY}>Mill log into slabs</Heading>
      )}

      <Box>
        <table width="100%">
          <thead>
            <tr>
              <th></th>
              {slabIndex.map((index) => (
                <th key={`${index}`}>{`#${index + 1}`}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Thickness (&frac14;&apos;s)</td>
              {slabIndex.map((index) => (
                <td key={`${index}`} width={`${100 / (slabIndex.length + 1)}%`}>
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
              {slabIndex.map((index) => (
                <td key={`${index}`} width={`${100 / (slabIndex.length + 1)}%`}>
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
              {slabIndex.map((index) => (
                <td key={`${index}`} width={`${100 / (slabIndex.length + 1)}%`}>
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
        </table>

        <br />

        <Box display="flex" justifyContent="space-between">
          <FormField label="Log to mill" width="auto">
            <CellRenderer
              field={ctx.logs.getFieldByName('Name')}
              record={ctx.log}
            />
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
                !form.maxWidths[0] ||
                !form.minWidths[0] ||
                !form.thicknesses[0]
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
