import { FieldId } from './airtable';
import { LinkRecordId } from './airtable';

import { Field } from '@airtable/blocks/models';
import { Record } from '@airtable/blocks/models';

export function getCellValueAsLinkRecordIds(
  record: Record,
  fieldOrFieldIdOrFieldName: Field | FieldId | string
): LinkRecordId[] {
  return record?.getCellValue(fieldOrFieldIdOrFieldName) as LinkRecordId[];
}

export function getCellValueAsNumber(
  record: Record,
  fieldOrFieldIdOrFieldName: Field | FieldId | string
): number {
  return Number(record?.getCellValue(fieldOrFieldIdOrFieldName));
}

// 👇 for links to single record
export function getLinkCellId(
  record: Record,
  fieldOrFieldIdOrFieldName: Field | FieldId | string
): string {
  return getCellValueAsLinkRecordIds(record, fieldOrFieldIdOrFieldName)?.[0]
    ?.id;
}

// 👇 for links to multiple records
export function getLinkCellIds(
  record: Record,
  fieldOrFieldIdOrFieldName: Field | FieldId | string
): string[] {
  const values =
    getCellValueAsLinkRecordIds(record, fieldOrFieldIdOrFieldName) ?? [];
  return values.map((value) => value.id);
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
