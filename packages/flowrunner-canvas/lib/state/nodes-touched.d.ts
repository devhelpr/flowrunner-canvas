import { State } from 'zustand';
interface INodesTouchedState extends State {
    nodesTouched: any;
    setNodesTouched: (nodesTouched: any) => void;
    clearNodesTouched: () => void;
}
export declare const useNodesTouchedStateStore: import("zustand").UseBoundStore<INodesTouchedState, import("zustand").StoreApi<INodesTouchedState>>;
export declare const useNodesTouchedStateForMultiFormStore: import("zustand").UseBoundStore<INodesTouchedState, import("zustand").StoreApi<INodesTouchedState>>;
export {};
