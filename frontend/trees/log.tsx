import { TreesAppProps } from './app';

import { createLogs } from '../actions';
import { toISOString } from '../helpers';
import { updateTree } from '../actions';

import { Box } from '@airtable/blocks/ui';
import { Button } from '@airtable/blocks/ui';
import { CellRenderer } from '@airtable/blocks/ui';
import { FormField } from '@airtable/blocks/ui';
import { Heading } from '@airtable/blocks/ui';
import { Input } from '@airtable/blocks/ui';
import { Loader } from '@airtable/blocks/ui';

import { expandRecord } from '@airtable/blocks/ui';
import { useState } from 'react';

import React from 'react';

export default function LogTree({ ctx }: TreesAppProps): JSX.Element {
  // 👇 prepare the form
  const logIndex = [0, 1, 2, 3, 4];
  const [form, setForm] = useState({
    date: toISOString(new Date()),
    diameters: new Array(logIndex.length).fill(''),
    lengths: new Array(logIndex.length).fill(''),
    working: false
  });
  const numLogs = ctx.tree?.getCellValue('# Logs') as number;
  const stageId = ctx.tree?.getCellValue('Stage')?.[0]?.id;
  const disabled = numLogs !== 0 || stageId !== ctx.stageBySymbol['HARVESTED'];
  // 👇 when OK is clicked
  const ok = async (): Promise<void> => {
    setForm({ ...form, working: true });
    await updateTree({
      date: form.date,
      history: ctx.history,
      stageId: ctx.stageBySymbol['LOGGED'],
      tree: ctx.tree,
      trees: ctx.trees
    });
    await createLogs({
      date: form.date,
      diameters: form.diameters,
      history: ctx.history,
      lengths: form.lengths,
      logs: ctx.logs,
      stageId: ctx.stageBySymbol['PRE_MILL'],
      tree: ctx.tree
    });
    expandRecord(ctx.tree);
    setForm({ ...form, working: false });
  };
  // 👇 build the form
  return (
    <Box className="divided-box">
      <Heading>Cut a harvested tree into logs</Heading>
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
                <td key={`${index}`} width={`${100 / (logIndex.length + 1)}%`}>
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
                <td key={`${index}`} width={`${100 / (logIndex.length + 1)}%`}>
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
          <FormField label="Tree to log" width="auto">
            <CellRenderer
              field={ctx.trees.getFieldByName('Name')}
              record={ctx.tree}
            />
          </FormField>
          <FormField label="When logged" width="auto">
            <input
              className="datetime-input"
              onChange={(e): void => setForm({ ...form, date: e.target.value })}
              type="datetime-local"
              value={form.date}
            />
          </FormField>
          {form.working ? (
            <Loader alignSelf="center" scale={0.8} />
          ) : (
            <Button
              alignSelf="center"
              disabled={disabled || !form.diameters[0] || !form.lengths[0]}
              onClick={ok}
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
