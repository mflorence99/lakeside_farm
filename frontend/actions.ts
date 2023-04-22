/* eslint-disable prefer-rest-params */
import { getLinkCellId } from './helpers';
import { getLinkCellIds } from './helpers';

import { Record } from '@airtable/blocks/models';
import { Table } from '@airtable/blocks/models';

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
  products: Table;
  tree: Record;
  trees: Table;
};

type GetRecordByIdParams = { recordId: string; table: Table };

type FindAndCompleteMilestoneParams = {
  date: string;
  history: Table;
  leaveOpen?: boolean;
  logId: string;
  record: Record;
  treeId: string;
};

type UpdateRecordParams = {
  date: string;
  history: Table;
  logId: string;
  record: Record;
  stageId: string;
  table: Table;
  treeId: string;
};

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
  console.log('🔶 createLogs', arguments[0]);
  // 👇 complete the last milestone
  const milestone = await findAndCompleteMilestone({
    date,
    history,
    leaveOpen: true, // 👈 keep the last tree stage as a milestone
    logId: null,
    record: tree,
    treeId: tree.id
  });
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
      await history.createRecordAsync({
        'Date ended': date,
        'Log': [{ id: logId }],
        'Precedent': milestone ? [{ id: milestone.id }] : null,
        'Stage': [{ id: stageId }],
        'Tree': [{ id: tree.id }]
      });
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
  console.log('🔶 createTree', arguments[0]);
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
//    NOTE: sole delete function -- wipes everything associated with tree
// ///////////////////////////////////////////////////////////////////////////

export async function deleteTree({
  history,
  logs,
  products,
  tree,
  trees
}: DeleteTreeParams): Promise<void> {
  console.log('🔶 deleteTree', arguments[0]);
  // 👇 delete history first
  //    NOTE: this will delete ALL history
  const historyIds = getLinkCellIds(tree, 'History');
  if (historyIds.length > 0) await history.deleteRecordsAsync(historyIds);
  // 🔥 this could be wicked slow
  const logIds = getLinkCellIds(tree, 'Logs');
  for (const logId of logIds) {
    const log = await getRecordById({ recordId: logId, table: logs });
    // 👇 delete each linked product
    const productIds = getLinkCellIds(log, 'Products');
    for (const productId of productIds) {
      const product = await getRecordById({
        recordId: productId,
        table: products
      });
      await products.deleteRecordAsync(product);
    }
    // 👇 delete each linked log
    await logs.deleteRecordAsync(log);
  }
  // 👇 finally, delete the tree
  await trees.deleteRecordAsync(tree);
}

// ///////////////////////////////////////////////////////////////////////////
// 🔶 getRecordById
// ///////////////////////////////////////////////////////////////////////////

// 🔥 https://community.airtable.com/t5/development-apis/select-record-s-from-table-by-id-s/td-p/107212
export async function getRecordById({
  recordId,
  table
}: GetRecordByIdParams): Promise<Record> {
  console.log(`🔶 getRecordById from ${table.name}`, arguments[0]);
  const query = await table.selectRecordsAsync();
  const record = query.getRecordByIdIfExists(recordId);
  query.unloadData();
  return record;
}

// ///////////////////////////////////////////////////////////////////////////
// 🔶 findAndCompleteMilestone
// ///////////////////////////////////////////////////////////////////////////

export async function findAndCompleteMilestone({
  date,
  history,
  leaveOpen,
  logId,
  record,
  treeId
}: FindAndCompleteMilestoneParams): Promise<Record> {
  console.log('🔶 findAndCompleteMilestone', arguments[0]);
  // 👇 grab the entire history
  const query = await record.selectLinkedRecordsFromCellAsync('History');
  // 👇 find the milestone for this tree, this log
  const milestone = query.records.find((history) => {
    const matchesLog =
      (!logId && !getLinkCellId(history, 'Log')) ||
      logId === getLinkCellId(history, 'Log');
    const matchesTree = treeId === getLinkCellId(history, 'Tree');
    const notStarted = !history.getCellValue('Date started');
    return matchesLog && matchesTree && notStarted;
  });
  // 👇 if the milestone was found, complete it
  if (!leaveOpen && milestone) {
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
// 🔶 updateRecord
//    NOTE: Tree, Log
// ///////////////////////////////////////////////////////////////////////////

export async function updateRecord({
  date,
  history,
  logId,
  record,
  stageId,
  table,
  treeId
}: UpdateRecordParams): Promise<void> {
  console.log(`🔶 updateRecord in ${table.name}`, arguments[0]);
  // 👇 first update the record
  await table.updateRecordAsync(record, {
    Stage: [{ id: stageId }]
  });
  // 👇 complete the last milestone
  const milestone = await findAndCompleteMilestone({
    date,
    history,
    logId,
    record,
    treeId
  });
  // 👇 write the successor history
  await history.createRecordAsync({
    'Date ended': date,
    'Log': logId ? [{ id: logId }] : null,
    'Precedent': milestone ? [{ id: milestone.id }] : null,
    'Stage': [{ id: stageId }],
    'Tree': treeId ? [{ id: treeId }] : null
  });
}
