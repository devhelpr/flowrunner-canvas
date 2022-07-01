import { IFlowrunnerConnector } from '../../interfaces/IFlowrunnerConnector';
import { Subject } from 'rxjs';
import { IFlowState } from '../../state/flow-state';
import { ICanvasModeState } from '../../state/canvas-mode-state';
import { INodeState } from '../../state/selected-node-state';
import { FlowState } from '../../use-flows';
import { IModalSize } from '../../interfaces/IModalSize';
import { INodeDependency } from '../../interfaces/INodeDependency';
export interface CanvasProps {
    externalId: string;
    hasTaskNameAsNodeTitle?: boolean;
    showsStateMachineUpdates: boolean;
    hasCustomNodesAndRepository: boolean;
    canvasToolbarsubject: Subject<string>;
    formNodesubject: Subject<any>;
    flowHasNodes: boolean;
    flowId?: number | string;
    flowState: FlowState;
    flowType: string;
    saveFlow: (flowId?: any, flow?: any[]) => void;
    isEditingInModal: boolean;
    modalSize?: IModalSize;
    initialOpacity: number;
    flowrunnerConnector: IFlowrunnerConnector;
    renderHtmlNode?: (node: any, flowrunnerConnector: IFlowrunnerConnector, flow: any, taskSettings?: any) => any;
    getNodeInstance: (node: any, flowrunnerConnector?: IFlowrunnerConnector, flow?: any, taskSettings?: any) => any;
    getNodeDependencies?: (nodeName: string) => INodeDependency[];
    useFlowStore: () => IFlowState;
    useCanvasModeStateStore: () => ICanvasModeState;
    useSelectedNodeStore: (param?: any) => INodeState;
}
export interface CanvasState {
    stageWidth: number;
    stageHeight: number;
    canvasOpacity: number;
    canvasKey: number;
    showNodeSettings: boolean;
    editNode: any;
    editNodeSettings: any;
    isConnectingNodesByDragging: boolean;
    connectionX: number;
    connectionY: number;
    updateNodeTouchedState: boolean;
}
export declare const Canvas: (props: CanvasProps) => JSX.Element;
