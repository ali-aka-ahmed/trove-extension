export type SchemaValue =
  | {
      name: string;
      propertyId: string;
      type: SchemaPropertyType.Title;
      value?: string;
    }
  | TextProperty
  | NumberProperty
  | SelectProperty
  | MultiSelectProperty
  | DateProperty
  | PersonProperty
  | FileProperty
  | CheckboxProperty
  | UrlProperty
  | EmailProperty
  | PhoneNumberProperty
  | FormulaProperty
  | RelationProperty
  | RollupProperty
  | CreatedTimeProperty
  | CreatedByProperty
  | LastEditedTimeProperty
  | LastEditedByProperty;

export enum SchemaPropertyType {
  Title = 'title',
  Text = 'text',
  Number = 'number',
  Select = 'select',
  MultiSelect = 'multi_select',
  Date = 'date',
  Person = 'person',
  File = 'file',
  Checkbox = 'checkbox',
  Url = 'url',
  Email = 'email',
  PhoneNumber = 'phone_number',
  Formula = 'formula',
  Relation = 'relation',
  Rollup = 'rollup',
  CreatedTime = 'created_time',
  CreatedBy = 'created_by',
  LastEditedTime = 'last_edited_time',
  LastEditedBy = 'last_edited_by',
}

// export type AnySchemaPropertyType = `${SchemaPropertyType}`;

export enum NotionColor {
  Default = 'default',
  Gray = 'gray',
  Brown = 'brown',
  Orange = 'orange',
  Yellow = 'yellow',
  Green = 'green',
  Blue = 'blue',
  Purple = 'purple',
  Pink = 'pink',
  Red = 'red',
}

export type TextProperty = {
  name: string;
  propertyId: string;
  type: SchemaPropertyType.Text;
  value?: string;
};

export type NumberProperty = {
  name: string;
  propertyId: string;
  type: SchemaPropertyType.Number;
  value?: string;
};

export type SelectProperty = {
  name: string;
  propertyId: string;
  type: SchemaPropertyType.Select;
  options: SelectOption[];
  value?: SelectOption;
};

export type MultiSelectProperty = {
  name: string;
  propertyId: string;
  type: SchemaPropertyType.MultiSelect;
  options: SelectOption[];
  value?: Array<SelectOption>;
};

export type SelectOption = {
  id: string;
  color: NotionColor;
  value: string;
};

export type DateProperty = {
  name: string;
  propertyId: string;
  type: SchemaPropertyType.Date;
  value?: number;
};

export type PersonProperty = {
  name: string;
  propertyId: string;
  type: SchemaPropertyType.Person;
  value?: Array<string>; // userIds of those chosen.
};

export type FileProperty = {
  name: string;
  propertyId: string;
  type: SchemaPropertyType.File;
  value?: string; // file path
};

export type CheckboxProperty = {
  name: string;
  propertyId: string;
  type: SchemaPropertyType.Checkbox;
  value?: 'Yes' | 'No';
};

export type UrlProperty = {
  name: string;
  propertyId: string;
  type: SchemaPropertyType.Url;
  value?: string;
};

export type EmailProperty = {
  name: string;
  propertyId: string;
  type: SchemaPropertyType.Email;
  value?: string;
};

export type PhoneNumberProperty = {
  name: string;
  propertyId: string;
  type: SchemaPropertyType.PhoneNumber;
  value?: string;
};

export type FormulaProperty = {
  name: string;
  propertyId: string;
  type: SchemaPropertyType.Formula;
  formula: object; // TODO
  value?: unknown;
};

export type RelationProperty = {
  name: string;
  propertyId: string;
  type: SchemaPropertyType.Relation;
  property: string;
  collection_id: string;
  value?: unknown;
};

export type RollupProperty = {
  name: string;
  propertyId: string;
  type: SchemaPropertyType.Rollup;
  target_property: string;
  relation_property: string;
  target_property_type: SchemaPropertyType;
  value?: unknown;
};

export type CreatedTimeProperty = {
  name: string;
  propertyId: string;
  type: SchemaPropertyType.CreatedTime;
  value?: number;
};

export type CreatedByProperty = {
  name: string;
  propertyId: string;
  type: SchemaPropertyType.CreatedBy;
  value?: string;
};

export type LastEditedTimeProperty = {
  name: string;
  propertyId: string;
  type: SchemaPropertyType.LastEditedTime;
  value?: number;
};

export type LastEditedByProperty = {
  name: string;
  propertyId: string;
  type: SchemaPropertyType.LastEditedBy;
  value?: string;
};
