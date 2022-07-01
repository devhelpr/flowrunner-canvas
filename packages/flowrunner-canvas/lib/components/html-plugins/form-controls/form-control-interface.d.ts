export interface IFormControlProps {
    onChange: (value: any, metaInfo: any) => void;
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
}
