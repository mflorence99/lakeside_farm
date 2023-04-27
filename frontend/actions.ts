/* eslint-disable prefer-rest-params */
import { AppProps } from './app';

import { fld } from './constants';
import { getCellValueAsDayjs } from './helpers';
import { getLinkCellId } from './helpers';

import * as dayjs from 'dayjs';

import { Record } from '@airtable/blocks/models';
import { Table } from '@airtable/blocks/models';

type CompleteMilestoneParams = {
  date: string;
  leaveOpen?: boolean;
  logId: string;
  productId: string;
};

type CreateLogsParams = {
  date: string;
  diameters: number[];
  lengths: number[];
  stageId: string;
};

type CreateMilestoneParams = {
  date: string;
  iDryPower?: string;
  iDryTemp?: string;
  logId: string;
  predecessor?: Record;
  productId: string;
  stageId: string;
  treeId: string;
};

type CreateProductsParams = {
  counts: number[];
  date: string;
  logId: string;
  maxWidths: number[];
  minWidths: number[];
  stageId: string;
  thicknesses: number[];
  type: string;
  widths: number[];
};

type CreateTreeParams = {
  date: string;
  speciesId: string;
  stageId: string;
};

type GetRecordByIdParams = { recordId: string; table: Table };

type UpdateRecordParams = {
  date: string;
  iDryPower?: string;
  iDryTemp?: string;
  logId: string;
  productId: string;
  record: Record;
  stageId: string;
  table: Table;
};

// ///////////////////////////////////////////////////////////////////////////
// 🔶 completeMilestone
//
// 🔥 we COULD pass in data.histories instead of re-reading them
//    via tree.selectLinkedRecordsFromCellAsync -- let's see how it looks
//    when we're more code-complete -- also use findHistoryFor in helpers.ts
// ///////////////////////////////////////////////////////////////////////////

