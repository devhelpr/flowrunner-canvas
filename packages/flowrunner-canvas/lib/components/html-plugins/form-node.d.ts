import { IFlowrunnerConnector } from '../../interfaces/IFlowrunnerConnector';
import { Subject } from 'rxjs';
import { IFlowState } from '../../state/flow-state';
export declare class FormNodeHtmlPluginInfo {
    private taskSettings;
    constructor(taskSettings: any);
    getWidth(node: any): any;
    getMetaInfoLength(metaInfo: any, node: any, isParent: any): number;
    getHeight(node: any): number;
}
export interface FormNodeHtmlPluginProps {
    flowrunnerConnector?: IFlowrunnerConnector;
    node: any;
    taskSettings?: any;
    formNodesubject?: Subject<any>;
    isObjectListNodeEditing?: boolean;
    isReadOnly?: boolean;
    isInFlowEditor: boolean;
    isNodeSettingsUI?: boolean;
    datasources?: any;
    onSetValue?: (value: any, fieldName: any) => void;
    useFlowStore?: (param?: any) => IFlowState;
}
export interface FormNodeHtmlPluginState {
    value: string;
    values: string[];
    node: any;
    errors: any;
    datasource: any;
    receivedPayload: any;
}
export declare const FormNodeHtmlPlugin: (props: FormNodeHtmlPluginProps) => JSX.Element;
