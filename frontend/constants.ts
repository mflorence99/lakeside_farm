export const iDryPowerOptions = [
  { label: 'High power', value: 'HIGH' },
  { label: 'Low power', value: 'LOW' }
];

export const iDryTempOptions = [
  { label: '100\u00B0 F', value: '100' },
  { label: '125\u00B0 F', value: '125' },
  { label: '150\u00B0 F', value: '150' },
  { label: '175\u00B0 F', value: '175' }
];
export const fld = {
  BOARD_COUNT: 'Board count',
  BOARD_WIDTH: 'Board width',
  DATE_ENDED: 'Date ended',
  DATE_ENDED_GANTT: 'Date ended (Gantt)',
  DATE_STARTED: 'Date started',
  DATE_STARTED_GANTT: 'Date started (Gantt)',
  DIAMETER: 'Diameter',
  HISTORY: 'History',
  IDRY_POWER: 'iDry power',
  IDRY_TEMP: 'iDry temp',
  LENGTH: 'Length',
  LOG: 'Log',
  LOG_ID: 'Log ID',
  NAME: 'Name',
  NUM_BOARDS: '# Boards',
  NUM_LOGS: '# Logs',
  NUM_SLABS: '# Slabs',
  PREDECESSOR_GANTT: 'Predecessor (Gantt)',
  PRODUCT: 'Product',
  PRODUCT_ID: 'Product ID',
  SPECIES: 'Species',
  SLAB_ID: 'Slab ID',
  SLAB_MAX_WIDTH: 'Slab max width',
  SLAB_MIN_WIDTH: 'Slab min width',
  STAGE: 'Stage',
  SYMBOL: 'SYMBOL',
  THICKNESS: 'Thickness',
  TREE: 'Tree',
  TREE_ID: 'Tree ID',
  TYPE: 'Type'
};

export const tbl = {
  HISTORY: 'History',
  LOGS: 'Logs',
  LOCATIONS: 'Locations',
  PRODUCTS: 'Products',
  STAGES: 'Stages',
  SPECIES: 'Species',
  TREES: 'Trees'
};

export enum stg {
  AIR_DRYING,
  FINISHED,
  FLATTENING,
  HARVESTED,
  KILN_DRYING,
  LOGGED,
  MILLED,
  PRE_DRY,
  PRE_FLATTEN,
  PRE_MILL,
  SCRAPPED,
  STANDING
}

export type StageMap = { [k in keyof typeof stg]: string };
