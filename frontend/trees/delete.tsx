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
  const enabled = ctx.tree;
  // 👇 when OK is clicked
  const ok = async (): Promise<void> => {
    setForm({ ...form, isDialogOpen: false, working: true });
    await deleteTree({
      history: ctx.history,
      products: ctx.products,
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
          )} and ALL its associated data will be permanently deleted. Only perform this action in order to clean up erroneous data.`}
          isConfirmActionDangerous={true}
          onCancel={(): void => setForm({ ...form, isDialogOpen: false })}
          onConfirm={ok}
          title="Are you sure?"
        />
      )}

      {enabled ? (
        <Heading>
          Delete {ctx.tree.getCellValue('Name')} and ALL its data
        </Heading>
      ) : (
        <Heading textColor={colors.GRAY}>Delete tree</Heading>
      )}

      <Box display="flex" justifyContent="space-between">
        <FormField label="Tree to delete" width="33%">
          {enabled && (
            <CellRenderer
              field={ctx.trees.getFieldByName('Name')}
              record={ctx.tree}
            />
          )}
        </FormField>
        {form.working ? (
          <Loader alignSelf="center" className="spinner" scale={0.3} />
        ) : (
          <Button
            alignSelf="center"
            className="ok-button"
            disabled={!enabled}
            onClick={(): void => setForm({ ...form, isDialogOpen: true })}
            variant="danger"
          >
            OK
          </Button>
        )}
      </Box>
    </Box>
  );
}
