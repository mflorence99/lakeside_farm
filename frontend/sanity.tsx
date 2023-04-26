import { tbl } from './constants';

import Warning from './warning';

import { Box } from '@airtable/blocks/ui';
import { PropsWithChildren } from 'react';

import { useBase } from '@airtable/blocks/ui';
import { useWatchable } from '@airtable/blocks/ui';

import React from 'react';

export default function SanityCheck(
  props: PropsWithChildren<Object>
): JSX.Element {
  const base = useBase();
  const errors: string[] = [];
  // 👇 watch for table name changes
  useWatchable(base.tables, 'name');
  Object.keys(tbl).reduce((acc, key) => {
    const table = base.getTableByNameIfExists(tbl[key]);
    if (!table) acc.push(`Table ${tbl[key]} does not exist`);
    return acc;
  }, errors);
  // 🔥 watch for any field name change
  const fields = base.tables.flatMap((table) => table.fields);
  useWatchable(fields, 'name', (model, keys, args) =>
    console.log({ tag: 'WATCHED', model, keys, args })
  );
  // 👇 run either the app or the errors
  return (
    <Box as="main" padding={2}>
      {errors.length === 0
        ? props.children
        : errors.map((error) => <Warning key={error} text={error} />)}
    </Box>
  );
}
