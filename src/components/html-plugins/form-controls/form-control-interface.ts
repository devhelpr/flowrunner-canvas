export interface IFormControlProps {
  onChange: (value, metaInfo) => void;
  value: string;
  node: any;
  fieldName: string;
  fieldType: string;
  metaInfo: any;
  datasource?: any;
  datasources?: any;
  payload?: any;
  isInFlowEditor: boolean;
  fieldDefinition?: any;
  selected?: boolean;
  onFormControlGroupClick: (event: any, fieldName: string, formControlDOMId : string) => void;
}
