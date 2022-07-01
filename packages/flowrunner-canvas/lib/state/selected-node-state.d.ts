import { State } from 'zustand';
export interface ISelectedNode {
    name: string;
    node: any;
    payload: any;
}
export interface INodeState extends State {
    node: ISelectedNode | any;
    selectNode: (nodeName: string, node: any) => void;
    setPayload: (payload: any) => void;
}
export declare const useSelectedNodeStore: import("zustand").UseBoundStore<INodeState, import("zustand").StoreApi<INodeState>>;
export declare const useSelectedNodeForMultiFormStore: import("zustand").UseBoundStore<INodeState, import("zustand").StoreApi<INodeState>>;
export declare const useBundleSelectedNodeStore: import("zustand").UseBoundStore<INodeState, import("zustand").StoreApi<INodeState>>;
