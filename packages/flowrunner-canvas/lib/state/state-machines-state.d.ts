import { State } from 'zustand';
interface IStateMachinesState extends State {
    machines: any;
    setMachineState: (nodeName: string, nodeState: string) => void;
    clearMachinesState: () => void;
}
export declare const useStateMachinesStateStore: import("zustand").UseBoundStore<IStateMachinesState, import("zustand").StoreApi<IStateMachinesState>>;
export declare const useStateMachinesStateForMultiFormStore: import("zustand").UseBoundStore<IStateMachinesState, import("zustand").StoreApi<IStateMachinesState>>;
export {};
