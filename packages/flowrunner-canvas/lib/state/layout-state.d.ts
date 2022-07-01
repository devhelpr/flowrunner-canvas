import { State } from 'zustand';
interface ILayoutState extends State {
    layout: string;
    storeLayout: (layout: string) => void;
}
export declare const useLayoutStore: import("zustand").UseBoundStore<ILayoutState, import("zustand").StoreApi<ILayoutState>>;
export declare const useLayoutForMultiFormStore: import("zustand").UseBoundStore<ILayoutState, import("zustand").StoreApi<ILayoutState>>;
export {};
