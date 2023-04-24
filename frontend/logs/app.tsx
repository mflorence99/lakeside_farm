import { AppProps } from '../app';

import { fld } from '../constants';
import { getLinkCellId } from '../helpers';
import { getRecordById } from '../actions';

import MillLog from './mill';
import ScrapLog from './scrap';

import { Box } from '@airtable/blocks/ui';

import { useEffect } from 'react';
import { useRecordById } from '@airtable/blocks/ui';

import React from 'react';

export type LogsAppProps = AppProps & { productType?: 'Board' | 'Slab' };

export default function LogsApp({ ctx, data }: AppProps): JSX.Element {
  // 👇 load up the current Log and its parent Tree
  data.log = useRecordById(ctx.LOGS, data.selectedRecordId);
  // 🔥 https://stackoverflow.com/questions/69514771/async-function-call-inside-jsx
  useEffect(() => {
    const loadTree = async (): Promise<void> => {
      const treeId = getLinkCellId(data.log, fld.TREE);
      if (treeId) {
        data.tree = await getRecordById({
          recordId: treeId,
          table: ctx.TREES
        });
        console.log({
          tree: data.tree.name
        });
      }
    };
    loadTree();
  });

  // 👇 build the app
  return (
    <Box>
      <MillLog ctx={ctx} data={data} productType="Slab" />
      <MillLog ctx={ctx} data={data} productType="Board" />
      <ScrapLog ctx={ctx} data={data} />
    </Box>
  );
}
