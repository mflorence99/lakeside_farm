import { AppProps } from '../app';

import { findHistoryFor } from '../helpers';
import { fld } from '../constants';
import { forHTMLDatetime } from '../helpers';
import { getLinkCellId } from '../helpers';
import { iDryPowerOptions } from '../constants';
import { iDryTempOptions } from '../constants';
import { updateRecord } from '../actions';

import Datetime from '../datetime';
import History from '../history';
import OKButton from '../ok-button';

import { Box } from '@airtable/blocks/ui';
import { CellRenderer } from '@airtable/blocks/ui';
import { FormField } from '@airtable/blocks/ui';
import { Heading } from '@airtable/blocks/ui';
import { Select } from '@airtable/blocks/ui';

import { colors } from '@airtable/blocks/ui';
import { expandRecord } from '@airtable/blocks/ui';
import { useState } from 'react';

import React from 'react';

export default function KilnDryProduct({ ctx, data }: AppProps): JSX.Element {
  // 👇 prepare the form
  const [form, setForm] = useState({
    date: forHTMLDatetime(new Date()),
    iDryPower: iDryPowerOptions[0].value,
    iDryTemp: iDryTempOptions[0].value,
    working: false
  });
  const stageId = getLinkCellId(data.product, fld.STAGE);
  const enabled =
    data.product &&
    (stageId === data.stageIdBySymbol.AIR_DRYING ||
      stageId === data.stageIdBySymbol.KILN_DRYING);
  // 👇 already been processed at the desired stage?
  const alreadyProcessed = findHistoryFor(
    data.histories,
    [data.stageBySymbol.KILN_DRYING],
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
        iDryPower: form.iDryPower,
        iDryTemp: form.iDryTemp,
        logId: data.log.getCellValueAsString(fld.LOG_ID),
        productId: data.product.getCellValueAsString(fld.PRODUCT_ID),
        record: data.product,
        stageId: data.stageIdBySymbol.KILN_DRYING,
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
        <Heading>7. Kiln dry {data.product.getCellValue(fld.NAME)}</Heading>
      ) : (
        <Heading textColor={colors.GRAY}>7. Kiln dry product</Heading>
      )}

      {alreadyProcessed && <History ctx={ctx} history={alreadyProcessed} />}

      {(!alreadyProcessed || enabled) && (
        <Box>
          <Box display="flex" justifyContent="space-around">
            <FormField label="iDry Power" width="8rem">
              <Select
                onChange={(v: string): void =>
                  setForm({ ...form, iDryPower: v })
                }
                options={iDryPowerOptions}
                value={form.iDryPower}
              />
            </FormField>
            <FormField label="iDry Temp" width="8rem">
              <Select
                onChange={(v: string): void =>
                  setForm({ ...form, iDryTemp: v })
                }
                options={iDryTempOptions}
                value={form.iDryTemp}
              />
            </FormField>
          </Box>

          <br />

          <Box display="flex" justifyContent="space-between">
            <FormField label="Product to kiln dry" width="33%">
              {enabled && (
                <CellRenderer
                  field={ctx.PRODUCTS.getFieldByName(fld.NAME)}
                  record={data.product}
                  shouldWrap={false}
                />
              )}
            </FormField>
            <FormField label="When kiln drying started" width="auto">
              <Datetime
                date={form.date}
                onChange={(date): void => setForm({ ...form, date })}
              />
            </FormField>
            <OKButton disabled={!enabled} onClick={ok} working={form.working} />
          </Box>
        </Box>
      )}
    </Box>
  );
}
