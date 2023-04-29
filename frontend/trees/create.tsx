import { AppProps } from '../app';

import { createTree } from '../actions';
import { forHTMLDate } from '../helpers';
import { getRecordById } from '../actions';

import Datetime from '../datetime';
import OKButton from '../ok-button';

import { Box } from '@airtable/blocks/ui';
import { FormField } from '@airtable/blocks/ui';
import { Heading } from '@airtable/blocks/ui';
import { Select } from '@airtable/blocks/ui';

import { expandRecord } from '@airtable/blocks/ui';
import { useState } from 'react';

import React from 'react';

export default function CreateTree({ ctx, data }: AppProps): JSX.Element {
  // 👇 prepare the form
  const [form, setForm] = useState({
    date: forHTMLDate(new Date()),
    speciesId: null,
    working: false
  });
  const dfltSpecies = { label: 'Pick one', value: null };
  const stageId = data.stageIdBySymbol.STANDING;
  // 👇 when OK is clicked
  const ok = async (): Promise<void> => {
    setForm({ ...form, working: true });
    const treeId = await createTree(
      { ctx, data },
      {
        date: form.date,
        speciesId: form.speciesId,
        stageId
      }
    );
    expandRecord(
      await getRecordById({
        recordId: treeId,
        table: ctx.TREES
      })
    );
    setForm({ ...form, working: false });
  };
  // 👇 build the form
  return (
    <Box className="divided-box">
      <Heading>1. Identify standing tree</Heading>

      <Box display="flex" justifyContent="space-between">
        <FormField label="Species" width="33%">
          <Select
            onChange={(v: string): void => setForm({ ...form, speciesId: v })}
            options={[dfltSpecies, ...data.speciesOptions]}
            value={form.speciesId}
          />
        </FormField>
        <FormField label="When identified" width="auto">
          <Datetime
            date={form.date}
            onChange={(date): void => setForm({ ...form, date })}
          />
        </FormField>
        <OKButton
          disabled={!form.speciesId}
          onClick={ok}
          working={form.working}
        />
      </Box>
    </Box>
  );
}
