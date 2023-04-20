import { TreesAppProps } from './app';

import { deleteTree } from '../actions';

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

export default function DeleteTree({ ctx }: TreesAppProps): JSX.Element {
  // 👇 prepare the form
  const [form, setForm] = useState({
    isDialogOpen: false,
    working: false
  });
  const disabled = !ctx.tree;
  // 👇 when OK is clicked
  const ok = async (): Promise<void> => {
    setForm({ ...form, working: true });
    await deleteTree({
      history: ctx.history,
      logs: ctx.logs,
      tree: ctx.tree,
      trees: ctx.trees
    });
    setForm({ ...form, isDialogOpen: false, working: false });
  };
  // 👇 build the form
  return (
    <Box>
      {form.isDialogOpen && ctx.tree && (
        <ConfirmationDialog
          body={`Tree ${ctx.tree.getCellValueAsString(
            'Name'
          )} and ALL its associated data will be permanently deleted. Only perform this action in order to clean up test data etc.`}
          isConfirmActionDangerous={true}
          onCancel={(): void => setForm({ ...form, isDialogOpen: false })}
          onConfirm={ok}
          title="Are you sure?"
        />
      )}
      <Heading textColor={colors.RED}>Delete a tree and ALL its data</Heading>
      <Box display="flex" justifyContent="space-between">
        <FormField label="Tree to delete" width="auto">
          <CellRenderer
            field={ctx.trees.getFieldByName('Name')}
            record={ctx.tree}
          />
        </FormField>
        {form.working ? (
          <Loader alignSelf="center" scale={0.8} />
        ) : (
          <Button
            alignSelf="center"
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
