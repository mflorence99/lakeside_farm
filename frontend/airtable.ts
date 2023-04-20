// 🔥 tyoes that airtable should export but doesn't

export type FieldId = string;

export type LinkRecordId = {
  id: FieldId;
  name?: string;
};

export type RecordId = string;

export type SelectOption = {
  disabled?: boolean;
  label: React.ReactNode;
  value: SelectOptionValue;
};

export type SelectOptionValue = string | number | boolean | null | undefined;

export type TableId = string;

export type ViewId = string;
