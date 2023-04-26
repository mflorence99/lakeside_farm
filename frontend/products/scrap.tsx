import { AppProps } from '../app';

import { fld } from '../constants';
import { forHTMLDatetime } from '../helpers';
import { getLinkCellId } from '../helpers';
import { updateRecord } from '../actions';

import { Box } from '@airtable/blocks/ui';
import { Button } from '@airtable/blocks/ui';
import { CellRenderer } from '@airtable/blocks/ui';
import { FormField } from '@airtable/blocks/ui';
import { Heading } from '@airtable/blocks/ui';
import { Loader } from '@airtable/blocks/ui';

import { colors } from '@airtable/blocks/ui';
import { expandRecord } from '@airtable/blocks/ui';
import { useState } from 'react';

import React from 'react';

export default function ScrapProduct({ ctx, data }: AppProps): JSX.Element {
  // 👇 prepare the form
  const [form, setForm] = useState({
    date: forHTMLDatetime(new Date()),
    working: false
  });
  const stageId = getLinkCellId(data.product, fld.STAGE);
  const enabled = data.product && stageId !== data.stageIdBySymbol['SCRAPPED'];
  // 👇 when OK is clicked
  const ok = async (): Promise<void> => {
    setForm({ ...form, working: true });
    await updateRecord({
      date: form.date,
      history: ctx.HISTORY,
      logId: data.log.getCellValueAsString(fld.LOG_ID),
      productId: data.product.getCellValueAsString(fld.PRODUCT_ID),
      record: data.product,
      stageId: data.stageIdBySymbol['SCRAPPED'],
      table: ctx.PRODUCTS,
      tree: data.tree
    });
    expandRecord(data.product);
    setForm({ ...form, working: false });
  };
  // 👇 build the form
  return (
    <Box>
      {enabled ? (
        <Heading>Scrap {data.product.getCellValue(fld.NAME)}</Heading>
      ) : (
        <Heading textColor={colors.GRAY}>Scrap product</Heading>
      )}

      <Box display="flex" justifyContent="space-between">
        <FormField label="Product to scrap" width="33%">
          {enabled && (
            <CellRenderer
              field={ctx.PRODUCTS.getFieldByName(fld.NAME)}
              record={data.product}
              shouldWrap={false}
            />
          )}
        </FormField>
        <FormField label="When scrapped" width="auto">
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
            disabled={!enabled}
            onClick={ok}
            variant="danger"
          >
            OK
          </Button>
        )}
      </Box>
    </Box>
  );
}