export async function completeMilestone(
  { ctx, data }: AppProps,
  { date, leaveOpen, logId, productId }: CompleteMilestoneParams
): Promise<Record> {
  console.log('🔶 completeMilestone', arguments[0]);
  // 👇 the entire history is linked to the tree
  const query = await data.tree.selectLinkedRecordsFromCellAsync(fld.HISTORY);
  // 👇 find the milestone for this tree, this log, this product
  const milestone = query.records.find((history) => {
    const matchesLog = logId === history.getCellValueAsString(fld.LOG_ID);
    const matchesProduct =
      productId === history.getCellValueAsString(fld.PRODUCT_ID);
    const matchesTree = data.tree.id === getLinkCellId(history, fld.TREE);
    const notStarted = !history.getCellValue(fld.DATE_STARTED);
    return matchesLog && matchesProduct && matchesTree && notStarted;
  });
  // 👇 if the milestone was found, complete it
  //    to satisfy the Gantt chart, we move the end date back one day
  //    to avoid overlap on the chart
  if (milestone && !leaveOpen) {
    const ganttStart = getCellValueAsDayjs(milestone, fld.DATE_ENDED);
    let ganttEnd = dayjs(date);
    const sameDay = ganttStart.isSame(ganttEnd, 'day');
    if (!sameDay) ganttEnd = ganttEnd.subtract(1, 'day');
    // console.log(
    //   `ganttStart=${ganttStart.toISOString()} ganttEnd=${ganttEnd.toISOString()} sameDay=${sameDay}`
    // );
    await ctx.HISTORY.updateRecordAsync(milestone, {
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

export async function createLogs(
  { ctx, data }: AppProps,
  { date, diameters, lengths, stageId }: CreateLogsParams
): Promise<void> {
  console.log('🔶 createLogs', arguments[0]);
  // 👇 create each log
  for (let ix = 0; ix < lengths.length; ix++) {
    if (lengths[ix]) {
      // 👇 first create the log
      const logId = `${ix + 1}`;
      await ctx.LOGS.createRecordAsync({
        [fld.DIAMETER]: diameters[ix],
        [fld.LENGTH]: lengths[ix],
        [fld.LOG_ID]: logId,
        [fld.STAGE]: [{ id: stageId }],
        [fld.TREE]: [{ id: data.tree.id }]
      });
      // 👇 find the predecessor history
      const predecessor = await completeMilestone(
        { ctx, data },
        {
          date,
          leaveOpen: true,
          logId: '',
          productId: ''
        }
      );
      // 👇 then initialize its history
      await createMilestone(
        { ctx, data },
        {
          date,
          logId,
          predecessor,
          productId: '',
          stageId,
          treeId: data.tree.id
        }
      );
    }
  }
}

// ///////////////////////////////////////////////////////////////////////////
// 🔶 createMilestone
// ///////////////////////////////////////////////////////////////////////////

export async function createMilestone(
  { ctx }: AppProps,
  {
    date,
    iDryPower,
    iDryTemp,
    logId,
    predecessor,
    productId,
    stageId,
    treeId
  }: CreateMilestoneParams
): Promise<string> {
  console.log('🔶 createMilestone', arguments[0]);
  return await ctx.HISTORY.createRecordAsync({
    [fld.DATE_ENDED]: date,
    [fld.DATE_ENDED_GANTT]: date,
    [fld.IDRY_POWER]: iDryPower,
    [fld.IDRY_TEMP]: iDryTemp,
    [fld.LOG_ID]: logId,
    [fld.PREDECESSOR_GANTT]: predecessor ? [{ id: predecessor.id }] : null,
    [fld.PRODUCT_ID]: productId,
    [fld.STAGE]: [{ id: stageId }],
    [fld.TREE]: [{ id: treeId }]
  });
}

// ///////////////////////////////////////////////////////////////////////////
// 🔶 createProducts
// ///////////////////////////////////////////////////////////////////////////

export async function createProducts(
  { ctx, data }: AppProps,
  {
    counts,
    date,
    logId,
    maxWidths,
    minWidths,
    stageId,
    thicknesses,
    type,
    widths
  }: CreateProductsParams
): Promise<void> {
  console.log('🔶 createProducts', arguments[0]);
  // 👇 create each product
  for (let ix = 0; ix < thicknesses.length; ix++) {
    if (thicknesses[ix]) {
      // 👇 first create the product
      const common = {
        [fld.LOG]: [{ id: data.log.id }],
        [fld.STAGE]: [{ id: stageId }],
        [fld.THICKNESS]: thicknesses[ix],
        [fld.TYPE]: { name: type }
      };
      let productId;
      if (type === 'Board') {
        productId = `${thicknesses[ix]}x${widths[ix]}`;
        await ctx.PRODUCTS.createRecordAsync({
          ...common,
          [fld.BOARD_COUNT]: counts[ix],
          [fld.BOARD_WIDTH]: widths[ix]
        });
      } else if (type === 'Slab') {
        const slabId = `${ix + 1}`;
        productId = slabId;
        await ctx.PRODUCTS.createRecordAsync({
          ...common,
          [fld.SLAB_ID]: slabId,
          [fld.SLAB_MAX_WIDTH]: maxWidths[ix],
          [fld.SLAB_MIN_WIDTH]: minWidths[ix]
        });
      }
      // 👇 find the predecessor history
      const predecessor = await completeMilestone(
        { ctx, data },
        {
          date,
          leaveOpen: true,
          logId,
          productId: ''
        }
      );
      // 👇 then initialize its history
      await createMilestone(
        { ctx, data },
        {
          date,
          logId,
          predecessor,
          productId,
          stageId,
          treeId: data.tree.id
        }
      );
    }
  }
}

// ///////////////////////////////////////////////////////////////////////////
// 🔶 createTree
// ///////////////////////////////////////////////////////////////////////////

export async function createTree(
  { ctx, data }: AppProps,
  { date, speciesId, stageId }: CreateTreeParams
): Promise<string> {
  console.log('🔶 createTree', arguments[0]);
  // 👇 first create the tree
  const treeId = await ctx.TREES.createRecordAsync({
    [fld.SPECIES]: [{ id: speciesId }],
    [fld.STAGE]: [{ id: stageId }]
  });
  // 👇 then initialize its history
  await createMilestone(
    { ctx, data },
    {
      date,
      logId: '',
      productId: '',
      stageId,
      treeId
    }
  );
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

export async function updateRecord(
  { ctx, data }: AppProps,
  {
    date,
    iDryPower,
    iDryTemp,
    logId,
    productId,
    record,
    stageId,
    table
  }: UpdateRecordParams
): Promise<void> {
  console.log(`🔶 updateRecord in ${table.name}`, arguments[0]);
  // 👇 first update the record
  await table.updateRecordAsync(record, {
    [fld.STAGE]: [{ id: stageId }]
  });
  // 👇 complete the last milestone
  const predecessor = await completeMilestone(
    { ctx, data },
    {
      date,
      logId,
      productId
    }
  );
  // 👇 write the successor history
  await createMilestone(
    { ctx, data },
    {
      date,
      iDryPower,
      iDryTemp,
      logId,
      predecessor: predecessor,
      productId,
      stageId,
      treeId: data.tree.id
    }
  );
}
