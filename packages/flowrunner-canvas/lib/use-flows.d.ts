import { IFlowrunnerConnector } from './interfaces/IFlowrunnerConnector';
import { IFlowState } from './state/flow-state';
export declare enum FlowState {
    idle = 0,
    loading = 1,
    loaded = 2,
    error = 3
}
export declare const useFlows: (flowrunnerConnector: IFlowrunnerConnector, useFlowStore: () => IFlowState, flowId?: string | number | undefined, onFlowHasChanged?: ((flow: any) => void) | undefined) => {
    flowState: FlowState;
    flowId: string | number | undefined;
    flow: any[];
    flowType: string;
    flows: any[] | undefined;
    getFlows: (getFlowId?: any) => void;
    loadFlow: (flowId?: string | number | undefined) => void;
    onGetFlows: (id?: string | number | undefined) => void;
    saveFlow: (selectedFlow?: any, stateFlow?: any[] | undefined) => void;
    reloadFlow: () => void;
    loadFlowFromMemory: (inputFlow: any[], flowId?: string | number | undefined) => void;
};
