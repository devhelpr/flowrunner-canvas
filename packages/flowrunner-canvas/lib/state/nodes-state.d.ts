import { State } from 'zustand';
interface INodesState extends State {
    nodes: any;
    setNodeState: (nodeName: string, nodeState: string) => void;
    clearNodesState: () => void;
}
export declare const useNodesStateStore: import("zustand").UseBoundStore<INodesState, import("zustand").StoreApi<INodesState>>;
export declare const useNodesStateForMultiFormStore: import("zustand").UseBoundStore<INodesState, import("zustand").StoreApi<INodesState>>;
export {};
