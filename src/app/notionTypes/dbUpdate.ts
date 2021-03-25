import { SchemaPropertyType, SelectOption } from '../notionTypes/schema';

export interface PropertyUpdate {
  type: SchemaPropertyType;
  propertyId: string; // 4-character code
  data: AnyPropertyUpdateData;
}

export type SelectOptionPropertyUpdate = {
  selected: SelectOption;
  newOptions: Array<SelectOption>;
};

export type MultiSelectOptionPropertyUpdate = {
  selected: Array<SelectOption>;
  newOptions: Array<SelectOption>;
};

/**
 * SchemaPropertyType.Title
 * SchemaPropertyType.Text
 * SchemaPropertyType.Number
 * SchemaPropertyType.Email
 * SchemaPropertyType.PhoneNumber
 * SchemaPropertyType.Url
 * --> string
 * SchemaPropertyType.Select
 * --> SelectOptionPropertyUpdate
 * SchemaPropertyType.MultiSelect
 * --> MultiSelectOptionPropertyUpdate
 * SchemaPropertyType.Checkbox
 * --> 'Yes' | 'No'
 */
export type AnyPropertyUpdateData =
  | string[]
  | 'Yes'
  | 'No'
  | string
  | SelectOptionPropertyUpdate
  | MultiSelectOptionPropertyUpdate;

export type PropertyUpdateData<T extends SchemaPropertyType> = T extends SchemaPropertyType.Title
  ? string
  : T extends SchemaPropertyType.Text
  ? string
  : T extends SchemaPropertyType.Number
  ? string
  : T extends SchemaPropertyType.Select
  ? SelectOptionPropertyUpdate
  : T extends SchemaPropertyType.MultiSelect
  ? MultiSelectOptionPropertyUpdate
  : T extends SchemaPropertyType.Date
  ? string // "YYYY-MM-DD"
  : T extends SchemaPropertyType.Person
  ? string[]
  : T extends SchemaPropertyType.Checkbox
  ? 'Yes' | 'No'
  : T extends SchemaPropertyType.Url
  ? string
  : T extends SchemaPropertyType.Email
  ? string
  : T extends SchemaPropertyType.PhoneNumber
  ? string
  : never;

// case SchemaProperty.Formula:
// case SchemaProperty.Relation:
// case SchemaProperty.Rollup:
// case SchemaProperty.File:
