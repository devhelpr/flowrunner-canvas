import { IFlowrunnerConnector } from '../../interfaces/IFlowrunnerConnector';
import { Subject } from 'rxjs';
import { FlowState } from '../../use-flows';
import { IModalSize } from '../../interfaces/IModalSize';
export interface IFlowFile {
    name: string;
    id: number;
}
export interface ToolbarProps {
    hasTaskNameAsNodeTitle: boolean;
    hasCustomNodesAndRepository: boolean;
    hasShowDependenciesInMenu?: boolean;
    hasJSONEditInMenu?: boolean;
    renderMenuOptions?: () => JSX.Element;
    flow: any[];
    flowId?: number | string;
    flows: any[] | undefined;
    flowState: FlowState;
    flowType: string;
    isFlowEditorOnly?: boolean;
    canvasToolbarsubject: Subject<string>;
    hasRunningFlowRunner: boolean;
    modalSize?: IModalSize;
    onEditorMode?: (editorMode: any) => void;
    flowrunnerConnector: IFlowrunnerConnector;
    getFlows: () => void;
    loadFlow: (flowId: any) => void;
    saveFlow: (flowId?: any) => void;
    onGetFlows: (id?: string | number) => void;
    getNodeInstance: (node: any, flowrunnerConnector?: IFlowrunnerConnector, flow?: any, taskSettings?: any) => any;
    renderHtmlNode?: (node: any, flowrunnerConnector: IFlowrunnerConnector, flow: any, taskSettings?: any) => any;
}
export interface ToolbarState {
    showEditPopup: boolean;
    showSchemaPopup: boolean;
    selectedTask: string;
    showDependencies: boolean;
    showNewFlow: boolean;
    flowFiles: string[];
    selectedFlow: string;
    showTaskHelp: boolean;
}
export declare const Toolbar: (props: ToolbarProps) => JSX.Element;
export * from './floating-toolbar';
