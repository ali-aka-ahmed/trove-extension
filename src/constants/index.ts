import { NotionColor } from '../app/notionTypes/schema';

export const NOTION_COLORS = {
  [NotionColor.Default]: '#D8D7D5',
  [NotionColor.Gray]: '#EBEAEA',
  [NotionColor.Brown]: '#E8D5CC',
  [NotionColor.Orange]: '#FDDECC',
  [NotionColor.Yellow]: '#FBEECC',
  [NotionColor.Green]: '#CCE7E1',
  [NotionColor.Blue]: '#CCE4F9',
  [NotionColor.Purple]: '#E0D3F9',
  [NotionColor.Pink]: '#F8CCE6',
  [NotionColor.Red]: '#FFCCD1',
};

export const NOTION_COLOR_VALUES_LIST = [
  '#D8D7D5', // default
  '#EBEAEA', // grey
  '#E8D5CC', // brown
  '#FDDECC', // orange
  '#FBEECC', // yellow
  '#CCE7E1', // green
  '#CCE4F9', // blue
  '#E0D3F9', // purple
  '#F8CCE6', // pink
  '#FFCCD1', // red
];

export const NOTION_COLOR_KEYS_LIST = [
  NotionColor.Default,
  NotionColor.Gray,
  NotionColor.Brown,
  NotionColor.Orange,
  NotionColor.Yellow,
  NotionColor.Green,
  NotionColor.Blue,
  NotionColor.Purple,
  NotionColor.Pink,
  NotionColor.Red,
];

export const EXCLUDED_HOSTNAMES = ['localhost'];

export const MINIMUM_REQUEST_TIME = 250;
export const NOTION_REQUEST_TIMEOUT = 10000;
export const NOTION_API_URL = 'https://www.notion.so/api/v3';

// export const DEFAULT_TOPIC_COLOR = '#BCE1FF';

// const TOOLTIP_MARGIN = 10;
// const TOOLTIP_HEIGHT = 200;
// const MINI_TOOLTIP_HEIGHT = 32;
// const DELETE_BUTTON_DIAMETER = 20;
