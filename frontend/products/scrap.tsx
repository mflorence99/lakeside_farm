import { AppProps } from '../app';

import { fld } from '../constants';
import { forHTMLDate } from '../helpers';
import { getLinkCellId } from '../helpers';
import { updateRecord } from '../actions';

import Datetime from '../datetime';
import OKButton from '../ok-button';

import { Box } from '@airtable/blocks/ui';
import { CellRenderer } from '@airtable/blocks/ui';
import { FormField } from '@airtable/blocks/ui';
import { Heading } from '@airtable/blocks/ui';

import { expandRecord } from '@airtable/blocks/ui';
import { useState } from 'react';

import React from 'react';

export default function ScrapProduct({ ctx, data }: AppProps): JSX.Element {
  // 👇 prepare the form
  const [form, setForm] = useState({
    date: forHTMLDate(new Date()),
    working: false
  });
  const stageId = getLinkCellId(data.product, fld.STAGE);
  const enabled = data.product && stageId !== data.stageIdBySymbol.SCRAPPED;
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
        stageId: data.stageIdBySymbol.SCRAPPED,
        table: ctx.PRODUCTS
      }
    );
    expandRecord(data.product);
    setForm({ ...form, working: false });
  };
  // 👇 build the form
  if (enabled)
    return (
      <Box>
        <Heading>Scrap {data.product.getCellValue(fld.NAME)}</Heading>

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
            <Datetime
              date={form.date}
              onChange={(date): void => setForm({ ...form, date })}
            />
          </FormField>
          <OKButton
            disabled={!enabled}
            onClick={ok}
            working={form.working}
            variant="danger"
          />
        </Box>
      </Box>
    );
  else return null;
}
