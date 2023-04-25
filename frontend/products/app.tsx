import { AppProps } from '../app';

import { fld } from '../constants';
import { getLinkCellId } from '../helpers';

import AirDryProduct from './air-dry';
import DriedProduct from './dried';
import FinishProduct from './finish';
import FlattenProduct from './flatten';
import KilnDryProduct from './kiln-dry';
import ScrapProduct from './scrap';

import { Box } from '@airtable/blocks/ui';

import { useRecordById } from '@airtable/blocks/ui';

import React from 'react';

export default function ProductsApp({ ctx, data }: AppProps): JSX.Element {
  // 👇 load up the current Log and its parent Tree and Log
  data.product = useRecordById(ctx.PRODUCTS, data.selectedRecordId);
  data.log = useRecordById(
    ctx.LOGS,
    getLinkCellId(data.product, fld.LOG) ?? ''
  );
  data.tree = useRecordById(ctx.TREES, getLinkCellId(data.log, fld.TREE) ?? '');
  // 🔥 https://stackoverflow.com/questions/69514771/async-function-call-inside-jsx

  // 👇 build the app
  return (
    <Box>
      <AirDryProduct ctx={ctx} data={data} />
      <KilnDryProduct ctx={ctx} data={data} />
      <DriedProduct ctx={ctx} data={data} />
      <FlattenProduct ctx={ctx} data={data} />
      <FinishProduct ctx={ctx} data={data} />
      <ScrapProduct ctx={ctx} data={data} />
    </Box>
  );
}
