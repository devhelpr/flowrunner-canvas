import { State, SetState } from 'zustand';
import { IPositionContext } from '../components/contexts/position-context';
export interface IFlowState extends State {
    flow: any[];
    flowId: string;
    flowHashmap: any;
    storeFlow: (flow: any[], flowId: string, positionContext?: IPositionContext) => void;
    storeFlowNode: (node: any, orgNodeName: string, positionContext?: IPositionContext) => void;
    storeFlowNodes: (node: any, positionContext?: IPositionContext) => void;
    addFlowNode: (node: any, positionContext?: IPositionContext) => void;
    addFlowNodes: (nodes: any[], positionContext?: IPositionContext) => void;
    addConnection: (connection: any, positionContext?: IPositionContext) => void;
    deleteConnection: (node: any) => void;
    deleteNode: (node: any, deleteLines: boolean) => void;
    deleteNodes: (nodes: any[]) => void;
}
export declare const storeHandler: (set: SetState<IFlowState>) => IFlowState;
export declare const useFlowStore: import("zustand").UseBoundStore<IFlowState, import("zustand").StoreApi<IFlowState>>;
export declare const useFlowForMultiFormStore: import("zustand").UseBoundStore<IFlowState, import("zustand").StoreApi<IFlowState>>;
export declare const useBundleFlowStore: import("zustand").UseBoundStore<IFlowState, import("zustand").StoreApi<IFlowState>>;
