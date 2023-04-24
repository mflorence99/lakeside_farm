import { AppProps } from '../app';

import { fld } from '../constants';
import { getLinkCellId } from '../helpers';
import { getRecordById } from '../actions';

import ScrapProduct from './scrap';

import { Box } from '@airtable/blocks/ui';

import { useEffect } from 'react';
import { useRecordById } from '@airtable/blocks/ui';

import React from 'react';

export default function ProductsApp({ ctx, data }: AppProps): JSX.Element {
  // 👇 load up the current Log and its parent Tree and Log
  data.product = useRecordById(ctx.PRODUCTS, data.selectedRecordId);
  // 🔥 https://stackoverflow.com/questions/69514771/async-function-call-inside-jsx
  useEffect(() => {
    const loadLogThenTree = async (): Promise<void> => {
      const logId = getLinkCellId(data.product, fld.LOG);
      if (logId) {
        data.log = await getRecordById({
          recordId: logId,
          table: ctx.LOGS
        });
        data.tree = await getRecordById({
          recordId: getLinkCellId(data.log, fld.TREE),
          table: ctx.TREES
        });
        console.log({
          log: data.log.name,
          tree: data.tree.name
        });
      }
    };
    loadLogThenTree();
  });

  // 👇 build the app
  return (
    <Box>
      <ScrapProduct ctx={ctx} data={data} />
    </Box>
  );
}
