import { Warning } from '../components';

import { deleteTree } from '../actions';

import { Box } from '@airtable/blocks/ui';
import { Button } from '@airtable/blocks/ui';
import { CellRenderer } from '@airtable/blocks/ui';
import { ConfirmationDialog } from '@airtable/blocks/ui';
import { FormField } from '@airtable/blocks/ui';
import { Heading } from '@airtable/blocks/ui';

import { colors } from '@airtable/blocks/ui';
import { useRecordById } from '@airtable/blocks/ui';
import { useState } from 'react';

import React from 'react';

export default function DeleteTree({ ctx }): JSX.Element {
  // 👇 prepare the form
  const [form, setForm] = useState({
    isDialogOpen: false,
    working: false
  });
  const record = useRecordById(ctx.trees, ctx.selectedRecordIds[0] ?? '');
  // 👇 when OK is clicked
  const ok = async (): Promise<void> => {
    setForm({ ...form, working: true });
    await deleteTree({
      history: ctx.history,
      logs: ctx.logs,
      tree: record,
      trees: ctx.trees
    });
    setForm({ ...form, isDialogOpen: false, working: false });
  };
  // 👇 build the form
  return (
    <Box className="divided-box">
      {form.isDialogOpen && record && (
        <ConfirmationDialog
          body={`Tree ${record.getCellValueAsString(
            'Name'
          )} and ALL its associated data will be permanently deleted. Only perform this action in order to clean up test data etc.`}
          isConfirmActionDangerous={true}
          onCancel={(): void => setForm({ ...form, isDialogOpen: false })}
          onConfirm={ok}
          title="Are you sure?"
        />
      )}
      <Heading textColor={colors.RED}>Delete a tree and ALL its data</Heading>
      {ctx.selectedRecordIds.length !== 1 || !record ? (
        <Warning text="Select a single tree to delete" />
      ) : (
        <Box display="flex" justifyContent="space-between">
          <FormField label="Tree to delete" width="auto">
            <CellRenderer
              field={ctx.trees.getFieldByName('Name')}
              record={record}
            />
          </FormField>
          <Button
            alignSelf="center"
            disabled={form.working}
            onClick={(): void => setForm({ ...form, isDialogOpen: true })}
            variant="primary"
          >
            OK
          </Button>
        </Box>
      )}
    </Box>
  );
}
