import { fld } from './constants';

import { Box } from '@airtable/blocks/ui';
import { CellRenderer } from '@airtable/blocks/ui';

import React from 'react';

export default function History({ ctx, history }): JSX.Element {
  return (
    <Box>
      <table width="100%">
        {history.getCellValueAsString(fld.DATE_STARTED) ? (
          <tbody>
            <tr>
              <td width="25%">{history.getCellValueAsString(fld.TREE)}</td>
              <td width="25%">{history.getCellValueAsString(fld.STAGE)}</td>
              <td>from</td>
              <td width="40%">
                <CellRenderer
                  field={ctx.HISTORY.getFieldByName(fld.DATE_STARTED)}
                  record={history}
                  shouldWrap={false}
                />
              </td>
            </tr>

            <tr>
              <td></td>
              <td></td>
              <td>to</td>
              <td>
                <CellRenderer
                  field={ctx.HISTORY.getFieldByName(fld.DATE_ENDED)}
                  record={history}
                  shouldWrap={false}
                />
              </td>
            </tr>
          </tbody>
        ) : (
          <tbody>
            <tr>
              <td width="25%">{history.getCellValueAsString(fld.TREE)}</td>
              <td width="25%">{history.getCellValueAsString(fld.STAGE)}</td>
              <td>on</td>
              <td width="40%">
                <CellRenderer
                  field={ctx.HISTORY.getFieldByName(fld.DATE_ENDED)}
                  record={history}
                  shouldWrap={false}
                />
              </td>
            </tr>
          </tbody>
        )}
      </table>
    </Box>
  );
}
