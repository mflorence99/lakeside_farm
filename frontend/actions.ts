import { Table } from '@airtable/blocks/models';

type CreateInitialEventParams = {
  date: string;
  events: Table;
  stageId: string;
  treeId: string;
};
type CreateTreeParams = { speciesId: string; stageId: string; trees: Table };

// /////////////////////////////////////////////////////////////////////////////
// ACTIONS
// /////////////////////////////////////////////////////////////////////////////

export async function createInitialEvent({
  date,
  events,
  stageId,
  treeId
}: CreateInitialEventParams): Promise<void> {
  const fields = {
    'Date ended': date,
    'Stage': [{ id: stageId }],
    'Tree': [{ id: treeId }]
  };
  await events.createRecordAsync(fields);
}

export async function createTree({
  speciesId,
  stageId,
  trees
}: CreateTreeParams): Promise<string> {
  const fields = {
    Species: [{ id: speciesId }],
    Stage: [{ id: stageId }]
  };
  return await trees.createRecordAsync(fields);
}

// 🔥 for testing only!
export function sleep(ms): Promise<any> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
