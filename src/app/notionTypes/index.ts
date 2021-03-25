import { SchemaValue } from './schema';

export type Icon = {
  value: string;
  type: 'url' | 'emoji';
};

export type Record = {
  id: string;
  name: string;
  type: 'database' | 'page' | 'space';
  hasSchema?: boolean;
  icon?: Icon;
  section?: 'database' | 'page' | 'recent';
  path?: string;
  collectionId?: string;
  schema?: Array<SchemaValue>;
};
