/* eslint-disable prefer-rest-params */
import { getLinkCellId } from './helpers';
import { getLinkCellIds } from './helpers';

import * as dayjs from 'dayjs';

import { Record } from '@airtable/blocks/models';
import { Table } from '@airtable/blocks/models';

type CompleteMilestoneParams = {
  date: string;
  history: Table;
  logId: string;
  productId: string;
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

type CreateMilestoneParams = {
  date: string;
  history: Table;
  logId: string;
  productId: string;
  stageId: string;
  treeId: string;
};

type CreateProductsParams = {
  counts: number[];
  date: string;
  history: Table;
  log: Record;
  maxWidths: number[];
  minWidths: number[];
  products: Table;
  stageId: string;
  thicknesses: number[];
  type: string;
  widths: number[];
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

type UpdateRecordParams = {
  date: string;
  history: Table;
  logId: string;
  productId: string;
  record: Record;
  stageId: string;
  table: Table;
  treeId: string;
};

// ///////////////////////////////////////////////////////////////////////////
// 🔶 completeMilestone
// ///////////////////////////////////////////////////////////////////////////

export async function completeMilestone({
  date,
  history,
  logId,
  productId,
  record,
  treeId
}: CompleteMilestoneParams): Promise<Record> {
  console.log('🔶 completeMilestone', arguments[0]);
  // 👇 grab the entire history
  const query = await record.selectLinkedRecordsFromCellAsync('History');
  // 👇 find the milestone for this tree, this log, this product
  const milestone = query.records.find((history) => {
    const matchesLog =
      (!logId && !getLinkCellId(history, 'Log')) ||
      logId === getLinkCellId(history, 'Log');
    const matchesProduct =
      (!productId && !getLinkCellId(history, 'Product')) ||
      productId === getLinkCellId(history, 'Product');
    const matchesTree = treeId === getLinkCellId(history, 'Tree');
    const notStarted = !history.getCellValue('Date started');
    return matchesLog && matchesProduct && matchesTree && notStarted;
  });
  // 👇 if the milestone was found, complete it
  //    to satisfy the Gantt chart, we move the end date back one day
  //    to avoid overlap on the chart
  if (milestone) {
    const ganttStart = dayjs(String(milestone.getCellValue('Date ended')));
    let ganttEnd = dayjs(date);
    const sameDay = ganttStart.isSame(ganttEnd, 'day');
    if (!sameDay) ganttEnd = ganttEnd.subtract(1, 'day');
    // console.log(
    //   `ganttStart=${ganttStart.toISOString()} ganttEnd=${ganttEnd.toISOString()} sameDay=${sameDay}`
    // );
    await history.updateRecordAsync(milestone, {
      'Date started': milestone.getCellValue('Date ended'),
      'Date ended': date,
      'Date started (Gantt)': ganttStart.toISOString(),
      'Date ended (Gantt)': ganttEnd.toISOString()
    });
  }
  // 👇 done with history data
  query.unloadData();
  return milestone;
}

// ///////////////////////////////////////////////////////////////////////////
// 🔶 createMilestone
// ///////////////////////////////////////////////////////////////////////////

export async function createMilestone({
  date,
  history,
  logId,
  productId,
  stageId,
  treeId
}: CreateMilestoneParams): Promise<string> {
  console.log('🔶 createMilestone', arguments[0]);
  return await history.createRecordAsync({
    'Date ended': date,
    'Date ended (Gantt)': date,
    'Log': logId ? [{ id: logId }] : null,
    'Product': productId ? [{ id: productId }] : null,
    'Stage': [{ id: stageId }],
    'Tree': treeId ? [{ id: treeId }] : null
  });
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
  console.log('🔶 createLogs', arguments[0]);
  // 👇 create each log
  for (let ix = 0; ix < lengths.length; ix++) {
    if (lengths[ix]) {
      // 👇 first create the log
      const logId = await logs.createRecordAsync({
        'Date staged': date,
        'Diameter': diameters[ix],
        'Length': lengths[ix],
        'Log ID': ix + 1,
        'Stage': [{ id: stageId }],
        'Tree': [{ id: tree.id }]
      });
      // 👇 then initialize its history
      await createMilestone({
        date,
        history,
        logId,
        productId: null,
        stageId,
        treeId: tree.id
      });
    }
  }
}

// ///////////////////////////////////////////////////////////////////////////
// 🔶 createProducts
// ///////////////////////////////////////////////////////////////////////////

export async function createProducts({
  counts,
  date,
  history,
  log,
  maxWidths,
  minWidths,
  products,
  stageId,
  thicknesses,
  type,
  widths
}: CreateProductsParams): Promise<void> {
  console.log('🔶 createProducts', arguments[0]);
  // 👇 create each product
  for (let ix = 0; ix < thicknesses.length; ix++) {
    if (thicknesses[ix]) {
      // 👇 first create the product
      const common = {
        'Date staged': date,
        'Log': [{ id: log.id }],
        'Stage': [{ id: stageId }],
        'Thickness': thicknesses[ix],
        'Type': { name: type }
      };
      let productId;
      if (type === 'Board')
        productId = await products.createRecordAsync({
          ...common,
          'Board count': counts[ix],
          'Board width': widths[ix]
        });
      else if (type === 'Slab')
        productId = await products.createRecordAsync({
          ...common,
          'Slab ID': ix + 1,
          'Slab max width': maxWidths[ix],
          'Slab min width': minWidths[ix]
        });
      // 👇 then initialize its history
      await createMilestone({
        date,
        history,
        logId: log.id,
        productId,
        stageId,
        treeId: getLinkCellId(log, 'Tree')
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
    'Date staged': date,
    'Species': [{ id: speciesId }],
    'Stage': [{ id: stageId }]
  });
  // 👇 then initialize its history
  await createMilestone({
    date,
    history,
    logId: null,
    productId: null,
    stageId,
    treeId
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
// 🔶 updateRecord
//    NOTE: Tree, Log, Product
// ///////////////////////////////////////////////////////////////////////////

export async function updateRecord({
  date,
  history,
  logId,
  productId,
  record,
  stageId,
  table,
  treeId
}: UpdateRecordParams): Promise<void> {
  console.log(`🔶 updateRecord in ${table.name}`, arguments[0]);
  // 👇 first update the record
  await table.updateRecordAsync(record, {
    'Date staged': date,
    'Stage': [{ id: stageId }]
  });
  // 👇 complete the last milestone
  await completeMilestone({
    date,
    history,
    logId,
    productId,
    record,
    treeId
  });
  // 👇 write the successor history
  await createMilestone({
    date,
    history,
    logId,
    productId,
    stageId,
    treeId
  });
}
