import { AppProps } from '../app';

import { findHistoryFor } from '../helpers';
import { fld } from '../constants';
import { forHTMLDatetime } from '../helpers';
import { getLinkCellId } from '../helpers';
import { updateRecord } from '../actions';

import Datetime from '../datetime';
import History from '../history';
import OKButton from '../ok-button';

import { Box } from '@airtable/blocks/ui';
import { CellRenderer } from '@airtable/blocks/ui';
import { FormField } from '@airtable/blocks/ui';
import { Heading } from '@airtable/blocks/ui';

import { colors } from '@airtable/blocks/ui';
import { expandRecord } from '@airtable/blocks/ui';
import { useState } from 'react';

import React from 'react';

export default function FlattenProduct({ ctx, data }: AppProps): JSX.Element {
  // 👇 prepare the form
  const [form, setForm] = useState({
    date: forHTMLDatetime(new Date()),
    working: false
  });
  const stageId = getLinkCellId(data.product, fld.STAGE);
  const enabled = data.product && stageId === data.stageIdBySymbol.PRE_FLATTEN;
  // 👇 already been processed at the desired stage?
  const alreadyProcessed = findHistoryFor(
    data.histories,
    [data.stageBySymbol.FLATTENING],
    data.tree?.getCellValueAsString(fld.TREE_ID),
    data.log?.getCellValueAsString(fld.LOG_ID),
    data.product?.getCellValueAsString(fld.PRODUCT_ID)
  );
  // 👇 when OK is clicked
  const ok = async (): Promise<void> => {
    setForm({ ...form, working: true });
    await updateRecord(
      { ctx, data },
      {
        date: form.date,
        logId: data.log.getCellValueAsString(fld.LOG_ID),
        productId: data.product.getCellValueAsString(fld.PRODUCT_ID),
        record: data.product,
        stageId: data.stageIdBySymbol.FLATTENING,
        table: ctx.PRODUCTS
      }
    );
    expandRecord(data.product);
    setForm({ ...form, working: false });
  };
  // 👇 build the form
  return (
    <Box className="divided-box">
      {enabled ? (
        <Heading>10. Flatten {data.product.getCellValue(fld.NAME)}</Heading>
      ) : (
        <Heading textColor={colors.GRAY}>10. Flatten product</Heading>
      )}

      {alreadyProcessed ? (
        <History ctx={ctx} history={alreadyProcessed} />
      ) : (
        <Box display="flex" justifyContent="space-between">
          <FormField label="Product now flattening" width="33%">
            {enabled && (
              <CellRenderer
                field={ctx.PRODUCTS.getFieldByName(fld.NAME)}
                record={data.product}
                shouldWrap={false}
              />
            )}
          </FormField>
          <FormField label="When flattening started" width="auto">
            <Datetime
              date={form.date}
              onChange={(date): void => setForm({ ...form, date })}
            />
          </FormField>
          <OKButton disabled={!enabled} onClick={ok} working={form.working} />
        </Box>
      )}
    </Box>
  );
}
