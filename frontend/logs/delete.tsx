import { LogsAppProps } from './app';

import { deleteLog } from '../actions';

import { Box } from '@airtable/blocks/ui';
import { Button } from '@airtable/blocks/ui';
import { CellRenderer } from '@airtable/blocks/ui';
import { ConfirmationDialog } from '@airtable/blocks/ui';
import { FormField } from '@airtable/blocks/ui';
import { Heading } from '@airtable/blocks/ui';
import { Loader } from '@airtable/blocks/ui';

import { colors } from '@airtable/blocks/ui';
import { useState } from 'react';

import React from 'react';

export default function DeleteLog({ ctx }: LogsAppProps): JSX.Element {
  // 👇 prepare the form
  const [form, setForm] = useState({
    isDialogOpen: false,
    working: false
  });
  const disabled = !ctx.log;
  // 👇 when OK is clicked
  const ok = async (): Promise<void> => {
    setForm({ ...form, working: true });
    await deleteLog({
      history: ctx.history,
      log: ctx.log,
      logs: ctx.logs
    });
    setForm({ ...form, isDialogOpen: false, working: false });
  };
  // 👇 build the form
  return (
    <Box>
      {form.isDialogOpen && ctx.log && (
        <ConfirmationDialog
          body={`Log ${ctx.log.getCellValueAsString(
            'Name'
          )} and ALL its associated data will be permanently deleted. Only perform this action in order to clean up test data etc.`}
          isConfirmActionDangerous={true}
          onCancel={(): void => setForm({ ...form, isDialogOpen: false })}
          onConfirm={ok}
          title="Are you sure?"
        />
      )}

      <Heading textColor={colors.RED}>Delete a log and ALL its data</Heading>

      <Box display="flex" justifyContent="space-between">
        <FormField label="Log to delete" width="auto">
          <CellRenderer
            field={ctx.logs.getFieldByName('Name')}
            record={ctx.log}
          />
        </FormField>
        {form.working ? (
          <Loader alignSelf="center" className="spinner" scale={0.3} />
        ) : (
          <Button
            alignSelf="center"
            className="ok-button"
            disabled={disabled}
            onClick={(): void => setForm({ ...form, isDialogOpen: true })}
            variant="primary"
          >
            OK
          </Button>
        )}
      </Box>
    </Box>
  );
}
