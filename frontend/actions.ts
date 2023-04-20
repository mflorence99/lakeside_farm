import { Record } from '@airtable/blocks/models';
import { Table } from '@airtable/blocks/models';

type CompleteMilestoneParams = {
  date: string;
  history: Table;
  logId: string;
  record: Record;
  treeId: string;
};

type CreateLogsParams = {
  date: string;
  diameters: number[];
  history: Table;
  lengths: number[];
  logs: Table;
  stageId: string;
  tree: Record;
};

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

// ///////////////////////////////////////////////////////////////////////////
// 🔶 completeMilestone
// ///////////////////////////////////////////////////////////////////////////

export async function completeMilestone({
  date,
  history,
  logId,
  record,
  treeId
}: CompleteMilestoneParams): Promise<Record> {
  // 👇 grab the entire history
  const query = await record.selectLinkedRecordsFromCellAsync('History');
  // 👇 find the milestone for this tree, this log
  const milestone = query.records.find((history) => {
    const matchesLog =
      (!logId && !history.getCellValue('Log')?.[0]?.id) ||
      logId === history.getCellValue('Log')?.[0]?.id;
    const matchesTree = treeId === history.getCellValue('Tree')?.[0]?.id;
    const notStarted = !history.getCellValue('Date started');
    return matchesLog && matchesTree && notStarted;
  });
  // 👇 if the milestone was found, complete it
  if (milestone) {
    await history.updateRecordAsync(milestone, {
      'Date started': milestone.getCellValue('Date ended'),
      'Date ended': date
    });
  }
  // 👇 done with history data
  query.unloadData();
  return milestone;
}

// ///////////////////////////////////////////////////////////////////////////
// 🔶 createLogs
// ///////////////////////////////////////////////////////////////////////////

export async function createLogs({
  date,
  diameters,
  history,
  lengths,
  logs,
  stageId,
  tree
}: CreateLogsParams): Promise<void> {
  // 👇 complete the last milestone
  // const milestone = await completeMilestone({
  //   date,
  //   history,
  //   logId: null,
  //   record: tree,
  //   treeId: tree.id
  // });
  // 👇 create each log
  for (let ix = 0; ix < lengths.length; ix++) {
    if (lengths[ix]) {
      // 👇 first create the log
      const logId = await logs.createRecordAsync({
        'Diameter': diameters[ix],
        'Length': lengths[ix],
        'Log ID': ix + 1,
        'Stage': [{ id: stageId }],
        'Tree': [{ id: tree.id }]
      });
      // 👇 then initialize its history
      // await history.createRecordAsync({
      //   'Date ended': date,
      //   'Log': [{ id: logId }],
      //   'Precedent': milestone ? [{ id: milestone.id }] : null,
      //   'Stage': [{ id: stageId }],
      //   'Tree': [{ id: tree.id }]
      // });
    }
  }
}

// ///////////////////////////////////////////////////////////////////////////
// 🔶 createTree
// ///////////////////////////////////////////////////////////////////////////

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

// ///////////////////////////////////////////////////////////////////////////
// 🔶 deleteTree
// ///////////////////////////////////////////////////////////////////////////

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

// ///////////////////////////////////////////////////////////////////////////
// 🔶 updateTree
// ///////////////////////////////////////////////////////////////////////////

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
  // 👇 complete the last milestone
  const milestone = await completeMilestone({
    date,
    history,
    logId: null,
    record: tree,
    treeId: tree.id
  });
  // 👇 write the successor mistory
  await history.createRecordAsync({
    'Date ended': date,
    'Precedent': milestone ? [{ id: milestone.id }] : null,
    'Stage': [{ id: stageId }],
    'Tree': [{ id: tree.id }]
  });
}
