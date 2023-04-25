/* eslint-disable prefer-rest-params */
import { fld } from './constants';
import { getCellValueAsDayjs } from './helpers';
import { getLinkCellId } from './helpers';

import * as dayjs from 'dayjs';

import { Record } from '@airtable/blocks/models';
import { Table } from '@airtable/blocks/models';

type CompleteMilestoneParams = {
  date: string;
  history: Table;
  logId: string;
  productId: string;
  tree: Record;
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
  iDryPower?: string;
  iDryTemp?: string;
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
  logId: string;
  maxWidths: number[];
  minWidths: number[];
  products: Table;
  stageId: string;
  thicknesses: number[];
  tree: Record;
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

type GetRecordByIdParams = { recordId: string; table: Table };

type UpdateRecordParams = {
  date: string;
  history: Table;
  iDryPower?: string;
  iDryTemp?: string;
  logId: string;
  productId: string;
  record: Record;
  stageId: string;
  table: Table;
  tree: Record;
};

// ///////////////////////////////////////////////////////////////////////////
// 🔶 completeMilestone
// ///////////////////////////////////////////////////////////////////////////

export async function completeMilestone({
  date,
  history,
  logId,
  productId,
  tree
}: CompleteMilestoneParams): Promise<Record> {
  console.log('🔶 completeMilestone', arguments[0]);
  // 👇 the entire history is linked to the tree
  const query = await tree.selectLinkedRecordsFromCellAsync(fld.HISTORY);
  // 👇 find the milestone for this tree, this log, this product
  const milestone = query.records.find((history) => {
    const matchesLog = logId === history.getCellValueAsString(fld.LOG_ID);
    const matchesProduct =
      productId === history.getCellValueAsString(fld.PRODUCT_ID);
    const matchesTree = tree.id === getLinkCellId(history, fld.TREE);
    const notStarted = !history.getCellValue(fld.DATE_STARTED);
    return matchesLog && matchesProduct && matchesTree && notStarted;
  });
  // 👇 if the milestone was found, complete it
  //    to satisfy the Gantt chart, we move the end date back one day
  //    to avoid overlap on the chart
  if (milestone) {
    const ganttStart = getCellValueAsDayjs(milestone, fld.DATE_ENDED);
    let ganttEnd = dayjs(date);
    const sameDay = ganttStart.isSame(ganttEnd, 'day');
    if (!sameDay) ganttEnd = ganttEnd.subtract(1, 'day');
    // console.log(
    //   `ganttStart=${ganttStart.toISOString()} ganttEnd=${ganttEnd.toISOString()} sameDay=${sameDay}`
    // );
    await history.updateRecordAsync(milestone, {
      [fld.DATE_STARTED]: milestone.getCellValue(fld.DATE_ENDED),
      [fld.DATE_ENDED]: date,
      [fld.DATE_STARTED_GANTT]: ganttStart.toISOString(),
      [fld.DATE_ENDED_GANTT]: ganttEnd.toISOString()
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
  console.log('🔶 createLogs', arguments[0]);
  // 👇 create each log
  for (let ix = 0; ix < lengths.length; ix++) {
    if (lengths[ix]) {
      // 👇 first create the log
      const logId = `${ix + 1}`;
      await logs.createRecordAsync({
        [fld.DIAMETER]: diameters[ix],
        [fld.LENGTH]: lengths[ix],
        [fld.LOG_ID]: logId,
        [fld.STAGE]: [{ id: stageId }],
        [fld.TREE]: [{ id: tree.id }]
      });
      // 👇 then initialize its history
      await createMilestone({
        date,
        history,
        logId,
        productId: '',
        stageId,
        treeId: tree.id
      });
    }
  }
}

// ///////////////////////////////////////////////////////////////////////////
// 🔶 createMilestone
// ///////////////////////////////////////////////////////////////////////////

export async function createMilestone({
  date,
  history,
  iDryPower,
  iDryTemp,
  logId,
  productId,
  stageId,
  treeId
}: CreateMilestoneParams): Promise<string> {
  console.log('🔶 createMilestone', arguments[0]);
  return await history.createRecordAsync({
    [fld.DATE_ENDED]: date,
    [fld.DATE_ENDED_GANTT]: date,
    [fld.IDRY_POWER]: iDryPower,
    [fld.IDRY_TEMP]: iDryTemp,
    [fld.LOG_ID]: logId,
    [fld.PRODUCT_ID]: productId,
    [fld.STAGE]: [{ id: stageId }],
    [fld.TREE]: [{ id: treeId }]
  });
}

// ///////////////////////////////////////////////////////////////////////////
// 🔶 createProducts
// ///////////////////////////////////////////////////////////////////////////

export async function createProducts({
  counts,
  date,
  history,
  log,
  logId,
  maxWidths,
  minWidths,
  products,
  stageId,
  thicknesses,
  tree,
  type,
  widths
}: CreateProductsParams): Promise<void> {
  console.log('🔶 createProducts', arguments[0]);
  // 👇 create each product
  for (let ix = 0; ix < thicknesses.length; ix++) {
    if (thicknesses[ix]) {
      // 👇 first create the product
      const common = {
        [fld.LOG]: [{ id: log.id }],
        [fld.STAGE]: [{ id: stageId }],
        [fld.THICKNESS]: thicknesses[ix],
        [fld.TYPE]: { name: type }
      };
      let productId;
      if (type === 'Board') {
        productId = `${thicknesses[ix]}x${widths[ix]}`;
        await products.createRecordAsync({
          ...common,
          [fld.BOARD_COUNT]: counts[ix],
          [fld.BOARD_WIDTH]: widths[ix]
        });
      } else if (type === 'Slab') {
        const slabId = `${ix + 1}`;
        productId = slabId;
        await products.createRecordAsync({
          ...common,
          [fld.SLAB_ID]: slabId,
          [fld.SLAB_MAX_WIDTH]: maxWidths[ix],
          [fld.SLAB_MIN_WIDTH]: minWidths[ix]
        });
      }
      // 👇 then initialize its history
      await createMilestone({
        date,
        history,
        logId,
        productId,
        stageId,
        treeId: tree.id
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
    [fld.SPECIES]: [{ id: speciesId }],
    [fld.STAGE]: [{ id: stageId }]
  });
  // 👇 then initialize its history
  await createMilestone({
    date,
    history,
    logId: '',
    productId: '',
    stageId,
    treeId
  });
  return treeId;
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
  iDryPower,
  iDryTemp,
  logId,
  productId,
  record,
  stageId,
  table,
  tree
}: UpdateRecordParams): Promise<void> {
  console.log(`🔶 updateRecord in ${table.name}`, arguments[0]);
  // 👇 first update the record
  await table.updateRecordAsync(record, {
    [fld.STAGE]: [{ id: stageId }]
  });
  // 👇 complete the last milestone
  await completeMilestone({
    date,
    history,
    logId,
    productId,
    tree
  });
  // 👇 write the successor history
  await createMilestone({
    date,
    history,
    iDryPower,
    iDryTemp,
    logId,
    productId,
    stageId,
    treeId: tree.id
  });
}
