import { SchemaValue } from './schema';

export type Icon = {
  value: string;
  type: 'url' | 'emoji';
};

export type Record = {
  id: string;
  name: string;
  type: 'database' | 'page' | 'space';
  hasSchema?: boolean; // database or page
  icon?: Icon;
  section?: 'database' | 'page' | 'recent';
  path?: string;
  collectionId?: string; // database
  schema?: Array<SchemaValue>; // database
  userId?: string; // space
  email?: string; // space
};
