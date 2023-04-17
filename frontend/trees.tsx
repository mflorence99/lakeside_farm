import { useBase } from '@airtable/blocks/ui';
import { useCursor } from '@airtable/blocks/ui';
import { useLoadable } from '@airtable/blocks/ui';
import { useWatchable } from '@airtable/blocks/ui';

import React from 'react';

export default function TreesApp(): JSX.Element {
  const base = useBase();
  const cursor = useCursor();
  // load selected records and fields
  useLoadable(cursor);
  // re-render whenever the list of selected records or fields changes
  useWatchable(cursor, ['selectedRecordIds', 'selectedFieldIds']);
  const table = base.getTableByIdIfExists(cursor.activeTableId);
  const view = table.getViewByIdIfExists(cursor.activeViewId);
  return (
    <section>
      <ActiveTableAndView table={table} view={view} />
      <SelectedRecordAndFieldIds cursor={cursor} />
    </section>
  );
}

function ActiveTableAndView({ table, view }): JSX.Element {
  return (
    <article>
      Active table: {table.name}
      <br />
      Active view: {view.name}
    </article>
  );
}

function SelectedRecordAndFieldIds({ cursor }): JSX.Element {
  return (
    <article>Selected records: {cursor.selectedRecordIds.join(', ')}</article>
  );
}
