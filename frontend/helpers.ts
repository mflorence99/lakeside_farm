import { FieldId } from './airtable';
import { LinkRecordId } from './airtable';

import * as dayjs from 'dayjs';

import { Field } from '@airtable/blocks/models';
import { Record } from '@airtable/blocks/models';

// 👍 https://stackoverflow.com/questions/17415579/how-to-iso-8601-format-a-date-with-timezone-offset-in-javascript
export function forHTMLDatetime(date: Date): string {
  const pad = (num): string => `${num < 10 ? '0' : ''}${num}`;
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function getCellValueAsDayjs(
  record: Record,
  nm: Field | FieldId | string
): dayjs.Dayjs {
  return record ? dayjs(String(record.getCellValue(nm))) : null;
}

export function getCellValueAsLinkRecordIds(
  record: Record,
  nm: Field | FieldId | string
): LinkRecordId[] {
  return record?.getCellValue(nm) as LinkRecordId[];
}

export function getCellValueAsNumber(
  record: Record,
  nm: Field | FieldId | string
): number {
  return Number(record?.getCellValue(nm));
}

export function getCellValueForHTMLDatetime(
  record: Record,
  nm: Field | FieldId | string
): string {
  const dayjs = getCellValueAsDayjs(record, nm);
  return dayjs ? dayjs.format('YYYY-MM-DD[T]HH:mm') : null;
}

// 👇 for link or lookup to single record
export function getLinkCellId(
  record: Record,
  nm: Field | FieldId | string
): string {
  return getLinkCellIds(record, nm)[0];
}

// 👇 for links to multiple records
export function getLinkCellIds(
  record: Record,
  nm: Field | FieldId | string
): string[] {
  const values = getCellValueAsLinkRecordIds(record, nm) ?? [];
  return values.map((value) => value.id || value.linkedRecordId);
}

// 🔥 for testing only!
export function sleep(ms): Promise<any> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
