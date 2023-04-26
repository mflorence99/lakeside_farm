import { AppProps } from '../app';

import { fld } from '../constants';

import CreateTree from './create';
import HarvestTree from './harvest';
import LogTree from './log';
import ScrapTree from './scrap';

import { Box } from '@airtable/blocks/ui';

import { useRecordById } from '@airtable/blocks/ui';
import { useRecords } from '@airtable/blocks/ui';

import React from 'react';

export default function TreesApp({ ctx, data }: AppProps): JSX.Element {
  // 👇 load up the current Tree
  data.tree = useRecordById(ctx.TREES, data.selectedRecordId);
  data.histories =
    useRecords(data.tree?.selectLinkedRecordsFromCell(fld.HISTORY)) ?? [];

  // 👇 build the app
  return (
    <Box>
      <CreateTree ctx={ctx} data={data} />
      <HarvestTree ctx={ctx} data={data} />
      <LogTree ctx={ctx} data={data} />
      <ScrapTree ctx={ctx} data={data} />
    </Box>
  );
}
