import { Table } from '@airtable/blocks/models';

type CreateInitialEventParams = {
  date: string;
  history: Table;
  stageId: string;
  treeId: string;
};
type CreateTreeParams = { speciesId: string; stageId: string; trees: Table };

// /////////////////////////////////////////////////////////////////////////////
// ACTIONS
// /////////////////////////////////////////////////////////////////////////////

export async function createInitialEvent({
  date,
  history,
  stageId,
  treeId
}: CreateInitialEventParams): Promise<void> {
  const fields = {
    'Date ended': date,
    'Stage': [{ id: stageId }],
    'Tree': [{ id: treeId }]
  };
  await history.createRecordAsync(fields);
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

// 👍 https://stackoverflow.com/questions/17415579/how-to-iso-8601-format-a-date-with-timezone-offset-in-javascript
export function toISOString(date: Date): string {
  const pad = (num): string => `${num < 10 ? '0' : ''}${num}`;
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

// 🔥 for testing only!
export function sleep(ms): Promise<any> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
