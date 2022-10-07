import { IFlowrunnerConnector } from '../../interfaces/IFlowrunnerConnector';

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
  enabled?: boolean;
  fieldIndex: number;
  currentFormValues?: any;
  flowrunnerConnector: IFlowrunnerConnector | undefined;
}
