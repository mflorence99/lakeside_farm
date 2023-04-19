import { Record } from '@airtable/blocks/models';
import { Table } from '@airtable/blocks/models';

type CreateTreeParams = {
  date: string;
  history: Table;
  speciesId: string;
  stageId: string;
  trees: Table;
};

type DeleteTreeParams = {
  history: Table;
  logs: Table;
  tree: Record;
  trees: Table;
};

type GetRecordByIdParams = { recordId: string; table: Table };

type UpdateTreeParams = {
  date: string;
  history: Table;
  stageId: string;
  tree: Record;
  trees: Table;
};

export async function createTree({
  date,
  history,
  speciesId,
  stageId,
  trees
}: CreateTreeParams): Promise<string> {
  // 👇 first create the tree
  const treeId = await trees.createRecordAsync({
    Species: [{ id: speciesId }],
    Stage: [{ id: stageId }]
  });
  // 👇 then initialize its history
  await history.createRecordAsync({
    'Date ended': date,
    'Stage': [{ id: stageId }],
    'Tree': [{ id: treeId }]
  });
  return treeId;
}

export async function deleteTree({
  history,
  logs,
  tree,
  trees
}: DeleteTreeParams): Promise<void> {
  const historyIds = tree.getCellValue('History') as Array<any>;
  if (historyIds?.length)
    history.deleteRecordsAsync(historyIds.map((id) => id.id));
  // 🔥 need to recursively delete here
  const logIds = tree.getCellValue('Logs') as Array<any>;
  if (logIds?.length) logs.deleteRecordsAsync(logIds.map((id) => id.id));
  await trees.deleteRecordAsync(tree);
}

// 🔥 https://community.airtable.com/t5/development-apis/select-record-s-from-table-by-id-s/td-p/107212
export async function getRecordById({
  recordId,
  table
}: GetRecordByIdParams): Promise<Record> {
  const query = await table.selectRecordsAsync();
  const record = query.getRecordByIdIfExists(recordId);
  query.unloadData();
  return record;
}

export async function updateTree({
  date,
  history,
  stageId,
  tree,
  trees
}: UpdateTreeParams): Promise<void> {
  // 👇 first update the tree
  await trees.updateRecordAsync(tree, {
    Stage: [{ id: stageId }]
  });
  // 👇 grab the entire history, latest first
  const query = await tree.selectLinkedRecordsFromCellAsync('History', {
    sorts: [{ field: 'Date ended' }]
  });
  const latest = query.records[0];
  if (latest) {
    await history.updateRecordAsync(latest, {
      'Date started': latest.getCellValue('Date ended'),
      'Date ended': date
    });
  }
  await history.createRecordAsync({
    'Date ended': date,
    'Precedent': latest ? [{ id: latest.id }] : null,
    'Stage': [{ id: stageId }],
    'Tree': [{ id: tree.id }]
  });
  query.unloadData();
}
